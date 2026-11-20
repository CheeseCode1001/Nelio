import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Composer } from "@/components/content/composer";
import { requireWorkspace } from "@/lib/auth";
import { loadComposer } from "@/lib/content";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Compose" };

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * CS-02 Post composer. Publishing destinations arrive with Connections (Milestone 6), so every account shows as
 * not connected and drafts can be saved but not submitted yet.
 */
export default async function ComposeRoute({ params, searchParams }: { params: Promise<{ ws: string; draftId?: string[] }>; searchParams: Promise<{ kind?: string; render?: string }> }) {
  const [{ ws, draftId }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  const id = draftId?.[0] ?? null;
  if ((draftId?.length ?? 0) > 1 || (id && !UUID.test(id))) notFound();
  const kind = sp.kind === "script" ? "script" : sp.kind === "caption" ? "caption" : "clip_caption";
  const d = await loadComposer({ workspaceId: workspace.workspaceId, name: workspace.name, kind: workspace.kind }, id, sp.render && UUID.test(sp.render) ? sp.render : null, kind);
  if (!d) notFound();
  const href = hrefForWorkspace(workspace);
  return <Composer key={d.draftId ?? `new-${kind}`} slug={workspace.slug} d={d} hrefs={{ content: href("CS-01"), connect: href("IN-01"), exports: href("CL-05"), draftBase: `/w/${workspace.slug}/content/compose` }} />;
}
