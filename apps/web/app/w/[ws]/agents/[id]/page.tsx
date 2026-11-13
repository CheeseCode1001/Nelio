import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentDetail } from "@/components/agents/agent-detail";
import { DETAIL_TABS, loadAgentDetail, type DetailTab } from "@/lib/agent-detail";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Agent" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** APP-05 Agent detail. Default tab is Policy & permissions, as on the Filled board. */
export default async function AgentDetailRoute({ params, searchParams }: { params: Promise<{ ws: string; id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ ws, id }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  if (!UUID.test(id)) notFound();
  const d = await loadAgentDetail(workspace.workspaceId, id);
  if (!d) notFound();
  const tab: DetailTab = (DETAIL_TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as DetailTab) : "policy";
  const href = hrefForWorkspace(workspace);
  const base = `${href("APP-04")}/${d.id}`;
  return (
    <AgentDetail
      d={d}
      tab={tab}
      workspaceSlug={workspace.slug}
      hrefs={{ agents: href("APP-04"), tab: (t) => (t === "policy" ? base : `${base}?tab=${t}`), newAgent: href("APP-06"), connections: href("IN-01"), activity: href("APP-03") }}
    />
  );
}
