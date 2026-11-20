import "server-only";
import { db, isStorageConfigured, licenseForAsset, signedGetUrl, storageKeys } from "@nelio/db";
import { DESTINATIONS, POST_KIND_LABEL, formatDuration, readContent, relativeTime, type Destination, type PostContent, type PostKind } from "@nelio/domain";
import type { Tone } from "@nelio/ui";

export interface DraftRow { id: string; title: string; kind: { label: string; tone: Tone }; platforms: Destination[]; updated: string; href: string }

const KIND_TONE: Record<PostKind, Tone> = { clip_caption: "lime", caption: "ai", script: "blue" };
const asKind = (k: string): PostKind => (k === "script" || k === "caption" ? k : "clip_caption");

/** CS-01: the most recent drafts in the workspace. */
export async function loadDrafts(workspaceId: string, tz: string, composeBase: string, now = new Date()): Promise<DraftRow[]> {
  const rows = await db().post.findMany({ where: { workspaceId, state: "draft" }, orderBy: { updatedAt: "desc" }, take: 8, select: { id: true, title: true, kind: true, platforms: true, updatedAt: true } });
  return rows.map((r) => {
    const kind = asKind(r.kind);
    return {
      id: r.id, title: r.title,
      kind: { label: POST_KIND_LABEL[kind], tone: KIND_TONE[kind] },
      platforms: r.platforms.filter((p): p is Destination => (DESTINATIONS as readonly string[]).includes(p)),
      updated: relativeTime(r.updatedAt, now, tz),
      href: `${composeBase}/${r.id}`,
    };
  });
}

export interface MediaLicense { creator: string; attribution: string; platforms: string[]; ok: boolean; message: string }
export interface MediaChoice { renderId: string; title: string; sub: string; posterUrl: string | null; hook: string; rights: string; license: MediaLicense | null }
export interface ComposerData {
  draftId: string | null;
  kind: PostKind;
  content: PostContent;
  platforms: Destination[];
  media: MediaChoice | null;
  /** Ready exports that can be attached ("Change"). */
  choices: MediaChoice[];
  workspace: { name: string; initial: string; client: boolean };
}

async function choiceFor(workspaceId: string, r: { id: string; label: string | null; hook: string; format: string; settings: unknown; project: { name: string; assetId: string; startMs: number; endMs: number; asset: { rights: string | null; rightsRef: string } } }): Promise<MediaChoice> {
  const s = (r.settings ?? {}) as { startMs?: number; endMs?: number; format?: string; hook?: string };
  const len = ((s.endMs ?? r.project.endMs) - (s.startMs ?? r.project.startMs)) / 1000;
  const lic = r.project.asset.rights === "license" ? await licenseForAsset(db(), r.project.assetId, { action: "schedule" }) : null;
  const rights = r.project.asset.rights === "permission" ? "with permission" : lic ? `licensed: ${lic.creatorName}` : r.project.asset.rights === "license" ? "licensed" : "own upload";
  return {
    renderId: r.id,
    title: `“${r.project.name}”${r.label ? ` · ${r.label.split(" · ")[0]}` : ""}`,
    sub: `${formatDuration(len, "clock")} · ${s.format ?? r.format} · ${rights}`,
    posterUrl: isStorageConfigured() ? await signedGetUrl(storageKeys.poster(workspaceId, r.project.assetId), { expiresIn: 3600 }).catch(() => null) : null,
    hook: s.hook ?? r.hook,
    rights: lic ? `${lic.creatorName} · ${lic.type} license${lic.attribution ? " · attribution required" : ""}. Checked again right before publishing.` : r.project.asset.rights === "license" ? "Licensed source. Checked again right before publishing." : `${r.project.asset.rights === "permission" ? "Used with permission" : "Own upload"} · rights ${r.project.asset.rightsRef}. Checked again right before publishing.`,
    license: lic ? { creator: lic.creatorName, attribution: lic.attribution, platforms: lic.platforms, ok: lic.check.ok, message: lic.check.ok ? "" : lic.check.message } : null,
  };
}

/** CS-02 from real data: the draft (if any), the attached clip and the exports that could be attached. */
export async function loadComposer(ws: { workspaceId: string; name: string; kind: string }, draftId: string | null, renderId: string | null, kind: PostKind): Promise<ComposerData | null> {
  const client = db();
  const draft = draftId ? await client.post.findFirst({ where: { id: draftId, workspaceId: ws.workspaceId } }) : null;
  if (draftId && !draft) return null;
  const renders = await client.render.findMany({
    where: { workspaceId: ws.workspaceId, status: "ready" },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: { id: true, label: true, hook: true, format: true, settings: true, project: { select: { name: true, assetId: true, startMs: true, endMs: true, asset: { select: { rights: true, rightsRef: true } } } } },
  });
  const choices = await Promise.all(renders.map((r) => choiceFor(ws.workspaceId, r)));
  const wantedRender = draft?.renderId ?? renderId;
  let media = choices.find((c) => c.renderId === wantedRender) ?? null;
  if (!media && wantedRender) {
    const r = await client.render.findFirst({ where: { id: wantedRender, workspaceId: ws.workspaceId, status: "ready" }, select: { id: true, label: true, hook: true, format: true, settings: true, project: { select: { name: true, assetId: true, startMs: true, endMs: true, asset: { select: { rights: true, rightsRef: true } } } } } });
    media = r ? await choiceFor(ws.workspaceId, r) : null;
  }
  const k = draft ? asKind(draft.kind) : kind === "script" ? "script" : media ? "clip_caption" : kind;
  return {
    draftId: draft?.id ?? null,
    kind: k,
    content: readContent(draft?.content),
    platforms: (draft?.platforms ?? ["instagram", "youtube"]).filter((p): p is Destination => (DESTINATIONS as readonly string[]).includes(p)),
    media: k === "script" ? null : media,
    choices,
    workspace: { name: ws.name, initial: ws.name.trim().charAt(0).toUpperCase() || "N", client: ws.kind === "client" },
  };
}
