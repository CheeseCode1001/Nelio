-- Milestone 3: agents, runs and steps, activity feed, agent spend, notifications, push subscriptions, outbox.
-- CreateEnum
CREATE TYPE "agent_state" AS ENUM ('active', 'paused', 'budget_reached', 'stopped');

-- CreateEnum
CREATE TYPE "run_trigger" AS ENUM ('schedule', 'manual', 'strategist');

-- CreateEnum
CREATE TYPE "run_status" AS ENUM ('queued', 'running', 'blocked', 'needs_approval', 'confirming', 'paused', 'failed', 'done', 'canceled');

-- CreateEnum
CREATE TYPE "spend_kind" AS ENUM ('reserve', 'settle', 'release');

-- CreateEnum
CREATE TYPE "notification_category" AS ENUM ('approvals', 'publishing', 'licenses', 'billing', 'security', 'agents');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('in_app', 'email', 'push');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('pending', 'sent', 'skipped', 'failed');

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "mode" "automation_mode" NOT NULL DEFAULT 'assisted',
    "state" "agent_state" NOT NULL DEFAULT 'active',
    "paused_at" TIMESTAMPTZ(6),
    "paused_reason" TEXT,
    "stopped_at" TIMESTAMPTZ(6),
    "schedule" JSONB,
    "brand_rules" TEXT,
    "source_refs" JSONB NOT NULL DEFAULT '[]',
    "destination_refs" JSONB NOT NULL DEFAULT '[]',
    "weekly_budget" INTEGER NOT NULL,
    "per_run_limit" INTEGER NOT NULL,
    "max_posts_per_day" INTEGER NOT NULL DEFAULT 1,
    "max_posts_per_week" INTEGER NOT NULL DEFAULT 3,
    "next_run_at" TIMESTAMPTZ(6),
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_authorizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "scope" JSONB NOT NULL,
    "acknowledged" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "agent_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "trigger" "run_trigger" NOT NULL,
    "status" "run_status" NOT NULL DEFAULT 'queued',
    "reason" TEXT,
    "reason_text" TEXT,
    "estimated_credits" INTEGER NOT NULL DEFAULT 0,
    "actual_credits" INTEGER NOT NULL DEFAULT 0,
    "refunded_credits" INTEGER NOT NULL DEFAULT 0,
    "idempotency_key" TEXT NOT NULL,
    "started_by_user_id" UUID,
    "deadline_at" TIMESTAMPTZ(6) NOT NULL,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "status" "run_status" NOT NULL DEFAULT 'queued',
    "reason" TEXT,
    "reason_text" TEXT,
    "estimated_credits" INTEGER NOT NULL DEFAULT 0,
    "actual_credits" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "retry_after" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "agent_id" UUID,
    "run_id" UUID,
    "step_id" UUID,
    "type" TEXT NOT NULL,
    "status" "run_status",
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_spend" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "kind" "spend_kind" NOT NULL,
    "credits" INTEGER NOT NULL,
    "week_start" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_spend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "org_id" UUID,
    "workspace_id" UUID,
    "category" "notification_category" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL,
    "channel" "notification_channel" NOT NULL,
    "status" "delivery_status" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "sent_at" TIMESTAMPTZ(6),

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category" "notification_category" NOT NULL,
    "in_app" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_success_at" TIMESTAMPTZ(6),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "available_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched_at" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agents_workspace_id_state_idx" ON "agents"("workspace_id", "state");

-- CreateIndex
CREATE INDEX "agents_next_run_at_idx" ON "agents"("next_run_at");

-- CreateIndex
CREATE UNIQUE INDEX "agents_id_workspace_id_key" ON "agents"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "agent_authorizations_agent_id_idx" ON "agent_authorizations"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_runs_idempotency_key_key" ON "agent_runs"("idempotency_key");

-- CreateIndex
CREATE INDEX "agent_runs_workspace_id_status_created_at_idx" ON "agent_runs"("workspace_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "agent_runs_id_workspace_id_key" ON "agent_runs"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_runs_agent_id_number_key" ON "agent_runs"("agent_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "run_steps_run_id_ordinal_key" ON "run_steps"("run_id", "ordinal");

-- CreateIndex
CREATE INDEX "activity_events_workspace_id_created_at_idx" ON "activity_events"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_events_run_id_created_at_idx" ON "activity_events"("run_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_spend_agent_id_week_start_idx" ON "agent_spend"("agent_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "agent_spend_step_id_kind_key" ON "agent_spend"("step_id", "kind");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_dedupe_key_key" ON "notifications"("user_id", "dedupe_key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_notification_id_channel_key" ON "notification_deliveries"("notification_id", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_category_key" ON "notification_preferences"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_dedupe_key_key" ON "outbox_events"("dedupe_key");

-- CreateIndex
CREATE INDEX "outbox_events_dispatched_at_available_at_idx" ON "outbox_events"("dispatched_at", "available_at");

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspace_id_org_id_fkey" FOREIGN KEY ("workspace_id", "org_id") REFERENCES "workspaces"("id", "org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_authorizations" ADD CONSTRAINT "agent_authorizations_agent_id_workspace_id_fkey" FOREIGN KEY ("agent_id", "workspace_id") REFERENCES "agents"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_authorizations" ADD CONSTRAINT "agent_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_workspace_id_org_id_fkey" FOREIGN KEY ("workspace_id", "org_id") REFERENCES "workspaces"("id", "org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_agent_id_workspace_id_fkey" FOREIGN KEY ("agent_id", "workspace_id") REFERENCES "agents"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_run_id_workspace_id_fkey" FOREIGN KEY ("run_id", "workspace_id") REFERENCES "agent_runs"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_workspace_id_org_id_fkey" FOREIGN KEY ("workspace_id", "org_id") REFERENCES "workspaces"("id", "org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_spend" ADD CONSTRAINT "agent_spend_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_spend" ADD CONSTRAINT "agent_spend_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------- Rules the schema language cannot express

-- Budgets and credits are never negative; limits are positive; a run's per-run limit fits its weekly budget.
ALTER TABLE "agents" ADD CONSTRAINT "agents_budget_check"
  CHECK ("weekly_budget" > 0 AND "per_run_limit" > 0 AND "per_run_limit" <= "weekly_budget"
     AND "max_posts_per_day" > 0 AND "max_posts_per_week" >= "max_posts_per_day");
ALTER TABLE "agents" ADD CONSTRAINT "agents_stopped_check" CHECK (("state" = 'stopped') = ("stopped_at" IS NOT NULL));
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_credits_check"
  CHECK ("estimated_credits" >= 0 AND "actual_credits" >= 0 AND "refunded_credits" >= 0);
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_credits_check"
  CHECK ("estimated_credits" >= 0 AND "actual_credits" >= 0 AND "attempts" >= 0 AND "max_attempts" > 0);
ALTER TABLE "agent_spend" ADD CONSTRAINT "agent_spend_credits_check" CHECK ("credits" >= 0);
-- Autonomous authorization must be acknowledged (CreateAgent-Authorize checkbox).
ALTER TABLE "agent_authorizations" ADD CONSTRAINT "agent_authorizations_ack_check" CHECK ("acknowledged");

-- The activity feed, the spend log and authorizations are append-only (authorizations may only be revoked).
CREATE FUNCTION "append_only"() RETURNS trigger
  LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = 'insufficient_privilege';
END;
$$;
CREATE TRIGGER "activity_events_append_only" BEFORE UPDATE OR DELETE ON "activity_events"
  FOR EACH ROW EXECUTE FUNCTION "append_only"();
CREATE TRIGGER "agent_spend_append_only" BEFORE UPDATE OR DELETE ON "agent_spend"
  FOR EACH ROW EXECUTE FUNCTION "append_only"();

CREATE FUNCTION "agent_authorizations_revoke_only"() RETURNS trigger
  LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'agent_authorizations is append-only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF OLD."revoked_at" IS NOT NULL OR NEW."revoked_at" IS NULL
     OR (to_jsonb(NEW) - 'revoked_at') IS DISTINCT FROM (to_jsonb(OLD) - 'revoked_at') THEN
    RAISE EXCEPTION 'an authorization can only be revoked, once' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "agent_authorizations_revoke_only" BEFORE UPDATE OR DELETE ON "agent_authorizations"
  FOR EACH ROW EXECUTE FUNCTION "agent_authorizations_revoke_only"();

-- Row-level security on every new table with no policies: the browser keys can read and write nothing.
ALTER TABLE "agents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_authorizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "run_steps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_spend" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_events" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------- Live updates (Activity Center, notifications)
-- Rows are pushed to private realtime channels. A signed-in browser may listen only to
--   "ws:<workspace id>"  when it can see that workspace, and
--   "user:<user id>"     for its own notifications.
-- The membership check lives in a private schema the browser roles cannot reach directly.
-- Plain PostgreSQL (CI) has no realtime schema, so this part only runs on Supabase.
CREATE SCHEMA IF NOT EXISTS "nelio_private";
REVOKE ALL ON SCHEMA "nelio_private" FROM PUBLIC;

CREATE FUNCTION "nelio_private"."can_see_workspace"(p_user uuid, p_workspace uuid) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = p_workspace AND w.deleted_at IS NULL
      AND (
        EXISTS (SELECT 1 FROM public.workspace_memberships m WHERE m.workspace_id = w.id AND m.user_id = p_user)
        OR EXISTS (SELECT 1 FROM public.organization_memberships o WHERE o.org_id = w.org_id AND o.user_id = p_user)
      )
  );
$$;
REVOKE ALL ON FUNCTION "nelio_private"."can_see_workspace"(uuid, uuid) FROM PUBLIC;

DO $$
BEGIN
  IF to_regnamespace('realtime') IS NULL OR to_regprocedure('realtime.send(jsonb,text,text,boolean)') IS NULL THEN
    RAISE NOTICE 'realtime schema not present: skipping live-update triggers and policies';
    RETURN;
  END IF;

  GRANT USAGE ON SCHEMA "nelio_private" TO authenticated;
  GRANT EXECUTE ON FUNCTION "nelio_private"."can_see_workspace"(uuid, uuid) TO authenticated;

  EXECUTE $f$
    CREATE FUNCTION "nelio_private"."broadcast_activity"() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $b$
    BEGIN
      PERFORM realtime.send(
        jsonb_build_object('id', NEW.id, 'type', NEW.type, 'status', NEW.status, 'title', NEW.title,
                           'detail', NEW.detail, 'agentId', NEW.agent_id, 'runId', NEW.run_id,
                           'stepId', NEW.step_id, 'createdAt', NEW.created_at),
        'activity', 'ws:' || NEW.workspace_id::text, true);
      RETURN NULL;
    END;
    $b$
  $f$;
  EXECUTE $f$
    CREATE FUNCTION "nelio_private"."broadcast_notification"() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $b$
    BEGIN
      PERFORM realtime.send(
        jsonb_build_object('id', NEW.id, 'category', NEW.category, 'title', NEW.title, 'body', NEW.body,
                           'href', NEW.href, 'createdAt', NEW.created_at),
        'notification', 'user:' || NEW.user_id::text, true);
      RETURN NULL;
    END;
    $b$
  $f$;
  EXECUTE 'CREATE TRIGGER "activity_events_broadcast" AFTER INSERT ON public."activity_events"
             FOR EACH ROW EXECUTE FUNCTION "nelio_private"."broadcast_activity"()';
  EXECUTE 'CREATE TRIGGER "notifications_broadcast" AFTER INSERT ON public."notifications"
             FOR EACH ROW EXECUTE FUNCTION "nelio_private"."broadcast_notification"()';

  EXECUTE $p$
    CREATE POLICY "nelio_listen_own_channels" ON realtime.messages
      FOR SELECT TO authenticated
      USING (
        realtime.messages.extension = 'broadcast'
        AND (
          (realtime.topic() LIKE 'ws:%'
            AND "nelio_private"."can_see_workspace"((SELECT auth.uid()), substring(realtime.topic() from 4)::uuid))
          OR realtime.topic() = 'user:' || (SELECT auth.uid())::text
        )
      )
  $p$;
END $$;
