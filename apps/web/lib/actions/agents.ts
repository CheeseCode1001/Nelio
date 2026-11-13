"use server";

import { db, findWorkspaceFor, pauseSummary, pauseWorkspace, recordActivity, refreshNextRun, resumeChecks, resumeWorkspace, startRun, weekCommitted, type PauseSummary, type ResumeCheck, type WorkspaceSummary } from "@nelio/db";
import { can, type Capability } from "@nelio/domain";
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
    const used = await weekCommitted(tx, agent.id, new Date(), agent.workspace.timezone);
    if (used >= agent.weeklyBudget) {
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
  const errors = { missing: "This agent doesn’t exist.", ws_paused: "Everything in this workspace is paused. Resume the workspace first.", stopped: "Stopped agents can’t be restarted.", budget: "This week’s budget is used up. It resets on Monday." } as const;
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
