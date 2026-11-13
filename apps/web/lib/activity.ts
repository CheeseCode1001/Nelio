import "server-only";
import { db } from "@nelio/db";
import type { AgentColor, IconName, Tone } from "@nelio/ui";
import { formatWhen, type AgentShape } from "./agents";

export const ACTIVITY_FILTERS = ["all", "running", "queued", "blocked", "needs_approval", "failed", "done"] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];
export const FILTER_LABEL: Record<ActivityFilter, string> = { all: "All", running: "Running", queued: "Queued", blocked: "Blocked", needs_approval: "Needs approval", failed: "Failed", done: "Done" };

const STATUS_CHIP: Record<string, { label: string; tone: Tone; icon: IconName }> = {
  running: { label: "running", tone: "blue", icon: "refresh" },
  queued: { label: "queued", tone: "neutral", icon: "clock" },
  paused: { label: "paused", tone: "neutral", icon: "pause" },
  blocked: { label: "blocked", tone: "warn", icon: "lock" },
  needs_approval: { label: "needs approval", tone: "warn", icon: "alert" },
  confirming: { label: "confirming", tone: "blue", icon: "clock" },
  failed: { label: "failed", tone: "err", icon: "x" },
  done: { label: "done", tone: "ok", icon: "check" },
  canceled: { label: "canceled", tone: "neutral", icon: "x" },
};
const REASON_SHORT: Record<string, string> = { budget: "budget", run_limit: "budget", no_sources: "no videos", not_available: "not switched on", license: "license", permission: "permission", timeout: "time limit" };
/** Which filter a status belongs to (paused counts as queued; confirming as running; canceled as done). */
const BUCKET: Record<string, ActivityFilter> = { running: "running", confirming: "running", queued: "queued", paused: "queued", blocked: "blocked", needs_approval: "needs_approval", failed: "failed", done: "done", canceled: "done" };

export interface ActivityItem {
  runId: string;
  title: string;
  sub: string;
  bucket: ActivityFilter;
  chip: { label: string; tone: Tone; icon: IconName };
  agent: { color: AgentColor; shape: AgentShape };
}

export interface RunPanel {
  runId: string;
  agentName: string;
  agent: { color: AgentColor; shape: AgentShape };
  number: number;
  started: string;
  estimated: number;
  used: number;
  canPause: boolean;
  steps: { title: string; detail: string; status: string; icon: IconName; tone: Tone }[];
  log: { at: string; title: string; detail: string | null }[];
}

export interface ActivityData {
  items: ActivityItem[];
  counts: Record<ActivityFilter, number>;
  panel: RunPanel | null;
  hasAgents: boolean;
  workspacePaused: boolean;
}

const STEP_ICON: Record<string, { icon: IconName; tone: Tone }> = {
  done: { icon: "check", tone: "lime" },
  running: { icon: "refresh", tone: "blue" },
  failed: { icon: "x", tone: "err" },
  blocked: { icon: "lock", tone: "warn" },
};

/** APP-03 from real data: the last 7 days of runs, newest first, each shown by its current step. */
export async function loadActivity(workspaceId: string, selectedRun: string | null, now = new Date()): Promise<ActivityData> {
  const client = db();
  const ws = await client.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { timezone: true, pausedAt: true } });
  const tz = ws.timezone;
  const [runs, agentCount] = await Promise.all([
    client.agentRun.findMany({
      where: { workspaceId, createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { agent: { select: { name: true, color: true, shape: true } }, steps: { orderBy: { ordinal: "asc" } } },
    }),
    client.agent.count({ where: { workspaceId } }),
  ]);
  const time = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

  const items: ActivityItem[] = runs.map((r) => {
    const current = r.steps.find((s) => ["running", "blocked", "failed", "needs_approval", "confirming"].includes(s.status))
      ?? r.steps.find((s) => s.status === "queued" || s.status === "paused")
      ?? r.steps.at(-1);
    const st = r.status;
    const reason = r.reason ? REASON_SHORT[r.reason] : null;
    const chip = STATUS_CHIP[st] ?? STATUS_CHIP.queued!;
    const detail = st === "running" ? `started ${time(r.startedAt ?? r.createdAt)}`
      : st === "done" ? `${r.actualCredits} credits used (estimated ${r.estimatedCredits})${r.refundedCredits ? ` · ${r.refundedCredits} refunded` : ""}`
      : r.reasonText ?? current?.reasonText ?? (st === "queued" ? "waiting to start" : "");
    return {
      runId: r.id,
      title: st === "done" ? `${r.agent.name} · run #${r.number} finished` : current?.title ?? `Run #${r.number}`,
      sub: [r.agent.name, detail].filter(Boolean).join(" · "),
      bucket: BUCKET[st] ?? "queued",
      chip: { ...chip, label: reason && (st === "blocked" || st === "failed") ? `${chip.label} · ${reason}` : chip.label },
      agent: { color: r.agent.color as AgentColor, shape: r.agent.shape as AgentShape },
    };
  });
  const counts = Object.fromEntries(ACTIVITY_FILTERS.map((f) => [f, f === "all" ? items.length : items.filter((i) => i.bucket === f).length])) as Record<ActivityFilter, number>;

  const pick = runs.find((r) => r.id === selectedRun) ?? runs.find((r) => r.status === "running") ?? runs[0];
  let panel: RunPanel | null = null;
  if (pick) {
    const log = await client.activityEvent.findMany({ where: { runId: pick.id }, orderBy: { createdAt: "asc" }, take: 200, select: { createdAt: true, title: true, detail: true } });
    const trigger = pick.trigger === "schedule" ? "triggered by schedule" : pick.trigger === "manual" ? "started by hand" : "started by Nelio AI";
    panel = {
      runId: pick.id,
      agentName: pick.agent.name,
      agent: { color: pick.agent.color as AgentColor, shape: pick.agent.shape as AgentShape },
      number: pick.number,
      started: `Started ${formatWhen(pick.startedAt ?? pick.createdAt, now, tz).replace(/^today /, "")} · ${trigger}`,
      estimated: pick.estimatedCredits,
      used: pick.actualCredits,
      canPause: ["queued", "running", "blocked"].includes(pick.status) && !ws.pausedAt,
      steps: pick.steps.map((s) => {
        const look = STEP_ICON[s.status] ?? { icon: "clock" as IconName, tone: "neutral" as Tone };
        const detail = s.status === "blocked" || s.status === "failed" ? s.reasonText ?? "" : s.status === "queued" && s.ordinal > 1 ? `Waits for ${pick.steps[s.ordinal - 2]?.title.toLowerCase()}` : s.detail ?? (s.kind === "rank_moments" ? "Nelio AI" : s.kind === "transcribe" ? "Balanced quality" : "");
        return { title: s.title, detail, status: s.status, icon: look.icon, tone: look.tone };
      }),
      log: log.map((e) => ({ at: time(e.createdAt), title: e.title, detail: e.detail })),
    };
  }
  return { items, counts, panel, hasAgents: agentCount > 0, workspacePaused: Boolean(ws.pausedAt) };
}
