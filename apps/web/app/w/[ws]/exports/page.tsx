import type { Metadata } from "next";
import { ExportsPage } from "@/components/studio/exports-page";
import { requireWorkspace } from "@/lib/auth";
import { loadExports } from "@/lib/exports";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Exports" };

/** CL-05 Exports: every render with its status, cost and a signed download. */
export default async function ExportsRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const d = await loadExports(workspace.workspaceId, workspace.orgId);
  return <ExportsPage slug={workspace.slug} d={d} hrefs={{ studio: href("CL-01"), plans: href("BI-02") }} />;
}
