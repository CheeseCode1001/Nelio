/**
 * End-to-end check of the Milestone 4 media pipeline with a real fixture video (76 s of synthesised speech).
 * Uses real storage, transcription and Nelio AI (a few cents per run), drives each step directly (no Redis),
 * asserts every result, then removes the test files and soft-deletes the test workspace.
 * Usage: pnpm --filter @nelio/worker-node check:pipeline
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { cancelRenderRun, db, deleteObject, headObject, putObject, signedGetUrl, startProcessingRun, startRenderRun, storageKeys } from "@nelio/db";
import { buildVariants, processingEstimate, processingSplit, renderEstimate, type ClipSnapshot } from "@nelio/domain";
import { ffmpeg, withTempDir } from "../src/ffmpeg";
import { probe } from "../src/ffmpeg";
import { processStep } from "../src/steps";

let failures = 0;
const check = (label: string, ok: boolean, got?: unknown) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(got)})`}`);
  if (!ok) failures++;
};
const tag = `zz-pipe-${Date.now().toString(36)}`;
const client = db();
const userId = randomUUID();
let orgId = "";
const keys: string[] = [];

try {
  await client.user.create({ data: { id: userId, email: `${tag}@nelio-test.invalid`, fullName: "Pipeline Check" } });
  const org = await client.organization.create({ data: { name: tag, slug: tag, accountType: "creator", plan: "creator_pro" } });
  orgId = org.id;
  await client.organizationMembership.create({ data: { orgId, userId, role: "owner" } });
  const ws = await client.workspace.create({ data: { orgId, name: tag, slug: tag } });

  // The upload: the fixture goes straight into storage, as a browser upload would.
  const file = await readFile(new URL("../fixtures/budgeting_talk.mp4", import.meta.url));
  const asset = await client.mediaAsset.create({ data: { orgId, workspaceId: ws.id, filename: "budgeting_talk.mp4", contentType: "video/mp4", sizeBytes: BigInt(file.length), durationSec: 76, storageKey: `pending/${randomUUID()}`, status: "uploaded", rights: "own", rightsRef: "r-100", quality: "balanced", language: "en", uploadedByUserId: userId } });
  const key = storageKeys.source(ws.id, asset.id, "mp4");
  keys.push(key, storageKeys.poster(ws.id, asset.id), storageKeys.audio(ws.id, asset.id), ...[1, 2, 3, 4].map((r) => storageKeys.preview(ws.id, asset.id, r)));
  await client.mediaAsset.update({ where: { id: asset.id }, data: { storageKey: key } });
  await putObject(key, file, "video/mp4");
  check("fixture stored", (await headObject(key))?.size === file.length);

  const estimate = processingEstimate(76, "balanced");
  const { runId } = await client.$transaction((tx) => startProcessingRun(tx, { assetId: asset.id, userId, split: processingSplit(estimate) }));
  check("processing run created with five steps", (await client.runStep.count({ where: { runId } })) === 5);

  for (let i = 0; i < 8; i++) {
    const s = await client.runStep.findFirst({ where: { runId, status: "queued" }, orderBy: { ordinal: "asc" } });
    if (!s) break;
    const t0 = Date.now();
    const note = await processStep(s.id);
    const after = await client.runStep.findUniqueOrThrow({ where: { id: s.id } });
    console.log(`      ${s.kind}: ${note} in ${((Date.now() - t0) / 1000).toFixed(1)} s · ${after.detail ?? after.reasonText ?? ""}`);
  }

  const run = await client.agentRun.findUniqueOrThrow({ where: { id: runId } });
  check("run finished", run.status === "done", { status: run.status, reason: run.reasonText });
  const a = await client.mediaAsset.findUniqueOrThrow({ where: { id: asset.id }, include: { transcript: true } });
  check("video marked ready", a.status === "ready", a.status);
  check("duration read from the file", Math.abs((a.durationSec ?? 0) - 76) < 2, a.durationSec);
  check("poster frame stored", Boolean(await headObject(storageKeys.poster(ws.id, asset.id))));
  const words = (a.transcript?.words as unknown as { w: string }[]) ?? [];
  check("transcript has the spoken words", words.length > 150, words.length);
  check("transcript caught the opening line", words.slice(0, 6).map((w) => w.w.toLowerCase()).join(" ").includes("stop budgeting"), words.slice(0, 6).map((w) => w.w).join(" "));
  const cands = await client.clipCandidate.findMany({ where: { assetId: asset.id }, orderBy: { rank: "asc" } });
  check("Nelio AI found moments", cands.length >= 1, cands.length);
  check("moments are 8–90 s and don't overlap", cands.every((c, i) => c.endMs - c.startMs >= 8000 && c.endMs - c.startMs <= 90_000 && cands.slice(0, i).every((o) => c.startMs >= o.endMs || o.startMs >= c.endMs)), cands.map((c) => [c.startMs, c.endMs]));
  check("scores are 0–100 and ranked", cands.every((c, i) => c.score >= 0 && c.score <= 100 && (i === 0 || cands[i - 1]!.score >= c.score)));
  for (const c of cands) console.log(`      #${c.rank} ${c.score} ${(c.startMs / 1000).toFixed(1)}–${(c.endMs / 1000).toFixed(1)} s “${c.title}” · ${c.hook}`);
  const preview = await headObject(storageKeys.preview(ws.id, asset.id, 1));
  check("first preview rendered", Boolean(preview && preview.size > 1000), preview);
  if (preview) {
    const { signedGetUrl } = await import("@nelio/db");
    const p = await probe(await signedGetUrl(storageKeys.preview(ws.id, asset.id, 1)));
    check("preview is 9:16 (360×640)", p.width === 360 && p.height === 640, [p.width, p.height]);
  }
  check("credits settled within the estimate", run.actualCredits > 0 && run.actualCredits <= estimate, { actual: run.actualCredits, estimate });
  const n = await client.notification.findFirst({ where: { userId } });
  check("uploader told the video is ready", n?.title === "budgeting_talk.mp4 is ready", n?.title);

  // Render the top moment as a saved clip version with a brand kit: 9:16, hook, captions, end card.
  const top = cands[0];
  if (top) {
    const kit = await client.brandKit.create({ data: { orgId, workspaceId: ws.id, name: "Pipeline Kit", primary: "#2F5BFF", accent: "#FFD43B", isDefault: true } });
    const snap = { startMs: top.startMs, endMs: Math.min(top.endMs, top.startMs + 20_000), hook: top.hook, captionStyle: "bold_pop", captionSize: 120, format: "9:16", brandKitId: kit.id };
    const project = await client.clipProject.create({ data: { orgId, workspaceId: ws.id, assetId: asset.id, name: top.hook, startMs: snap.startMs, endMs: snap.endMs, hook: snap.hook, captionSize: 120, brandKitId: kit.id, createdById: userId } });
    await client.projectRevision.create({ data: { projectId: project.id, number: 1, snapshot: snap, createdById: userId } });
    const est = renderEstimate((snap.endMs - snap.startMs) / 1000);
    const { renderId, runId: renderRun } = await client.$transaction((tx) => startRenderRun(tx, { projectId: project.id, userId, estimate: est }));
    keys.push(storageKeys.render(ws.id, renderId));
    const step = await client.runStep.findFirstOrThrow({ where: { runId: renderRun } });
    const t0 = Date.now();
    const note = await processStep(step.id);
    console.log(`      render_clip: ${note} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    const r = await client.render.findUniqueOrThrow({ where: { id: renderId } });
    check("render finished", r.status === "ready", { status: r.status, text: r.statusText });
    const rr = await client.agentRun.findUniqueOrThrow({ where: { id: renderRun } });
    check("render credits settled within the estimate", rr.status === "done" && rr.actualCredits > 0 && rr.actualCredits <= est, { status: rr.status, actual: rr.actualCredits, est });
    if (r.storageKey) {
      const url = await signedGetUrl(r.storageKey);
      const p = await probe(url);
      check("render is 1080×1920 with sound", p.width === 1080 && p.height === 1920 && p.hasAudio, p);
      check("render is as long as the clip", Math.abs(p.durationSec - (snap.endMs - snap.startMs) / 1000) < 0.6, p.durationSec);
      // The hook card is burned in: the top third of the first second has the brand yellow in it.
      const yellow = await withTempDir(async (dir) => {
        const out = `${dir}/frame.rgb`;
        await ffmpeg(["-ss", "0.5", "-i", url, "-frames:v", "1", "-vf", "crop=1080:640:0:0,scale=54:32", "-f", "rawvideo", "-pix_fmt", "rgb24", out]);
        const b = await readFile(out);
        let n = 0;
        for (let i = 0; i + 2 < b.length; i += 3) if (b[i]! > 200 && b[i + 1]! > 170 && b[i + 2]! < 120) n++;
        return n;
      });
      check("hook card is burned in", yellow > 20, yellow);
    }
    const rn = await client.notification.findFirst({ where: { userId, title: { contains: "is rendered" } } });
    check("creator told the clip is rendered", Boolean(rn), rn?.title);

    // Variants (CL-04): a square cut without captions renders at 1080×1080; a queued variant cancels with nothing charged.
    const variants = buildVariants(snap as ClipSnapshot, { question: "Are you budgeting wrong?", number: "3 budget mistakes" });
    const square = { ...variants.find((v) => v.key === "square")!, settings: { ...variants.find((v) => v.key === "square")!.settings, captionStyle: "none" as const } };
    const minimal = variants.find((v) => v.key === "minimal")!;
    const started = await client.$transaction(async (tx) => [
      await startRenderRun(tx, { projectId: project.id, userId, estimate: est, label: square.label, settings: square.settings, key: `variant:${project.id}:check:square` }),
      await startRenderRun(tx, { projectId: project.id, userId, estimate: est, label: minimal.label, settings: minimal.settings, key: `variant:${project.id}:check:minimal` }),
    ]);
    keys.push(...started.map((x) => storageKeys.render(ws.id, x.renderId)));
    const canceled = await client.$transaction((tx) => cancelRenderRun(tx, { renderId: started[1]!.renderId, workspaceId: ws.id, byUserName: "Pipeline Check" }));
    const minimalStep = await client.runStep.findFirstOrThrow({ where: { runId: started[1]!.runId } });
    check("queued variant cancels", canceled && (await processStep(minimalStep.id)) !== "done", minimalStep.status);
    const cr = await client.agentRun.findUniqueOrThrow({ where: { id: started[1]!.runId } });
    check("canceled variant charged nothing", cr.status === "canceled" && cr.actualCredits === 0, { status: cr.status, actual: cr.actualCredits });
    const sqStep = await client.runStep.findFirstOrThrow({ where: { runId: started[0]!.runId } });
    await processStep(sqStep.id);
    const sq = await client.render.findUniqueOrThrow({ where: { id: started[0]!.renderId } });
    check("square variant rendered", sq.status === "ready" && Boolean(sq.storageKey), { status: sq.status, text: sq.statusText });
    if (sq.storageKey) {
      const p2 = await probe(await signedGetUrl(sq.storageKey));
      check("square variant is 1080×1080", p2.width === 1080 && p2.height === 1080, [p2.width, p2.height]);
    }
  }
} catch (e) {
  failures++;
  console.log("FAIL  unexpected error:", e instanceof Error ? e.message.replace(/(postgres(ql)?|rediss?|https?):\/\/\S+/g, "[url]") : e);
} finally {
  for (const k of keys) await deleteObject(k);
  if (orgId) {
    await client.workspace.updateMany({ where: { orgId }, data: { deletedAt: new Date() } }).catch(() => {});
    await client.organization.update({ where: { id: orgId }, data: { deletedAt: new Date() } }).catch(() => {});
  }
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll pipeline checks passed");
  await client.$disconnect();
  process.exit(failures ? 1 : 0);
}
