import { db } from "@nelio/db";
import { can } from "@nelio/domain";
import type { Metadata } from "next";
import { AiSettingsPage } from "@/components/settings/ai-settings";
import { requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "AI & processing" };

/** ST-07 AI & processing defaults. */
export default async function AiSettingsRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { session, workspace } = await requireWorkspace(ws);
  const w = await db().workspace.findUniqueOrThrow({ where: { id: workspace.workspaceId }, select: { processingQuality: true, captionLanguage: true, suggestPostTimes: true, updatedAt: true } });
  const d = can(session.actor, "agent.set_budget", workspace);
  return (
    <AiSettingsPage
      key={w.updatedAt.getTime()}
      slug={workspace.slug}
      saved={{ quality: w.processingQuality, language: w.captionLanguage, suggestPostTimes: w.suggestPostTimes }}
      canEdit={d.allowed && d.access !== "R" && d.access !== "V"}
      aiReady={Boolean(process.env.AI_API_KEY)}
    />
  );
}
