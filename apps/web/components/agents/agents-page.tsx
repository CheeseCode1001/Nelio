import { AgentAvatar, AgentTrio, Banner, ButtonLink, Chip, EmptyState, Meter, Motion, PageHead, RowCard, RowCardList, RowCardSkeleton, Sk, SkCard } from "@nelio/ui";
import type { AgentsPageData } from "@/lib/agents";
import { AgentCard } from "./agent-card";

const fmt = (n: number) => n.toLocaleString("en-US");

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
      <div data-enter="" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {d.cards.map((a) => <AgentCard key={a.id} a={a} openHref={hrefs.agent(a.id)} workspaceSlug={workspaceSlug} />)}
      </div>
      <RowCardList label="All agents">
        {d.rows.map((r) => {
          const pct = Math.min(100, (r.budget.used / Math.max(1, r.budget.limit)) * 100);
          return (
            <RowCard
              key={r.id}
              primary={
                <a href={hrefs.agent(r.id)} className="tap-target flex items-center gap-2.5 text-text no-underline hover:text-accent-text">
                  <AgentAvatar color={r.color} shape={r.shape} size={40} animated={false} />
                  {r.name}
                </a>
              }
              fields={[
                { label: "Mode", value: <Chip tone={r.mode.tone} icon={r.mode.icon}>{r.mode.label}</Chip> },
                { label: "State", value: <Chip tone={r.state.tone} icon={r.state.icon}>{r.state.label}</Chip> },
                { label: "This week", value: r.thisWeek },
                { label: "Budget", value: <Meter right={`${fmt(r.budget.used)}/${fmt(r.budget.limit)}`} ariaLabel={`Weekly budget ${fmt(r.budget.used)} of ${fmt(r.budget.limit)} credits`} pct={pct} tone={pct >= 100 ? "warn" : "acc"} /> },
                { label: "Next run", value: r.nextRun },
              ]}
            />
          );
        })}
      </RowCardList>
    </Motion>
  );
}

export function AgentsLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={160} h={36} /><Sk w={220} h={16} /></div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        <SkCard /><SkCard /><SkCard />
      </div>
      <RowCardSkeleton rows={3} fields={5} />
      <span className="sr-only" role="status">Loading agents…</span>
    </div>
  );
}
