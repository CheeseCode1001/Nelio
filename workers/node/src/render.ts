import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { db, putObject, signedGetUrl, storageKeys } from "@nelio/db";
import { CLIP_FORMATS, buildAss, captionChunks, clampCaptionSize, cropFor, isCaptionStyle, isClipFormat, renderEstimate, type ClipSnapshot, type Word } from "@nelio/domain";
import { ffmpeg, probe, progressSeconds, withTempDir } from "./ffmpeg";
import { RetryableStepError, type StepHandler } from "./step-types";

/**
 * Final render (CL-03 → CL-05): cuts the saved clip version from the source, fills the chosen format from
 * the centre, and burns in the hook, captions and brand end card with the bundled caption font (OFL).
 */
const require = createRequire(import.meta.url);
// The bundled file is a single ExtraBold face, so captions use its full family name and no synthetic bold.
export const CAPTION_FONT = "Plus Jakarta Sans ExtraBold";
function captionFontFile(): string {
  return require.resolve("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf");
}

const renderClip: StepHandler = async (ctx) => {
  if (!ctx.run.renderId) return { status: "blocked", reason: "missing", text: "This render was deleted." };
  const client = db();
  const render = await client.render.findUnique({ where: { id: ctx.run.renderId }, include: { project: { include: { asset: { include: { transcript: { select: { words: true } } } } } } } });
  if (!render) return { status: "blocked", reason: "missing", text: "This render was deleted." };
  const asset = render.project.asset;
  if (asset.deletedAt || asset.status !== "ready") return { status: "blocked", reason: "source", text: `${asset.filename} can’t be used any more. Pick another source.` };
  const revision = await client.projectRevision.findUnique({ where: { projectId_number: { projectId: render.projectId, number: render.revision } } });
  const snap = (revision?.snapshot as unknown as ClipSnapshot | undefined) ?? {
    startMs: render.project.startMs, endMs: render.project.endMs, hook: render.hook, captionStyle: render.captionStyle, captionSize: render.project.captionSize, format: render.format, brandKitId: render.project.brandKitId,
  } as ClipSnapshot;
  const format = isClipFormat(snap.format) ? snap.format : "9:16";
  const style = isCaptionStyle(snap.captionStyle) ? snap.captionStyle : "bold_pop";
  const kit = snap.brandKitId ? await client.brandKit.findFirst({ where: { id: snap.brandKitId, workspaceId: render.workspaceId }, select: { name: true, accent: true } }) : null;
  const clipMs = snap.endMs - snap.startMs;
  await client.render.update({ where: { id: render.id }, data: { status: "rendering", statusText: null } });

  const src = await signedGetUrl(asset.storageKey, { expiresIn: 6 * 3600 });
  const dims = asset.width && asset.height ? { width: asset.width, height: asset.height } : await probe(src, ctx.signal);
  const w = dims.width ?? 1920;
  const h = dims.height ?? 1080;
  const crop = cropFor(w, h, format);
  const { width, height } = CLIP_FORMATS[format];
  const words = ((asset.transcript?.words as unknown as Word[] | undefined) ?? []);
  const ass = buildAss(captionChunks(words, snap.startMs, snap.endMs, style), {
    format, style, sizePct: clampCaptionSize(snap.captionSize ?? 100), font: CAPTION_FONT, accent: kit?.accent, hook: snap.hook, endCard: kit?.name, clipMs,
  });

  const key = storageKeys.render(render.workspaceId, render.id);
  const size = await withTempDir(async (dir) => {
    await mkdir(join(dir, "fonts"));
    await copyFile(captionFontFile(), join(dir, "fonts", "caption.ttf"));
    await writeFile(join(dir, "clip.ass"), ass, "utf8");
    const out = join(dir, "clip.mp4");
    let lastPct = -1;
    // Relative paths keep the subtitles filter free of drive letters and spaces (Windows and Linux alike).
    const vf = `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${width}:${height}:flags=lanczos,setsar=1,subtitles=clip.ass:fontsdir=fonts`;
    try {
      await ffmpeg(
        ["-ss", (snap.startMs / 1000).toFixed(3), "-i", src, "-t", (clipMs / 1000).toFixed(3), "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", "clip.mp4"],
        ctx.signal,
        (chunk) => {
          const t = progressSeconds(chunk);
          if (t === null) return;
          const pct = Math.min(99, Math.floor(((t * 1000) / clipMs) * 10) * 10);
          if (pct > lastPct) {
            lastPct = pct;
            void ctx.progress(`${format} · ${render.resolution} · ${pct}%`).catch(() => {});
          }
        },
        { cwd: dir },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "render failed";
      if (/stopped/.test(msg)) throw e;
      throw new RetryableStepError(msg);
    }
    const bytes = await readFile(out);
    await putObject(key, bytes, "video/mp4");
    return (await stat(out)).size;
  });
  await client.render.update({ where: { id: render.id }, data: { storageKey: key, sizeBytes: BigInt(size) } });
  return { status: "done", actualCredits: Math.min(render.estimatedCredits, renderEstimate(clipMs / 1000)), detail: `${format} · ${render.resolution}` };
};

export const RENDER_HANDLERS: Record<string, StepHandler> = { render_clip: renderClip };
