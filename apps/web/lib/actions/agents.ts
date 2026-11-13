"use server";

import { DbNull, db, findWorkspaceFor, pauseSummary, pauseWorkspace, recordActivity, refreshNextRun, resumeChecks, resumeWorkspace, startRun, weekCommitted, type PauseSummary, type ResumeCheck, type WorkspaceSummary } from "@nelio/db";
import { COUNTS_TOWARD_AGENT_LIMIT, PLANS, SCHEDULE_PRESETS, agentBudgetSchema, agentCreateSchema, agentPolicySchema, can, type Capability } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { getSession, type Session } from "../auth";

type Fail = { ok: false; error: string };
const DENIED: Fail = { ok: false, error: "You don’t have permission to do that here." };

/** Resolves the workspace and checks one capability. "Request only" access (R) does not act directly. */
async function authorize(slug: string, capability: Capability): Promise<{ session: Session; ws: WorkspaceSummary } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return DENIED;
  const d = can(session.actor, capability, ws);
  if (!d.allowed || d.access === "R" || d.access === "V") return DENIED;
  return { session, ws };
}

function refresh(slug: string, agentId?: string) {
  revalidatePath(`/w/${slug}/agents`);
  revalidatePath(`/w/${slug}/home`);
  revalidatePath(`/w/${slug}/activity`);
  if (agentId) revalidatePath(`/w/${slug}/agents/${agentId}`);
}

export async function pauseAgentAction(slug: string, agentId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "agent.pause_resume");
  if ("ok" in a) return a;
  const client = db();
  const done = await client.$transaction(async (tx) => {
    const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId: a.ws.workspaceId }, select: { id: true, name: true, state: true } });
    if (!agent) return false;
    if (agent.state !== "active" && agent.state !== "budget_reached") return true;
    await tx.agent.update({ where: { id: agent.id }, data: { state: "paused", pausedAt: new Date(), pausedReason: "manual", nextRunAt: null } });
    await tx.runStep.updateMany({ where: { workspaceId: a.ws.workspaceId, status: "queued", run: { agentId: agent.id } }, data: { status: "paused" } });
    await tx.agentRun.updateMany({ where: { agentId: agent.id, status: { in: ["queued", "running"] } }, data: { status: "paused" } });
    await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, agentId: agent.id, type: "agent.paused", status: "paused", title: `${agent.name} paused`, detail: `Paused by ${a.session.user.fullName}` });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.pause", targetType: "agent", targetId: agent.id } });
    return true;
  });
  if (!done) return { ok: false, error: "This agent doesn’t exist." };
  refresh(slug, agentId);
  return { ok: true };
}

/** Resume re-checks the budget first ("Resume re-checks budget & licenses"). */
export async function resumeAgentAction(slug: string, agentId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "agent.pause_resume");
  if ("ok" in a) return a;
  const client = db();
  const result = await client.$transaction(async (tx) => {
    const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId: a.ws.workspaceId }, select: { id: true, name: true, state: true, weeklyBudget: true, workspace: { select: { timezone: true, pausedAt: true } } } });
    if (!agent) return "missing" as const;
    if (agent.workspace.pausedAt) return "ws_paused" as const;
    if (agent.state === "stopped") return "stopped" as const;
    if (agent.state === "paused") {
      await tx.$queryRaw`SELECT id FROM organizations WHERE id = ${a.ws.orgId}::uuid FOR UPDATE`;
      const org = await tx.organization.findUniqueOrThrow({ where: { id: a.ws.orgId }, select: { plan: true } });
      const limit = PLANS[org.plan].agents;
      const count = await tx.agent.count({ where: { orgId: a.ws.orgId, state: { in: [...COUNTS_TOWARD_AGENT_LIMIT] } } });
      if (limit !== null && count >= limit) return "limit" as const;
    }
    const used = await weekCommitted(tx, agent.id, new Date(), agent.workspace.timezone);
    if (agent.state === "budget_reached" || used >= agent.weeklyBudget) {
      await tx.agent.update({ where: { id: agent.id }, data: { state: "budget_reached" } });
      return "budget" as const;
    }
    await tx.agent.update({ where: { id: agent.id }, data: { state: "active", pausedAt: null, pausedReason: null } });
    await refreshNextRun(tx, agent.id);
    const held = await tx.runStep.findMany({ where: { status: "paused", run: { agentId: agent.id } }, select: { id: true, runId: true } });
    const { enqueue, TOPICS } = await import("@nelio/db");
    for (const s of held) {
      await tx.runStep.update({ where: { id: s.id }, data: { status: "queued" } });
      await tx.agentRun.update({ where: { id: s.runId }, data: { status: "queued" } });
      await enqueue(tx, TOPICS.stepRun, { stepId: s.id }, `step:${s.id}:resume:${Date.now()}`);
    }
    await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, agentId: agent.id, type: "agent.resumed", status: "running", title: `${agent.name} resumed`, detail: "Budget OK" });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.resume", targetType: "agent", targetId: agent.id } });
    return "ok" as const;
  });
  refresh(slug, agentId);
  if (result === "ok") return { ok: true };
  const errors = { limit: "You’re using every agent your plan includes. Pause another agent first.", missing: "This agent doesn’t exist.", ws_paused: "Everything in this workspace is paused. Resume the workspace first.", stopped: "Stopped agents can’t be restarted.", budget: "This week’s budget is used up. It resets on Monday." } as const;
  return { ok: false, error: errors[result] };
}

export async function runAgentNowAction(slug: string, agentId: string, requestId: string): Promise<{ ok: true; runNumber: number } | Fail> {
  const a = await authorize(slug, "agent.pause_resume");
  if ("ok" in a) return a;
  const r = await db().$transaction((tx) => startRun(tx, { agentId, workspaceId: a.ws.workspaceId, trigger: "manual", userId: a.session.user.id, idempotencyKey: `manual:${agentId}:${requestId.slice(0, 64)}` }));
  refresh(slug, agentId);
  return r.ok ? { ok: true, runNumber: r.number } : { ok: false, error: r.text };
}

// ------------------------------------------------------------------ Pause all (SY-09)

export async function pauseSummaryAction(slug: string): Promise<{ ok: true; summary: PauseSummary } | Fail> {
  const a = await authorize(slug, "workspace.emergency_pause");
  if ("ok" in a) return a;
  return { ok: true, summary: await pauseSummary(db(), a.ws.workspaceId) };
}

export async function pauseAllAction(slug: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "workspace.emergency_pause");
  if ("ok" in a) return a;
  await db().$transaction((tx) => pauseWorkspace(tx, { workspaceId: a.ws.workspaceId, userId: a.session.user.id }));
  refresh(slug);
  return { ok: true };
}

export async function resumeChecksAction(slug: string): Promise<{ ok: true; checks: ResumeCheck[] } | Fail> {
  const a = await authorize(slug, "workspace.emergency_pause");
  if ("ok" in a) return a;
  return { ok: true, checks: await resumeChecks(db(), a.ws.workspaceId) };
}

export async function resumeAllAction(slug: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "workspace.emergency_pause");
  if ("ok" in a) return a;
  await db().$transaction((tx) => resumeWorkspace(tx, { workspaceId: a.ws.workspaceId, userId: a.session.user.id }));
  refresh(slug);
  return { ok: true };
}

// ------------------------------------------------------------------ Forms (APP-05 policy and budget, APP-06 create)

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

export async function saveAgentPolicyAction(slug: string, agentId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const a = await authorize(slug, "agent.activate");
  if ("ok" in a) return { ok: false, message: a.error };
  const parsed = agentPolicySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), message: "Check the highlighted fields." };
  const v = parsed.data;
  const done = await db().$transaction(async (tx) => {
    const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId: a.ws.workspaceId }, select: { id: true, state: true } });
    if (!agent || agent.state === "stopped") return false;
    const schedule = SCHEDULE_PRESETS[v.schedule].schedule;
    await tx.agent.update({
      where: { id: agent.id },
      data: { goal: v.goal, brandRules: v.brandRules || null, maxPostsPerDay: v.maxPostsPerDay, maxPostsPerWeek: v.maxPostsPerWeek, schedule: schedule ? { ...schedule, days: [...schedule.days] } : DbNull },
    });
    await refreshNextRun(tx, agent.id);
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.policy_update", targetType: "agent", targetId: agent.id, metadata: { schedule: v.schedule, maxPostsPerDay: v.maxPostsPerDay, maxPostsPerWeek: v.maxPostsPerWeek } } });
    return true;
  });
  if (!done) return { ok: false, message: "This agent can’t be changed." };
  refresh(slug, agentId);
  return { ok: true, message: "Changes saved." };
}

export async function saveAgentBudgetAction(slug: string, agentId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const a = await authorize(slug, "agent.set_budget");
  if ("ok" in a) return { ok: false, message: a.error };
  const parsed = agentBudgetSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), message: "Check the highlighted fields." };
  const v = parsed.data;
  const done = await db().$transaction(async (tx) => {
    const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId: a.ws.workspaceId }, select: { id: true, state: true, weeklyBudget: true, perRunLimit: true, workspace: { select: { timezone: true } } } });
    if (!agent || agent.state === "stopped") return false;
    await tx.agent.update({ where: { id: agent.id }, data: { weeklyBudget: v.weeklyBudget, perRunLimit: v.perRunLimit } });
    // Raising the budget above what is already used lifts "budget reached" for this week.
    if (agent.state === "budget_reached" && v.weeklyBudget > agent.weeklyBudget) {
      const used = await weekCommitted(tx, agent.id, new Date(), agent.workspace.timezone);
      if (used < v.weeklyBudget) {
        await tx.agent.update({ where: { id: agent.id }, data: { state: "active" } });
        await refreshNextRun(tx, agent.id);
      }
    }
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.budget_update", targetType: "agent", targetId: agent.id, metadata: { from: { weekly: agent.weeklyBudget, perRun: agent.perRunLimit }, to: { weekly: v.weeklyBudget, perRun: v.perRunLimit } } } });
    return true;
  });
  if (!done) return { ok: false, message: "This agent can’t be changed." };
  refresh(slug, agentId);
  return { ok: true, message: "Budget saved." };
}

export type CreateState = FormState & { agentId?: string };

export async function createAgentAction(slug: string, _prev: CreateState, form: FormData): Promise<CreateState> {
  const a = await authorize(slug, "agent.activate");
  if ("ok" in a) return { ok: false, message: a.error };
  const parsed = agentCreateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), message: "Check the highlighted fields." };
  const v = parsed.data;
  const result = await db().$transaction(async (tx) => {
    // Serialise creates per organization, so two tabs cannot both pass the limit check.
    await tx.$queryRaw`SELECT id FROM organizations WHERE id = ${a.ws.orgId}::uuid FOR UPDATE`;
    const org = await tx.organization.findUniqueOrThrow({ where: { id: a.ws.orgId }, select: { plan: true } });
    const limit = PLANS[org.plan].agents;
    const count = await tx.agent.count({ where: { orgId: a.ws.orgId, state: { in: [...COUNTS_TOWARD_AGENT_LIMIT] } } });
    if (limit !== null && count >= limit) return { limit: true as const, plan: PLANS[org.plan].label, max: limit };
    const schedule = SCHEDULE_PRESETS[v.schedule].schedule;
    const agent = await tx.agent.create({
      data: {
        orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, name: v.name, goal: v.goal, color: v.color, shape: v.shape, mode: v.mode,
        weeklyBudget: v.weeklyBudget, perRunLimit: v.perRunLimit, maxPostsPerWeek: v.maxPostsPerWeek, maxPostsPerDay: 1,
        ...(schedule ? { schedule: { ...schedule, days: [...schedule.days] } } : {}),
        createdByUserId: a.session.user.id,
      },
      select: { id: true, name: true },
    });
    await refreshNextRun(tx, agent.id);
    await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, agentId: agent.id, type: "agent.created", status: "queued", title: `${agent.name} created`, detail: `By ${a.session.user.fullName}` });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.create", targetType: "agent", targetId: agent.id, metadata: { mode: v.mode, weeklyBudget: v.weeklyBudget } } });
    return { agentId: agent.id };
  });
  if ("limit" in result) return { ok: false, message: `You’ve hit your agent limit. ${result.plan} includes ${result.max} agents.` };
  refresh(slug, result.agentId);
  return { ok: true, agentId: result.agentId };
}

/** Stopping is permanent: history is kept, and the agent can be duplicated (AgentDetail-Stopped). */
export async function stopAgentAction(slug: string, agentId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug, "agent.activate");
  if ("ok" in a) return a;
  const done = await db().$transaction(async (tx) => {
    const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId: a.ws.workspaceId }, select: { id: true, name: true, state: true } });
    if (!agent) return false;
    if (agent.state === "stopped") return true;
    const now = new Date();
    await tx.agent.update({ where: { id: agent.id }, data: { state: "stopped", stoppedAt: now, nextRunAt: null } });
    await tx.runStep.updateMany({ where: { status: { in: ["queued", "paused"] }, run: { agentId: agent.id } }, data: { status: "canceled", finishedAt: now } });
    await tx.agentRun.updateMany({ where: { agentId: agent.id, status: { in: ["queued", "paused", "blocked"] } }, data: { status: "canceled", finishedAt: now } });
    await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, agentId: agent.id, type: "agent.stopped", status: "canceled", title: `${agent.name} stopped`, detail: `By ${a.session.user.fullName}` });
    await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "agent.stop", targetType: "agent", targetId: agent.id } });
    return true;
  });
  if (!done) return { ok: false, error: "This agent doesn’t exist." };
  refresh(slug, agentId);
  return { ok: true };
}
