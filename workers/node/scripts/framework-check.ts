/**
 * End-to-end check of the Milestone 3 job framework against the real dev database and Redis.
 * Creates a throwaway organization ("zz-test-…"), drives runs through fake step handlers, asserts every rule,
 * then soft-deletes the organization. Prints results only, never connection strings.
 * Usage: pnpm --filter @nelio/worker-node check:framework
 */
import { randomUUID } from "node:crypto";
import { db, pauseWorkspace, resumeChecks, resumeWorkspace, startRun, weekCommitted } from "@nelio/db";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { dispatchOutbox } from "../src/dispatcher";
import { processStep, RetryableStepError, sweepTimeouts, type StepHandler } from "../src/steps";

let failures = 0;
const check = (label: string, ok: boolean, got?: unknown) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(got)})`}`);
  if (!ok) failures++;
};

const tag = `zz-test-${Date.now().toString(36)}`;
const client = db();
const TZ = "Africa/Lagos";

async function nextQueued(runId: string) {
  return client.runStep.findFirst({ where: { runId, status: "queued" }, orderBy: { ordinal: "asc" } });
}
async function drive(runId: string, handlers: Record<string, StepHandler>, max = 12) {
  const notes: string[] = [];
  for (let i = 0; i < max; i++) {
    const s = await nextQueued(runId);
    if (!s) break;
    notes.push(`${s.kind}:${await processStep(s.id, handlers)}`);
  }
  return notes;
}

const userId = randomUUID();
let orgId = "";
try {
  // ---- Fixture
  await client.user.create({ data: { id: userId, email: `${tag}@nelio-test.invalid`, fullName: "Framework Check" } });
  const org = await client.organization.create({ data: { name: tag, slug: tag, accountType: "creator", plan: "creator_pro" } });
  orgId = org.id;
  await client.organizationMembership.create({ data: { orgId, userId, role: "owner" } });
  const ws = await client.workspace.create({ data: { orgId, name: tag, slug: tag, timezone: TZ } });
  const mkAgent = (name: string, weeklyBudget: number) => client.agent.create({
    data: { orgId, workspaceId: ws.id, name, goal: "test", color: "blue", shape: "circle", weeklyBudget, perRunLimit: Math.min(60, weeklyBudget), createdByUserId: userId },
  });

  // ---- 1. A run: retries, settles, then hits the weekly budget on the last step.
  const a1 = await mkAgent("Budget Check", 40);
  const r1 = await client.$transaction((tx) => startRun(tx, { agentId: a1.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r1`, userId }));
  check("run starts and is numbered #1", r1.ok && r1.number === 1, r1);
  const again = await client.$transaction((tx) => startRun(tx, { agentId: a1.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r1`, userId }));
  check("same idempotency key returns the same run", again.ok && r1.ok && again.runId === r1.runId && again.existing, again);
  if (!r1.ok) throw new Error("cannot continue");
  check("five steps written", (await client.runStep.count({ where: { runId: r1.runId } })) === 5);
  check("first step queued through the outbox", (await client.outboxEvent.count({ where: { dedupeKey: { startsWith: "step:" }, payload: { path: ["stepId"], not: "" } } })) > 0);

  let flaky = 0;
  const handlers: Record<string, StepHandler> = {
    check_sources: async () => ({ status: "done", actualCredits: 0 }),
    transcribe: async () => ({ status: "done", actualCredits: 18 }),
    detect_scenes: async () => { if (flaky++ === 0) throw new RetryableStepError("provider timeout"); return { status: "done", actualCredits: 4 }; },
    rank_moments: async () => ({ status: "done", actualCredits: 8 }),
    render_previews: async () => ({ status: "done", actualCredits: 20 }),
  };
  // Retries are delayed in production; make the retried step runnable now for the check.
  let notes = await drive(r1.runId, handlers, 3);
  check("a failing step is scheduled for retry", notes.at(-1) === "detect_scenes:retry scheduled", notes);
  notes = notes.concat(await drive(r1.runId, handlers));
  const run1 = await client.agentRun.findUniqueOrThrow({ where: { id: r1.runId } });
  check("retry succeeds, then the last step blocks on the weekly budget", run1.status === "blocked" && run1.reason === "budget", { status: run1.status, reason: run1.reason, notes });
  check("budget message matches the board's wording", run1.reasonText === "Needs 20 credits, 10 left in this agent’s budget", run1.reasonText);
  check("transcribe settled 18 of 20, refunding 2", (await client.runStep.findFirstOrThrow({ where: { runId: r1.runId, kind: "transcribe" } })).actualCredits === 18);
  check("week committed is 30 credits", (await weekCommitted(client, a1.id, new Date(), TZ)) === 30, await weekCommitted(client, a1.id, new Date(), TZ));
  check("run totals: 30 used, 2 refunded", run1.actualCredits === 30 && run1.refundedCredits === 2, { a: run1.actualCredits, r: run1.refundedCredits });
  check("agent marked 'budget reached'", (await client.agent.findUniqueOrThrow({ where: { id: a1.id } })).state === "budget_reached");
  const n = await client.notification.findMany({ where: { userId } });
  check("owner notified once about the budget", n.length === 1 && n[0]!.category === "agents", n.map((x) => x.title));
  const startAgain = await client.$transaction((tx) => startRun(tx, { agentId: a1.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r1b` }));
  check("an agent over budget cannot start a new run", !startAgain.ok, startAgain);
  check("activity feed recorded the run", (await client.activityEvent.count({ where: { runId: r1.runId } })) >= 8);
  const upd = await client.$executeRawUnsafe(`UPDATE activity_events SET title = 'x' WHERE run_id = '${r1.runId}'`).then(() => "allowed", (e: Error) => e.message);
  check("activity feed is append-only", upd.includes("append-only"), upd);

  // ---- 2. Pause all holds queued work; resume re-checks budgets and re-queues it.
  const a2 = await mkAgent("Pause Check", 300);
  const r2 = await client.$transaction((tx) => startRun(tx, { agentId: a2.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r2` }));
  if (!r2.ok) throw new Error("cannot continue");
  await client.$transaction((tx) => pauseWorkspace(tx, { workspaceId: ws.id, userId }));
  check("pause holds queued steps", (await client.runStep.count({ where: { runId: r2.runId, status: "paused" } })) === 5);
  const blockedStart = await client.$transaction((tx) => startRun(tx, { agentId: a2.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r2b` }));
  check("nothing new starts while paused", !blockedStart.ok && blockedStart.reason === "workspace_paused", blockedStart);
  const checks = await resumeChecks(client, ws.id);
  check("resume re-checks each agent", checks.length === 2 && checks.find((c) => c.name === "Budget Check")?.willResume === false && checks.find((c) => c.name === "Pause Check")?.willResume === true, checks);
  await client.$transaction((tx) => resumeWorkspace(tx, { workspaceId: ws.id, userId }));
  check("resume re-queues held work", (await client.runStep.count({ where: { runId: r2.runId, status: "queued" } })) === 5);

  // ---- 3. Real Milestone 3 handlers block honestly instead of pretending.
  notes = await drive(r2.runId, (await import("../src/steps")).DEFAULT_HANDLERS, 1);
  const s1 = await client.runStep.findFirstOrThrow({ where: { runId: r2.runId, ordinal: 1 } });
  check("with no videos the run blocks with an honest reason", s1.status === "blocked" && s1.reason === "no_sources", { s: s1.status, r: s1.reason });

  // ---- 4. Timeouts release reservations.
  const a3 = await mkAgent("Timeout Check", 300);
  const r3 = await client.$transaction((tx) => startRun(tx, { agentId: a3.id, workspaceId: ws.id, trigger: "manual", idempotencyKey: `${tag}:r3` }));
  if (!r3.ok) throw new Error("cannot continue");
  await client.agentRun.update({ where: { id: r3.runId }, data: { deadlineAt: new Date(Date.now() - 1000) } });
  await sweepTimeouts();
  check("a run past its deadline is stopped", (await client.agentRun.findUniqueOrThrow({ where: { id: r3.runId } })).status === "failed");

  // ---- 5. Outbox → queue, on a throwaway queue prefix.
  const conn = new IORedis(process.env.NELIO_REDIS_URL!, { maxRetriesPerRequest: null });
  const prefix = `${tag}-q`;
  const queues = { "agent-steps": new Queue("agent-steps", { connection: conn, prefix }), notify: new Queue("notify", { connection: conn, prefix }) };
  const pending = await client.outboxEvent.count({ where: { dispatchedAt: null } });
  const moved = await dispatchOutbox(queues, 500);
  const waiting = await queues["agent-steps"].getJobCounts("waiting", "delayed");
  check("dispatcher moves outbox rows onto the queue", moved === pending && moved > 0 && (waiting.waiting ?? 0) + (waiting.delayed ?? 0) >= 1, { pending, moved, waiting });
  const movedAgain = await dispatchOutbox(queues, 500);
  check("a dispatched row is never sent twice", movedAgain === 0, movedAgain);
  for (const q of Object.values(queues)) { await q.obliterate({ force: true }); await q.close(); }
  conn.disconnect();
} catch (e) {
  failures++;
  console.log("FAIL  unexpected error:", e instanceof Error ? e.message.replace(/(postgres(ql)?|rediss?):\/\/\S+/g, "[url]") : e);
} finally {
  if (orgId) await client.organization.update({ where: { id: orgId }, data: { deletedAt: new Date() } }).catch(() => {});
  await client.workspace.updateMany({ where: { orgId }, data: { deletedAt: new Date() } }).catch(() => {});
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll framework checks passed");
  await client.$disconnect();
  process.exit(failures ? 1 : 0);
}
