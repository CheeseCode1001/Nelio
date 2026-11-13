"use server";

import { db, findWorkspaceFor, recordActivity, requeueHeld } from "@nelio/db";
import { can } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { getSession } from "../auth";

type Result = { ok: true } | { ok: false; error: string };

async function guard(slug: string) {
  const session = await getSession();
  if (!session || session.user.needsMfa) return null;
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return null;
  const d = can(session.actor, "agent.pause_resume", ws);
  return d.allowed && d.access !== "R" && d.access !== "V" ? { session, ws } : null;
}

/** "Pause run" on the Activity panel: holds this run's queued steps. A running step finishes or stops safely. */
export async function pauseRunAction(slug: string, runId: string): Promise<Result> {
  const g = await guard(slug);
  if (!g) return { ok: false, error: "You don’t have permission to do that here." };
  const done = await db().$transaction(async (tx) => {
    const run = await tx.agentRun.findFirst({ where: { id: runId, workspaceId: g.ws.workspaceId }, include: { agent: { select: { name: true } } } });
    if (!run || !["queued", "running", "blocked"].includes(run.status)) return false;
    await tx.runStep.updateMany({ where: { runId: run.id, status: "queued" }, data: { status: "paused" } });
    await tx.agentRun.update({ where: { id: run.id }, data: { status: "paused" } });
    await recordActivity(tx, { orgId: g.ws.orgId, workspaceId: g.ws.workspaceId, agentId: run.agentId, runId: run.id, type: "run.paused", status: "paused", title: `${run.agent.name} · run #${run.number} paused`, detail: `By ${g.session.user.fullName}` });
    await tx.auditEvent.create({ data: { orgId: g.ws.orgId, workspaceId: g.ws.workspaceId, actorUserId: g.session.user.id, action: "run.pause", targetType: "agent_run", targetId: run.id } });
    return true;
  });
  revalidatePath(`/w/${slug}/activity`);
  return done ? { ok: true } : { ok: false, error: "This run can’t be paused now." };
}

/** Resumes a paused run: held steps go back on the queue (the workspace and agent must be active). */
export async function resumeRunAction(slug: string, runId: string): Promise<Result> {
  const g = await guard(slug);
  if (!g) return { ok: false, error: "You don’t have permission to do that here." };
  const result = await db().$transaction(async (tx) => {
    const run = await tx.agentRun.findFirst({ where: { id: runId, workspaceId: g.ws.workspaceId }, include: { agent: { select: { name: true, state: true } }, workspace: { select: { pausedAt: true } } } });
    if (!run || run.status !== "paused") return "not_paused";
    if (run.workspace.pausedAt) return "ws_paused";
    if (run.agent.state !== "active") return "agent";
    const held = await tx.runStep.findMany({ where: { runId: run.id, status: "paused" }, orderBy: { ordinal: "asc" }, select: { id: true, runId: true } });
    await requeueHeld(tx, held);
    await recordActivity(tx, { orgId: g.ws.orgId, workspaceId: g.ws.workspaceId, agentId: run.agentId, runId: run.id, type: "run.resumed", status: "queued", title: `${run.agent.name} · run #${run.number} resumed`, detail: `By ${g.session.user.fullName}` });
    return "ok";
  });
  revalidatePath(`/w/${slug}/activity`);
  if (result === "ok") return { ok: true };
  return { ok: false, error: result === "ws_paused" ? "Everything in this workspace is paused." : result === "agent" ? "Resume the agent first." : "This run isn’t paused." };
}
