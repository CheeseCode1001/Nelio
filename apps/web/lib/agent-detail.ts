import "server-only";
import { db, weekCommitted } from "@nelio/db";
import { presetFor, weekResetsAt, weekStartFor, type AgentSchedule, type SchedulePresetId } from "@nelio/domain";
import type { AgentColor, IconName, Tone } from "@nelio/ui";
import { MODE_CHIP, STATE_CHIP, formatWhen, type AgentModeName, type AgentShape, type AgentStateName } from "./agents";

export const DETAIL_TABS = ["overview", "policy", "budget", "destinations", "runs"] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

const RUN_RESULT: Record<string, { label: string; tone: Tone; icon: IconName }> = {
  queued: { label: "queued", tone: "neutral", icon: "clock" },
  running: { label: "running", tone: "blue", icon: "refresh" },
  blocked: { label: "blocked", tone: "warn", icon: "alert" },
  needs_approval: { label: "needs approval", tone: "ai", icon: "check" },
  confirming: { label: "confirming", tone: "blue", icon: "clock" },
  paused: { label: "paused", tone: "neutral", icon: "pause" },
  failed: { label: "failed", tone: "err", icon: "alert" },
  done: { label: "done", tone: "ok", icon: "check" },
  canceled: { label: "canceled", tone: "neutral", icon: "x" },
};
const REASON_SHORT: Record<string, string> = { budget: "budget", no_sources: "no videos", not_available: "not switched on", timeout: "took too long", license: "license", error: "error" };

export interface AgentDetailData {
  id: string;
  name: string;
  goal: string;
  color: AgentColor;
  shape: AgentShape;
  state: AgentStateName;
  stateChip: { label: string; tone: Tone; icon: IconName };
  modeChip: { label: string; tone: Tone; icon: IconName };
  createdBy: string;
  runsOn: string;
  workspacePaused: boolean;
  policy: { goal: string; schedule: SchedulePresetId; brandRules: string; maxPostsPerDay: number; maxPostsPerWeek: number };
  budget: {
    weeklyBudget: number;
    perRunLimit: number;
    used: number;
    resets: string;
    days: { label: string; credits: number }[];
    estimated: number;
    actual: number;
    refunded: number;
  };
  runs: { id: string; number: number; started: string; steps: string; credits: string; result: { label: string; tone: Tone; icon: IconName }; reason: string | null }[];
}

/** APP-05 from real data. Null when the agent is not in this workspace (callers show 404). */
export async function loadAgentDetail(workspaceId: string, agentId: string, now = new Date()): Promise<AgentDetailData | null> {
  const client = db();
  const a = await client.agent.findFirst({
    where: { id: agentId, workspaceId },
    include: { createdBy: { select: { fullName: true } }, workspace: { select: { timezone: true, pausedAt: true } } },
  });
  if (!a) return null;
  const tz = a.workspace.timezone;
  const used = await weekCommitted(client, a.id, now, tz);
  const weekStart = new Date(`${weekStartFor(now, tz)}T00:00:00Z`);
  const spend = await client.agentSpend.findMany({ where: { agentId: a.id, weekStart }, select: { kind: true, credits: true, createdAt: true } });
  const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = WEEK.map((label) => ({ label, credits: 0 }));
  const dayIndex = (d: Date) => WEEK.indexOf(new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).format(d));
  for (const e of spend) if (e.kind === "settle") { const i = dayIndex(e.createdAt); if (i >= 0) days[i]!.credits += e.credits; }
  const sum = (k: string) => spend.filter((e) => e.kind === k).reduce((n, e) => n + e.credits, 0);

  const runs = await client.agentRun.findMany({
    where: { agentId: a.id },
    orderBy: { number: "desc" },
    take: 20,
    select: { id: true, number: true, status: true, reason: true, createdAt: true, estimatedCredits: true, actualCredits: true, steps: { select: { status: true } } },
  });
  const firstName = a.createdBy.fullName.split(/\s+/)[0] ?? a.createdBy.fullName;
  const state = a.state as AgentStateName;
  return {
    id: a.id,
    name: a.name,
    goal: a.goal,
    color: a.color as AgentColor,
    shape: a.shape as AgentShape,
    state,
    stateChip: STATE_CHIP[state],
    modeChip: MODE_CHIP[a.mode as AgentModeName],
    createdBy: firstName,
    runsOn: a.schedule ? "runs on schedule" : "runs when started",
    workspacePaused: Boolean(a.workspace.pausedAt),
    policy: { goal: a.goal, schedule: presetFor(a.schedule as unknown as AgentSchedule | null), brandRules: a.brandRules ?? "", maxPostsPerDay: a.maxPostsPerDay, maxPostsPerWeek: a.maxPostsPerWeek },
    budget: {
      weeklyBudget: a.weeklyBudget,
      perRunLimit: a.perRunLimit,
      used,
      resets: `Resets ${new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long" }).format(weekResetsAt(now, tz))} 00:00`,
      days,
      estimated: sum("reserve"),
      actual: sum("settle"),
      refunded: sum("release"),
    },
    runs: runs.map((r) => {
      const finished = r.steps.filter((s) => s.status === "done").length;
      const open = ["queued", "running"].includes(r.status);
      return {
        id: r.id,
        number: r.number,
        started: formatWhen(r.createdAt, now, tz).replace(/^./, (c) => c.toUpperCase()),
        steps: `${finished} of ${r.steps.length}`,
        credits: `${r.estimatedCredits} → ${r.actualCredits}${open ? " so far" : ""}`,
        result: RUN_RESULT[r.status] ?? RUN_RESULT.queued!,
        reason: r.reason ? REASON_SHORT[r.reason] ?? null : null,
      };
    }),
  };
}
