import { db } from "@nelio/db";
import type { Metadata } from "next";
import { UploadPage } from "@/components/media/upload-page";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Add a video" };

/** CL-02 Upload. Quality and caption language start from the workspace's AI & processing defaults (ST-07). */
export default async function UploadRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { workspace } = await requireWorkspace(ws);
  const settings = await db().workspace.findUniqueOrThrow({ where: { id: workspace.workspaceId }, select: { processingQuality: true, captionLanguage: true } });
  return <UploadPage slug={workspace.slug} defaults={{ quality: settings.processingQuality, language: settings.captionLanguage }} libraryHref={hrefForWorkspace(workspace)("CL-01")} studioBase={`/w/${workspace.slug}/studio`} />;
}
