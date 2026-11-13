import { db } from "@nelio/db";
import { COUNTS_TOWARD_AGENT_LIMIT, PLANS, nextPlanForAgents, presetFor, type AgentSchedule, type PlanId } from "@nelio/domain";
import { PageHead, type AgentColor } from "@nelio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { CreateAgentLimit, CreateAgentWizard } from "@/components/agents/create-agent";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "New agent" };

/** APP-06 Create agent. Shows CreateAgent-Limit instead when the plan's agents are all in use. */
export default async function NewAgentRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<{ from?: string }> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const client = db();
  const org = await client.organization.findUniqueOrThrow({ where: { id: workspace.orgId }, select: { plan: true } });
  const plan = org.plan as PlanId;
  const limit = PLANS[plan].agents;
  const counted = await client.agent.count({ where: { orgId: workspace.orgId, state: { in: [...COUNTS_TOWARD_AGENT_LIMIT] } } });
  const source = sp.from && /^[0-9a-f-]{36}$/i.test(sp.from)
    ? await client.agent.findFirst({ where: { id: sp.from, workspaceId: workspace.workspaceId }, select: { name: true, goal: true, color: true, shape: true, schedule: true, weeklyBudget: true, perRunLimit: true, maxPostsPerWeek: true } })
    : null;
  const hrefs = { agents: href("APP-04"), plans: "/pricing", connections: href("IN-01") };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
          <Link href={hrefs.agents} className="tap-target text-muted no-underline hover:text-text">Agents</Link> › New
        </nav>
        <PageHead title="New agent" />
      </div>
      {limit !== null && counted >= limit ? (
        <CreateAgentLimit planLabel={PLANS[plan].label} limit={limit} upgrade={nextPlanForAgents(plan)} hrefs={hrefs} />
      ) : (
        <CreateAgentWizard
          slug={workspace.slug}
          uploads={0}
          hrefs={hrefs}
          from={source ? { name: `${source.name} (copy)`, goal: source.goal, color: source.color as AgentColor, shape: source.shape as "circle", schedule: presetFor(source.schedule as unknown as AgentSchedule | null), weeklyBudget: source.weeklyBudget, perRunLimit: source.perRunLimit, maxPostsPerWeek: source.maxPostsPerWeek } : undefined}
        />
      )}
    </div>
  );
}
