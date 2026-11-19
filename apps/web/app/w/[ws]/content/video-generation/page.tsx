import { db } from "@nelio/db";
import type { Metadata } from "next";
import { AiVideoPage } from "@/components/content/ai-video";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Original AI video" };

/** CS-03 Original AI video (gated, blocker B-09). */
export default async function AiVideoRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { session, workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const interested = Boolean(await db().featureInterest.findUnique({ where: { userId_feature: { userId: session.user.id, feature: "ai_video" } }, select: { id: true } }));
  return <AiVideoPage slug={workspace.slug} interested={interested} hrefs={{ content: href("CS-01"), studio: href("CL-01") }} />;
}
