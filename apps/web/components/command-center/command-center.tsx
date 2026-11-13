import type { ScreenId } from "@nelio/config";
import {
  AgentAvatar, Blob, Bubble, ButtonLink, Card, CardHead, CardTitle, Chip, EmptyState, IPhone, Icon, IconButton, Illustration, LoadingNote, Meter,
  Motion, Pipeline, Row, RowList, SectionTitle, ShortScreen, Sk, SkCard, SkRows, SkStat, Small, StatTile, Sticker, TopStrip, photoForCaption,
} from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChecklistCard } from "./checklist";
import { CHECKLIST, isFirstRun, type AgentCardData, type CommandCenterData, type StripState } from "./model";

export type HrefFor = (id: ScreenId) => string;
const fmt = (n: number) => n.toLocaleString("en-US");
const checklistLinks = (href: HrefFor) => Object.fromEntries(CHECKLIST.map((c) => [c.key, href(c.screen)])) as Record<(typeof CHECKLIST)[number]["key"], string>;
const plural = (n: number, one: string, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;

// ------------------------------------------------------------------ Strip under the top bar
export function CommandCenterStrip({ strip, href, resumeAvailable }: { strip: StripState; href: HrefFor; resumeAvailable: boolean }) {
  const action = (label: string, id: ScreenId) => <Link href={href(id)} className="tap-target">{label}</Link>;
  if (strip.kind === "paused") {
    return <TopStrip tone="warn" icon="pause" text={`All agents paused by ${strip.by} at ${strip.at}. Nothing new will start.`} action={resumeAvailable ? action("Resume all", "APP-01") : undefined} />;
  }
  if (strip.kind === "trial") {
    return <TopStrip tone="ai" icon="gift" text={`Trial · ${plural(strip.daysLeft, "day")} left · no card needed, you won’t be charged`} action={action("Choose a plan", "BI-02")} />;
  }
  return <TopStrip tone="err" icon="alert" text={`Payment failed · ${plural(strip.daysLeft, "day")} left to update. Top-ups are paused.`} action={action("Update payment", "BI-01")} />;
}

// ------------------------------------------------------------------ Filled pieces
function Hero({ d, href }: { d: CommandCenterData; href: HrefFor }) {
  const h = d.hero!;
  const s = d.stats;
  const phones = h.shorts.slice(0, 3);
  return (
    <section className="flex flex-wrap items-stretch gap-4 md:gap-5">
      {/* Phone and tablet (under 1280 px): text above, phones centred below, as on the mobile board. Desktop: side by side. */}
      <div className="relative flex flex-[2_1_560px] flex-col items-stretch gap-5 overflow-hidden rounded-feature bg-accent p-5 text-white md:p-[30px] xl:flex-row xl:items-center">
        <Blob size={300} fill="#3D63FF" className="-bottom-[120px] -right-[60px]" />
        <div className="relative flex flex-col gap-3.5 xl:flex-[1_1_300px]">
          <Sticker fill="pink" rotate={-3} icon="spark" size={13}>Nelio AI · this week</Sticker>
          <h1 className="m-0 font-display text-[31px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[40px]">
            Good {d.greeting}, {d.firstName}. {plural(h.ready, "short")} {h.ready === 1 ? "is" : "are"} ready for you.
          </h1>
          <p className="m-0 text-base font-medium">
            Your agents made {plural(h.drafts, "draft")} from {plural(h.videos, "video")}. Review the best {fmt(h.ready)} and they’ll go out on schedule.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ButtonLink href={href("PB-02")} variant="lime">Review drafts</ButtonLink>
            <Link href={href("CL-02")} className="box-border inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white px-[18px] py-2.5 text-sm font-bold text-white no-underline hover:text-white">
              <Icon name="upload" size={16} />
              New upload
            </Link>
          </div>
        </div>
        {phones.length ? (
          <div className="relative flex justify-center pb-2 pt-1 xl:justify-start xl:p-0" aria-hidden="true">
            {phones.map((p, i) => (
              <div key={p.caption} style={{ marginLeft: i ? -30 : 0, marginTop: [16, 0, 22][i] }}>
                <IPhone width={120} rotate={[-8, 0, 8][i]}>
                  <ShortScreen photo={photoForCaption(p.caption)} caption={p.caption} bg={p.bg} />
                </IPhone>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {s ? (
        <div className="grid flex-[1_1_280px] grid-cols-2 gap-3.5">
          <StatTile label="Agents active" value={fmt(s.agentsActive)} sub={`${fmt(s.agentsPaused)} paused`} icon="bot" />
          <StatTile label="Waiting on you" value={fmt(s.waiting)} sub={`${fmt(s.waitingClients)} for clients`} icon="check" />
          <StatTile label="Published" value={fmt(s.published)} sub="this week" icon="zap" filled="lime" />
          <StatTile label="Credits used" value={fmt(s.creditsUsed)} sub={`of ${fmt(s.creditBudget)} budget`} icon="wallet" />
        </div>
      ) : null}
    </section>
  );
}

function AgentCard({ a, href }: { a: AgentCardData; href: HrefFor }) {
  const pct = (a.budget.used / Math.max(1, a.budget.limit)) * 100;
  return (
    <Card>
      <div className="flex items-center gap-3">
        <AgentAvatar color={a.color} shape={a.shape} size={52} />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <CardTitle size={17}>{a.name}</CardTitle>
          <Small>{a.line}</Small>
        </div>
        <span className="grow" />
        <Chip tone={a.state.tone} icon={a.state.icon}>{a.state.label}</Chip>
      </div>
      <Meter label="Weekly budget" right={`${fmt(a.budget.used)} / ${fmt(a.budget.limit)} cr`} pct={pct} tone={pct >= 100 ? "warn" : "acc"} />
      <div className="flex flex-wrap items-center gap-2">
        <Small>{a.meta}</Small>
        <span className="grow" />
        <IconButton icon={a.running ? "pause" : "play"} label={a.running ? `Pause ${a.name}` : `Resume ${a.name}`} />
        <ButtonLink href={href("APP-04")} variant="secondary" size="sm">Open</ButtonLink>
      </div>
    </Card>
  );
}

function Filled({ d, href }: { d: CommandCenterData; href: HrefFor }) {
  const p = d.pipeline;
  return (
    <>
      {d.hero ? <Hero d={d} href={href} /> : null}
      {!d.checklist.dismissed && d.checklist.done.length < 5 ? <ChecklistCard done={d.checklist.done} links={checklistLinks(href)} /> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionTitle title="Your agents" right={<ButtonLink href={href("APP-06")} variant="secondary" size="sm" icon="plus">New agent</ButtonLink>} />
          {d.agents.length ? (
            <div className="grid gap-3 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
              {d.agents.map((a) => <AgentCard key={a.id} a={a} href={href} />)}
            </div>
          ) : (
            <EmptyState illustration="agents" width={220} title="No agents yet" text="Agents research, clip and schedule for you. Start with one, or let Nelio AI suggest a plan." actions={<ButtonLink href={href("APP-06")} variant="cta" arrow>Create your first agent</ButtonLink>} />
          )}
          {p ? (
            <Card>
              <CardHead title="Content pipeline" right={<Small>This week</Small>} />
              <Pipeline
                items={[
                  { label: "Ideas", value: p.ideas, tone: "neutral" },
                  { label: "Drafts", value: p.drafts, tone: "ai" },
                  { label: "Needs approval", value: p.needsApproval, tone: "warn" },
                  { label: "Scheduled", value: p.scheduled, tone: "blue" },
                  { label: "Published", value: p.published, tone: "ok" },
                ]}
              />
            </Card>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHead title="Needs you" right={<Chip tone="warn">{fmt(d.needs.length)}</Chip>} />
            {d.needs.length ? (
              <RowList>
                {d.needs.map((n) => (
                  <Row key={n.key} title={n.title} sub={n.sub} left={<Bubble icon={n.icon} tone={n.tone} size={40} />} right={<ButtonLink href={href(n.action.screen)} variant={n.action.primary ? "primary" : "secondary"} size="sm">{n.action.label}</ButtonLink>} />
                ))}
              </RowList>
            ) : (
              <Small>Approvals, expiring sign-ins and budget alerts will show up here.</Small>
            )}
          </Card>
          <Card>
            <CardHead title="Live activity" right={<Link href={href("APP-03")} className="tap-target text-[13.5px] font-bold text-accent-text no-underline hover:text-text">See all →</Link>} />
            {d.live.length ? (
              <RowList>
                {d.live.map((l) => (
                  <Row key={l.key} title={l.title} sub={l.sub} left={<AgentAvatar color={l.agent.color} shape={l.agent.shape} size={36} />} right={<Chip tone={l.status.tone} icon={l.status.icon}>{l.status.label}</Chip>} />
                ))}
              </RowList>
            ) : (
              <Small>Nothing is running right now.</Small>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Empty (first run)
function Empty({ d, href }: { d: CommandCenterData; href: HrefFor }) {
  return (
    <>
      <section className="relative flex flex-wrap items-center gap-6 overflow-hidden rounded-feature bg-lime p-5 md:p-8">
        <div className="flex flex-[1_1_420px] flex-col gap-3.5 text-outline">
          <Sticker fill="yellow" rotate={-4} icon="smile">Welcome, {d.firstName}!</Sticker>
          <h1 className="m-0 font-display text-[31px] font-extrabold leading-[1.02] tracking-[-0.045em] text-outline md:text-[46px]">Let’s make your first short.</h1>
          <p className="m-0 text-base font-medium">Upload a long video you own. Your first agent can take it from there.</p>
          <div className="flex flex-wrap gap-2.5">
            <ButtonLink href={href("CL-02")} variant="cta" size="lg" arrow>Upload a video</ButtonLink>
            <ButtonLink href={href("APP-02")} variant="secondary" size="lg" icon="spark">Plan with Nelio AI</ButtonLink>
          </div>
        </div>
        <div className="flex flex-[1_1_320px] justify-center">
          <Illustration name="welcome" width={380} />
        </div>
      </section>
      {!d.checklist.dismissed ? <ChecklistCard done={d.checklist.done} links={checklistLinks(href)} /> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <EmptyState
          illustration="agents"
          width={220}
          title="No agents yet"
          text="Agents research, clip and schedule for you. Start with one, or let Nelio AI suggest a plan."
          actions={
            <>
              <ButtonLink href={href("APP-06")} variant="cta" arrow>Create your first agent</ButtonLink>
              <ButtonLink href={href("APP-02")} variant="secondary">Ask Nelio AI</ButtonLink>
            </>
          }
        />
        <EmptyState illustration="inbox" width={220} title="Nothing needs you" text="Approvals, expiring sign-ins and budget alerts will show up here." />
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Loading
export function CommandCenterLoading() {
  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-busy="true">
      <div className="flex flex-wrap gap-4 md:gap-5">
        <Sk h={290} r={36} className="flex-[2_1_560px]" />
        <div className="grid flex-[1_1_280px] grid-cols-2 gap-3.5">
          <SkStat />
          <SkStat />
          <SkStat />
          <SkStat />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5">
        <div className="flex flex-col gap-3.5">
          <Sk w={180} h={20} />
          <SkCard />
          <SkCard />
        </div>
        <div className="flex flex-col gap-3.5">
          <Sk w={140} h={20} />
          <SkRows n={4} />
        </div>
      </div>
      <LoadingNote text="Loading your studio…" />
    </div>
  );
}

/** APP-01 Command Center body. The state comes from the data (Filled or Empty); Loading is its own component. */
export function CommandCenter({ data, href }: { data: CommandCenterData; href: HrefFor }): ReactNode {
  return (
    <Motion className="flex flex-col gap-4 md:gap-6">
      <div data-enter="" className="flex flex-col gap-4 md:gap-6">
        {isFirstRun(data) ? <Empty d={data} href={href} /> : <Filled d={data} href={href} />}
      </div>
    </Motion>
  );
}
