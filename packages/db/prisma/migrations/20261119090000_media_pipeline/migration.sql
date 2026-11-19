-- Milestone 4: media assets, transcripts, clip candidates, clip projects and revisions, renders, brand kits, posts;
-- runs gain a type and may work on a video or render without an agent.
-- CreateEnum
CREATE TYPE "media_status" AS ENUM ('uploading', 'uploaded', 'processing', 'ready', 'failed', 'blocked');

-- CreateEnum
CREATE TYPE "rights_basis" AS ENUM ('own', 'permission', 'license');

-- CreateEnum
CREATE TYPE "processing_quality" AS ENUM ('fast', 'balanced', 'high');

-- CreateEnum
CREATE TYPE "run_kind" AS ENUM ('agent', 'process', 'render');

-- CreateEnum
CREATE TYPE "render_status" AS ENUM ('queued', 'rendering', 'ready', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "post_state" AS ENUM ('draft', 'needs_approval', 'scheduled', 'published', 'failed');

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "caption_language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "processing_quality" "processing_quality" NOT NULL DEFAULT 'balanced';

-- AlterTable
ALTER TABLE "agent_runs" ADD COLUMN     "asset_id" UUID,
ADD COLUMN     "kind" "run_kind" NOT NULL DEFAULT 'agent',
ADD COLUMN     "render_id" UUID,
ALTER COLUMN "agent_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "duration_sec" DOUBLE PRECISION,
    "width" INTEGER,
    "height" INTEGER,
    "storage_key" TEXT NOT NULL,
    "multipart_id" TEXT,
    "status" "media_status" NOT NULL DEFAULT 'uploading',
    "status_text" TEXT,
    "rights" "rights_basis" NOT NULL,
    "rights_note" TEXT,
    "rights_ref" TEXT NOT NULL,
    "quality" "processing_quality" NOT NULL DEFAULT 'balanced',
    "language" TEXT NOT NULL DEFAULT 'en',
    "estimated_credits" INTEGER NOT NULL DEFAULT 0,
    "actual_credits" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "quality" "processing_quality" NOT NULL,
    "words" JSONB NOT NULL,
    "scenes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clip_candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clip_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clip_projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "hook" TEXT NOT NULL,
    "caption_style" TEXT NOT NULL DEFAULT 'bold_pop',
    "format" TEXT NOT NULL DEFAULT '9:16',
    "brand_kit_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clip_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "label" TEXT,
    "hook" TEXT NOT NULL,
    "caption_style" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT '1080p',
    "status" "render_status" NOT NULL DEFAULT 'queued',
    "status_text" TEXT,
    "estimated_credits" INTEGER NOT NULL,
    "actual_credits" INTEGER NOT NULL DEFAULT 0,
    "storage_key" TEXT,
    "size_bytes" BIGINT,
    "run_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "renders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_kits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "caption_font" TEXT NOT NULL DEFAULT 'Plus Jakarta Sans',
    "caption_style" TEXT NOT NULL DEFAULT 'bold_pop',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "brand_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "render_id" UUID,
    "agent_id" UUID,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "state" "post_state" NOT NULL DEFAULT 'draft',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_key_key" ON "media_assets"("storage_key");

-- CreateIndex
CREATE INDEX "media_assets_workspace_id_created_at_idx" ON "media_assets"("workspace_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_id_workspace_id_key" ON "media_assets"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_workspace_id_rights_ref_key" ON "media_assets"("workspace_id", "rights_ref");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_asset_id_key" ON "transcripts"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_asset_id_workspace_id_key" ON "transcripts"("asset_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "clip_candidates_asset_id_rank_key" ON "clip_candidates"("asset_id", "rank");

-- CreateIndex
CREATE INDEX "clip_projects_workspace_id_updated_at_idx" ON "clip_projects"("workspace_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "clip_projects_id_workspace_id_key" ON "clip_projects"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_revisions_project_id_number_key" ON "project_revisions"("project_id", "number");

-- CreateIndex
CREATE INDEX "renders_workspace_id_created_at_idx" ON "renders"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "brand_kits_workspace_id_idx" ON "brand_kits"("workspace_id");

-- CreateIndex
CREATE INDEX "posts_workspace_id_state_updated_at_idx" ON "posts"("workspace_id", "state", "updated_at");

-- CreateIndex
CREATE INDEX "agent_runs_asset_id_idx" ON "agent_runs"("asset_id");

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_workspace_id_org_id_fkey" FOREIGN KEY ("workspace_id", "org_id") REFERENCES "workspaces"("id", "org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_asset_id_workspace_id_fkey" FOREIGN KEY ("asset_id", "workspace_id") REFERENCES "media_assets"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clip_candidates" ADD CONSTRAINT "clip_candidates_asset_id_workspace_id_fkey" FOREIGN KEY ("asset_id", "workspace_id") REFERENCES "media_assets"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clip_projects" ADD CONSTRAINT "clip_projects_asset_id_workspace_id_fkey" FOREIGN KEY ("asset_id", "workspace_id") REFERENCES "media_assets"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "clip_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renders" ADD CONSTRAINT "renders_project_id_workspace_id_fkey" FOREIGN KEY ("project_id", "workspace_id") REFERENCES "clip_projects"("id", "workspace_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_render_id_fkey" FOREIGN KEY ("render_id") REFERENCES "renders"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------- Rules the schema language cannot express
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_numbers_check"
  CHECK ("size_bytes" >= 0 AND ("duration_sec" IS NULL OR "duration_sec" >= 0) AND "estimated_credits" >= 0 AND "actual_credits" >= 0);
ALTER TABLE "clip_candidates" ADD CONSTRAINT "clip_candidates_range_check"
  CHECK ("start_ms" >= 0 AND "end_ms" > "start_ms" AND "score" BETWEEN 0 AND 100 AND "rank" > 0);
ALTER TABLE "clip_projects" ADD CONSTRAINT "clip_projects_range_check" CHECK ("start_ms" >= 0 AND "end_ms" > "start_ms" AND "version" > 0);
ALTER TABLE "renders" ADD CONSTRAINT "renders_credits_check" CHECK ("estimated_credits" >= 0 AND "actual_credits" >= 0);
-- An agent run has an agent; processing and render runs name what they work on.
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_kind_check"
  CHECK (("kind" = 'agent' AND "agent_id" IS NOT NULL)
      OR ("kind" = 'process' AND "asset_id" IS NOT NULL)
      OR ("kind" = 'render' AND "render_id" IS NOT NULL));
-- One default brand kit per workspace.
CREATE UNIQUE INDEX "brand_kits_one_default" ON "brand_kits" ("workspace_id") WHERE "is_default";

-- Row-level security on every new table with no policies: the browser keys can read and write nothing.
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transcripts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clip_candidates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clip_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_revisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "renders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "brand_kits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
    END IF;
  END LOOP;
END $$;
