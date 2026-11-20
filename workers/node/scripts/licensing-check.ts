/**
 * End-to-end check of Milestone 5 licensing against the real database and storage (no AI or transcription calls).
 * A test creator lists a video; a test workspace licenses it, imports it, schedules and publishes posts; then the
 * licence is revoked, another expires, and the video is excluded. Every gate and side effect is asserted.
 * Removes its files and hides its test records afterwards.
 * Usage: pnpm --filter @nelio/worker-node check:licensing
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { copyObject, db, deleteObject, headObject, licenseForAsset, putObject, startRenderRun, stopLicense, storageKeys, sweepLicenses } from "@nelio/db";
import { expiresAtFor, type TermsSnapshot } from "@nelio/domain";
import { checkCreatorVideos } from "../src/creator-videos";
import { processStep } from "../src/steps";

let failures = 0;
const check = (label: string, ok: boolean, got?: unknown) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(got)})`}`);
  if (!ok) failures++;
};
const rejects = async (label: string, fn: () => Promise<unknown>) => {
  try { await fn(); check(label, false, "accepted"); } catch { check(label, true); }
};
const tag = `zz-lic-${Date.now().toString(36)}`;
const client = db();
const creatorUser = randomUUID();
const ownerUser = randomUUID();
let orgId = "";
let creatorId = "";
const keys: string[] = [];

try {
  // --- The creator: verified channel, published free terms, one uploaded video.
  await client.user.create({ data: { id: creatorUser, email: `${tag}-creator@nelio-test.invalid`, fullName: "Licensing Check Creator" } });
  const profile = await client.creatorProfile.create({ data: { userId: creatorUser, displayName: `Check Creator ${tag}`, primaryPlatform: "youtube", verificationStatus: "verified", listingStatus: "listed" } });
  creatorId = profile.id;
  await client.creatorChannel.create({ data: { creatorId, platform: "youtube", title: "Check channel", externalId: `UC${tag}`, status: "verified", method: "manual", verifiedAt: new Date() } });
  const terms: TermsSnapshot = { licenseType: "free", allowedUses: ["clips"], platforms: ["instagram", "youtube"], commercial: false, attribution: "@zzcheck", edits: ["captions", "crops", "trims"], expiresMonths: 12, excludedCount: 0 };
  await client.licenseTerms.create({ data: { creatorId, licenseType: "free", allowedUses: terms.allowedUses, platforms: terms.platforms, commercial: false, attribution: terms.attribution, expiresMonths: 12, version: 1, publishedAt: new Date() } });
  const file = await readFile(new URL("../fixtures/budgeting_talk.mp4", import.meta.url));
  const video = await client.creatorVideo.create({ data: { creatorId, title: "Budgeting talk", filename: "budgeting_talk.mp4", contentType: "video/mp4", sizeBytes: BigInt(file.length), storageKey: `pending/${randomUUID()}`, status: "ready" } });
  const vKey = storageKeys.creatorVideo(creatorId, video.id, "mp4");
  keys.push(vKey, storageKeys.creatorPoster(creatorId, video.id));
  await client.creatorVideo.update({ where: { id: video.id }, data: { storageKey: vKey } });
  await putObject(vKey, file, "video/mp4");
  // Run the worker loop until it reaches our video (other test videos may be queued ahead of it).
  for (let i = 0; i < 5 && !(await client.creatorVideo.findUniqueOrThrow({ where: { id: video.id } })).checkedAt; i++) await checkCreatorVideos();
  const v = await client.creatorVideo.findUniqueOrThrow({ where: { id: video.id } });
  check("worker read the creator video's length", Math.abs((v.durationSec ?? 0) - 76) < 2, v.durationSec);
  check("worker saved a poster frame", Boolean(v.posterKey && (await headObject(v.posterKey))), v.posterKey);

  // --- The licensee workspace.
  await client.user.create({ data: { id: ownerUser, email: `${tag}-owner@nelio-test.invalid`, fullName: "Licensing Check Owner" } });
  const org = await client.organization.create({ data: { name: tag, slug: tag, accountType: "business", plan: "business" } });
  orgId = org.id;
  await client.organizationMembership.create({ data: { orgId, userId: ownerUser, role: "owner" } });
  const ws = await client.workspace.create({ data: { orgId, name: `Check Biz ${tag}`, slug: tag } });

  // --- Accepting a free licence: one open licence per pair, paid never stored.
  const now = new Date();
  const agreement = await client.licenseAgreement.create({ data: { creatorId, orgId, workspaceId: ws.id, type: "free", status: "active", terms, termsVersion: 1, requestedById: ownerUser, startsAt: now, expiresAt: expiresAtFor(terms, now), decidedAt: now } });
  check("licence ends 12 months after it starts", agreement.expiresAt!.getUTCFullYear() === now.getUTCFullYear() + 1, agreement.expiresAt);
  await rejects("a second open licence for the same pair is refused", () => client.licenseAgreement.create({ data: { creatorId, orgId, workspaceId: ws.id, type: "free", status: "requested", terms, termsVersion: 1, requestedById: ownerUser } }));
  await rejects("a paid licence can't be stored", () => client.licenseAgreement.create({ data: { creatorId, orgId, workspaceId: ws.id, type: "paid", status: "declined", terms, termsVersion: 1, requestedById: ownerUser } }));

  // --- Import ("Clip this"): server-side copy into the workspace, recorded under the licence.
  const asset = await client.mediaAsset.create({ data: { orgId, workspaceId: ws.id, filename: "Check · Budgeting talk", contentType: "video/mp4", sizeBytes: BigInt(file.length), durationSec: 76, storageKey: `pending/${randomUUID()}`, status: "ready", rights: "license", rightsRef: "r-901", licenseAgreementId: agreement.id, creatorVideoId: video.id, uploadedByUserId: ownerUser } });
  const aKey = storageKeys.source(ws.id, asset.id, "mp4");
  keys.push(aKey);
  await client.mediaAsset.update({ where: { id: asset.id }, data: { storageKey: aKey } });
  await copyObject(vKey, aKey, "video/mp4");
  check("licensed video copied into the workspace", (await headObject(aKey))?.size === file.length);
  await rejects("a licensed video must be marked as licensed", () => client.mediaAsset.create({ data: { orgId, workspaceId: ws.id, filename: "x", contentType: "video/mp4", sizeBytes: 1n, storageKey: `pending/${randomUUID()}`, rights: "own", rightsRef: "r-902", licenseAgreementId: agreement.id, uploadedByUserId: ownerUser } }));

  let lic = await licenseForAsset(client, asset.id, { action: "process" });
  check("gate allows processing under an active licence", lic?.check.ok === true, lic?.check);
  check("gate reports the attribution", lic?.attribution === "@zzcheck", lic?.attribution);
  lic = await licenseForAsset(client, asset.id, { action: "publish", platform: "tiktok" });
  check("gate refuses a platform the licence doesn't cover", lic?.check.ok === false && lic.check.code === "platform", lic?.check);

  // --- Clips and posts made under the licence.
  const project = await client.clipProject.create({ data: { orgId, workspaceId: ws.id, assetId: asset.id, name: "Check clip", startMs: 0, endMs: 20_000, hook: "Check", createdById: ownerUser } });
  const ready = await client.render.create({ data: { orgId, workspaceId: ws.id, projectId: project.id, revision: 1, hook: "Check", captionStyle: "bold_pop", format: "9:16", status: "ready", estimatedCredits: 9, createdById: ownerUser } });
  const scheduled = await client.post.create({ data: { orgId, workspaceId: ws.id, renderId: ready.id, title: "Scheduled", platforms: ["instagram"], state: "scheduled", createdById: ownerUser } });
  const published = await client.post.create({ data: { orgId, workspaceId: ws.id, renderId: ready.id, title: "Published", platforms: ["instagram"], state: "published", createdById: ownerUser } });
  const draft = await client.post.create({ data: { orgId, workspaceId: ws.id, renderId: ready.id, title: "Draft", platforms: ["instagram"], state: "draft", createdById: ownerUser } });
  const queued = await client.$transaction((tx) => startRenderRun(tx, { projectId: project.id, userId: ownerUser, estimate: 9 }));

  // --- Revocation (LI-09): stops at once, holds, flags, cancels, tells the workspace.
  const r = await client.$transaction((tx) => stopLicense(tx, { agreementId: agreement.id, why: "revoked", reason: "Check revoke", actorUserId: creatorUser }));
  check("revocation reports its impact", r?.held === 1 && r.flagged === 1 && r.canceled === 1, r);
  check("revoking twice does nothing", (await client.$transaction((tx) => stopLicense(tx, { agreementId: agreement.id, why: "revoked" }))) === null);
  check("scheduled post is on hold", (await client.post.findUniqueOrThrow({ where: { id: scheduled.id } })).state === "on_hold");
  check("published post is flagged for review", (await client.post.findUniqueOrThrow({ where: { id: published.id } })).rightsFlag === "review");
  check("draft is left as a draft", (await client.post.findUniqueOrThrow({ where: { id: draft.id } })).state === "draft");
  const qr = await client.render.findUniqueOrThrow({ where: { id: queued.renderId } });
  const qrun = await client.agentRun.findUniqueOrThrow({ where: { id: queued.runId } });
  check("queued render canceled, nothing charged", qr.status === "canceled" && qrun.actualCredits === 0, { status: qr.status, actual: qrun.actualCredits });
  const note = await client.notification.findFirst({ where: { userId: ownerUser, dedupeKey: `license:${agreement.id}:revoked` } });
  check("workspace owner notified with the reason", Boolean(note?.body?.includes("Check revoke")), note?.body);
  check("revocation is in the audit trail", (await client.auditEvent.count({ where: { action: "license.revoked", targetId: agreement.id } })) === 1);
  lic = await licenseForAsset(client, asset.id, { action: "render" });
  check("gate refuses new renders after revocation", lic?.check.ok === false && lic.check.code === "revoked", lic?.check);
  const late = await client.$transaction((tx) => startRenderRun(tx, { projectId: project.id, userId: ownerUser, estimate: 9, key: `check-late:${project.id}` }));
  const lateStep = await client.runStep.findFirstOrThrow({ where: { runId: late.runId } });
  await processStep(lateStep.id);
  const ls = await client.runStep.findUniqueOrThrow({ where: { id: lateStep.id } });
  check("worker blocks a render that slipped through", ls.status === "blocked" && ls.reason === "license", { status: ls.status, reason: ls.reason });

  // --- Expiry (worker sweep) and the two-week warning.
  const past = new Date(Date.now() - 60_000);
  const expiring = await client.licenseAgreement.create({ data: { creatorId, orgId, workspaceId: ws.id, type: "free", status: "active", terms, termsVersion: 1, requestedById: ownerUser, startsAt: new Date(Date.now() - 86_400_000), expiresAt: past, decidedAt: past } });
  check("an expired licence is refused before the sweep runs", (await licenseForAsset(client, (await client.mediaAsset.update({ where: { id: asset.id }, data: { licenseAgreementId: expiring.id }, select: { id: true } })).id, { action: "process" }))?.check.ok === false);
  await sweepLicenses(client);
  check("sweep marks it expired", (await client.licenseAgreement.findUniqueOrThrow({ where: { id: expiring.id } })).status === "expired");
  check("owner told it expired", Boolean(await client.notification.findFirst({ where: { userId: ownerUser, dedupeKey: `license:${expiring.id}:expired` } })));
  const ending = await client.licenseAgreement.create({ data: { creatorId, orgId, workspaceId: ws.id, type: "free", status: "active", terms, termsVersion: 1, requestedById: ownerUser, startsAt: new Date(), expiresAt: new Date(Date.now() + 5 * 86_400_000), decidedAt: new Date() } });
  await sweepLicenses(client);
  await sweepLicenses(client);
  const warn = await client.notification.findMany({ where: { userId: ownerUser, dedupeKey: `license:${ending.id}:ending` } });
  check("warned once that it ends in 5 days", warn.length === 1 && warn[0]!.title.includes("5 days"), warn.map((w) => w.title));

  // --- Excluded video and suspended listing.
  await client.mediaAsset.update({ where: { id: asset.id }, data: { licenseAgreementId: ending.id } });
  await client.creatorVideo.update({ where: { id: video.id }, data: { excluded: true, excludeReason: "Licensed music" } });
  lic = await licenseForAsset(client, asset.id, { action: "process" });
  check("excluded video is refused even under an active licence", lic?.check.ok === false && lic.check.code === "excluded", lic?.check);
  await client.creatorVideo.update({ where: { id: video.id }, data: { excluded: false, excludeReason: null } });
  await client.creatorProfile.update({ where: { id: creatorId }, data: { listingStatus: "suspended" } });
  lic = await licenseForAsset(client, asset.id, { action: "process" });
  check("suspended listing pauses its licences", lic?.check.ok === false && lic.check.code === "suspended", lic?.check);
} catch (e) {
  failures++;
  console.log("FAIL  unexpected error:", e instanceof Error ? e.message.replace(/(postgres(ql)?|rediss?|https?):\/\/\S+/g, "[url]") : e);
} finally {
  for (const k of keys) await deleteObject(k).catch(() => {});
  if (orgId) {
    await client.licenseAgreement.updateMany({ where: { workspaceId: { in: (await client.workspace.findMany({ where: { orgId }, select: { id: true } })).map((w) => w.id) }, status: "active" }, data: { status: "canceled" } }).catch(() => {});
    await client.workspace.updateMany({ where: { orgId }, data: { deletedAt: new Date() } }).catch(() => {});
    await client.organization.update({ where: { id: orgId }, data: { deletedAt: new Date() } }).catch(() => {});
  }
  if (creatorId) {
    await client.creatorProfile.update({ where: { id: creatorId }, data: { listingStatus: "draft" } }).catch(() => {});
    await client.creatorVideo.updateMany({ where: { creatorId }, data: { deletedAt: new Date() } }).catch(() => {});
  }
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll licensing checks passed");
  await client.$disconnect();
  process.exit(failures ? 1 : 0);
}
