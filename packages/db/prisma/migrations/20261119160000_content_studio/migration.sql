-- Content Studio, brand kits and AI settings (CS-01..03, ST-06, ST-07).
ALTER TABLE "brand_kits" ADD COLUMN "colours" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "brand_kits" ADD COLUMN "voice" TEXT NOT NULL DEFAULT '';
UPDATE "brand_kits" SET "colours" = ARRAY["primary", "accent"] WHERE cardinality("colours") = 0;

ALTER TABLE "workspaces" ADD COLUMN "suggest_post_times" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "posts" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'clip_caption';
ALTER TABLE "posts" ADD COLUMN "content" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "posts" ADD CONSTRAINT "posts_kind_check" CHECK ("kind" IN ('script', 'caption', 'clip_caption'));

CREATE TABLE "feature_interest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "feature" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_interest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "feature_interest_user_id_feature_key" ON "feature_interest"("user_id", "feature");
-- Server-only table: row level security on, no policies (the app connects as the service role).
ALTER TABLE "feature_interest" ENABLE ROW LEVEL SECURITY;
