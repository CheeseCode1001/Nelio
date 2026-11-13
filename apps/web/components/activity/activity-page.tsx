import { AgentAvatar, Bubble, ButtonLink, Chip, EmptyState, Motion, PageHead, Sk, SkRows, cn } from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { ACTIVITY_FILTERS, FILTER_LABEL, type ActivityData, type ActivityFilter } from "@/lib/activity";
import { LiveStatus, RunPanelActions } from "./activity-live";

export interface ActivityHrefs { filter: (f: ActivityFilter, run?: string) => string; run: (id: string, f: ActivityFilter) => string; newAgent: string; upload: string }

function Filters({ d, active, hrefs }: { d: ActivityData; active: ActivityFilter; hrefs: ActivityHrefs }) {
  return (
    <nav aria-label="Filter activity" className="flex w-fit max-w-full flex-wrap gap-0.5 self-start rounded-[26px] border border-border bg-surface-1 p-1 md:rounded-full">
      {ACTIVITY_FILTERS.map((f) => (
        <Link
          key={f}
          href={hrefs.filter(f)}
          scroll={false}
          aria-current={f === active ? "page" : undefined}
          className={cn("tap-target inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", f === active ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}
        >
          {FILTER_LABEL[f]}{f !== "all" && f !== "done" && d.counts[f] ? ` ${d.counts[f]}` : ""}
        </Link>
      ))}
    </nav>
  );
}

/** APP-03 Activity Center. Filters and the selected run are in the address (?filter=&run=). */
export function ActivityPage({ d, filter, hrefs, live, headerAction }: { d: ActivityData; filter: ActivityFilter; hrefs: ActivityHrefs; live: { topic: string | null; slug?: string; preview?: "live" | "reconnecting" | "synced" }; headerAction?: ReactNode }) {
  const items = filter === "all" ? d.items : d.items.filter((i) => i.bucket === filter);
  const p = d.panel;
  const header = <PageHead title="Activity" sub="Everything your agents are doing, live." actions={d.items.length ? headerAction : undefined} />;

  if (d.items.length === 0) {
    return (
      <Motion className="flex flex-col gap-6">
        <div data-enter="" className="flex flex-col gap-6">
          {header}
          <EmptyState
            illustration="inbox"
            title="Nothing running yet"
            text="When agents start working, every step shows up here live: what they’re doing, what it costs and anything that needs you."
            actions={<><ButtonLink href={hrefs.newAgent} variant="cta" arrow>{d.hasAgents ? "View agents" : "Create an agent"}</ButtonLink><ButtonLink href={hrefs.upload} variant="secondary">Upload a video</ButtonLink></>}
          />
        </div>
      </Motion>
    );
  }

  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        {header}
        <LiveStatus topic={live.topic} preview={live.preview}>
          <Filters d={d} active={filter} hrefs={hrefs} />
        </LiveStatus>
      </div>
      <div data-enter="" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {items.length ? (
          <ul className="m-0 list-none overflow-hidden rounded-[20px] border border-border bg-surface-1 p-0 shadow-card">
            {items.map((i) => (
              <li key={i.runId} className="border-b border-border last:border-b-0">
                <Link href={hrefs.run(i.runId, filter)} scroll={false} aria-current={p?.runId === i.runId ? "true" : undefined} className={cn("flex items-center gap-3 px-4 py-3 text-text no-underline hover:bg-surface-2", p?.runId === i.runId && "bg-surface-2")}>
                  <AgentAvatar color={i.agent.color} shape={i.agent.shape} size={38} animated={false} />
                  <span className="min-w-0 grow">
                    <span className="block truncate text-sm font-semibold">{i.title}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{i.sub}</span>
                  </span>
                  <Chip tone={i.chip.tone} icon={i.chip.icon}>{i.chip.label}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface-1 px-6 py-12 text-center shadow-card">
            <Bubble icon="check" tone="lime" size={48} />
            <h2 className="m-0 font-display text-[20px] font-extrabold text-text">No {FILTER_LABEL[filter].toLowerCase()} runs this week</h2>
            <p className="m-0 text-sm text-muted">{filter === "failed" ? "Nice. Everything that ran succeeded." : "Nothing here right now."}</p>
            <ButtonLink href={hrefs.filter("all")} variant="secondary" size="sm">Show all activity</ButtonLink>
          </div>
        )}
        {p ? (
          <section aria-label={`${p.agentName} run ${p.number}`} className="flex flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <AgentAvatar color={p.agent.color} shape={p.agent.shape} size={48} />
              <div className="min-w-0">
                <h2 className="m-0 font-display text-lg font-bold leading-[1.25] text-text">{p.agentName} · run #{p.number}</h2>
                <p className="m-0 mt-0.5 text-[12.5px] font-medium text-muted">{p.started}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([["Estimated", p.estimated], ["Used so far", p.used]] as const).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 rounded-[24px] border border-border px-5 py-[18px] shadow-card">
                  <div className="text-[13px] font-bold text-muted">{k}</div>
                  <div className="font-display text-[29px] font-extrabold tracking-[-0.03em] text-text md:text-[36px]">{v} cr</div>
                </div>
              ))}
            </div>
            <ol className="m-0 list-none p-0">
              {p.steps.map((s, idx) => (
                <li key={s.title} className="relative flex items-start gap-3 pb-3.5">
                  {idx < p.steps.length - 1 ? <span aria-hidden="true" className="absolute bottom-[-8px] left-4 top-9 w-0.5 bg-border" /> : null}
                  <span className={cn("inline-flex size-[34px] flex-none items-center justify-center rounded-full [&>span]:!size-[34px] [&>span]:!rounded-full", "")}><Bubble icon={s.icon} tone={s.tone} size={34} /></span>
                  <span className="min-w-0 pt-1.5">
                    <span className="block text-sm font-bold text-text">{s.title}</span>
                    {s.detail ? <span className="block text-[12.5px] text-muted">{s.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
            <RunPanelActions slug={live.slug} runId={p.runId} canPause={p.canPause} paused={p.steps.some((s) => s.status === "paused")} log={p.log} title={`${p.agentName} · run #${p.number}`} />
          </section>
        ) : null}
      </div>
    </Motion>
  );
}

export function ActivityLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={170} h={36} /><Sk w={280} h={16} /></div>
      <Sk w={560} h={48} r={24} className="max-w-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-card border border-border bg-surface-1 p-2 shadow-card"><SkRows n={7} /></div>
        <div className="hidden rounded-card border border-border bg-surface-1 p-5 shadow-card lg:block"><SkRows n={5} /></div>
      </div>
      <span className="sr-only" role="status">Loading activity…</span>
    </div>
  );
}
