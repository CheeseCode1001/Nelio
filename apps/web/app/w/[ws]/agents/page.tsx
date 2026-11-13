import type { Metadata } from "next";
import { AgentsPage } from "@/components/agents/agents-page";
import { loadAgents } from "@/lib/agents";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Agents" };

/** APP-04 Agents. Filled, Empty and Limit follow the workspace's real agents and plan. */
export default async function AgentsRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const data = await loadAgents(workspace.workspaceId);
  return (
    <AgentsPage
      d={data}
      workspaceSlug={workspace.slug}
      hrefs={{ newAgent: href("APP-06"), strategist: href("APP-02"), plans: "/pricing", agent: (id) => `${href("APP-04")}/${id}` }}
    />
  );
}
