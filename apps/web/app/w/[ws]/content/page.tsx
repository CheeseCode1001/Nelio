import { db } from "@nelio/db";
import type { Metadata } from "next";
import { ContentStudio } from "@/components/content/content-studio";
import { requireWorkspace } from "@/lib/auth";
import { loadDrafts } from "@/lib/content";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Content Studio" };

/** CS-01 Content Studio. */
export default async function ContentRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const { timezone } = await db().workspace.findUniqueOrThrow({ where: { id: workspace.workspaceId }, select: { timezone: true } });
  const compose = `/w/${workspace.slug}/content/compose`;
  const drafts = await loadDrafts(workspace.workspaceId, timezone, compose);
  return <ContentStudio drafts={drafts} hrefs={{ compose, script: `${compose}?kind=script`, caption: `${compose}?kind=caption`, aiVideo: href("CS-03"), licensing: href("LI-01"), drafts: href("PB-02") }} />;
}
