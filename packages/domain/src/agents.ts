/**
 * Agent rules that do not touch the database: schedules, budget weeks, the step plan and budget arithmetic.
 * Shared by the web app (forms, estimates) and the worker (scheduling, hard budget checks).
 */

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface AgentSchedule {
  days: Weekday[];
  /** "HH:MM", 24-hour, in the workspace time zone. */
  time: string;
}

/** Agent fills a person can pick ("Pick a look"); names match the UI package's AgentAvatar colours. */
export const AGENT_COLORS = ["lime", "blue", "pink", "yellow", "orange", "teal"] as const;
export const AGENT_SHAPES = ["circle", "square", "blob", "pill"] as const;

/** Wall-clock parts of an instant in a time zone. */
function zonedParts(at: Date, timeZone: string) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", weekday: "short",
  });
  const p = Object.fromEntries(f.formatToParts(at).map((x) => [x.type, x.value]));
  return {
    y: Number(p.year), m: Number(p.month), d: Number(p.day), hh: Number(p.hour), mm: Number(p.minute), ss: Number(p.second),
    wd: WEEKDAYS.indexOf(String(p.weekday).toLowerCase().slice(0, 3) as Weekday),
  };
}

/** Offset of a time zone from UTC at an instant, in minutes. */
function offsetMinutes(at: Date, timeZone: string): number {
  const p = zonedParts(at, timeZone);
  return (Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - Math.floor(at.getTime() / 1000) * 1000) / 60000;
}

/** The instant at which the wall clock in `timeZone` shows y-m-d hh:mm. */
export function zonedTimeToUtc(y: number, m: number, d: number, hh: number, mm: number, timeZone: string): Date {
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const first = new Date(guess.getTime() - offsetMinutes(guess, timeZone) * 60000);
  // A second pass settles instants near a daylight-saving change.
  return new Date(guess.getTime() - offsetMinutes(first, timeZone) * 60000);
}

/** Budget weeks start Monday 00:00 in the workspace time zone ("Resets Monday 00:00"). Returns YYYY-MM-DD. */
export function weekStartFor(at: Date, timeZone: string): string {
  const p = zonedParts(at, timeZone);
  const day = new Date(Date.UTC(p.y, p.m - 1, p.d - p.wd));
  return day.toISOString().slice(0, 10);
}

/** When the current budget week ends (next Monday 00:00 local), as an instant. */
export function weekResetsAt(at: Date, timeZone: string): Date {
  const [y, m, d] = weekStartFor(at, timeZone).split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(y, m - 1, d + 7));
  return zonedTimeToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 0, 0, timeZone);
}

export function parseTime(t: string): { hh: number; mm: number } | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  return m ? { hh: Number(m[1]), mm: Number(m[2]) } : null;
}

/** The first scheduled instant strictly after `after`, or null when the schedule has no days. */
export function nextRunAfter(schedule: AgentSchedule, after: Date, timeZone: string): Date | null {
  const t = parseTime(schedule.time);
  if (!t || schedule.days.length === 0) return null;
  const p = zonedParts(after, timeZone);
  for (let i = 0; i <= 7; i++) {
    const day = new Date(Date.UTC(p.y, p.m - 1, p.d + i));
    const wd = (p.wd + i) % 7;
    if (!schedule.days.includes(WEEKDAYS[wd]!)) continue;
    const at = zonedTimeToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), t.hh, t.mm, timeZone);
    if (at.getTime() > after.getTime()) return at;
  }
  return null;
}

// ------------------------------------------------------------------ The run plan

/**
 * Steps of a clipping run, in order (APP-03 run panel). Credit estimates are provisional until the cost
 * benchmark (decision D-10); they total 52, as the board shows. `needs` names what must exist for the step
 * to do real work; until it does the step stops as "blocked" with an honest reason, never a fake result.
 */
export const CLIP_RUN_STEPS = [
  { kind: "check_sources", title: "Upload & check file", estimate: 0, needs: "media" },
  { kind: "transcribe", title: "Transcribe", estimate: 20, needs: "media" },
  { kind: "detect_scenes", title: "Detect scenes", estimate: 4, needs: "media" },
  { kind: "rank_moments", title: "Rank moments", estimate: 8, needs: "ai" },
  { kind: "render_previews", title: "Render previews", estimate: 20, needs: "media" },
] as const;
export type StepKind = (typeof CLIP_RUN_STEPS)[number]["kind"];
export const CLIP_RUN_ESTIMATE = CLIP_RUN_STEPS.reduce((n, s) => n + s.estimate, 0);

/** Every run must finish within this time or it is stopped and its reservations released. */
export const RUN_DEADLINE_MINUTES = 6 * 60;

// ------------------------------------------------------------------ Budget arithmetic

export interface SpendEntry {
  stepId: string;
  attempt?: number;
  kind: "reserve" | "settle" | "release";
  credits: number;
}

/**
 * Credits counted against a budget week: settled spend plus reservations not yet settled or released.
 * A reservation is "open" until the same step attempt has a settle or release entry.
 */
export function committedCredits(entries: readonly SpendEntry[]): number {
  const byStep = new Map<string, { reserve: number; settle: number; closed: boolean }>();
  for (const e of entries) {
    const key = `${e.stepId}:${e.attempt ?? 1}`;
    const s = byStep.get(key) ?? { reserve: 0, settle: 0, closed: false };
    if (e.kind === "reserve") s.reserve += e.credits;
    if (e.kind === "settle") { s.settle += e.credits; s.closed = true; }
    if (e.kind === "release") s.closed = true;
    byStep.set(key, s);
  }
  let total = 0;
  for (const s of byStep.values()) total += s.closed ? s.settle : s.reserve;
  return total;
}

export type BudgetDecision =
  | { ok: true }
  | { ok: false; reason: "weekly_budget" | "run_limit"; text: string };

/** Hard check before a step starts. Work never overspends: if the estimate does not fit, the step blocks. */
export function canReserve(args: { estimate: number; weeklyBudget: number; weekCommitted: number; perRunLimit: number; runCommitted: number }): BudgetDecision {
  const { estimate, weeklyBudget, weekCommitted, perRunLimit, runCommitted } = args;
  if (estimate === 0) return { ok: true };
  const weekLeft = weeklyBudget - weekCommitted;
  if (estimate > weekLeft) return { ok: false, reason: "weekly_budget", text: `Needs ${estimate} credits, ${Math.max(0, weekLeft)} left in this agent’s budget` };
  const runLeft = perRunLimit - runCommitted;
  if (estimate > runLeft) return { ok: false, reason: "run_limit", text: `Needs ${estimate} credits, ${Math.max(0, runLeft)} left in this run’s limit` };
  return { ok: true };
}

/** Settles a step: what was used, and what goes back. Actual never exceeds the reservation. */
export function settle(reserved: number, actual: number): { settled: number; released: number } {
  const settled = Math.max(0, Math.min(reserved, Math.round(actual)));
  return { settled, released: reserved - settled };
}
