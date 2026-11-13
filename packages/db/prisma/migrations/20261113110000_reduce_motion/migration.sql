-- ST-03 Appearance: per-person "Reduce motion" switch.
ALTER TABLE "users" ADD COLUMN "reduce_motion" BOOLEAN NOT NULL DEFAULT false;
