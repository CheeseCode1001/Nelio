"use client";

import { SCHEDULE_PRESETS } from "@nelio/domain";
import { Banner, Button, Card, CardHead, Chip, Field, Meter, SelectField, Switch } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useActionState, useId, useState, useTransition } from "react";
import { pauseAgentAction, resumeAgentAction, runAgentNowAction, saveAgentBudgetAction, saveAgentPolicyAction, type FormState } from "@/lib/actions/agents";
import type { AgentDetailData } from "@/lib/agent-detail";

export const AGENT_FORM_ID = "agent-form";
const TEXTAREA = "box-border min-h-[96px] w-full resize-y rounded-input border-2 border-border bg-surface-1 px-4 py-3 font-body text-sm text-text placeholder:text-muted";
const fmt = (n: number) => n.toLocaleString("en-US");

function Saved({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p role={state.ok ? "status" : "alert"} className={`m-0 text-[13px] font-semibold ${state.ok ? "text-ok-text" : "text-err-text"}`}>{state.message}</p>;
}

/** Header actions: Run now, Pause / Resume, Save changes (submits the open tab's form). */
export function DetailActions({ slug, d, canSave }: { slug?: string; d: AgentDetailData; canSave: boolean }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const stopped = d.state === "stopped";
  // A stopped agent keeps the board's disabled "Pause agent" button.
  const running = d.state === "active" || stopped;
  const act = (fn: () => Promise<{ ok: true; runNumber?: number } | { ok: false; error: string }>, okText: (r: { runNumber?: number }) => string) => {
    if (!slug) return;
    setNote(null);
    start(async () => {
      const r = await fn();
      setNote(r.ok ? { ok: true, text: okText(r) } : { ok: false, text: r.error });
      router.refresh();
    });
  };
  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" icon="play" disabled={stopped || pending || d.workspacePaused} onClick={() => act(() => runAgentNowAction(slug!, d.id, crypto.randomUUID()), (r) => `Run #${r.runNumber} started. Follow it in Activity.`)}>Run now</Button>
        <Button
          variant="secondary"
          icon={running ? "pause" : "play"}
          disabled={stopped || pending}
          onClick={() => act(() => (running ? pauseAgentAction(slug!, d.id) : resumeAgentAction(slug!, d.id)), () => (running ? "Paused." : "Resumed."))}
        >
          {running ? "Pause agent" : "Resume agent"}
        </Button>
        <Button type="submit" form={AGENT_FORM_ID} disabled={stopped || !canSave}>Save changes</Button>
      </div>
      {note ? <p role={note.ok ? "status" : "alert"} className={`m-0 text-[13px] font-semibold ${note.ok ? "text-ok-text" : "text-err-text"}`}>{note.text}</p> : null}
    </div>
  );
}

/** Policy & permissions tab (the Filled board). */
export function PolicyForm({ slug, d }: { slug?: string; d: AgentDetailData }) {
  const [state, action] = useActionState(slug ? saveAgentPolicyAction.bind(null, slug, d.id) : async (s: FormState) => s, {});
  const id = useId();
  const e = state.errors ?? {};
  const stopped = d.state === "stopped";
  return (
    <form id={AGENT_FORM_ID} action={action} className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
      <Card>
        <CardHead title="Goal & sources" />
        <Field label="Goal" name="goal" defaultValue={d.policy.goal} error={e.goal} disabled={stopped} required maxLength={300} />
        <SelectField label="Content types" name="contentTypes" options={[{ value: "short_clips", label: "Short clips from long videos" }]} disabled={stopped} />
        <SelectField label="Source pool" name="sourcePool" options={[{ value: "uploads", label: "Your uploads" }]} hint="Licensed creators can be added once licensing opens." disabled={stopped} />
        <SelectField label="Schedule" name="schedule" defaultValue={d.policy.schedule} options={Object.entries(SCHEDULE_PRESETS).map(([value, p]) => ({ value, label: p.schedule ? `${p.label} WAT` : p.label }))} error={e.schedule} disabled={stopped} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${id}-rules`} className="text-[13px] font-bold text-text">Brand rules</label>
          <textarea id={`${id}-rules`} name="brandRules" defaultValue={d.policy.brandRules} maxLength={600} disabled={stopped} className={TEXTAREA} placeholder="Tone, words to avoid, caption style…" aria-invalid={e.brandRules ? true : undefined} />
          {e.brandRules ? <span className="text-[12.5px] text-err-text">{e.brandRules}</span> : null}
        </div>
      </Card>
      <Card>
        <CardHead title="Permissions" right={<span className="ml-auto"><Chip tone={d.modeChip.tone} icon={d.modeChip.icon}>{d.modeChip.label}</Chip></span>} />
        <Switch id={`${id}-auto`} label="Publish without asking" sub="Autonomous: requires authorization and a connected account" checked={false} disabled />
        <Switch id={`${id}-lic`} label="Use licensed sources" sub="Only active licenses, checked before every use" checked={false} disabled />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max posts per day" name="maxPostsPerDay" type="number" min={1} max={20} defaultValue={d.policy.maxPostsPerDay} error={e.maxPostsPerDay} disabled={stopped} inputMode="numeric" />
          <Field label="Max posts per week" name="maxPostsPerWeek" type="number" min={1} max={100} defaultValue={d.policy.maxPostsPerWeek} error={e.maxPostsPerWeek} disabled={stopped} inputMode="numeric" />
        </div>
        <SelectField label="Approval" name="approval" options={[{ value: "owner", label: "Owner approves every post" }]} disabled={stopped} />
        <Banner tone="warn" title="Widening permissions needs re-authorization" text="You’ll confirm the new limits before they apply." />
        <Saved state={state} />
      </Card>
    </form>
  );
}

/** Budget tab (AgentDetail-Budget). */
export function BudgetForm({ slug, d }: { slug?: string; d: AgentDetailData }) {
  const [state, action] = useActionState(slug ? saveAgentBudgetAction.bind(null, slug, d.id) : async (s: FormState) => s, {});
  const id = useId();
  const e = state.errors ?? {};
  const b = d.budget;
  const max = Math.max(1, ...b.days.map((x) => x.credits));
  const stopped = d.state === "stopped";
  return (
    <form id={AGENT_FORM_ID} action={action} className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
      <Card>
        <CardHead title="Weekly budget" />
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[44px] font-extrabold leading-none tracking-[-0.03em] text-text">{fmt(b.used)}</span>
          <span className="text-[15px] font-semibold text-muted">/ {fmt(b.weeklyBudget)} credits</span>
        </div>
        <Meter pct={(b.used / Math.max(1, b.weeklyBudget)) * 100} tone={b.used >= b.weeklyBudget ? "warn" : "acc"} ariaLabel={`${fmt(b.used)} of ${fmt(b.weeklyBudget)} credits used this week`} />
        <span className="self-end text-[12.5px] font-semibold text-muted">{b.resets} WAT</span>
        <Field label="Weekly limit" name="weeklyBudget" type="number" min={10} defaultValue={b.weeklyBudget} error={e.weeklyBudget} hint="Credit amounts are provisional until launch." disabled={stopped} inputMode="numeric" />
        <Field label="Per-run limit" name="perRunLimit" type="number" min={1} defaultValue={b.perRunLimit} error={e.perRunLimit} disabled={stopped} inputMode="numeric" />
        <Switch id={`${id}-stop`} label="Pause when limit is reached" sub="Always on: work never overspends" checked disabled />
        <Saved state={state} />
      </Card>
      <Card>
        <CardHead title="Spend this week" />
        <div className="flex h-[150px] items-end gap-2" role="img" aria-label={`Credits used per day this week: ${b.days.map((x) => `${x.label} ${x.credits}`).join(", ")}`}>
          {b.days.map((x) => (
            <div key={x.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="w-full max-w-[44px] rounded-[10px] bg-accent" style={{ height: `${Math.max(x.credits ? 6 : 0, (x.credits / max) * 110)}px` }} />
              <span className="text-[11.5px] font-semibold text-muted">{x.label}</span>
            </div>
          ))}
        </div>
        <dl className="m-0 flex flex-col">
          {([["Estimated", b.estimated], ["Actual", b.actual], ["Refunded", b.refunded]] as const).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-border py-[11px] last:border-b-0">
              <dt className="text-[13px] text-muted">{k}</dt>
              <dd className="m-0 text-sm font-bold text-text">{fmt(v)} cr</dd>
            </div>
          ))}
        </dl>
      </Card>
    </form>
  );
}
