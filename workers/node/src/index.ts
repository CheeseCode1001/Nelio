import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { dispatchOutbox } from "./dispatcher";
import { deliverNotification } from "./notify";
import { db, resetBudgetWeeks } from "@nelio/db";
import { processStep, startDueRuns, sweepTimeouts } from "./steps";

/**
 * Nelio Node worker: outbox dispatcher, agent step runner, notification delivery, scheduler and timeout sweep.
 * Runs as a long-lived process (Render or Railway in production; `pnpm worker:dev` locally). Never on serverless.
 */
const url = process.env.NELIO_REDIS_URL;
if (!url) { console.error("NELIO_REDIS_URL is not set"); process.exit(1); }
if (!process.env.NELIO_DATABASE_URL) { console.error("NELIO_DATABASE_URL is not set"); process.exit(1); }

const connection = new IORedis(url, { maxRetriesPerRequest: null });
connection.on("error", (e) => console.error("[redis]", e.message.replace(/rediss?:\/\/\S+/g, "[url]")));
const prefix = process.env.NELIO_QUEUE_PREFIX ?? "nelio";

const queues = { "agent-steps": new Queue("agent-steps", { connection, prefix }), notify: new Queue("notify", { connection, prefix }) };

const log = (name: string) => (job: Job, result: unknown) => console.log(`[${name}] ${job.name} ${job.id} → ${String(result)}`);
const workers = [
  new Worker("agent-steps", async (job) => processStep((job.data as { stepId: string }).stepId), { connection, prefix, concurrency: 2 }),
  new Worker("notify", async (job) => deliverNotification((job.data as { notificationId: string }).notificationId), { connection, prefix, concurrency: 4 }),
];
workers[0]!.on("completed", log("steps"));
workers[1]!.on("completed", log("notify"));
for (const w of workers) w.on("failed", (job, err) => console.error(`[${w.name}] ${job?.name} ${job?.id} failed: ${err.message}`));

let stopping = false;
async function loop(name: string, everyMs: number, fn: () => Promise<number>) {
  while (!stopping) {
    try {
      const n = await fn();
      if (n > 0) console.log(`[${name}] ${n}`);
    } catch (e) {
      console.error(`[${name}]`, e instanceof Error ? e.message.replace(/postgres(ql)?:\/\/\S+/g, "[url]") : e);
    }
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

void loop("outbox", 1000, () => dispatchOutbox(queues));
void loop("schedule", 30_000, () => startDueRuns());
void loop("timeouts", 60_000, () => sweepTimeouts());
void loop("budget-week", 5 * 60_000, () => resetBudgetWeeks(db()));
console.log("Nelio worker started: queues agent-steps, notify; outbox, schedule, timeout and budget-week loops running.");

async function shutdown() {
  if (stopping) return;
  stopping = true;
  console.log("Stopping: finishing jobs in progress…");
  await Promise.all(workers.map((w) => w.close()));
  await Promise.all(Object.values(queues).map((q) => q.close()));
  connection.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
