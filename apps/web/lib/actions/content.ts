"use server";

import { db, findWorkspaceFor, type WorkspaceSummary } from "@nelio/db";
import { DESTINATIONS, POST_KINDS, can, draftTitle, hashtagsIn, type PostContent } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";

type Fail = { ok: false; error: string };

async function authorize(slug: string, needsEdit = true): Promise<{ session: Session; ws: WorkspaceSummary } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  if (needsEdit) {
    const d = can(session.actor, "content.edit", ws);
    if (!d.allowed || d.access === "R" || d.access === "V") return { ok: false, error: "You don’t have permission to edit content here." };
  }
  return { session, ws };
}

const contentSchema = z.object({
  instagram: z.object({ caption: z.string().max(10_000), firstComment: z.string().max(10_000) }),
  youtube: z.object({ title: z.string().max(1_000), description: z.string().max(20_000) }),
  script: z.string().max(40_000),
});
const draftSchema = z.object({
  kind: z.enum(POST_KINDS),
  renderId: z.string().uuid().nullable(),
  platforms: z.array(z.enum(DESTINATIONS)).max(DESTINATIONS.length),
  content: contentSchema,
});
export type DraftInput = z.input<typeof draftSchema>;

/**
 * CS-02 Save draft. Drafts may still have problems (they're shown under each field); only submitting needs a
 * clean post and a connected account, which arrive with Connections (Milestone 6).
 */
export async function saveDraftAction(slug: string, draftId: string | null, input: DraftInput): Promise<{ ok: true; draftId: string } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the draft and try again." };
  const v = parsed.data;
  const client = db();
  let clipName: string | null = null;
  if (v.renderId) {
    const r = await client.render.findFirst({ where: { id: v.renderId, workspaceId: a.ws.workspaceId, status: "ready" }, select: { label: true, project: { select: { name: true } } } });
    if (!r) return { ok: false, error: "That clip isn’t available any more. Pick another one." };
    clipName = `${r.project.name}${r.label ? ` · ${r.label.split(" · ")[0]}` : ""}`;
  }
  const kind = v.kind === "script" ? "script" : v.renderId ? "clip_caption" : "caption";
  const data = {
    kind,
    title: draftTitle(kind, v.content as PostContent, clipName),
    caption: v.content.instagram.caption,
    hashtags: hashtagsIn(`${v.content.instagram.caption} ${v.content.youtube.description}`),
    platforms: kind === "script" ? [] : v.platforms,
    content: v.content as object,
    renderId: kind === "script" ? null : v.renderId,
  };
  if (draftId) {
    const existing = await client.post.findFirst({ where: { id: draftId, workspaceId: a.ws.workspaceId, state: "draft" }, select: { id: true } });
    if (!existing) return { ok: false, error: "This draft was deleted or already submitted." };
    await client.post.update({ where: { id: existing.id }, data });
    revalidatePath(`/w/${slug}/content`);
    return { ok: true, draftId: existing.id };
  }
  const created = await client.post.create({ data: { ...data, orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, createdById: a.session.user.id }, select: { id: true } });
  revalidatePath(`/w/${slug}/content`);
  return { ok: true, draftId: created.id };
}

const rewriteSchema = z.object({
  field: z.enum(["instagram.caption", "youtube.title", "youtube.description", "script"]),
  text: z.string().max(20_000),
  context: z.string().max(400),
});

/** "Rewrite with Nelio AI": rewrites one field for its platform in the workspace's brand voice. Nothing is saved. */
export async function rewriteAction(slug: string, input: z.input<typeof rewriteSchema>): Promise<{ ok: true; text: string } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = rewriteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nothing to rewrite yet." };
  const { isNelioAiConfigured, rewriteForPlatform } = await import("../nelio-ai");
  if (!isNelioAiConfigured()) return { ok: false, error: "Nelio AI isn’t switched on for this deployment yet." };
  const kit = await db().brandKit.findFirst({ where: { workspaceId: a.ws.workspaceId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], select: { voice: true } });
  try {
    return { ok: true, text: await rewriteForPlatform({ ...parsed.data, voice: kit?.voice ?? "" }) };
  } catch {
    return { ok: false, error: "Nelio AI couldn’t rewrite this right now. Try again in a moment." };
  }
}

/** CS-03 "Notify me": remembers who wants a gated feature. Safe to press twice. */
export async function registerInterestAction(slug: string, feature: "ai_video"): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, false);
  if ("ok" in a) return a;
  await db().featureInterest.upsert({
    where: { userId_feature: { userId: a.session.user.id, feature } },
    create: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, userId: a.session.user.id, feature },
    update: {},
  });
  return { ok: true };
}
