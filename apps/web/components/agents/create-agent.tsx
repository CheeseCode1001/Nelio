"use client";

import { SCHEDULE_PRESETS, type SchedulePresetId } from "@nelio/domain";
import { AgentAvatar, Banner, Bubble, Button, ButtonLink, Card, CardHead, Chip, Field, Icon, Meter, PlatformBadge, SelectField, Small, StepProgress, cn, type AgentColor } from "@nelio/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { createAgentAction, type CreateState } from "@/lib/actions/agents";

const STEPS = ["Goal", "Sources", "Destinations", "Budget", "Mode & review"] as const;
type Shape = "circle" | "square" | "blob" | "pill";
const LOOKS: { color: AgentColor; shape: Shape; label: string }[] = [
  { color: "lime", shape: "circle", label: "Lime circle" },
  { color: "pink", shape: "blob", label: "Pink blob" },
  { color: "blue", shape: "square", label: "Blue square" },
  { color: "orange", shape: "blob", label: "Orange blob" },
  { color: "yellow", shape: "circle", label: "Yellow circle" },
];
const SUGGESTIONS = [
  { label: "Clip my podcast", goal: "Clip my podcast into 3 shorts a week" },
  { label: "Repurpose streams", goal: "Turn my live streams into short highlights" },
  { label: "Post daily tips", goal: "Post one short tip every day from my videos" },
];
const TEXTAREA = "box-border min-h-[96px] w-full resize-y rounded-input border-2 border-border bg-surface-1 px-4 py-3 font-body text-sm text-text placeholder:text-muted";
const CREDITS_PER_CLIP = 50; // provisional, Balanced quality (D-10)
const fmt = (n: number) => n.toLocaleString("en-US");

export interface CreateAgentProps {
  slug?: string;
  uploads: number;
  /** Plain strings only: this component runs in the browser. A new agent opens at `${agents}/${id}`. */
  hrefs: { agents: string; plans: string; connections: string };
  /** Pre-fills from an agent being duplicated (AgentDetail-Stopped). */
  from?: { name: string; goal: string; color: AgentColor; shape: Shape; schedule: SchedulePresetId; weeklyBudget: number; perRunLimit: number; maxPostsPerWeek: number };
  initialStep?: number;
}

function StepTabs({ current }: { current: number }) {
  return (
    <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Steps">
      {STEPS.map((s, i) => {
        const n = i + 1;
        return (
          <li key={s} aria-current={n === current ? "step" : undefined} className={cn("rounded-full px-2.5 py-1 text-[12.5px] font-bold", n === current ? "bg-ink text-on-ink" : n < current ? "bg-accent-tint text-accent-text" : "text-muted")}>
            {n} {s}
          </li>
        );
      })}
    </ol>
  );
}

/** APP-06 Create agent: five steps, one form. Nothing is created until the last step. */
export function CreateAgentWizard({ slug, uploads, hrefs, from, initialStep = 1 }: CreateAgentProps) {
  const id = useId();
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [name, setName] = useState(from?.name ?? "");
  const [goal, setGoal] = useState(from?.goal ?? "");
  const [look, setLook] = useState(from ? Math.max(0, LOOKS.findIndex((l) => l.color === from.color)) : 0);
  const [schedule, setSchedule] = useState<SchedulePresetId>(from?.schedule ?? "mwf_1800");
  const [weekly, setWeekly] = useState(from?.weeklyBudget ?? 300);
  const [perRun, setPerRun] = useState(from?.perRunLimit ?? 60);
  const [perWeek, setPerWeek] = useState(from?.maxPostsPerWeek ?? 3);
  const [mode, setMode] = useState<"manual" | "assisted">("assisted");
  const [local, setLocal] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState(slug ? createAgentAction.bind(null, slug) : async (s: CreateState) => s, {});

  useEffect(() => {
    if (state.ok && state.agentId) router.push(`${hrefs.agents}/${state.agentId}`);
  }, [state, router, hrefs]);

  const errors = { ...local, ...(state.errors ?? {}) };
  const clips = Math.floor(weekly / CREDITS_PER_CLIP);
  const top = Math.min(weekly, Math.max(clips, 1) * CREDITS_PER_CLIP);
  const low = Math.round((top * 0.93) / 10) * 10;
  const chosen = LOOKS[look]!;

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (name.trim().length < 2) e.name = "Give your agent a name";
      if (goal.trim().length < 5) e.goal = "Describe what the agent should do";
    }
    if (step === 4) {
      if (!(weekly >= 10)) e.weeklyBudget = "Weekly budget must be at least 10";
      if (!(perRun >= 1) || perRun > weekly) e.perRunLimit = "Per-run limit can’t be more than the weekly budget";
      if (!(perWeek >= 1)) e.maxPostsPerWeek = "At least 1 post a week";
    }
    setLocal(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(5, s + 1));
  };

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {/* Every answer is posted with the last step, whichever step is showing. */}
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="goal" value={goal} />
      <input type="hidden" name="color" value={chosen.color} />
      <input type="hidden" name="shape" value={chosen.shape} />
      <input type="hidden" name="schedule" value={schedule} />
      <input type="hidden" name="weeklyBudget" value={weekly} />
      <input type="hidden" name="perRunLimit" value={perRun} />
      <input type="hidden" name="maxPostsPerWeek" value={perWeek} />
      <input type="hidden" name="mode" value={mode} />

      <StepProgress total={5} current={step} />
      <StepTabs current={step} />

      {step === 1 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
          <Card>
            <Field label="Name your agent" id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} error={errors.name} autoFocus placeholder="Budget Shorts" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`${id}-goal`} className="text-[13px] font-bold text-text">What should it do?</label>
              <textarea id={`${id}-goal`} value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} className={TEXTAREA} aria-invalid={errors.goal ? true : undefined} placeholder="Clip my podcast into 3 shorts a week about budgeting" />
              {errors.goal ? <span className="text-[12.5px] font-semibold text-err-text">{errors.goal}</span> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s.label} type="button" onClick={() => setGoal(s.goal)} className="tap-target inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-ai-tint px-3 py-1.5 text-[12.5px] font-bold text-ai-text">
                  <Icon name="spark" size={13} />{s.label}
                </button>
              ))}
            </div>
          </Card>
          <Card className="items-start">
            <div className="flex w-full justify-center py-2"><AgentAvatar color={chosen.color} shape={chosen.shape} size={120} /></div>
            <div className="text-[17px] font-bold text-text" id={`${id}-look`}>Pick a look</div>
            <div role="radiogroup" aria-labelledby={`${id}-look`} className="flex flex-wrap gap-2.5">
              {LOOKS.map((l, i) => (
                <button key={l.label} type="button" role="radio" aria-checked={i === look} aria-label={l.label} onClick={() => setLook(i)} className={cn("tap-target cursor-pointer rounded-full border-0 bg-transparent p-0.5", i === look && "outline-3 outline-offset-2 outline-accent")}>
                  <AgentAvatar color={l.color} shape={l.shape} size={40} animated={false} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHead title="Where can it get videos?" sub="Only your uploads and active licenses" />
          <ul className="m-0 list-none overflow-hidden rounded-row border border-border p-0">
            <li className="flex items-center gap-3 px-4 py-3">
              <Bubble icon="upload" tone="blue" />
              <div className="min-w-0 grow">
                <div className="text-sm font-semibold text-text">Your uploads</div>
                <div className="text-[13px] text-muted">{uploads ? `${fmt(uploads)} videos` : "No videos yet. The agent waits until you upload one."}</div>
              </div>
              <Chip tone="ok" icon="check">included</Chip>
            </li>
          </ul>
          <Small>Licensed creators appear here once licensing opens. A license is checked before every use, and revoked ones can’t be chosen.</Small>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHead title="Where can it post?" />
          <ul className="m-0 list-none overflow-hidden rounded-row border border-border p-0">
            {([["ig", "Instagram", "Reels", "In development"], ["yt", "YouTube", "Shorts", "In development"], ["tt", "TikTok", "", "Coming later"], ["fb", "Facebook", "", "Coming later"]] as const).map(([p, n, sub, st]) => (
              <li key={p} className={cn("flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0", st === "Coming later" && "opacity-50")}>
                <PlatformBadge platform={p} size={36} />
                <div className="min-w-0 grow">
                  <div className="text-sm font-semibold text-text">{n}</div>
                  <div className="text-[13px] text-muted">{sub ? `${sub} · ` : ""}not connected</div>
                </div>
                <Chip tone={st === "Coming later" ? "neutral" : "blue"} icon="clock">{st}</Chip>
              </li>
            ))}
          </ul>
          <Small>Until an account is connected, the agent prepares drafts for you to review. Nothing is published.</Small>
        </Card>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
          <Card>
            <Field label="Weekly budget (credits)" type="number" inputMode="numeric" min={10} value={weekly} onChange={(e) => setWeekly(Number(e.target.value))} error={errors.weeklyBudget} hint={`About ${fmt(clips)} short clip${clips === 1 ? "" : "s"} a week at Balanced quality`} />
            <Field label="Per-run limit" type="number" inputMode="numeric" min={1} value={perRun} onChange={(e) => setPerRun(Number(e.target.value))} error={errors.perRunLimit} />
            <Field label="Max posts per week" type="number" inputMode="numeric" min={1} max={100} value={perWeek} onChange={(e) => setPerWeek(Number(e.target.value))} error={errors.maxPostsPerWeek} />
            <SelectField label="Schedule" value={schedule} onChange={(e) => setSchedule(e.target.value as SchedulePresetId)} options={Object.entries(SCHEDULE_PRESETS).map(([value, p]) => ({ value, label: p.schedule ? `${p.label} WAT` : p.label }))} />
          </Card>
          <Card>
            <CardHead title="Estimate" />
            <div className="font-display text-[40px] font-extrabold tracking-[-0.03em] text-text">≈ {fmt(low)}–{fmt(top)}</div>
            <Small>credits per week · provisional until launch</Small>
            <Meter label="Share of this agent’s budget" right={`${fmt(top)} of ${fmt(weekly)}`} pct={(top / Math.max(1, weekly)) * 100} />
          </Card>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Mode" className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            {([["manual", "Manual", "You start everything.", "pen", "neutral"], ["assisted", "Assisted", "Agent prepares, you approve.", "check", "lime"]] as const).map(([v, t, s, icon, tone]) => (
              <button key={v} type="button" role="radio" aria-checked={mode === v} onClick={() => setMode(v)} className={cn("box-border flex cursor-pointer items-center gap-3 rounded-[22px] border-2 bg-surface-1 px-[18px] py-4 text-left", mode === v ? "border-accent bg-accent-tint" : "border-border")}>
                <Bubble icon={icon} tone={tone} />
                <span className="min-w-0 grow">
                  <span className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-text">{t}{v === "assisted" ? <Chip tone="ai">Recommended</Chip> : null}</span>
                  <span className="block text-[13px] text-muted">{s}</span>
                </span>
                <span aria-hidden="true" className={cn("inline-flex size-6 flex-none items-center justify-center rounded-full border-2", mode === v ? "border-accent bg-accent text-white" : "border-border")}>{mode === v ? <Icon name="check" size={14} strokeWidth={3} /> : null}</span>
              </button>
            ))}
            <div aria-disabled="true" className="box-border flex items-center gap-3 rounded-[22px] border-2 border-border bg-surface-1 px-[18px] py-4 opacity-60">
              <Bubble icon="zap" tone="ai" />
              <span className="min-w-0 grow">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-text">Autonomous <Chip tone="ai">Needs authorization</Chip></span>
                <span className="block text-[13px] text-muted">Needs a connected account first.</span>
              </span>
            </div>
          </div>
          <Card>
            <CardHead title="Review" />
            <dl className="m-0 flex flex-col">
              {([["Name", name], ["Sources", "Your uploads"], ["Posts to", "Drafts only (no account connected)"], ["Schedule", SCHEDULE_PRESETS[schedule].label], ["Budget", `${fmt(weekly)} credits / week`]] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border py-[11px] last:border-b-0">
                  <dt className="text-[13px] text-muted">{k}</dt>
                  <dd className="m-0 text-right text-sm font-bold text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          {state.message && !state.ok ? <Banner tone="err" title={state.message} action={state.message.includes("limit") ? <ButtonLink href={hrefs.plans} variant="secondary" size="sm">Compare plans</ButtonLink> : undefined} /> : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {step === 1 ? (
          <Link href={hrefs.agents} className="tap-target text-sm font-bold text-text no-underline">Back</Link>
        ) : (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="tap-target cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-text">Back</button>
        )}
        {step < 5 ? (
          <Button variant="cta" arrow onClick={next}>Continue</Button>
        ) : (
          <Button type="submit" variant="cta" arrow loading={pending}>Create agent</Button>
        )}
      </div>
    </form>
  );
}

/** CreateAgent-Limit: shown instead of the wizard when the plan's agents are all in use. */
export function CreateAgentLimit({ planLabel, limit, upgrade, hrefs }: { planLabel: string; limit: number; upgrade: { label: string; agents: number | null } | null; hrefs: { agents: string; plans: string } }) {
  return (
    <div className="flex flex-col gap-5">
      <StepProgress total={5} current={1} />
      <StepTabs current={1} />
      <Card>
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <Bubble icon="bot" tone="warn" size={56} />
          <h2 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.02em] text-text">You’ve hit your agent limit</h2>
          <p className="m-0 max-w-[460px] text-[15px] text-muted">
            {planLabel} includes {limit} agent{limit === 1 ? "" : "s"}. Pause or stop one{upgrade ? `, or upgrade to ${upgrade.label}${upgrade.agents ? ` for ${upgrade.agents}` : ""}` : ""}.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <ButtonLink href={hrefs.plans} variant="cta" arrow>Compare plans</ButtonLink>
            <ButtonLink href={hrefs.agents} variant="secondary">Manage agents</ButtonLink>
          </div>
        </div>
      </Card>
    </div>
  );
}
