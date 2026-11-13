import { AgentAvatar, Banner, Bubble, ButtonLink, Card, CardHead, Chip, Motion, PlatformBadge, Sk, SkCard, Small, cn } from "@nelio/ui";
import Link from "next/link";
import type { AgentDetailData, DetailTab } from "@/lib/agent-detail";
import { BudgetForm, DetailActions, PolicyForm } from "./agent-detail-forms";

const TAB_LABEL: Record<DetailTab, string> = { overview: "Overview", policy: "Policy & permissions", budget: "Budget", destinations: "Destinations", runs: "Runs" };
const TH = "whitespace-nowrap border-b border-border bg-surface-2 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.05em] text-muted";
const TD = "border-b border-border px-4 py-3.5 align-middle text-sm text-text";

export interface AgentDetailHrefs { agents: string; tab: (t: DetailTab) => string; newAgent: string; connections: string; activity: string }

function Tabs({ active, hrefs }: { active: DetailTab; hrefs: AgentDetailHrefs }) {
  return (
    <nav aria-label="Agent sections" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
      {(Object.keys(TAB_LABEL) as DetailTab[]).map((t) => (
        <Link
          key={t}
          href={hrefs.tab(t)}
          scroll={false}
          aria-current={t === active ? "page" : undefined}
          className={cn("tap-target inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", t === active ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}
        >
          {TAB_LABEL[t]}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Platforms an agent can post to. Social connections arrive in Milestone 6, so none can be chosen yet;
 * the rows say so plainly instead of offering a switch that would do nothing.
 */
function Destinations({ hrefs }: { hrefs: AgentDetailHrefs }) {
  const rows = [
    { p: "ig" as const, name: "Instagram", sub: "Reels", state: "In development" },
    { p: "yt" as const, name: "YouTube", sub: "Shorts", state: "In development" },
    { p: "tt" as const, name: "TikTok", sub: "Coming later", state: "Coming later" },
    { p: "fb" as const, name: "Facebook", sub: "Coming later", state: "Coming later" },
  ];
  return (
    <Card>
      <CardHead title="Where this agent can post" right={<span className="ml-auto text-[13px] text-muted">Only connected accounts can be chosen</span>} />
      <ul className="m-0 list-none overflow-hidden rounded-row border border-border p-0">
        {rows.map((r) => (
          <li key={r.p} className={cn("flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0", r.state === "Coming later" && "opacity-50")}>
            <PlatformBadge platform={r.p} size={36} />
            <div className="min-w-0 grow">
              <div className="text-sm font-semibold text-text">{r.name}</div>
              <div className="text-[13px] text-muted">{r.sub} · not connected</div>
            </div>
            <Chip tone={r.state === "Coming later" ? "neutral" : "blue"} icon="clock">{r.state}</Chip>
          </li>
        ))}
      </ul>
      <Small>Connecting accounts opens when publishing is verified with each platform. Until then this agent prepares drafts only.</Small>
      <ButtonLink href={hrefs.connections} variant="secondary" size="sm">Connections</ButtonLink>
    </Card>
  );
}

function RunsTable({ d }: { d: AgentDetailData }) {
  if (d.runs.length === 0) {
    return (
      <Card>
        <CardHead title="No runs yet" sub="Runs appear here when the schedule starts one, or when you press Run now." />
      </Card>
    );
  }
  return (
    <div className="overflow-x-auto rounded-row border border-border bg-surface-1 shadow-card">
      <table className="w-full min-w-[600px] border-collapse">
        <caption className="sr-only">Runs of {d.name}</caption>
        <thead><tr>{["Run", "Started", "Steps", "Credits (est → actual)", "Result"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {d.runs.map((r) => (
            <tr key={r.id}>
              <td className={TD}>#{r.number}</td>
              <td className={TD}>{r.started}</td>
              <td className={TD}>{r.steps}</td>
              <td className={TD}>{r.credits}</td>
              <td className={TD}>
                <span className="flex flex-wrap items-center gap-1.5">
                  <Chip tone={r.result.tone} icon={r.result.icon}>{r.result.label}</Chip>
                  {r.reason ? <Small>{r.reason}</Small> : null}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LastRuns({ d }: { d: AgentDetailData }) {
  return (
    <Card>
      <CardHead title="Last runs" />
      {d.runs.length ? (
        <ul className="m-0 list-none overflow-hidden rounded-row border border-border p-0">
          {d.runs.slice(0, 5).map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <Bubble icon={r.result.icon} tone={r.result.tone === "ok" ? "lime" : r.result.tone === "err" ? "warn" : "blue"} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text">Run #{r.number}</div>
                <div className="text-[13px] text-muted">{r.started} · {r.result.label}{r.reason ? ` · ${r.reason}` : ""}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : <Small>No runs yet.</Small>}
    </Card>
  );
}

/** APP-05 Agent detail. Tabs are links (?tab=), so each has its own address and works without scripts. */
export function AgentDetail({ d, tab, hrefs, workspaceSlug }: { d: AgentDetailData; tab: DetailTab; hrefs: AgentDetailHrefs; workspaceSlug?: string }) {
  const stopped = d.state === "stopped";
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
              <Link href={hrefs.agents} className="tap-target text-muted no-underline hover:text-text">Agents</Link> › {d.name}
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">{d.name}</h1>
              <Chip tone={d.stateChip.tone} icon={d.stateChip.icon}>{d.stateChip.label}</Chip>
            </div>
            <p className="m-0 mt-1.5 text-[15px] text-muted">Created by {d.createdBy} · {d.runsOn}</p>
          </div>
          <DetailActions slug={workspaceSlug} d={d} canSave={tab === "policy" || tab === "budget"} />
        </header>
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
          <AgentAvatar color={d.color} shape={d.shape} size={72} />
          <div className="min-w-0">
            <div className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-text">Hi, I’m {d.name}.</div>
            <p className="m-0 text-sm text-muted">{d.goal}</p>
          </div>
        </div>
        {d.workspacePaused && !stopped ? <Banner tone="warn" title="Everything in this workspace is paused" text="This agent won’t start new work until you resume from the top bar." /> : null}
      </div>
      {stopped ? (
        <div data-enter="" className="flex flex-col gap-4">
          <Banner tone="neutral" title="This agent is stopped" text="Its history is kept. Stopped agents can’t be restarted; duplicate it to start fresh." action={<ButtonLink href={`${hrefs.newAgent}?from=${d.id}`} variant="secondary" size="sm">Duplicate as new agent</ButtonLink>} />
          <LastRuns d={d} />
        </div>
      ) : (
        <div data-enter="" className="flex flex-col gap-6">
          <Tabs active={tab} hrefs={hrefs} />
          {tab === "policy" ? <PolicyForm slug={workspaceSlug} d={d} /> : null}
          {tab === "budget" ? <BudgetForm slug={workspaceSlug} d={d} /> : null}
          {tab === "destinations" ? <Destinations hrefs={hrefs} /> : null}
          {tab === "runs" ? <RunsTable d={d} /> : null}
          {tab === "overview" ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
              <Card>
                <CardHead title="Goal & sources" />
                <dl className="m-0 flex flex-col">
                  {([["Goal", d.goal], ["Sources", "Your uploads"], ["Mode", d.modeChip.label], ["Weekly budget", `${d.budget.used.toLocaleString("en-US")} / ${d.budget.weeklyBudget.toLocaleString("en-US")} credits`]] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-border py-[11px] last:border-b-0">
                      <dt className="text-[13px] text-muted">{k}</dt>
                      <dd className="m-0 text-right text-sm font-bold text-text">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
              <LastRuns d={d} />
            </div>
          ) : null}
        </div>
      )}
    </Motion>
  );
}

export function AgentDetailLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={120} h={14} /><Sk w={260} h={36} /><Sk w={200} h={16} /></div>
      <div className="flex items-center gap-4"><Sk w={64} h={64} r={32} /><div className="flex grow flex-col gap-2"><Sk w={220} h={22} /><Sk w="60%" h={14} /></div></div>
      <Sk w={460} h={48} r={24} />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]"><SkCard lines={5} /><SkCard lines={5} /></div>
      <span className="sr-only" role="status">Loading agent…</span>
    </div>
  );
}
