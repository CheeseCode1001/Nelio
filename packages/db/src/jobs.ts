import {
  CLIP_RUN_ESTIMATE, CLIP_RUN_STEPS, RUN_DEADLINE_MINUTES, nextRunAfter, weekStartFor, committedCredits,
  type AgentSchedule,
} from "@nelio/domain";
import type { Db, Tx } from "./client";
import type { Prisma } from "./generated/client";

type Client = Db | Tx;

/**
 * Queue topics. The web app never talks to Redis: it writes an outbox row in the same transaction as the
 * change, and the worker's dispatcher moves it onto the queue. Each topic maps to one queue.
 */
export const TOPICS = {
  stepRun: "step.run",
  notifyDeliver: "notify.deliver",
} as const;
export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
export const QUEUE_FOR_TOPIC: Record<Topic, "agent-steps" | "notify"> = {
  "step.run": "agent-steps",
  "notify.deliver": "notify",
};
export interface TopicPayload {
  "step.run": { stepId: string };
  "notify.deliver": { notificationId: string };
}

/** Adds work to the outbox. The same dedupe key is queued once, however many times this is called. */
export async function enqueue<T extends Topic>(tx: Client, topic: T, payload: TopicPayload[T], dedupeKey: string, availableAt?: Date): Promise<void> {
  await tx.outboxEvent.createMany({
    data: [{ topic, payload: payload as unknown as Prisma.InputJsonValue, dedupeKey, availableAt: availableAt ?? new Date() }],
    skipDuplicates: true,
  });
}

export interface ActivityInput {
  orgId: string;
  workspaceId: string;
  agentId?: string | null;
  runId?: string | null;
  stepId?: string | null;
  type: string;
  status?: Prisma.ActivityEventCreateManyInput["status"];
  title: string;
  detail?: string | null;
}

/** Appends to the activity feed; the database pushes it to the workspace's live channel. */
export async function recordActivity(tx: Client, a: ActivityInput): Promise<void> {
  await tx.activityEvent.create({ data: { ...a, agentId: a.agentId ?? null, runId: a.runId ?? null, stepId: a.stepId ?? null, detail: a.detail ?? null } });
}

export type StartRunResult =
  | { ok: true; runId: string; number: number; existing: boolean }
  | { ok: false; reason: "agent_not_found" | "agent_not_active" | "workspace_paused"; text: string };

/**
 * Starts a run of an agent: numbers it, writes its steps and queues the first one. Safe to retry: the same
 * idempotency key returns the run already created. Must be called inside a transaction.
 */
export async function startRun(tx: Tx, args: { agentId: string; workspaceId: string; trigger: "schedule" | "manual" | "strategist"; idempotencyKey: string; userId?: string | null; now?: Date }): Promise<StartRunResult> {
  const now = args.now ?? new Date();
  const existing = await tx.agentRun.findUnique({ where: { idempotencyKey: args.idempotencyKey }, select: { id: true, number: true } });
  if (existing) return { ok: true, runId: existing.id, number: existing.number, existing: true };

  const agent = await tx.agent.findFirst({
    where: { id: args.agentId, workspaceId: args.workspaceId },
    select: { id: true, orgId: true, workspaceId: true, name: true, state: true, workspace: { select: { pausedAt: true } } },
  });
  if (!agent) return { ok: false, reason: "agent_not_found", text: "This agent doesn’t exist." };
  if (agent.workspace.pausedAt) return { ok: false, reason: "workspace_paused", text: "Everything in this workspace is paused." };
  if (agent.state !== "active") return { ok: false, reason: "agent_not_active", text: `${agent.name} isn’t active.` };

  // Row lock on the agent serialises run numbering.
  const { runCount } = await tx.agent.update({ where: { id: agent.id }, data: { runCount: { increment: 1 } }, select: { runCount: true } });
  const run = await tx.agentRun.create({
    data: {
      orgId: agent.orgId, workspaceId: agent.workspaceId, agentId: agent.id, number: runCount, trigger: args.trigger,
      estimatedCredits: CLIP_RUN_ESTIMATE, idempotencyKey: args.idempotencyKey, startedByUserId: args.userId ?? null,
      deadlineAt: new Date(now.getTime() + RUN_DEADLINE_MINUTES * 60000),
      steps: { create: CLIP_RUN_STEPS.map((s, i) => ({ ordinal: i + 1, kind: s.kind, title: s.title, estimatedCredits: s.estimate })) },
    },
    select: { id: true, number: true, steps: { where: { ordinal: 1 }, select: { id: true } } },
  });
  const by = args.trigger === "schedule" ? "triggered by schedule" : args.trigger === "manual" ? "started by hand" : "started by Nelio AI";
  await recordActivity(tx, { orgId: agent.orgId, workspaceId: agent.workspaceId, agentId: agent.id, runId: run.id, type: "run.started", status: "queued", title: `${agent.name} · run #${run.number}`, detail: by });
  const first = run.steps[0];
  if (first) await enqueue(tx, TOPICS.stepRun, { stepId: first.id }, `step:${first.id}:1`);
  return { ok: true, runId: run.id, number: run.number, existing: false };
}

/** Credits this agent has committed in the budget week containing `at`. */
export async function weekCommitted(client: Client, agentId: string, at: Date, timeZone: string): Promise<number> {
  const weekStart = new Date(`${weekStartFor(at, timeZone)}T00:00:00Z`);
  const rows = await client.agentSpend.findMany({ where: { agentId, weekStart }, select: { stepId: true, attempt: true, kind: true, credits: true } });
  return committedCredits(rows);
}

/** Recomputes when an agent next runs from its schedule (null when it has none or is not active). */
export async function refreshNextRun(tx: Client, agentId: string, now = new Date()): Promise<Date | null> {
  const a = await tx.agent.findUnique({ where: { id: agentId }, select: { state: true, schedule: true, workspace: { select: { timezone: true, pausedAt: true } } } });
  if (!a) return null;
  const next = a.state === "active" && !a.workspace.pausedAt && a.schedule
    ? nextRunAfter(a.schedule as unknown as AgentSchedule, now, a.workspace.timezone)
    : null;
  await tx.agent.update({ where: { id: agentId }, data: { nextRunAt: next } });
  return next;
}

// ------------------------------------------------------------------ Emergency pause (SY-09, journey J-12)

export interface PauseSummary { agents: number; queuedSteps: number; runningSteps: number }

/** What "Pause all" would stop, for the confirmation dialog. */
export async function pauseSummary(client: Client, workspaceId: string): Promise<PauseSummary> {
  const [agents, queuedSteps, runningSteps] = await Promise.all([
    client.agent.count({ where: { workspaceId, state: "active" } }),
    client.runStep.count({ where: { workspaceId, status: "queued", run: { status: { in: ["queued", "running"] } } } }),
    client.runStep.count({ where: { workspaceId, status: "running" } }),
  ]);
  return { agents, queuedSteps, runningSteps };
}

/**
 * Stops everything in a workspace now. Queued work is held (not deleted); a step already running finishes or
 * stops safely and nothing new starts. Published posts are not affected. Idempotent.
 */
export async function pauseWorkspace(tx: Tx, args: { workspaceId: string; userId: string; now?: Date }): Promise<{ changed: boolean }> {
  const now = args.now ?? new Date();
  const ws = await tx.workspace.findUnique({ where: { id: args.workspaceId }, select: { id: true, orgId: true, pausedAt: true } });
  if (!ws || ws.pausedAt) return { changed: false };
  await tx.workspace.update({ where: { id: ws.id }, data: { pausedAt: now, pausedByUserId: args.userId } });
  await tx.agent.updateMany({ where: { workspaceId: ws.id }, data: { nextRunAt: null } });
  await tx.runStep.updateMany({ where: { workspaceId: ws.id, status: "queued" }, data: { status: "paused" } });
  await tx.agentRun.updateMany({ where: { workspaceId: ws.id, status: { in: ["queued", "running", "blocked"] } }, data: { status: "paused" } });
  await recordActivity(tx, { orgId: ws.orgId, workspaceId: ws.id, type: "workspace.paused", status: "paused", title: "Everything paused", detail: "Nothing new will start until you resume." });
  await tx.auditEvent.create({ data: { orgId: ws.orgId, workspaceId: ws.id, actorUserId: args.userId, action: "workspace.pause_all" } });
  return { changed: true };
}

export interface ResumeCheck { agentId: string; name: string; budgetOk: boolean; willResume: boolean; note: string }

/** "Before restarting, we re-check every agent's budget and licenses" (PauseConfirm-Resume). */
export async function resumeChecks(client: Client, workspaceId: string, now = new Date()): Promise<ResumeCheck[]> {
  const ws = await client.workspace.findUnique({ where: { id: workspaceId }, select: { timezone: true } });
  if (!ws) return [];
  const agents = await client.agent.findMany({ where: { workspaceId, state: { in: ["active", "budget_reached"] } }, select: { id: true, name: true, state: true, weeklyBudget: true }, orderBy: { name: "asc" } });
  const out: ResumeCheck[] = [];
  for (const a of agents) {
    const used = await weekCommitted(client, a.id, now, ws.timezone);
    // "Budget reached" holds until the week resets (resetBudgetWeeks), even if a little budget is left:
    // the step that stopped it did not fit.
    const budgetOk = a.state !== "budget_reached" && used < a.weeklyBudget;
    // Licence checks join here when licensing ships (MS 5); until then there are no licensed sources to check.
    out.push({ agentId: a.id, name: a.name, budgetOk, willResume: budgetOk, note: budgetOk ? "Budget OK · license OK" : "Weekly budget reached" });
  }
  return out;
}

/**
 * Monday 00:00 in each workspace's time zone: agents stopped for "budget reached" in an earlier week become
 * active again and get their next run time. Safe to call often.
 */
export async function resetBudgetWeeks(client: Db, now = new Date()): Promise<number> {
  const held = await client.agent.findMany({
    where: { state: "budget_reached", workspace: { deletedAt: null } },
    select: { id: true, name: true, orgId: true, workspaceId: true, workspace: { select: { timezone: true, pausedAt: true } } },
    take: 200,
  });
  let reset = 0;
  for (const a of held) {
    const thisWeek = new Date(`${weekStartFor(now, a.workspace.timezone)}T00:00:00Z`);
    const spentThisWeek = await client.agentSpend.count({ where: { agentId: a.id, weekStart: thisWeek } });
    if (spentThisWeek > 0) continue;
    const lastBlock = await client.activityEvent.findFirst({ where: { agentId: a.id, type: "step.blocked" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    if (lastBlock && weekStartFor(lastBlock.createdAt, a.workspace.timezone) === weekStartFor(now, a.workspace.timezone)) continue;
    await client.$transaction(async (tx) => {
      await tx.agent.update({ where: { id: a.id }, data: { state: "active" } });
      if (!a.workspace.pausedAt) await refreshNextRun(tx, a.id, now);
      await recordActivity(tx, { orgId: a.orgId, workspaceId: a.workspaceId, agentId: a.id, type: "agent.budget_reset", status: "running", title: `${a.name} is active again`, detail: "A new budget week started." });
    });
    reset++;
  }
  return reset;
}

/** Resumes a paused workspace. Agents over budget stay paused; held work is re-queued. */
export async function resumeWorkspace(tx: Tx, args: { workspaceId: string; userId: string; now?: Date }): Promise<{ changed: boolean; checks: ResumeCheck[] }> {
  const now = args.now ?? new Date();
  const ws = await tx.workspace.findUnique({ where: { id: args.workspaceId }, select: { id: true, orgId: true, pausedAt: true } });
  if (!ws || !ws.pausedAt) return { changed: false, checks: [] };
  const checks = await resumeChecks(tx, ws.id, now);
  await tx.workspace.update({ where: { id: ws.id }, data: { pausedAt: null, pausedByUserId: null } });
  for (const c of checks) {
    if (!c.willResume) await tx.agent.update({ where: { id: c.agentId }, data: { state: "budget_reached" } });
  }
  const held = await tx.runStep.findMany({ where: { workspaceId: ws.id, status: "paused" }, select: { id: true, runId: true, attempts: true, run: { select: { agentId: true } } } });
  const stoppedAgents = new Set(checks.filter((c) => !c.willResume).map((c) => c.agentId));
  for (const s of held) {
    if (stoppedAgents.has(s.run.agentId)) continue;
    await tx.runStep.update({ where: { id: s.id }, data: { status: "queued" } });
    await tx.agentRun.update({ where: { id: s.runId }, data: { status: "queued" } });
    await enqueue(tx, TOPICS.stepRun, { stepId: s.id }, `step:${s.id}:resume:${now.getTime()}`);
  }
  const agents = await tx.agent.findMany({ where: { workspaceId: ws.id, state: "active" }, select: { id: true } });
  for (const a of agents) await refreshNextRun(tx, a.id, now);
  await recordActivity(tx, { orgId: ws.orgId, workspaceId: ws.id, type: "workspace.resumed", status: "running", title: "Resumed", detail: `${checks.filter((c) => c.willResume).length} of ${checks.length} agents resumed` });
  await tx.auditEvent.create({ data: { orgId: ws.orgId, workspaceId: ws.id, actorUserId: args.userId, action: "workspace.resume_all", metadata: { checks: checks.map((c) => ({ agentId: c.agentId, willResume: c.willResume })) } } });
  return { changed: true, checks };
}

// ------------------------------------------------------------------ Notifications (NT-01)

type Category = Prisma.NotificationCreateManyInput["category"];

/** Channels on by default per category; a person's saved preferences override these. */
export const DEFAULT_CHANNELS: Record<Category, { inApp: boolean; email: boolean; push: boolean }> = {
  approvals: { inApp: true, email: true, push: true },
  publishing: { inApp: true, email: true, push: true },
  licenses: { inApp: true, email: true, push: true },
  billing: { inApp: true, email: true, push: false },
  security: { inApp: true, email: true, push: true },
  agents: { inApp: true, email: false, push: false },
};

/** Creates a notification once per (person, dedupe key) and queues its email / push deliveries. */
export async function notify(tx: Tx, n: { userId: string; category: Category; title: string; body?: string; href?: string; dedupeKey: string; orgId?: string; workspaceId?: string }): Promise<{ created: boolean }> {
  const prefs = await tx.notificationPreference.findUnique({ where: { userId_category: { userId: n.userId, category: n.category } } });
  const ch = prefs ?? DEFAULT_CHANNELS[n.category];
  const created = await tx.notification.createManyAndReturn({
    data: [{ userId: n.userId, category: n.category, title: n.title, body: n.body ?? null, href: n.href ?? null, dedupeKey: n.dedupeKey, orgId: n.orgId ?? null, workspaceId: n.workspaceId ?? null }],
    skipDuplicates: true,
    select: { id: true },
  });
  const row = created[0];
  if (!row) return { created: false };
  const channels = (["email", "push"] as const).filter((c) => ch[c]);
  if (channels.length) {
    await tx.notificationDelivery.createMany({ data: channels.map((channel) => ({ notificationId: row.id, channel })) });
    await enqueue(tx, TOPICS.notifyDeliver, { notificationId: row.id }, `notify:${row.id}`);
  }
  return { created: true };
}

/** Everyone who should hear about agent work in a workspace: its managers plus the org's owners and admins. */
export async function workspaceWatchers(client: Client, workspaceId: string): Promise<string[]> {
  const ws = await client.workspace.findUnique({
    where: { id: workspaceId },
    select: { orgId: true, memberships: { where: { role: "manager" }, select: { userId: true } } },
  });
  if (!ws) return [];
  const org = await client.organizationMembership.findMany({ where: { orgId: ws.orgId }, select: { userId: true } });
  return [...new Set([...ws.memberships.map((m) => m.userId), ...org.map((m) => m.userId)])];
}
