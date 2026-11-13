import type { Metadata } from "next";
import { CommandCenter } from "@/components/command-center/command-center";
import { requireWorkspace } from "@/lib/auth";
import { loadCommandCenter } from "@/lib/command-center";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Command Center" };

/** APP-01 Command Center. Filled or Empty follows the workspace's real data; Loading is loading.tsx. */
export default async function HomePage({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { session, workspace } = await requireWorkspace(ws);
  const data = await loadCommandCenter(session, workspace.workspaceId);
  return <CommandCenter data={data} href={hrefForWorkspace(workspace)} />;
}
