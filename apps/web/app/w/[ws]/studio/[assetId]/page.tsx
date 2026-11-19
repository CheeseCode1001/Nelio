import { db } from "@nelio/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/studio-page";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";
import { loadStudio } from "@/lib/studio";

export const metadata: Metadata = { title: "Studio" };

/** CL-03 Clipping Studio for one video: processing, moments, editing, versions and render. */
export default async function StudioRoute({ params, searchParams }: { params: Promise<{ ws: string; assetId: string }>; searchParams: Promise<{ project?: string }> }) {
  const [{ ws, assetId }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  if (!/^[0-9a-f-]{36}$/i.test(assetId)) notFound();
  const project = sp.project && /^[0-9a-f-]{36}$/i.test(sp.project) ? sp.project : null;
  const { timezone } = await db().workspace.findUniqueOrThrow({ where: { id: workspace.workspaceId }, select: { timezone: true } });
  const d = await loadStudio(workspace.workspaceId, assetId, project, timezone);
  if (!d) notFound();
  const href = hrefForWorkspace(workspace);
  return <StudioPage slug={workspace.slug} d={d} hrefs={{ library: href("CL-01"), variants: `/w/${workspace.slug}/studio/${assetId}/variants${d.project ? `?project=${d.project.id}` : ""}` }} />;
}
