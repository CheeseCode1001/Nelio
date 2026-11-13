import "server-only";
import { db, weekCommitted } from "@nelio/db";
import { COUNTS_TOWARD_AGENT_LIMIT, PLANS, nextPlanForAgents, weekResetsAt, type PlanId } from "@nelio/domain";
import type { AgentColor, IconName, Tone } from "@nelio/ui";
import type { AgentCardData } from "@/components/command-center/model";

export type AgentShape = "circle" | "square" | "blob" | "pill";
export type AgentStateName = "active" | "paused" | "budget_reached" | "stopped";
export type AgentModeName = "manual" | "assisted" | "autonomous";

export const STATE_CHIP: Record<AgentStateName, { label: string; tone: Tone; icon: IconName }> = {
  active: { label: "active", tone: "blue", icon: "zap" },
  paused: { label: "paused", tone: "neutral", icon: "pause" },
  budget_reached: { label: "budget reached", tone: "warn", icon: "alert" },
  stopped: { label: "stopped", tone: "neutral", icon: "x" },
};
export const MODE_LABEL: Record<AgentModeName, string> = { manual: "Manual", assisted: "Assisted", autonomous: "Autonomous" };
export const MODE_CHIP: Record<AgentModeName, { label: string; tone: Tone; icon: IconName }> = {
  manual: { label: "Manual", tone: "neutral", icon: "pen" },
  assisted: { label: "Assisted", tone: "blue", icon: "check" },
  autonomous: { label: "Autonomous", tone: "ai", icon: "zap" },
};

const DAY = 86_400_000;

/** "today 15:00", "tomorrow 09:00", "Mon 15:00" or "12 Dec 15:00", in the workspace time zone. */
export function formatWhen(at: Date, now: Date, timeZone: string): string {
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  if (day(at) === day(now)) return `today ${time}`;
  if (day(at) === day(new Date(now.getTime() + DAY))) return `tomorrow ${time}`;
  if (at.getTime() - now.getTime() < 6 * DAY && at > now) return `${new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(at)} ${time}`;
  return `${new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "short" }).format(at)} ${time}`;
}

function pausedLine(pausedAt: Date | null, reason: string | null, now: Date, timeZone: string): string {
  if (reason === "budget") return "Paused: weekly budget reached";
  if (!pausedAt) return "Paused";
  const ago = now.getTime() - pausedAt.getTime();
  const when = ago < DAY ? "today" : ago < 7 * DAY ? `on ${new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long" }).format(pausedAt)}` : `on ${new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "short" }).format(pausedAt)}`;
  return `Paused by you ${when}`;
}

export interface AgentRowData {
  id: string;
  name: string;
  color: AgentColor;
  shape: AgentShape;
  mode: { label: string; tone: Tone; icon: IconName };
  state: { label: string; tone: Tone; icon: IconName };
  thisWeek: string;
  budget: { used: number; limit: number };
  nextRun: string;
}

export interface AgentsPageData {
  cards: (AgentCardData & { stateName: AgentStateName })[];
  rows: AgentRowData[];
  counted: number;
  limit: number | null;
  planLabel: string;
  atLimit: boolean;
  upgrade: { label: string; agents: number | null } | null;
  workspacePaused: boolean;
}

/** APP-04 from real data. Stopped agents keep their history but leave the list (AgentDetail-Stopped). */
export async function loadAgents(workspaceId: string, now = new Date()): Promise<AgentsPageData> {
  const client = db();
  const ws = await client.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { timezone: true, pausedAt: true, org: { select: { plan: true } } } });
  const agents = await client.agent.findMany({
    where: { workspaceId, state: { not: "stopped" } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, goal: true, color: true, shape: true, mode: true, state: true, pausedAt: true, pausedReason: true, weeklyBudget: true, nextRunAt: true, destinationRefs: true },
  });
  const weekStart = new Date(now.getTime());
  const runsThisWeek = await client.agentRun.groupBy({
    by: ["agentId"],
    where: { workspaceId, createdAt: { gte: new Date(weekResetsAt(weekStart, ws.timezone).getTime() - 7 * DAY) } },
    _count: { _all: true },
  });
  const runCount = new Map(runsThisWeek.map((r) => [r.agentId, r._count._all]));

  const cards: AgentsPageData["cards"] = [];
  const rows: AgentRowData[] = [];
  for (const a of agents) {
    const used = await weekCommitted(client, a.id, now, ws.timezone);
    const state = a.state as AgentStateName;
    const resets = `Resets ${new Intl.DateTimeFormat("en-GB", { timeZone: ws.timezone, weekday: "long" }).format(weekResetsAt(now, ws.timezone))} 00:00`;
    const line = state === "paused" ? pausedLine(a.pausedAt, a.pausedReason, now, ws.timezone)
      : a.mode === "autonomous" ? "Autonomous" : a.goal;
    const meta = ws.pausedAt ? "Everything in this workspace is paused"
      : state === "paused" ? "Resume re-checks budget & licenses"
      : state === "budget_reached" ? resets
      : a.nextRunAt ? `Next run ${formatWhen(a.nextRunAt, now, ws.timezone)}`
      : "Runs when you start it";
    const color = a.color as AgentColor;
    const shape = a.shape as AgentShape;
    const budget = { used, limit: a.weeklyBudget };
    cards.push({ id: a.id, name: a.name, color, shape, state: STATE_CHIP[state], stateName: state, line, meta, budget, running: state === "active" && !ws.pausedAt });
    const n = runCount.get(a.id) ?? 0;
    rows.push({
      id: a.id, name: a.name, color, shape, mode: MODE_CHIP[a.mode as AgentModeName], state: STATE_CHIP[state],
      thisWeek: n ? `${n} run${n === 1 ? "" : "s"}` : "—",
      budget,
      nextRun: state === "budget_reached" ? formatWhen(weekResetsAt(now, ws.timezone), now, ws.timezone) : state === "active" && a.nextRunAt && !ws.pausedAt ? formatWhen(a.nextRunAt, now, ws.timezone) : "—",
    });
  }
  const plan = ws.org.plan as PlanId;
  const limit = PLANS[plan].agents;
  const counted = agents.filter((a) => (COUNTS_TOWARD_AGENT_LIMIT as readonly string[]).includes(a.state)).length;
  const next = nextPlanForAgents(plan);
  return { cards, rows, counted, limit, planLabel: PLANS[plan].label, atLimit: limit !== null && counted >= limit, upgrade: next ? { label: next.label, agents: next.agents } : null, workspacePaused: Boolean(ws.pausedAt) };
}
