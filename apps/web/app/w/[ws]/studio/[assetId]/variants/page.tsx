import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VariantsPage } from "@/components/studio/variants-page";
import { requireWorkspace } from "@/lib/auth";
import { loadVariants } from "@/lib/exports";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Variants" };

/** CL-04 Batch variants for one clip. */
export default async function VariantsRoute({ params, searchParams }: { params: Promise<{ ws: string; assetId: string }>; searchParams: Promise<{ project?: string }> }) {
  const [{ ws, assetId }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  if (!/^[0-9a-f-]{36}$/i.test(assetId)) notFound();
  const project = sp.project && /^[0-9a-f-]{36}$/i.test(sp.project) ? sp.project : null;
  const d = await loadVariants(workspace.workspaceId, assetId, project);
  if (!d) notFound();
  const studio = `/w/${workspace.slug}/studio/${assetId}${d.projectId ? `?project=${d.projectId}` : ""}`;
  return <VariantsPage key={d.set?.id ?? "new"} slug={workspace.slug} d={d} hrefs={{ studio, exports: hrefForWorkspace(workspace)("CL-05") }} />;
}
