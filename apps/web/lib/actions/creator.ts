"use server";

import { PART_SIZE, abortMultipart, completeMultipart, db, headObject, isStorageConfigured, notify, signParts, startMultipart, storageKeys } from "@nelio/db";
import { ACCEPTED_TYPES, ATTRIBUTION_MAX, EXPIRY_CHOICES, LICENSE_EDITS, LICENSE_PLATFORMS, LICENSE_USES, checkUpload, expiresAtFor, validateTerms, videoTypeFor } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "../auth";
import { PAYOUTS_FEATURE, readTerms } from "../creator";

type Fail = { ok: false; error: string; field?: string };

/** Every creator action: a signed-in content owner acting on their own profile only. */
async function creator(): Promise<{ userId: string; creatorId: string; name: string } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  if (!session.actor.isContentOwner) return { ok: false, error: "Only content owners can do that." };
  const p = await db().creatorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true, displayName: true } });
  if (!p) return { ok: false, error: "Only content owners can do that." };
  return { userId: session.user.id, creatorId: p.id, name: p.displayName };
}

// ------------------------------------------------------------------ LI-07 Publish terms

const termsSchema = z.object({
  licenseType: z.enum(["free", "private", "paid"]),
  allowedUses: z.array(z.enum(LICENSE_USES)).max(2),
  platforms: z.array(z.enum(LICENSE_PLATFORMS)).max(4),
  commercial: z.boolean(),
  attribution: z.string().trim().max(ATTRIBUTION_MAX + 20),
  expiresMonths: z.number().int().nullable(),
  hasThirdParty: z.boolean(),
  thirdPartyNote: z.string().trim().max(1000),
});
export type TermsInput = z.input<typeof termsSchema>;

/** "Publish terms": checks them, saves a new version and lists the creator in the marketplace. Licences already given keep their snapshot. */
export async function publishTermsAction(input: TermsInput): Promise<{ ok: true } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  const parsed = termsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the terms and try again." };
  const v = parsed.data;
  const client = db();
  const [verified, excludedCount] = await Promise.all([
    client.creatorChannel.count({ where: { creatorId: c.creatorId, status: "verified" } }),
    client.creatorVideo.count({ where: { creatorId: c.creatorId, excluded: true, deletedAt: null } }),
  ]);
  const problems = validateTerms({ ...v, edits: [...LICENSE_EDITS], excludedCount }, { verified: verified > 0 });
  if (problems.length) return { ok: false, error: problems[0]!.message, field: problems[0]!.field };
  if (v.hasThirdParty && !v.thirdPartyNote) return { ok: false, error: "Say which videos have music or footage you don’t own.", field: "thirdPartyNote" };
  if (!(EXPIRY_CHOICES as readonly (number | null)[]).includes(v.expiresMonths)) return { ok: false, error: "Pick an expiry from the list.", field: "expiresMonths" };
  await client.$transaction(async (tx) => {
    const data = { licenseType: v.licenseType, allowedUses: v.allowedUses, platforms: v.platforms, commercial: v.commercial, attribution: v.attribution, edits: [...LICENSE_EDITS], expiresMonths: v.expiresMonths, hasThirdParty: v.hasThirdParty, thirdPartyNote: v.hasThirdParty ? v.thirdPartyNote : "", publishedAt: new Date() };
    const t = await tx.licenseTerms.upsert({ where: { creatorId: c.creatorId }, create: { creatorId: c.creatorId, ...data, version: 1 }, update: { ...data, version: { increment: 1 } }, select: { version: true } });
    // A suspended listing stays suspended until a platform admin clears it.
    await tx.creatorProfile.updateMany({ where: { id: c.creatorId, listingStatus: { not: "suspended" } }, data: { listingStatus: "listed" } });
    await tx.auditEvent.create({ data: { actorUserId: c.userId, action: "license_terms.published", targetType: "creator_profile", targetId: c.creatorId, metadata: { version: t.version, licenseType: v.licenseType, platforms: v.platforms, commercial: v.commercial } } });
  });
  revalidatePath("/creator", "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ Excluded videos

const REASONS = ["Licensed music", "Guest footage", "Third-party footage", "Other"] as const;

/** Include or exclude one video. Excluded videos are never licensable, including under licences already given. */
export async function setVideoExcludedAction(videoId: string, excluded: boolean, reason?: string): Promise<{ ok: true } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  const why = excluded ? (REASONS as readonly string[]).includes(reason ?? "") ? reason! : "Third-party footage" : null;
  const r = await db().creatorVideo.updateMany({ where: { id: videoId, creatorId: c.creatorId, deletedAt: null }, data: { excluded, excludeReason: why } });
  if (!r.count) return { ok: false, error: "That video isn’t in your library any more." };
  await db().auditEvent.create({ data: { actorUserId: c.userId, action: excluded ? "creator_video.excluded" : "creator_video.included", targetType: "creator_video", targetId: videoId, metadata: { reason: why } } });
  revalidatePath("/creator", "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ The creator's videos: direct uploads

const startSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().max(100),
  size: z.number().int().positive(),
  durationSec: z.number().positive().max(24 * 3600).nullable(),
});

export async function startCreatorUploadAction(input: z.input<typeof startSchema>): Promise<{ ok: true; videoId: string; partSize: number; partCount: number } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  if (!isStorageConfigured()) return { ok: false, error: "Uploads aren’t switched on for this deployment yet." };
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: "file", error: "Check the file and try again." };
  const v = parsed.data;
  const problem = checkUpload({ name: v.name, type: v.type, size: v.size, durationSec: v.durationSec });
  if (problem) return { ok: false, field: "file", error: problem.text };
  const type = videoTypeFor(v.name, v.type)!;
  const client = db();
  const created = await client.creatorVideo.create({
    data: { creatorId: c.creatorId, title: v.name.replace(/\.[^.]+$/, "").slice(0, 120) || v.name, filename: v.name, contentType: type, sizeBytes: BigInt(v.size), durationSec: v.durationSec, storageKey: `pending/${crypto.randomUUID()}` },
    select: { id: true },
  });
  const key = storageKeys.creatorVideo(c.creatorId, created.id, ACCEPTED_TYPES[type]);
  try {
    const uploadId = await startMultipart(key, type);
    await client.creatorVideo.update({ where: { id: created.id }, data: { storageKey: key, multipartId: uploadId } });
  } catch {
    await client.creatorVideo.update({ where: { id: created.id }, data: { status: "failed" } });
    return { ok: false, error: "Storage didn’t accept the upload. Try again in a moment." };
  }
  await client.auditEvent.create({ data: { actorUserId: c.userId, action: "creator_video.upload_started", targetType: "creator_video", targetId: created.id, metadata: { size: v.size } } });
  return { ok: true, videoId: created.id, partSize: PART_SIZE, partCount: Math.ceil(v.size / PART_SIZE) };
}

async function uploading(videoId: string) {
  const c = await creator();
  if ("ok" in c) return c;
  const v = await db().creatorVideo.findFirst({ where: { id: videoId, creatorId: c.creatorId, status: "uploading", deletedAt: null }, select: { id: true, storageKey: true, multipartId: true, sizeBytes: true } });
  if (!v?.multipartId) return { ok: false as const, error: "This upload isn’t active any more." };
  return { ...c, video: { ...v, multipartId: v.multipartId } };
}

export async function signCreatorPartsAction(videoId: string, parts: number[]): Promise<{ ok: true; urls: { part: number; url: string }[] } | Fail> {
  const g = await uploading(videoId);
  if ("ok" in g) return g;
  const max = Math.ceil(Number(g.video.sizeBytes) / PART_SIZE);
  const wanted = [...new Set(parts)].filter((p) => Number.isInteger(p) && p >= 1 && p <= max).slice(0, 8);
  return { ok: true, urls: await signParts(g.video.storageKey, g.video.multipartId, wanted) };
}

export async function completeCreatorUploadAction(videoId: string, parts: { part: number; etag: string }[]): Promise<{ ok: true } | Fail> {
  const g = await uploading(videoId);
  if ("ok" in g) return g;
  const clean = parts.filter((p) => Number.isInteger(p.part) && p.part > 0 && typeof p.etag === "string" && p.etag.length < 200);
  try {
    await completeMultipart(g.video.storageKey, g.video.multipartId, clean);
  } catch {
    return { ok: false, error: "Some parts didn’t arrive. Try the upload again." };
  }
  const stored = await headObject(g.video.storageKey);
  if (!stored || stored.size !== Number(g.video.sizeBytes)) {
    await db().creatorVideo.update({ where: { id: g.video.id }, data: { status: "failed", multipartId: null } });
    return { ok: false, error: "The stored file doesn’t match what was sent. Try again." };
  }
  await db().creatorVideo.update({ where: { id: g.video.id }, data: { status: "ready", multipartId: null } });
  revalidatePath("/creator", "layout");
  return { ok: true };
}

export async function cancelCreatorUploadAction(videoId: string): Promise<{ ok: boolean }> {
  const g = await uploading(videoId);
  if ("ok" in g) return { ok: false };
  await abortMultipart(g.video.storageKey, g.video.multipartId);
  await db().creatorVideo.update({ where: { id: g.video.id }, data: { status: "failed", multipartId: null, deletedAt: new Date() } });
  return { ok: true };
}

/** Takes a video out of the library. Licensees can't start new clips from it; their existing copies follow their licence. */
export async function removeCreatorVideoAction(videoId: string): Promise<{ ok: true } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  const r = await db().creatorVideo.updateMany({ where: { id: videoId, creatorId: c.creatorId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!r.count) return { ok: false, error: "That video isn’t in your library any more." };
  await db().auditEvent.create({ data: { actorUserId: c.userId, action: "creator_video.removed", targetType: "creator_video", targetId: videoId } });
  revalidatePath("/creator", "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ LI-10 Payouts: Notify me

export async function notifyPayoutsAction(): Promise<{ ok: true } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  await db().featureInterest.upsert({ where: { userId_feature: { userId: c.userId, feature: PAYOUTS_FEATURE } }, create: { userId: c.userId, feature: PAYOUTS_FEATURE }, update: {} });
  revalidatePath("/creator/payouts");
  return { ok: true };
}

// ------------------------------------------------------------------ LI-05 Requests: approve or decline a private licence

/**
 * The creator decides on a request. Approving starts the licence now, on the terms snapshot the requester saw;
 * it ends after the snapshot's months (or runs until revoked). The requester hears either way.
 */
export async function decideRequestAction(agreementId: string, decision: "approve" | "decline", note?: string): Promise<{ ok: true } | Fail> {
  const c = await creator();
  if ("ok" in c) return c;
  const message = (note ?? "").trim().slice(0, 500) || null;
  const r = await db().$transaction(async (tx) => {
    const a = await tx.licenseAgreement.findFirst({ where: { id: agreementId, creatorId: c.creatorId, status: "requested" }, select: { id: true, orgId: true, workspaceId: true, terms: true, requestedById: true, workspace: { select: { slug: true, name: true } } } });
    if (!a) return null;
    const now = new Date();
    const approve = decision === "approve";
    await tx.licenseAgreement.update({
      where: { id: a.id },
      data: approve
        ? { status: "active", startsAt: now, expiresAt: expiresAtFor(readTerms(a.terms), now), decidedAt: now, decisionNote: message }
        : { status: "declined", decidedAt: now, decisionNote: message },
    });
    await tx.auditEvent.create({ data: { orgId: a.orgId, workspaceId: a.workspaceId, actorUserId: c.userId, action: approve ? "license.approved" : "license.declined", targetType: "license_agreement", targetId: a.id } });
    await notify(tx, {
      userId: a.requestedById, orgId: a.orgId, workspaceId: a.workspaceId, category: "licenses",
      title: approve ? `${c.name} approved your license` : `${c.name} declined your license request`,
      body: approve ? "You can clip their videos within the terms." : message ?? "You can browse other creators in the marketplace.",
      href: `/w/${a.workspace.slug}/licensing/mine`, dedupeKey: `license:${a.id}:${decision}`,
    });
    return a;
  });
  if (!r) return { ok: false, error: "That request was already answered." };
  revalidatePath("/creator", "layout");
  return { ok: true };
}
