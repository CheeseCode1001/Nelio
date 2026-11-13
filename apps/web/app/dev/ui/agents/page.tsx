import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentsLoading, AgentsPage } from "@/components/agents/agents-page";
import { AGENTS_SAMPLE, AGENTS_SAMPLE_EMPTY, AGENTS_SAMPLE_LIMIT } from "@/components/agents/sample";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-04 preview", robots: { index: false } };

const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const HREFS = { newAgent: "#APP-06", strategist: "#APP-02", plans: "#BI-02", agent: (id: string) => `#APP-05-${id}` };

/** Development-only preview of APP-04 with the design's sample data: ?state=filled|empty|limit|loading. */
export default async function AgentsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const data = state === "empty" ? AGENTS_SAMPLE_EMPTY : state === "limit" ? AGENTS_SAMPLE_LIMIT : AGENTS_SAMPLE;
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="APP-04" preview>
      {state === "loading" ? <AgentsLoading /> : <AgentsPage d={data} hrefs={HREFS} />}
    </AppShell>
  );
}
