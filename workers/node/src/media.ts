import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, putObject, signedGetUrl, storageKeys } from "@nelio/db";
import { MAX_DURATION_SEC, formatBytes, formatDuration, processingEstimate, processingSplit } from "@nelio/domain";
import { ffmpeg, probe, progressSeconds, withTempDir } from "./ffmpeg";
import { NelioAiDeclined, NelioAiUnavailable, isRetryableAiError, rankMoments, transcriptLines } from "./nelio-ai";
import { RetryableStepError, type StepContext, type StepHandler, type StepOutcome } from "./step-types";
import { TranscriptionRetryable, TranscriptionUnavailable, transcribe, type Word } from "./transcription";

/**
 * Media pipeline steps (Milestone 4). A processing run has check_file → transcribe → detect_scenes →
 * rank_moments → build_previews; an agent run starts with check_sources (picks a video) and then reuses the
 * same steps. A step whose result already exists finishes at once and its reservation is refunded.
 */

async function assetFor(ctx: StepContext) {
  if (!ctx.run.assetId) return null;
  return db().mediaAsset.findFirst({ where: { id: ctx.run.assetId, deletedAt: null }, include: { transcript: true } });
}
type Asset = NonNullable<Awaited<ReturnType<typeof assetFor>>>;

/** The share of the run estimate this step may actually use, recomputed from the real duration. */
function actualFor(asset: Asset, step: "transcribe" | "detect_scenes" | "rank_moments" | "build_previews"): number {
  if (!asset.durationSec) return 0;
  return processingSplit(processingEstimate(asset.durationSec, asset.quality))[step];
}

const blocked = (reason: string, text: string): StepOutcome => ({ status: "blocked", reason, text });

/** Agent runs: the newest processed or uploaded video in the workspace that this agent hasn't worked on yet. */
const checkSources: StepHandler = async (ctx) => {
  if (ctx.run.assetId) return { status: "done", actualCredits: 0 };
  const used = ctx.agent ? await db().agentRun.findMany({ where: { agentId: ctx.agent.id, assetId: { not: null } }, select: { assetId: true } }) : [];
  const asset = await db().mediaAsset.findFirst({
    where: { workspaceId: ctx.run.workspaceId, deletedAt: null, rights: { in: ["own", "permission"] }, status: { in: ["ready", "uploaded"] }, id: { notIn: used.map((u) => u.assetId!) } },
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true },
  });
  if (!asset) return blocked("no_sources", "No new videos to work with. Upload a video to start.");
  await db().agentRun.update({ where: { id: ctx.runId }, data: { assetId: asset.id } });
  return { status: "done", actualCredits: 0, detail: asset.filename };
};

const checkFile: StepHandler = async (ctx) => {
  const asset = await assetFor(ctx);
  if (!asset) return blocked("missing", "This video was deleted.");
  if (!asset.rights) return blocked("rights", "Tell us who owns this video before it’s processed.");
  const url = await signedGetUrl(asset.storageKey, { expiresIn: 3600 });
  let p;
  try {
    p = await probe(url, ctx.signal);
  } catch (e) {
    throw new RetryableStepError(e instanceof Error ? e.message : "probe failed");
  }
  if (!p.hasVideo) return blocked("not_video", `${asset.filename} has no video track.`);
  if (!p.durationSec) return blocked("not_video", `${asset.filename} couldn’t be read as a video.`);
  if (p.durationSec > MAX_DURATION_SEC) return blocked("too_long", `${asset.filename} is longer than 2 hours. Split it into parts first.`);
  await db().mediaAsset.update({ where: { id: asset.id }, data: { durationSec: p.durationSec, width: p.width, height: p.height } });
  await withTempDir(async (dir) => {
    const out = join(dir, "poster.jpg");
    await ffmpeg(["-ss", String(Math.min(p.durationSec * 0.1, 30)), "-i", url, "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "4", out], ctx.signal);
    await putObject(storageKeys.poster(asset.workspaceId, asset.id), await readFile(out), "image/jpeg");
  });
  return { status: "done", actualCredits: 0, detail: `${formatBytes(Number(asset.sizeBytes))} · ${formatDuration(p.durationSec)}${p.hasAudio ? "" : " · no sound"}` };
};

const transcribeStep: StepHandler = async (ctx) => {
  const asset = await assetFor(ctx);
  if (!asset) return blocked("missing", "This video was deleted.");
  if (asset.transcript) return { status: "done", actualCredits: 0, detail: "Already transcribed" };
  const source = await signedGetUrl(asset.storageKey, { expiresIn: 3600 });
  const audioKey = storageKeys.audio(asset.workspaceId, asset.id);
  await ctx.progress("Extracting audio");
  await withTempDir(async (dir) => {
    const out = join(dir, "audio.m4a");
    const total = asset.durationSec ?? 0;
    let last = 0;
    await ffmpeg(["-i", source, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "aac", "-b:a", "48k", out], ctx.signal, (chunk) => {
      const t = progressSeconds(chunk);
      if (t && total && Date.now() - last > 4000) { last = Date.now(); void ctx.progress(`Extracting audio ${Math.min(99, Math.round((t / total) * 100))}%`); }
    });
    await putObject(audioKey, await readFile(out), "audio/mp4");
  });
  await ctx.progress("Transcribing");
  let words: Word[];
  try {
    ({ words } = await transcribe(await signedGetUrl(audioKey, { expiresIn: 3600 }), { quality: asset.quality, language: asset.language, signal: ctx.signal }));
  } catch (e) {
    if (e instanceof TranscriptionUnavailable) return blocked("not_available", e.message);
    if (e instanceof TranscriptionRetryable) throw new RetryableStepError(e.message);
    throw e;
  }
  await db().transcript.create({ data: { assetId: asset.id, workspaceId: asset.workspaceId, language: asset.language, quality: asset.quality, words: words as unknown as object } });
  const label = asset.quality === "high" ? "High quality" : asset.quality === "fast" ? "Fast quality" : "Balanced quality";
  return { status: "done", actualCredits: actualFor(asset, "transcribe"), detail: words.length ? `${label} · ${words.length.toLocaleString("en-US")} words` : `${label} · no speech found` };
};

const detectScenes: StepHandler = async (ctx) => {
  const asset = await assetFor(ctx);
  if (!asset?.transcript) return blocked("missing", "The transcript isn’t ready.");
  const existing = asset.transcript.scenes as unknown as number[];
  if (Array.isArray(existing) && existing.length) return { status: "done", actualCredits: 0, detail: `${existing.length} scenes` };
  const url = await signedGetUrl(asset.storageKey, { expiresIn: 3600 });
  // Keyframes only, scaled down: a fast scene check that is good enough to snap clip edges to cuts.
  const { stderr } = await ffmpeg(["-skip_frame", "nokey", "-i", url, "-an", "-vf", "scale=320:-2,select='gt(scene,0.3)',showinfo", "-f", "null", "-"], ctx.signal);
  const cuts = [...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Math.round(Number(m[1]) * 1000)).filter((n, i, a) => i === 0 || n - a[i - 1]! > 1500);
  await db().transcript.update({ where: { assetId: asset.id }, data: { scenes: cuts } });
  return { status: "done", actualCredits: actualFor(asset, "detect_scenes"), detail: `${cuts.length} scenes` };
};

/** Moves a time to the nearest word boundary (start of a word, or end of one), so clips never cut mid-word. */
function snap(ms: number, words: Word[], edge: "start" | "end"): number {
  if (!words.length) return ms;
  let best = edge === "start" ? words[0]!.s : words[0]!.e;
  for (const w of words) {
    const t = edge === "start" ? w.s : w.e;
    if (Math.abs(t - ms) < Math.abs(best - ms)) best = t;
  }
  return best;
}

const rankStep: StepHandler = async (ctx) => {
  const asset = await assetFor(ctx);
  if (!asset?.transcript) return blocked("missing", "The transcript isn’t ready.");
  if (await db().clipCandidate.count({ where: { assetId: asset.id } })) return { status: "done", actualCredits: 0, detail: "Already ranked" };
  const words = asset.transcript.words as unknown as Word[];
  if (transcriptLines(words).length < 3) return blocked("no_speech", "There isn’t enough speech in this video to find moments.");
  let moments;
  try {
    moments = await rankMoments(words, { title: asset.filename, signal: ctx.signal });
  } catch (e) {
    if (e instanceof NelioAiUnavailable) return blocked("not_available", e.message);
    if (e instanceof NelioAiDeclined) return blocked("declined", e.message);
    if (isRetryableAiError(e)) throw new RetryableStepError("Nelio AI is busy");
    throw e;
  }
  const durationMs = Math.round((asset.durationSec ?? 0) * 1000);
  const clean = moments
    .map((m) => {
      const start = snap(Math.max(0, m.start_s * 1000), words, "start");
      let end = snap(Math.min(durationMs || m.end_s * 1000, m.end_s * 1000), words, "end");
      if (end - start > 90_000) end = snap(start + 60_000, words, "end");
      return { ...m, start, end };
    })
    .filter((m) => m.end - m.start >= 8_000)
    .sort((a, b) => b.score - a.score)
    .filter((m, i, all) => !all.slice(0, i).some((o) => m.start < o.end && o.start < m.end))
    .slice(0, 6);
  if (!clean.length) return blocked("no_moments", "Nelio AI didn’t find a moment that works on its own.");
  await db().clipCandidate.createMany({
    data: clean.map((m, i) => ({ assetId: asset.id, workspaceId: asset.workspaceId, rank: i + 1, startMs: m.start, endMs: m.end, title: m.title, hook: m.hook, score: m.score, reasons: m.reasons })),
  });
  return { status: "done", actualCredits: actualFor(asset, "rank_moments"), detail: `${clean.length} moments found` };
};

/** Small 9:16 previews of the top moments (360×640), for the Studio and library cards. */
const buildPreviews: StepHandler = async (ctx) => {
  const asset = await assetFor(ctx);
  if (!asset) return blocked("missing", "This video was deleted.");
  const candidates = await db().clipCandidate.findMany({ where: { assetId: asset.id }, orderBy: { rank: "asc" }, take: 4 });
  if (!candidates.length) return blocked("no_moments", "No moments to preview.");
  const url = await signedGetUrl(asset.storageKey, { expiresIn: 3600 });
  let made = 0;
  for (const c of candidates) {
    await ctx.progress(`Preview ${made + 1} of ${candidates.length}`);
    await withTempDir(async (dir) => {
      const out = join(dir, "preview.mp4");
      await ffmpeg([
        "-ss", (c.startMs / 1000).toFixed(2), "-t", ((c.endMs - c.startMs) / 1000).toFixed(2), "-i", url,
        "-vf", "scale=360:640:force_original_aspect_ratio=increase,crop=360:640", "-r", "30",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", out,
      ], ctx.signal);
      await putObject(storageKeys.preview(asset.workspaceId, asset.id, c.rank), await readFile(out), "video/mp4");
    });
    made++;
  }
  return { status: "done", actualCredits: actualFor(asset, "build_previews"), detail: `${made} clips` };
};

export const MEDIA_HANDLERS: Record<string, StepHandler> = {
  check_sources: checkSources,
  check_file: checkFile,
  transcribe: transcribeStep,
  detect_scenes: detectScenes,
  rank_moments: rankStep,
  build_previews: buildPreviews,
  render_previews: buildPreviews,
};
