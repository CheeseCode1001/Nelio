/**
 * End-to-end check of the Milestone 4 media pipeline with a real fixture video (76 s of synthesised speech).
 * Uses real storage, transcription and Nelio AI (a few cents per run), drives each step directly (no Redis),
 * asserts every result, then removes the test files and soft-deletes the test workspace.
 * Usage: pnpm --filter @nelio/worker-node check:pipeline
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { db, deleteObject, headObject, putObject, startProcessingRun, storageKeys } from "@nelio/db";
import { processingEstimate, processingSplit } from "@nelio/domain";
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
