-- A retried step reserves credits again, so spend entries are unique per step attempt, not per step.
ALTER TABLE "agent_spend" ADD COLUMN "attempt" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "agent_spend" ADD CONSTRAINT "agent_spend_attempt_check" CHECK ("attempt" > 0);
DROP INDEX "agent_spend_step_id_kind_key";
CREATE UNIQUE INDEX "agent_spend_step_id_attempt_kind_key" ON "agent_spend"("step_id", "attempt", "kind");
