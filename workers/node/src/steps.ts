import { db, enqueue, notify, recordActivity, refreshNextRun, TOPICS, weekCommitted, workspaceWatchers, type Tx } from "@nelio/db";
import { canReserve, committedCredits, settle, weekStartFor } from "@nelio/domain";

import { MEDIA_HANDLERS } from "./media";
import { RENDER_HANDLERS } from "./render";
import { RetryableStepError, type StepHandler, type StepOutcome } from "./step-types";

export { RetryableStepError, type StepContext, type StepHandler, type StepOutcome } from "./step-types";

/** Real handlers from Milestone 4 on: the media pipeline (see media.ts). */
export const DEFAULT_HANDLERS: Record<string, StepHandler> = { ...MEDIA_HANDLERS, ...RENDER_HANDLERS };

const STEP_TIMEOUT_MS = 30 * 60 * 1000;
const backoffMs = (attempt: number) => Math.min(30_000 * 2 ** (attempt - 1), 15 * 60_000);

async function lockStep(tx: Tx, stepId: string) {
  await tx.$queryRaw`SELECT id FROM run_steps WHERE id = ${stepId}::uuid FOR UPDATE`;
  return tx.runStep.findUnique({
    where: { id: stepId },
    include: {
      run: {
        include: {
          agent: { select: { id: true, name: true, state: true, weeklyBudget: true, perRunLimit: true, sourceRefs: true, destinationRefs: true } },
          asset: { select: { filename: true } },
          workspace: { select: { id: true, orgId: true, timezone: true, pausedAt: true, slug: true } },
        },
      },
    },
  });
}

type Loaded = NonNullable<Awaited<ReturnType<typeof lockStep>>>;

/** How a run is named in the feed: "Budget Shorts · run #12", "Processing podcast_ep12.mp4", "Render #3". */
export function runLabel(run: Loaded["run"]): string {
  if (run.agent) return `${run.agent.name} · run #${run.number}`;
  if (run.kind === "process") return `Processing ${run.asset?.filename ?? "video"}`;
  return `Render #${run.number}`;
}

/** What a finished processing run means for its video: ready, or failed / blocked with the reason, and a notification. */
async function afterProcessRun(tx: Tx, s: Loaded, status: "done" | "failed" | "blocked", reasonText: string | null) {
  if (s.run.kind !== "process" || !s.run.assetId) return;
  const asset = await tx.mediaAsset.findUnique({ where: { id: s.run.assetId }, select: { id: true, filename: true, uploadedByUserId: true } });
  if (!asset) return;
  const ws = s.run.workspace;
  await tx.mediaAsset.update({ where: { id: asset.id }, data: { status: status === "done" ? "ready" : status === "blocked" ? "blocked" : "failed", statusText: status === "done" ? null : reasonText } });
  await notify(tx, {
    userId: asset.uploadedByUserId,
    category: "publishing",
    title: status === "done" ? `${asset.filename} is ready` : `${asset.filename} couldn’t be processed`,
    body: status === "done" ? "Your best moments are waiting in the Clipping Studio." : reasonText ?? undefined,
    href: `/w/${ws.slug}/studio/${asset.id}`,
    dedupeKey: `process:${asset.id}:${status}`,
    orgId: ws.orgId,
    workspaceId: ws.id,
  });
}

async function afterRenderRun(tx: Tx, s: Loaded, status: "done" | "failed" | "blocked", reasonText: string | null) {
  if (s.run.kind !== "render" || !s.run.renderId) return;
  const render = await tx.render.findUnique({ where: { id: s.run.renderId }, select: { id: true, createdById: true, actualCredits: true, project: { select: { name: true, assetId: true } } } });
  if (!render) return;
  const ws = s.run.workspace;
  const spent = await tx.agentSpend.findMany({ where: { runId: s.runId, kind: "settle" }, select: { credits: true } });
  await tx.render.update({
    where: { id: render.id },
    data: status === "done" ? { status: "ready", statusText: null, actualCredits: spent.reduce((n, e) => n + e.credits, 0) } : { status: "failed", statusText: reasonText ?? "The render didn’t finish." },
  });
  await notify(tx, {
    userId: render.createdById,
    category: "publishing",
    title: status === "done" ? `“${render.project.name}” is rendered` : `“${render.project.name}” couldn’t be rendered`,
    body: status === "done" ? "Download it from Exports or schedule it." : `${reasonText ?? "Something went wrong."} Credits for it were refunded.`,
    href: status === "done" ? `/w/${ws.slug}/exports` : `/w/${ws.slug}/studio/${render.project.assetId}`,
    dedupeKey: `render:${render.id}:${status}`,
    orgId: ws.orgId,
    workspaceId: ws.id,
  });
}

async function finishRun(tx: Tx, s: Loaded, status: "done" | "failed" | "blocked", reason: string | null, reasonText: string | null, now: Date) {
  const spend = await tx.agentSpend.findMany({ where: { runId: s.runId }, select: { kind: true, credits: true } });
  const actual = spend.filter((e) => e.kind === "settle").reduce((n, e) => n + e.credits, 0);
  const refunded = spend.filter((e) => e.kind === "release").reduce((n, e) => n + e.credits, 0);
  await tx.agentRun.update({
    where: { id: s.runId },
    data: { status, reason, reasonText, actualCredits: actual, refundedCredits: refunded, finishedAt: status === "blocked" ? null : now },
  });
  await afterProcessRun(tx, s, status, reasonText);
  await afterRenderRun(tx, s, status, reasonText);
}

/**
 * Runs one step. Safe to call more than once for the same step: only a queued step starts, and every state
 * change happens in a transaction that holds the step's row lock.
 */
export async function processStep(stepId: string, handlers: Record<string, StepHandler> = DEFAULT_HANDLERS, now = () => new Date()): Promise<string> {
  const client = db();

  // 1. Checks and reservation.
  const start = await client.$transaction(async (tx) => {
    const s = await lockStep(tx, stepId);
    if (!s) return { go: false as const, note: "missing" };
    if (s.status !== "queued") return { go: false as const, note: `already ${s.status}` };
    // Steps run strictly in order: a step whose predecessor is not done waits for it to finish.
    if (s.ordinal > 1) {
      const prev = await tx.runStep.findFirst({ where: { runId: s.runId, ordinal: s.ordinal - 1 }, select: { status: true } });
      if (prev && prev.status !== "done") return { go: false as const, note: `waiting for step ${s.ordinal - 1}` };
    }
    const { run } = s;
    const ws = run.workspace;
    const agent = run.agent;
    const base = { orgId: ws.orgId, workspaceId: ws.id, agentId: agent?.id ?? null, runId: run.id, stepId: s.id };

    if (ws.pausedAt || agent?.state === "paused" || agent?.state === "stopped") {
      await tx.runStep.update({ where: { id: s.id }, data: { status: "paused" } });
      await tx.agentRun.update({ where: { id: run.id }, data: { status: "paused" } });
      return { go: false as const, note: "paused" };
    }
    if (now() > run.deadlineAt) {
      await tx.runStep.update({ where: { id: s.id }, data: { status: "failed", reason: "timeout", reasonText: "The run took too long and was stopped.", finishedAt: now() } });
      await finishRun(tx, s, "failed", "timeout", "The run took too long and was stopped.", now());
      await recordActivity(tx, { ...base, type: "step.failed", status: "failed", title: s.title, detail: "The run took too long and was stopped." });
      return { go: false as const, note: "timeout" };
    }

    if (s.estimatedCredits > 0 && agent) {
      const week = await weekCommitted(tx, agent.id, now(), ws.timezone);
      const runSpend = await tx.agentSpend.findMany({ where: { runId: run.id }, select: { stepId: true, attempt: true, kind: true, credits: true } });
      const decision = canReserve({ estimate: s.estimatedCredits, weeklyBudget: agent.weeklyBudget, weekCommitted: week, perRunLimit: agent.perRunLimit, runCommitted: committedCredits(runSpend) });
      if (!decision.ok) {
        await tx.runStep.update({ where: { id: s.id }, data: { status: "blocked", reason: "budget", reasonText: decision.text } });
        await finishRun(tx, s, "blocked", "budget", decision.text, now());
        await recordActivity(tx, { ...base, type: "step.blocked", status: "blocked", title: s.title, detail: decision.text });
        if (decision.reason === "weekly_budget") {
          await tx.agent.update({ where: { id: agent.id }, data: { state: "budget_reached", nextRunAt: null } });
          const week = weekStartFor(now(), ws.timezone);
          for (const userId of await workspaceWatchers(tx, ws.id)) {
            await notify(tx, { userId, category: "agents", title: `${agent.name} reached its weekly budget`, body: `${agent.weeklyBudget} credits used. It resumes on Monday.`, href: `/w/${ws.slug}/agents/${agent.id}`, dedupeKey: `budget:${agent.id}:${week}`, orgId: ws.orgId, workspaceId: ws.id });
          }
        }
        return { go: false as const, note: "budget" };
      }
    }
    // Work started by hand was costed and confirmed before it started; its spend is recorded the same way.
    if (s.estimatedCredits > 0) {
      await tx.agentSpend.create({ data: { agentId: agent?.id ?? null, runId: run.id, stepId: s.id, attempt: s.attempts + 1, kind: "reserve", credits: s.estimatedCredits, weekStart: new Date(`${weekStartFor(now(), ws.timezone)}T00:00:00Z`) } });
    }

    await tx.runStep.update({ where: { id: s.id }, data: { status: "running", attempts: { increment: 1 }, startedAt: s.startedAt ?? now(), reason: null, reasonText: null } });
    if (run.status !== "running") await tx.agentRun.update({ where: { id: run.id }, data: { status: "running", startedAt: run.startedAt ?? now() } });
    await recordActivity(tx, { ...base, type: "step.started", status: "running", title: s.title, detail: runLabel(run) });
    return { go: true as const, step: s };
  });
  if (!start.go) return start.note;
  const s = start.step;

  // 2. The work itself, outside any transaction, with a time limit.
  const handler = handlers[s.kind];
  let outcome: StepOutcome | { status: "error"; text: string };
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), STEP_TIMEOUT_MS);
  try {
    outcome = handler
      ? await handler({
          stepId: s.id,
          kind: s.kind,
          runId: s.runId,
          run: { id: s.run.id, kind: s.run.kind, number: s.run.number, orgId: s.run.orgId, workspaceId: s.run.workspaceId, assetId: s.run.assetId, renderId: s.run.renderId },
          agent: s.run.agent,
          signal: ac.signal,
          progress: async (detail) => { await client.runStep.update({ where: { id: s.id }, data: { detail: detail.slice(0, 200) } }).catch(() => {}); },
        })
      : { status: "blocked", reason: "not_available", text: "This step isn’t available yet." };
  } catch (e) {
    outcome = { status: "error", text: e instanceof Error ? e.message.slice(0, 300) : "Unknown error" };
  } finally {
    clearTimeout(timer);
  }

  // 3. Settle and move on.
  return client.$transaction(async (tx) => {
    const cur = await lockStep(tx, stepId);
    if (!cur || cur.status !== "running") return "state changed while running";
    const ws = cur.run.workspace;
    const agent = cur.run.agent;
    const label = runLabel(cur.run);
    const base = { orgId: ws.orgId, workspaceId: ws.id, agentId: agent?.id ?? null, runId: cur.runId, stepId: cur.id };
    const reservation = await tx.agentSpend.findUnique({ where: { stepId_attempt_kind: { stepId: cur.id, attempt: cur.attempts, kind: "reserve" } } });
    const weekStart = reservation?.weekStart ?? new Date(`${weekStartFor(now(), ws.timezone)}T00:00:00Z`);
    const closeSpend = async (actual: number) => {
      if (!reservation) return { settled: 0, released: 0 };
      const r = settle(reservation.credits, actual);
      await tx.agentSpend.create({ data: { agentId: agent?.id ?? null, runId: cur.runId, stepId: cur.id, attempt: cur.attempts, kind: "settle", credits: r.settled, weekStart } });
      await tx.agentSpend.create({ data: { agentId: agent?.id ?? null, runId: cur.runId, stepId: cur.id, attempt: cur.attempts, kind: "release", credits: r.released, weekStart } });
      return r;
    };

    if (outcome.status === "done") {
      const r = await closeSpend(outcome.actualCredits);
      await tx.runStep.update({ where: { id: cur.id }, data: { status: "done", actualCredits: r.settled, detail: outcome.detail ?? null, finishedAt: now() } });
      const detail = reservation ? `${r.settled} credits used (estimated ${reservation.credits})${r.released ? ` · ${r.released} refunded` : ""}` : outcome.detail ?? null;
      await recordActivity(tx, { ...base, type: "step.done", status: "done", title: cur.title, detail });
      const next = await tx.runStep.findFirst({ where: { runId: cur.runId, ordinal: cur.ordinal + 1 }, select: { id: true } });
      if (next) await enqueue(tx, TOPICS.stepRun, { stepId: next.id }, `step:${next.id}:1`);
      else {
        await finishRun(tx, cur, "done", null, null, now());
        await recordActivity(tx, { ...base, stepId: null, type: "run.done", status: "done", title: label, detail: "Finished" });
      }
      return "done";
    }

    // Kept on the step for diagnosis (URLs and long tokens removed); people see the plain reason text.
    const errorText = outcome.status === "error" ? outcome.text.replace(/(https?|rediss?|postgres(ql)?):\/\/\S+/g, "[url]").replace(/[A-Za-z0-9_\-]{32,}/g, "[…]").slice(0, 180) : "";
    // Blocked or errored: nothing was used, so the whole reservation goes back.
    await closeSpend(0);
    if (outcome.status === "blocked") {
      await tx.runStep.update({ where: { id: cur.id }, data: { status: "blocked", reason: outcome.reason, reasonText: outcome.text } });
      await finishRun(tx, cur, "blocked", outcome.reason, outcome.text, now());
      await recordActivity(tx, { ...base, type: "step.blocked", status: "blocked", title: cur.title, detail: outcome.text });
      return `blocked: ${outcome.reason}`;
    }

    if (cur.attempts < cur.maxAttempts) {
      const at = new Date(now().getTime() + backoffMs(cur.attempts));
      await tx.runStep.update({ where: { id: cur.id }, data: { status: "queued", reason: "retrying", reasonText: `Attempt ${cur.attempts} failed. Trying again.`, detail: `Last error: ${errorText}` } });
      await recordActivity(tx, { ...base, type: "step.retrying", status: "queued", title: cur.title, detail: `Attempt ${cur.attempts} of ${cur.maxAttempts} failed. Trying again.` });
      await enqueue(tx, TOPICS.stepRun, { stepId: cur.id }, `step:${cur.id}:${cur.attempts + 1}`, at);
      return "retry scheduled";
    }
    const text = `Failed after ${cur.attempts} attempts.`;
    await tx.runStep.update({ where: { id: cur.id }, data: { status: "failed", reason: "error", reasonText: text, detail: `Last error: ${errorText}`, finishedAt: now() } });
    await finishRun(tx, cur, "failed", "error", text, now());
    await recordActivity(tx, { ...base, type: "step.failed", status: "failed", title: cur.title, detail: text });
    for (const userId of await workspaceWatchers(tx, ws.id)) {
      await notify(tx, { userId, category: agent ? "agents" : "publishing", title: `${agent?.name ?? label}: “${cur.title}” failed`, body: text, href: `/w/${ws.slug}/activity`, dedupeKey: `stepfail:${cur.id}`, orgId: ws.orgId, workspaceId: ws.id });
    }
    return "failed";
  });
}

/** Starts scheduled runs that are due. Each schedule slot runs once, even if this is called repeatedly. */
export async function startDueRuns(now = new Date()): Promise<number> {
  const { startRun } = await import("@nelio/db");
  const due = await db().agent.findMany({
    where: { state: "active", nextRunAt: { lte: now }, workspace: { pausedAt: null, deletedAt: null } },
    select: { id: true, workspaceId: true, nextRunAt: true },
    take: 50,
  });
  let started = 0;
  for (const a of due) {
    await db().$transaction(async (tx) => {
      const r = await startRun(tx, { agentId: a.id, workspaceId: a.workspaceId, trigger: "schedule", idempotencyKey: `sched:${a.id}:${a.nextRunAt!.toISOString()}`, now });
      if (r.ok && !r.existing) started++;
      await refreshNextRun(tx, a.id, now);
    });
  }
  return started;
}

/** Stops runs past their deadline and returns their open reservations. */
export async function sweepTimeouts(now = new Date()): Promise<number> {
  const late = await db().agentRun.findMany({ where: { deadlineAt: { lt: now }, status: { in: ["queued", "running"] } }, select: { id: true }, take: 50 });
  for (const r of late) {
    await db().$transaction(async (tx) => {
      const run = await tx.agentRun.findUnique({ where: { id: r.id }, include: { agent: { select: { id: true, name: true } }, asset: { select: { filename: true } }, workspace: { select: { orgId: true } } } });
      if (!run || !["queued", "running"].includes(run.status)) return;
      const open = await tx.agentSpend.findMany({ where: { runId: run.id }, select: { stepId: true, attempt: true, kind: true, credits: true, weekStart: true } });
      const closed = new Set(open.filter((e) => e.kind !== "reserve").map((e) => `${e.stepId}:${e.attempt}`));
      for (const e of open.filter((x) => x.kind === "reserve" && !closed.has(`${x.stepId}:${x.attempt}`))) {
        await tx.agentSpend.create({ data: { agentId: run.agent?.id ?? null, runId: run.id, stepId: e.stepId, attempt: e.attempt, kind: "release", credits: e.credits, weekStart: e.weekStart } });
      }
      await tx.runStep.updateMany({ where: { runId: run.id, status: { in: ["queued", "running"] } }, data: { status: "canceled", finishedAt: now } });
      await tx.agentRun.update({ where: { id: run.id }, data: { status: "failed", reason: "timeout", reasonText: "The run took too long and was stopped.", finishedAt: now } });
      const title = run.agent ? `${run.agent.name} · run #${run.number}` : run.kind === "process" ? `Processing ${run.asset?.filename ?? "video"}` : `Render #${run.number}`;
      await recordActivity(tx, { orgId: run.workspace.orgId, workspaceId: run.workspaceId, agentId: run.agent?.id ?? null, runId: run.id, type: "run.failed", status: "failed", title, detail: "The run took too long and was stopped." });
    });
  }
  return late.length;
}
