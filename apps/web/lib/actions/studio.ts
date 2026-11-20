"use server";

import { cancelRenderRun, db, findWorkspaceFor, startRenderRun, type WorkspaceSummary } from "@nelio/db";
import { CAPTION_STYLES, CLIP_FORMATS, buildVariants, can, clampCaptionSize, clampClip, exportsLeft, renderEstimate, transcriptLines, type ClipSnapshot, type PlanId, type Variant } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";

type Fail = { ok: false; error: string };

async function authorize(slug: string, permission: "content.edit" | "content.render"): Promise<{ session: Session; ws: WorkspaceSummary } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, permission, ws);
  if (!d.allowed || d.access === "R" || d.access === "V") return { ok: false, error: permission === "content.render" ? "You don’t have permission to render here." : "You don’t have permission to edit clips here." };
  return { session, ws };
}

const snapshotSchema = z.object({
  startMs: z.number().int().min(0),
  endMs: z.number().int().positive(),
  hook: z.string().trim().min(1).max(120),
  captionStyle: z.enum(Object.keys(CAPTION_STYLES) as [keyof typeof CAPTION_STYLES]),
  captionSize: z.number().int(),
  format: z.enum(Object.keys(CLIP_FORMATS) as [keyof typeof CLIP_FORMATS]),
  brandKitId: z.string().uuid().nullable(),
});

const same = (a: ClipSnapshot, b: ClipSnapshot) => JSON.stringify(a) === JSON.stringify(b);
const TX = { timeout: Number(process.env.NELIO_TX_TIMEOUT_MS ?? 20000) };

/** Trial plans allow two exports in total (Master Prompt 2); failed and canceled renders don't count. */
async function exportRoom(orgId: string, wanted: number): Promise<Fail | null> {
  const client = db();
  const org = await client.organization.findUniqueOrThrow({ where: { id: orgId }, select: { plan: true } });
  const used = await client.render.count({ where: { orgId, status: { notIn: ["failed", "canceled"] } } });
  const left = exportsLeft(org.plan as PlanId, used);
  if (left === null || left >= wanted) return null;
  return { ok: false, error: left === 0 ? "You’ve used both trial exports. Choose a plan to export more; your clips are saved." : `Your trial has ${left} export${left === 1 ? "" : "s"} left. Pick fewer, or choose a plan.` };
}

/** Saves the editor state as a new version of the clip, creating the clip project on first save. */
async function save(ws: WorkspaceSummary, userId: string, assetId: string, projectId: string | null, input: unknown, note: string | null): Promise<{ ok: true; projectId: string; version: number; changed: boolean } | Fail> {
  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the clip settings and try again." };
  const client = db();
  const asset = await client.mediaAsset.findFirst({ where: { id: assetId, workspaceId: ws.workspaceId, deletedAt: null }, select: { id: true, orgId: true, durationSec: true, status: true } });
  if (!asset) return { ok: false, error: "This video was deleted." };
  if (asset.status !== "ready") return { ok: false, error: "This video isn’t ready to edit yet." };
  const bounds = clampClip(parsed.data.startMs, parsed.data.endMs, Math.round((asset.durationSec ?? 0) * 1000));
  const snap: ClipSnapshot = { ...parsed.data, ...bounds, captionSize: clampCaptionSize(parsed.data.captionSize) };
  if (snap.brandKitId && !(await client.brandKit.findFirst({ where: { id: snap.brandKitId, workspaceId: ws.workspaceId }, select: { id: true } }))) {
    return { ok: false, error: "That brand kit no longer exists." };
  }

  return client.$transaction(async (tx) => {
    const data = { startMs: snap.startMs, endMs: snap.endMs, hook: snap.hook, captionStyle: snap.captionStyle, captionSize: snap.captionSize, format: snap.format, brandKitId: snap.brandKitId };
    if (projectId) {
      const p = await tx.clipProject.findFirst({ where: { id: projectId, workspaceId: ws.workspaceId, assetId } });
      if (!p) return { ok: false as const, error: "This clip was deleted." };
      const current: ClipSnapshot = { startMs: p.startMs, endMs: p.endMs, hook: p.hook, captionStyle: p.captionStyle as ClipSnapshot["captionStyle"], captionSize: p.captionSize, format: p.format as ClipSnapshot["format"], brandKitId: p.brandKitId };
      if (same(current, snap)) return { ok: true as const, projectId: p.id, version: p.version, changed: false };
      const version = p.version + 1;
      await tx.clipProject.update({ where: { id: p.id }, data: { ...data, name: snap.hook, version } });
      await tx.projectRevision.create({ data: { projectId: p.id, number: version, snapshot: snap as object, note, createdById: userId } });
      return { ok: true as const, projectId: p.id, version, changed: true };
    }
    const p = await tx.clipProject.create({ data: { orgId: asset.orgId, workspaceId: ws.workspaceId, assetId, name: snap.hook, ...data, version: 1, createdById: userId } });
    await tx.projectRevision.create({ data: { projectId: p.id, number: 1, snapshot: snap as object, note, createdById: userId } });
    return { ok: true as const, projectId: p.id, version: 1, changed: true };
  }, { timeout: Number(process.env.NELIO_TX_TIMEOUT_MS ?? 20000) });
}

export async function saveVersionAction(slug: string, assetId: string, projectId: string | null, snapshot: ClipSnapshot): Promise<{ ok: true; projectId: string; version: number } | Fail> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const r = await save(a.ws, a.session.user.id, assetId, projectId, snapshot, null);
  if (r.ok) revalidatePath(`/w/${slug}/studio/${assetId}`);
  return r.ok ? { ok: true, projectId: r.projectId, version: r.version } : r;
}

/**
 * CL-03 Render: saves unsaved edits as a version first, then queues the render. The estimate was shown and
 * confirmed; the actual cost is settled when the render finishes and refunded if it fails.
 */
export async function startRenderAction(slug: string, assetId: string, projectId: string | null, snapshot: ClipSnapshot): Promise<{ ok: true; projectId: string; renderId: string } | Fail> {
  const a = await authorize(slug, "content.render");
  if ("ok" in a) return a;
  const saved = await save(a.ws, a.session.user.id, assetId, projectId, snapshot, "Saved for render");
  if (!saved.ok) return saved;
  const client = db();
  const busy = await client.render.findFirst({ where: { projectId: saved.projectId, status: { in: ["queued", "rendering"] } }, select: { id: true } });
  if (busy) return { ok: false, error: "This clip is already rendering. You’ll be notified when it’s ready." };
  const room = await exportRoom(a.ws.orgId, 1);
  if (room) return room;
  const p = await client.clipProject.findUniqueOrThrow({ where: { id: saved.projectId }, select: { startMs: true, endMs: true } });
  const estimate = renderEstimate((p.endMs - p.startMs) / 1000);
  const { renderId } = await client.$transaction((tx) => startRenderRun(tx, { projectId: saved.projectId, userId: a.session.user.id, estimate }), { timeout: Number(process.env.NELIO_TX_TIMEOUT_MS ?? 20000) });
  revalidatePath(`/w/${slug}/studio/${assetId}`);
  revalidatePath(`/w/${slug}/media`);
  return { ok: true, projectId: saved.projectId, renderId };
}

const editSchema = z.object({ request: z.string().trim().min(3).max(300) });

/**
 * CL-03 Edit with words: Nelio AI turns a plain-words request into new clip settings. Nothing is saved; the
 * editor shows the result as unsaved edits the creator can keep or undo.
 */
export async function editWithWordsAction(slug: string, assetId: string, snapshot: ClipSnapshot, request: string): Promise<{ ok: true; snapshot: ClipSnapshot; summary: string; understood: boolean } | Fail> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const { editWithWords, isNelioAiConfigured } = await import("../nelio-ai");
  if (!isNelioAiConfigured()) return { ok: false, error: "Nelio AI isn’t switched on for this deployment yet." };
  const parsedReq = editSchema.safeParse({ request });
  const parsedSnap = snapshotSchema.safeParse(snapshot);
  if (!parsedReq.success) return { ok: false, error: "Describe the edit in a few words." };
  if (!parsedSnap.success) return { ok: false, error: "Check the clip settings and try again." };
  const asset = await db().mediaAsset.findFirst({ where: { id: assetId, workspaceId: a.ws.workspaceId, deletedAt: null, status: "ready" }, select: { durationSec: true, transcript: { select: { words: true } } } });
  if (!asset) return { ok: false, error: "This video isn’t ready to edit." };
  const { transcriptLines } = await import("@nelio/domain");
  const words = (asset.transcript?.words as unknown as { w: string; s: number; e: number; sp: number }[] | undefined) ?? [];
  try {
    const r = await editWithWords({ request: parsedReq.data.request, snapshot: parsedSnap.data, lines: transcriptLines(words), words: words.map((w) => [w.s, w.e, w.w]) });
    const bounds = clampClip(r.snapshot.startMs, r.snapshot.endMs, Math.round((asset.durationSec ?? 0) * 1000));
    return { ok: true, snapshot: { ...r.snapshot, ...bounds, captionSize: clampCaptionSize(r.snapshot.captionSize) }, summary: r.summary, understood: r.understood };
  } catch {
    return { ok: false, error: "Nelio AI couldn’t make that edit right now. Try again in a moment." };
  }
}

// ------------------------------------------------------------------ CL-04 variants

export interface VariantSet { id: string; items: Variant[] }

/**
 * CL-04: Nelio AI writes a question hook and a number hook for the clip; with the clip's own hook, no captions,
 * a square cut and minimal captions that makes six variants. Previews are free. Saves the clip first if needed.
 */
export async function generateVariantsAction(slug: string, assetId: string, projectId: string | null, snapshot: ClipSnapshot): Promise<{ ok: true; projectId: string; set: VariantSet } | Fail> {
  const a = await authorize(slug, "content.edit");
  if ("ok" in a) return a;
  const { isNelioAiConfigured, writeVariantHooks } = await import("../nelio-ai");
  if (!isNelioAiConfigured()) return { ok: false, error: "Nelio AI isn’t switched on for this deployment yet." };
  const saved = await save(a.ws, a.session.user.id, assetId, projectId, snapshot, null);
  if (!saved.ok) return saved;
  const client = db();
  const p = await client.clipProject.findUniqueOrThrow({ where: { id: saved.projectId }, include: { asset: { select: { transcript: { select: { words: true } } } } } });
  const words = (p.asset.transcript?.words as unknown as { w: string; s: number; e: number; sp: number }[] | undefined) ?? [];
  const clipText = transcriptLines(words.filter((w) => w.e > p.startMs && w.s < p.endMs)).map((l) => l.text).join(" ");
  let hooks: { question: string; number: string };
  try {
    hooks = await writeVariantHooks({ hook: p.hook, clipText });
  } catch {
    return { ok: false, error: "Nelio AI couldn’t make variants right now. Try again in a moment." };
  }
  const base: ClipSnapshot = { startMs: p.startMs, endMs: p.endMs, hook: p.hook, captionStyle: p.captionStyle as ClipSnapshot["captionStyle"], captionSize: p.captionSize, format: p.format as ClipSnapshot["format"], brandKitId: p.brandKitId };
  const set: VariantSet = { id: crypto.randomUUID().slice(0, 8), items: buildVariants(base, hooks) };
  await client.clipProject.update({ where: { id: p.id }, data: { variants: set as object } });
  revalidatePath(`/w/${slug}/studio/${assetId}/variants`);
  return { ok: true, projectId: p.id, set };
}

/** Renders the picked variants, one export each. Unpicked variants cost nothing. */
export async function renderVariantsAction(slug: string, projectId: string, keys: string[]): Promise<{ ok: true; count: number } | Fail> {
  const a = await authorize(slug, "content.render");
  if ("ok" in a) return a;
  const client = db();
  const p = await client.clipProject.findFirst({ where: { id: projectId, workspaceId: a.ws.workspaceId }, select: { id: true, assetId: true, variants: true, asset: { select: { status: true } } } });
  if (!p) return { ok: false, error: "This clip was deleted." };
  if (p.asset.status !== "ready") return { ok: false, error: "This video can’t be used any more." };
  const set = p.variants as unknown as VariantSet | null;
  const picked = (set?.items ?? []).filter((v) => keys.includes(v.key));
  if (!set || !picked.length) return { ok: false, error: "Pick at least one variant to render." };
  const room = await exportRoom(a.ws.orgId, picked.length);
  if (room) return room;
  await client.$transaction(async (tx) => {
    for (const v of picked) {
      const estimate = renderEstimate((v.settings.endMs - v.settings.startMs) / 1000);
      await startRenderRun(tx, { projectId: p.id, userId: a.session.user.id, estimate, label: v.label, settings: v.settings, key: `variant:${p.id}:${set.id}:${v.key}` });
    }
  }, TX);
  revalidatePath(`/w/${slug}/exports`);
  revalidatePath(`/w/${slug}/studio/${p.assetId}/variants`);
  return { ok: true, count: picked.length };
}

// ------------------------------------------------------------------ CL-05 exports

export async function cancelRenderAction(slug: string, renderId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "content.render");
  if ("ok" in a) return a;
  const done = await db().$transaction((tx) => cancelRenderRun(tx, { renderId, workspaceId: a.ws.workspaceId, byUserName: a.session.user.fullName }), TX);
  revalidatePath(`/w/${slug}/exports`);
  return done ? { ok: true } : { ok: false, error: "This render already finished." };
}

/** Renders a failed or canceled export again with exactly the same settings. */
export async function retryRenderAction(slug: string, renderId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "content.render");
  if ("ok" in a) return a;
  const client = db();
  const r = await client.render.findFirst({ where: { id: renderId, workspaceId: a.ws.workspaceId, status: { in: ["failed", "canceled"] } }, include: { project: { select: { id: true, asset: { select: { status: true, deletedAt: true } } } } } });
  if (!r) return { ok: false, error: "This export can’t be retried." };
  if (r.project.asset.deletedAt || r.project.asset.status !== "ready") return { ok: false, error: "The source video can’t be used any more." };
  const room = await exportRoom(a.ws.orgId, 1);
  if (room) return room;
  const settings = (r.settings as object | null) ?? ((await client.projectRevision.findUnique({ where: { projectId_number: { projectId: r.projectId, number: r.revision } } }))?.snapshot as object | undefined) ?? null;
  await client.$transaction((tx) => startRenderRun(tx, { projectId: r.projectId, userId: a.session.user.id, estimate: r.estimatedCredits, label: r.label, settings, key: `retry:${r.id}` }), TX);
  revalidatePath(`/w/${slug}/exports`);
  return { ok: true };
}
