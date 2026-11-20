import { AgentAvatar, Icon, PlatformBadge, cn } from "@nelio/ui";
import Link from "next/link";
import type { AgentCardData } from "@/components/command-center/model";
import { AgentMenu } from "./agent-menu";

const fmt = (n: number) => n.toLocaleString("en-US");
const HEADER = { lime: "bg-lime", pink: "bg-pink", grape: "bg-pink", blue: "bg-cyan", cyan: "bg-cyan", orange: "bg-orange", yellow: "bg-yellow", violet: "bg-violet" } as Record<string, string>;

/**
 * Agent card (Cards board "A", refresh of 20 Nov 2026), used on the Command Center and APP-04: an image header
 * with the mode, a white body with a notch for the menu, the agent, this week's drafts and budget, then the
 * people who see its work and where it posts. With a workspace slug the menu's pause / resume works.
 */
export function AgentCard({ a, openHref, workspaceSlug }: { a: AgentCardData; openHref: string; workspaceSlug?: string }) {
  const pct = Math.min(100, (a.budget.used / Math.max(1, a.budget.limit)) * 100);
  const state = a.state.label.charAt(0).toUpperCase() + a.state.label.slice(1);
  return (
    <article className="flex w-full min-w-0 flex-col rounded-[28px] border border-transparent bg-surface-1 p-2 shadow-card">
      <div className={cn("relative h-[140px] flex-none overflow-hidden rounded-[22px]", HEADER[a.color] ?? "bg-surface-3")}>
        {a.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
          <img src={a.cover} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><AgentAvatar color={a.color} shape={a.shape} size={88} /></div>
        )}
        {a.mode ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-[5px] rounded-full bg-white px-2.5 py-[5px] text-xs font-bold text-outline">
            <Icon name={a.mode.icon} size={13} strokeWidth={2.4} />
            {a.mode.label}
          </span>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-col gap-3 px-3 pb-2 pt-3.5">
        {/* The notch: a white disc biting into the header, holding the menu. */}
        <span className="absolute -top-[22px] right-2 inline-flex size-11 items-center justify-center rounded-full bg-surface-1">
          <AgentMenu id={a.id} name={a.name} running={a.running} openHref={openHref} workspaceSlug={workspaceSlug} />
        </span>
        <div className="flex min-w-0 items-center gap-2.5 pr-10">
          <AgentAvatar color={a.color} shape={a.shape} size={36} animated={false} />
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="flex min-w-0 items-center gap-[7px] text-[13px] font-semibold text-muted">
              <span className="truncate">{a.when ?? a.meta}</span>
              <span aria-hidden="true" className="size-1 flex-none rounded-full bg-current" />
              <span className="flex-none">{state}</span>
            </div>
            <Link href={openHref} className="tap-target text-inherit no-underline hover:text-accent-text">
              <div className="line-clamp-2 font-display text-lg font-extrabold leading-tight text-text">{a.name}</div>
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {a.drafts !== undefined ? (
            <div className="flex justify-between gap-2 text-[12.5px]"><span className="text-muted">This week</span><b className="text-text">{a.drafts ? `${a.drafts} draft${a.drafts === 1 ? "" : "s"}` : "Nothing yet"}</b></div>
          ) : null}
          <div className="flex justify-between gap-2 text-[12.5px]"><span className="text-muted">Weekly budget</span><b className="text-text">{fmt(a.budget.used)} / {fmt(a.budget.limit)} cr</b></div>
          <div role="progressbar" aria-label={`Weekly budget ${fmt(a.budget.used)} of ${fmt(a.budget.limit)} credits`} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className={cn("h-full rounded-full", pct >= 100 ? "bg-warn" : "bg-accent")} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2.5">
          <div className="flex flex-none items-center" aria-label={a.people?.length ? `${a.people.length + (a.morePeople ?? 0)} people see this agent’s work` : undefined}>
            {(a.people ?? []).map((p, i) => (
              <span key={i} className={cn("inline-flex rounded-full border-2 border-surface-1", i > 0 && "-ml-2")}>
                <span className="inline-flex size-[30px] items-center justify-center rounded-full text-[11px] font-extrabold text-outline" style={{ background: p.color }}>{p.initials}</span>
              </span>
            ))}
            {a.morePeople ? <span className="-ml-2 inline-flex size-[34px] items-center justify-center rounded-full border-2 border-surface-1 bg-surface-2 text-xs font-extrabold text-text">+{a.morePeople}</span> : null}
          </div>
          {a.platforms?.length ? (
            <div className="flex flex-none items-center">
              {a.platforms.map((p, i) => <span key={p} className={cn("inline-flex rounded-[10px] border-2 border-surface-1", i > 0 && "-ml-2")}><PlatformBadge platform={p} size={30} /></span>)}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
