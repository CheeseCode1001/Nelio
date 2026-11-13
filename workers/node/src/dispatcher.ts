import { db, QUEUE_FOR_TOPIC, type Topic } from "@nelio/db";
import type { Queue } from "bullmq";

/**
 * Moves outbox rows onto the job queues. Rows are claimed with SKIP LOCKED, so several dispatchers can run
 * side by side. The queue job id is the outbox row id, so a row added twice still becomes one job.
 */
export async function dispatchOutbox(queues: Record<string, Queue>, batch = 50): Promise<number> {
  return db().$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; topic: string; payload: unknown; attempts: number }[]>`
      SELECT id, topic, payload, attempts FROM outbox_events
      WHERE dispatched_at IS NULL AND available_at <= now()
      ORDER BY available_at
      LIMIT ${batch}
      FOR UPDATE SKIP LOCKED`;
    for (const r of rows) {
      const queueName = QUEUE_FOR_TOPIC[r.topic as Topic];
      const queue = queueName ? queues[queueName] : undefined;
      try {
        if (!queue) throw new Error(`no queue for topic ${r.topic}`);
        await queue.add(r.topic, r.payload, { jobId: r.id, attempts: 5, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: 1000, removeOnFail: 5000 });
        await tx.outboxEvent.update({ where: { id: r.id }, data: { dispatchedAt: new Date(), attempts: r.attempts + 1, lastError: null } });
      } catch (e) {
        const wait = Math.min(60_000 * 2 ** r.attempts, 60 * 60_000);
        await tx.outboxEvent.update({ where: { id: r.id }, data: { attempts: r.attempts + 1, lastError: String(e instanceof Error ? e.message : e).slice(0, 300), availableAt: new Date(Date.now() + wait) } });
      }
    }
    return rows.length;
  });
}
