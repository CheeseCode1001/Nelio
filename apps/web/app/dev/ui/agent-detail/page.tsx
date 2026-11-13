import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentDetail, AgentDetailLoading } from "@/components/agents/agent-detail";
import { AGENT_DETAIL_SAMPLE } from "@/components/agents/sample";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { DETAIL_TABS, type DetailTab } from "@/lib/agent-detail";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-05 preview", robots: { index: false } };

const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of APP-05: ?tab=overview|policy|budget|destinations|runs &state=stopped|loading. */
export default async function AgentDetailPreview({ searchParams }: { searchParams: Promise<{ tab?: string; state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const sp = await searchParams;
  const tab: DetailTab = (DETAIL_TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as DetailTab) : "policy";
  const d = sp.state === "stopped" ? { ...AGENT_DETAIL_SAMPLE, state: "stopped" as const, stateChip: { label: "stopped", tone: "neutral" as const, icon: "x" as const } } : AGENT_DETAIL_SAMPLE;
  const hrefs = { agents: "/dev/ui/agents", tab: (t: DetailTab) => `/dev/ui/agent-detail?tab=${t}`, newAgent: "#APP-06", connections: "#IN-01", activity: "#APP-03" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="APP-04" preview>
      {sp.state === "loading" ? <AgentDetailLoading /> : <AgentDetail d={d} tab={tab} hrefs={hrefs} />}
    </AppShell>
  );
}
