import { PageHead } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreateAgentLimit, CreateAgentWizard } from "@/components/agents/create-agent";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-06 preview", robots: { index: false } };

const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const HREFS = { agents: "/dev/ui/agents", plans: "#BI-02", connections: "#IN-01" };
const SAMPLE_FROM = { name: "Budget Shorts", goal: "Clip my podcast into 3 shorts a week about budgeting", color: "lime" as const, shape: "circle" as const, schedule: "mwf_1800" as const, weeklyBudget: 300, perRunLimit: 60, maxPostsPerWeek: 3 };

/** Development-only preview of APP-06: ?step=1..5 (filled with the boards' sample answers) or ?state=limit. */
export default async function CreateAgentPreview({ searchParams }: { searchParams: Promise<{ step?: string; state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const sp = await searchParams;
  const step = Math.min(5, Math.max(1, Number(sp.step) || 1));
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="APP-04" preview>
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-2 text-[13px] font-semibold text-muted">Agents › New</div>
          <PageHead title="New agent" />
        </div>
        {sp.state === "limit" ? (
          <CreateAgentLimit planLabel="Creator Pro" limit={5} upgrade={{ label: "Business", agents: 10 }} hrefs={HREFS} />
        ) : (
          <CreateAgentWizard key={step} uploads={14} hrefs={HREFS} from={{ ...SAMPLE_FROM }} initialStep={step} />
        )}
      </div>
    </AppShell>
  );
}
