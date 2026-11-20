"use server";

import { copyObject, db, findWorkspaceFor, isStorageConfigured, licenseForAsset, notify, recordActivity, startProcessingRun, storageKeys, type WorkspaceSummary } from "@nelio/db";
import { ACCEPTED_TYPES, EXPIRY_CHOICES, LICENSE_PLATFORMS, can, checkUse, expiresAtFor, processingEstimate, processingSplit, type LicensePlatform, type TermsSnapshot } from "@nelio/domain";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";
import { readTerms } from "../creator";

type Fail = { ok: false; error: string; field?: string };

async function authorize(slug: string): Promise<{ session: Session; ws: WorkspaceSummary; full: boolean } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, "licensing.request", ws);
  if (!d.allowed) return { ok: false, error: "You don’t have permission to license content here." };
  return { session, ws, full: d.access === "F" || d.access === "A" };
}

/** The creator's published, listed terms, or why they can't be licensed right now. */
async function sourceTerms(creatorId: string): Promise<{ ok: true; terms: TermsSnapshot; version: number; userId: string; name: string } | Fail> {
  const p = await db().creatorProfile.findUnique({
    where: { id: creatorId },
    select: { userId: true, displayName: true, listingStatus: true, channels: { where: { status: "verified" }, select: { id: true }, take: 1 }, terms: true, _count: { select: { videos: { where: { excluded: true, deletedAt: null } } } } },
  });
  if (!p || !p.terms?.publishedAt) return { ok: false, error: "This creator isn’t licensing their videos right now." };
  if (p.listingStatus === "suspended") return { ok: false, error: "This listing is suspended while ownership is reviewed." };
  if (p.listingStatus !== "listed" || !p.channels.length) return { ok: false, error: "This creator isn’t licensing their videos right now." };
  if (p.terms.licenseType === "paid") return { ok: false, error: "Paid licensing is coming later." };
  return { ok: true, terms: { ...readTerms(p.terms), excludedCount: p._count.videos }, version: p.terms.version, userId: p.userId, name: p.displayName };
}

/** An active licence whose date has passed is closed first, so a renewal can start (one open licence per creator). */
async function closeLapsed(tx: Parameters<Parameters<ReturnType<typeof db>["$transaction"]>[0]>[0], creatorId: string, workspaceId: string) {
  await tx.licenseAgreement.updateMany({ where: { creatorId, workspaceId, status: "active", expiresAt: { lte: new Date() } }, data: { status: "expired" } });
}

const isUniqueClash = (e: unknown) => typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002";

// ------------------------------------------------------------------ LI-03 Accept a free licence

export async function acceptFreeLicenseAction(slug: string, creatorId: string, confirm: { rules: boolean; revocable: boolean }): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  if (!a.full) return { ok: false, error: "Ask a workspace manager to accept licences." };
  if (!confirm.rules || !confirm.revocable) return { ok: false, field: "confirm", error: "Tick both boxes to accept the license." };
  const src = await sourceTerms(creatorId);
  if (!src.ok) return src;
  if (src.terms.licenseType !== "free") return { ok: false, error: "This creator approves each request. Send a request instead." };
  // A revoked licence can't be taken back on free terms: the owner decides again.
  const last = await db().licenseAgreement.findFirst({ where: { creatorId, workspaceId: a.ws.workspaceId, status: { in: ["active", "revoked", "expired"] } }, orderBy: { createdAt: "desc" }, select: { status: true } });
  if (last?.status === "revoked") return { ok: false, error: "The owner revoked your license, so it can’t be accepted again here." };
  const now = new Date();
  try {
    await db().$transaction(async (tx) => {
      await closeLapsed(tx, creatorId, a.ws.workspaceId);
      const ag = await tx.licenseAgreement.create({
        data: { creatorId, orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "free", status: "active", terms: src.terms, termsVersion: src.version, requestedById: a.session.user.id, startsAt: now, expiresAt: expiresAtFor(src.terms, now), decidedAt: now },
        select: { id: true },
      });
      await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.accepted", targetType: "license_agreement", targetId: ag.id, metadata: { creatorId, type: "free", termsVersion: src.version, confirmed: ["attribution_and_platforms", "revocable"] } } });
      await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "license.active", status: "done", title: `Licensed ${src.name}’s videos`, detail: `Free license · by ${a.session.user.fullName}` });
      await notify(tx, { userId: src.userId, category: "licenses", title: `${a.ws.name} licensed your videos`, body: "Free license on your published terms.", href: "/creator", dedupeKey: `license:${ag.id}:accepted` });
    });
  } catch (e) {
    if (isUniqueClash(e)) return { ok: false, error: "You already have a license or a request open with this creator." };
    throw e;
  }
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ LI-03 Request a private licence

const requestSchema = z.object({
  note: z.string().trim().min(3).max(600),
  platforms: z.array(z.enum(LICENSE_PLATFORMS)).min(1).max(4),
  months: z.number().int().nullable(),
  rules: z.boolean(),
});

export async function requestPrivateLicenseAction(slug: string, creatorId: string, input: z.input<typeof requestSchema>): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    const f = parsed.error.issues[0]?.path[0];
    return { ok: false, field: String(f ?? ""), error: f === "note" ? "Say what you’ll use it for." : f === "platforms" ? "Pick at least one platform." : "Check the request and try again." };
  }
  const v = parsed.data;
  if (!v.rules) return { ok: false, field: "confirm", error: "Tick the box to send the request." };
  const src = await sourceTerms(creatorId);
  if (!src.ok) return src;
  if (v.platforms.some((p) => !src.terms.platforms.includes(p as LicensePlatform))) return { ok: false, field: "platforms", error: "Pick platforms the creator allows." };
  if (!(EXPIRY_CHOICES as readonly (number | null)[]).includes(v.months) || (src.terms.expiresMonths !== null && (v.months === null || v.months > src.terms.expiresMonths))) return { ok: false, field: "months", error: "Pick a length the creator allows." };
  const snapshot: TermsSnapshot = { ...src.terms, licenseType: "private", platforms: v.platforms as LicensePlatform[], expiresMonths: v.months };
  try {
    await db().$transaction(async (tx) => {
      await closeLapsed(tx, creatorId, a.ws.workspaceId);
      const ag = await tx.licenseAgreement.create({
        data: { creatorId, orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "private", status: "requested", terms: snapshot, termsVersion: src.version, requestNote: v.note, requestedById: a.session.user.id },
        select: { id: true },
      });
      await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.requested", targetType: "license_agreement", targetId: ag.id, metadata: { creatorId, platforms: v.platforms, months: v.months } } });
      await notify(tx, { userId: src.userId, category: "licenses", title: `${a.ws.name} wants a private license`, body: v.note.slice(0, 140), href: "/creator", dedupeKey: `license:${ag.id}:requested` });
    });
  } catch (e) {
    if (isUniqueClash(e)) return { ok: false, error: "You already have a license or a request open with this creator." };
    throw e;
  }
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}

export async function cancelRequestAction(slug: string, agreementId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const r = await db().licenseAgreement.updateMany({ where: { id: agreementId, workspaceId: a.ws.workspaceId, status: "requested" }, data: { status: "canceled", decidedAt: new Date() } });
  if (!r.count) return { ok: false, error: "That request was already answered." };
  await db().auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.request_canceled", targetType: "license_agreement", targetId: agreementId } });
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ Clip a licensed video (LI-02 Licensed → CL-03)

/**
 * "Clip this": copies the creator's video into the workspace under the active licence and starts processing
 * with the workspace's defaults. The licence is checked here and again by every later step.
 */
export async function importLicensedVideoAction(slug: string, creatorVideoId: string): Promise<{ ok: true; assetId: string } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, "media.upload", ws);
  if (!d.allowed || d.access === "R" || d.access === "V") return { ok: false, error: "You don’t have permission to add videos here." };
  if (!isStorageConfigured()) return { ok: false, error: "Video storage isn’t switched on for this deployment yet." };
  const client = db();
  const video = await client.creatorVideo.findFirst({ where: { id: creatorVideoId, status: "ready", deletedAt: null }, select: { id: true, creatorId: true, title: true, filename: true, contentType: true, sizeBytes: true, durationSec: true, storageKey: true, excluded: true, creator: { select: { displayName: true, listingStatus: true } } } });
  if (!video) return { ok: false, error: "This video isn’t available any more." };
  const existing = await client.mediaAsset.findFirst({ where: { workspaceId: ws.workspaceId, creatorVideoId: video.id, deletedAt: null, status: { notIn: ["failed"] } }, select: { id: true, licenseAgreementId: true } });
  if (existing) {
    const lic = await licenseForAsset(client, existing.id, { action: "process" });
    if (lic && !lic.check.ok) return { ok: false, error: lic.check.message };
    return { ok: true, assetId: existing.id };
  }
  const now = new Date();
  const agreement = await client.licenseAgreement.findFirst({ where: { creatorId: video.creatorId, workspaceId: ws.workspaceId, status: "active" }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, expiresAt: true, type: true, terms: true } });
  const terms = readTerms(agreement?.terms);
  const check = checkUse(agreement ? { ...agreement, terms } : null, video.creator.listingStatus, { action: "process", videoExcluded: video.excluded }, now);
  if (!check.ok) return { ok: false, error: check.message };
  const type = (Object.keys(ACCEPTED_TYPES) as (keyof typeof ACCEPTED_TYPES)[]).find((t) => t === video.contentType) ?? "video/mp4";
  const settings = await client.workspace.findUniqueOrThrow({ where: { id: ws.workspaceId }, select: { processingQuality: true, captionLanguage: true } });
  const estimate = video.durationSec ? processingEstimate(video.durationSec, settings.processingQuality) : 1;

  const asset = await client.$transaction(async (tx) => {
    let rightsRef = "";
    for (let i = 0; i < 8 && !rightsRef; i++) {
      const c = `r-${randomInt(100, 1000)}`;
      if (!(await tx.mediaAsset.findFirst({ where: { workspaceId: ws.workspaceId, rightsRef: c }, select: { id: true } }))) rightsRef = c;
    }
    const created = await tx.mediaAsset.create({
      data: {
        orgId: ws.orgId, workspaceId: ws.workspaceId, filename: `${video.creator.displayName} · ${video.title}`, contentType: type, sizeBytes: video.sizeBytes, durationSec: video.durationSec,
        storageKey: `pending/${crypto.randomUUID()}`, status: "uploading", rights: "license", rightsNote: `Licensed from ${video.creator.displayName}`, rightsRef: rightsRef || `r-${randomInt(1000, 100000)}`,
        licenseAgreementId: agreement!.id, creatorVideoId: video.id, quality: settings.processingQuality, language: settings.captionLanguage, estimatedCredits: estimate, uploadedByUserId: session.user.id,
      },
      select: { id: true },
    });
    const key = storageKeys.source(ws.workspaceId, created.id, ACCEPTED_TYPES[type]);
    await tx.mediaAsset.update({ where: { id: created.id }, data: { storageKey: key } });
    await tx.auditEvent.create({ data: { orgId: ws.orgId, workspaceId: ws.workspaceId, actorUserId: session.user.id, action: "media.license_import", targetType: "media_asset", targetId: created.id, metadata: { agreementId: agreement!.id, creatorVideoId: video.id } } });
    return { id: created.id, key };
  });
  try {
    await copyObject(video.storageKey, asset.key, type);
  } catch {
    await client.mediaAsset.update({ where: { id: asset.id }, data: { status: "failed", statusText: "Couldn’t copy the video. Try again." } });
    return { ok: false, error: "Couldn’t copy the video. Try again in a moment." };
  }
  await client.$transaction(async (tx) => {
    await tx.mediaAsset.update({ where: { id: asset.id }, data: { status: "uploaded" } });
    await recordActivity(tx, { orgId: ws.orgId, workspaceId: ws.workspaceId, type: "media.uploaded", status: "done", title: `Added ${video.title} from ${video.creator.displayName}`, detail: `Licensed · by ${session.user.fullName}` });
    await startProcessingRun(tx, { assetId: asset.id, userId: session.user.id, split: processingSplit(estimate) });
  });
  revalidatePath(`/w/${slug}/media`);
  return { ok: true, assetId: asset.id };
}
