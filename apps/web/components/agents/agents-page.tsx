import { AgentTrio, Banner, ButtonLink, EmptyState, Ghost, Motion, PageHead } from "@nelio/ui";
import type { AgentsPageData } from "@/lib/agents";
import { AgentCard } from "./agent-card";
import { AGENTS_SAMPLE } from "./sample";

export interface AgentsHrefs { newAgent: string; strategist: string; plans: string; agent: (id: string) => string }

function Header({ d, hrefs }: { d: AgentsPageData; hrefs: AgentsHrefs }) {
  const sub = d.cards.length === 0 ? "Your AI team lives here." : d.limit === null ? `${d.counted} agents on ${d.planLabel}.` : `${d.counted} of ${d.limit} agents on ${d.planLabel}.`;
  return (
    <PageHead
      title="Agents"
      sub={sub}
      actions={
        <>
          {d.cards.length ? <ButtonLink href={hrefs.strategist} variant="ai" icon="spark">Ask Nelio AI</ButtonLink> : null}
          {d.atLimit ? null : <ButtonLink href={hrefs.newAgent} icon="plus">New agent</ButtonLink>}
        </>
      }
    />
  );
}

/** APP-04 Agents: Filled, Empty and Limit come from data; Loading is AgentsLoading. */
export function AgentsPage({ d, hrefs, workspaceSlug }: { d: AgentsPageData; hrefs: AgentsHrefs; workspaceSlug?: string }) {
  if (d.cards.length === 0) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <Header d={d} hrefs={hrefs} />
          <EmptyState
            illustration="agents"
            art={<AgentTrio />}
            title="Hire your first agent"
            text="An agent clips, plans or posts on a schedule, inside the budget and approval rules you set."
            actions={
              <>
                <ButtonLink href={hrefs.newAgent} variant="cta" arrow>Create an agent</ButtonLink>
                <ButtonLink href={hrefs.strategist} variant="secondary">Plan with Nelio AI</ButtonLink>
              </>
            }
          />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <Header d={d} hrefs={hrefs} />
        {d.atLimit ? (
          <Banner
            tone="warn"
            title={`You’re using ${d.counted} of ${d.limit} agents`}
            text={d.upgrade ? `Pause one, or move to ${d.upgrade.label}${d.upgrade.agents ? ` for ${d.upgrade.agents} agents` : ""}.` : "Pause or stop one to add another."}
            action={<ButtonLink href={hrefs.plans} variant="secondary" size="sm">Compare plans</ButtonLink>}
          />
        ) : null}
        {d.workspacePaused ? <Banner tone="warn" title="Everything in this workspace is paused" text="Agents won’t start new work until you resume from the top bar." /> : null}
      </div>
      <div data-enter="" className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
        {d.cards.map((a) => <AgentCard key={a.id} a={a} openHref={hrefs.agent(a.id)} workspaceSlug={workspaceSlug} />)}
      </div>
    </Motion>
  );
}

/** APP-04 Loading: the agents page itself, ghosted. */
export function AgentsLoading() {
  return <Ghost><AgentsPage d={AGENTS_SAMPLE} hrefs={{ newAgent: "#", strategist: "#", plans: "#", agent: () => "#" }} /></Ghost>;
}
