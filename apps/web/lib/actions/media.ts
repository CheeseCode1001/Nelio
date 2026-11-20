"use server";

import {
  PART_SIZE, abortMultipart, completeMultipart, db, findWorkspaceFor, headObject, isStorageConfigured, recordActivity, signParts, startMultipart,
  startProcessingRun, storageKeys, type WorkspaceSummary,
} from "@nelio/db";
import { ACCEPTED_TYPES, can, checkUpload, processingEstimate, processingSplit, videoTypeFor } from "@nelio/domain";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";

type Fail = { ok: false; error: string; field?: string };

async function authorize(slug: string): Promise<{ session: Session; ws: WorkspaceSummary } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, "media.upload", ws);
  if (!d.allowed || d.access === "R" || d.access === "V") return { ok: false, error: "You don’t have permission to upload here." };
  if (!isStorageConfigured()) return { ok: false, error: "Uploads aren’t switched on for this deployment yet." };
  return { session, ws };
}

const startSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().max(100),
  size: z.number().int().positive(),
  durationSec: z.number().positive().max(24 * 3600).nullable(),
});
export type StartUploadInput = z.input<typeof startSchema>;

/**
 * Starts a direct upload as soon as a file is picked (CL-02 Uploading): checks the file, records the asset and
 * returns how many parts to send. Who owns the video is asked while it uploads, before processing starts.
 */
export async function startUploadAction(slug: string, input: StartUploadInput): Promise<{ ok: true; assetId: string; partSize: number; partCount: number } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check the file and try again.", field: "file" };
  }
  const v = parsed.data;
  const problem = checkUpload({ name: v.name, type: v.type, size: v.size, durationSec: v.durationSec });
  if (problem) return { ok: false, field: "file", error: problem.text };
  const type = videoTypeFor(v.name, v.type)!;
  const ext = ACCEPTED_TYPES[type];

  const client = db();
  const asset = await client.$transaction(async (tx) => {
    let rightsRef = "";
    for (let i = 0; i < 8 && !rightsRef; i++) {
      const candidate = `r-${randomInt(100, 1000)}`;
      if (!(await tx.mediaAsset.findFirst({ where: { workspaceId: a.ws.workspaceId, rightsRef: candidate }, select: { id: true } }))) rightsRef = candidate;
    }
    if (!rightsRef) rightsRef = `r-${randomInt(1000, 100000)}`;
    const created = await tx.mediaAsset.create({
      data: {
        orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, filename: v.name, contentType: type, sizeBytes: BigInt(v.size), durationSec: v.durationSec,
        storageKey: `pending/${crypto.randomUUID()}`, rightsRef, uploadedByUserId: a.session.user.id,
      },
      select: { id: true },
    });
    const key = storageKeys.source(a.ws.workspaceId, created.id, ext);
    await tx.mediaAsset.update({ where: { id: created.id }, data: { storageKey: key } });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "media.upload_started", targetType: "media_asset", targetId: created.id, metadata: { rightsRef, size: v.size } } });
    return { id: created.id, key };
  });
  try {
    const uploadId = await startMultipart(asset.key, type);
    await client.mediaAsset.update({ where: { id: asset.id }, data: { multipartId: uploadId } });
  } catch {
    await client.mediaAsset.update({ where: { id: asset.id }, data: { status: "failed", statusText: "Storage didn’t accept the upload." } });
    return { ok: false, error: "Storage didn’t accept the upload. Try again in a moment." };
  }
  return { ok: true, assetId: asset.id, partSize: PART_SIZE, partCount: Math.ceil(v.size / PART_SIZE) };
}

async function uploadingAsset(slug: string, assetId: string) {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const asset = await db().mediaAsset.findFirst({ where: { id: assetId, workspaceId: a.ws.workspaceId, status: "uploading", uploadedByUserId: a.session.user.id }, select: { id: true, storageKey: true, multipartId: true, sizeBytes: true, filename: true } });
  if (!asset?.multipartId) return { ok: false as const, error: "This upload isn’t active any more." };
  return { ...a, asset: { ...asset, multipartId: asset.multipartId } };
}

/** Signed URLs for up to 8 parts at a time (each valid for an hour). */
export async function signPartsAction(slug: string, assetId: string, parts: number[]): Promise<{ ok: true; urls: { part: number; url: string }[] } | Fail> {
  const g = await uploadingAsset(slug, assetId);
  if ("ok" in g) return g;
  const max = Math.ceil(Number(g.asset.sizeBytes) / PART_SIZE);
  const wanted = [...new Set(parts)].filter((p) => Number.isInteger(p) && p >= 1 && p <= max).slice(0, 8);
  return { ok: true, urls: await signParts(g.asset.storageKey, g.asset.multipartId, wanted) };
}

/** Finishes the upload and checks the stored size. Processing starts separately, once the owner is known. */
export async function completeUploadAction(slug: string, assetId: string, parts: { part: number; etag: string }[]): Promise<{ ok: true } | Fail> {
  const g = await uploadingAsset(slug, assetId);
  if ("ok" in g) return g;
  const clean = parts.filter((p) => Number.isInteger(p.part) && p.part > 0 && typeof p.etag === "string" && p.etag.length < 200);
  try {
    await completeMultipart(g.asset.storageKey, g.asset.multipartId, clean);
  } catch {
    return { ok: false, error: "Some parts didn’t arrive. Try the upload again." };
  }
  const stored = await headObject(g.asset.storageKey);
  if (!stored || stored.size !== Number(g.asset.sizeBytes)) {
    await db().mediaAsset.update({ where: { id: g.asset.id }, data: { status: "failed", statusText: "The stored file doesn’t match what was sent." } });
    return { ok: false, error: "The stored file doesn’t match what was sent. Try again." };
  }
  await db().$transaction(async (tx) => {
    await tx.mediaAsset.update({ where: { id: g.asset.id }, data: { status: "uploaded", multipartId: null } });
    await recordActivity(tx, { orgId: g.ws.orgId, workspaceId: g.ws.workspaceId, type: "media.uploaded", status: "done", title: `Uploaded ${g.asset.filename}`, detail: `By ${g.session.user.fullName}` });
  });
  revalidatePath(`/w/${slug}/media`);
  return { ok: true };
}

const processSchema = z.object({
  rights: z.enum(["own", "permission", "license"]).nullable(),
  rightsNote: z.string().trim().max(500).optional().default(""),
  quality: z.enum(["fast", "balanced", "high"]),
  language: z.string().min(2).max(10),
});
export type StartProcessingInput = z.input<typeof processSchema>;

/**
 * "Start processing" (CL-02): needs an uploaded file and the owner's answer (Norights board otherwise).
 * Licensed sources are picked from active licenses instead, which opens with licensing (Milestone 5).
 * The estimate the person saw is the one reserved.
 */
export async function startProcessingAction(slug: string, assetId: string, input: StartProcessingInput): Promise<{ ok: true; runId: string } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = processSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the processing options." };
  const v = parsed.data;
  if (!v.rights) return { ok: false, field: "rights", error: "Tell us who owns this video" };
  if (v.rights === "license") return { ok: false, field: "rights", error: "Pick an active license instead: open the creator from My licenses and choose “Clip this”." };
  const asset = await db().mediaAsset.findFirst({ where: { id: assetId, workspaceId: a.ws.workspaceId, status: "uploaded", deletedAt: null }, select: { id: true, durationSec: true } });
  if (!asset) return { ok: false, error: "This video isn’t ready to process." };
  const estimate = asset.durationSec ? processingEstimate(asset.durationSec, v.quality) : 1;
  const r = await db().$transaction(async (tx) => {
    await tx.mediaAsset.update({ where: { id: asset.id }, data: { rights: v.rights, rightsNote: v.rightsNote || null, quality: v.quality, language: v.language, estimatedCredits: estimate } });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "media.rights_confirmed", targetType: "media_asset", targetId: asset.id, metadata: { rights: v.rights } } });
    return startProcessingRun(tx, { assetId: asset.id, userId: a.session.user.id, split: processingSplit(estimate) });
  });
  revalidatePath(`/w/${slug}/media`);
  revalidatePath(`/w/${slug}/activity`);
  return { ok: true, runId: r.runId };
}

/** Cancels an upload in progress and removes its parts from storage. */
export async function cancelUploadAction(slug: string, assetId: string): Promise<{ ok: boolean }> {
  const g = await uploadingAsset(slug, assetId);
  if ("ok" in g) return { ok: false };
  await abortMultipart(g.asset.storageKey, g.asset.multipartId);
  await db().mediaAsset.update({ where: { id: g.asset.id }, data: { status: "failed", statusText: "Upload canceled", multipartId: null, deletedAt: new Date() } });
  return { ok: true };
}
