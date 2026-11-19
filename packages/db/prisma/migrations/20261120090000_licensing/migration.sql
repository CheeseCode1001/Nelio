-- Milestone 5: licensing and the creator portal (LI-01..LI-10).
-- CreateEnum
CREATE TYPE "listing_status" AS ENUM ('draft', 'listed', 'suspended');

-- CreateEnum
CREATE TYPE "license_type" AS ENUM ('free', 'private', 'paid');

-- CreateEnum
CREATE TYPE "agreement_status" AS ENUM ('requested', 'active', 'declined', 'revoked', 'expired', 'canceled');

-- AlterEnum
ALTER TYPE "post_state" ADD VALUE 'on_hold';

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "listing_status" "listing_status" NOT NULL DEFAULT 'draft',
ADD COLUMN     "niche" TEXT,
ADD COLUMN     "suspended_reason" TEXT;

-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN     "creator_video_id" UUID,
ADD COLUMN     "license_agreement_id" UUID;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "rights_flag" TEXT;

-- CreateTable
CREATE TABLE "creator_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT,
    "url" TEXT,
    "external_id" TEXT,
    "status" "verification_status" NOT NULL DEFAULT 'pending',
    "method" TEXT,
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "failure_reason" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "creator_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_terms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "license_type" "license_type" NOT NULL DEFAULT 'free',
    "allowed_uses" TEXT[] DEFAULT ARRAY['clips']::TEXT[],
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commercial" BOOLEAN NOT NULL DEFAULT false,
    "attribution" TEXT NOT NULL DEFAULT '',
    "edits" TEXT[] DEFAULT ARRAY['captions', 'crops', 'trims']::TEXT[],
    "expires_months" INTEGER DEFAULT 12,
    "has_third_party" BOOLEAN NOT NULL DEFAULT false,
    "third_party_note" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "license_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "duration_sec" DOUBLE PRECISION,
    "storage_key" TEXT NOT NULL,
    "multipart_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploading',
    "excluded" BOOLEAN NOT NULL DEFAULT false,
    "exclude_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "creator_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "type" "license_type" NOT NULL,
    "status" "agreement_status" NOT NULL,
    "terms" JSONB NOT NULL,
    "terms_version" INTEGER NOT NULL,
    "request_note" TEXT,
    "decision_note" TEXT,
    "requested_by_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "decided_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "revoke_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "license_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creator_channels_creator_id_idx" ON "creator_channels"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_channels_platform_external_id_key" ON "creator_channels"("platform", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "license_terms_creator_id_key" ON "license_terms"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_videos_storage_key_key" ON "creator_videos"("storage_key");

-- CreateIndex
CREATE INDEX "creator_videos_creator_id_created_at_idx" ON "creator_videos"("creator_id", "created_at");

-- CreateIndex
CREATE INDEX "license_agreements_workspace_id_status_idx" ON "license_agreements"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "license_agreements_creator_id_status_idx" ON "license_agreements"("creator_id", "status");

-- CreateIndex
CREATE INDEX "license_agreements_status_expires_at_idx" ON "license_agreements"("status", "expires_at");

-- CreateIndex
CREATE INDEX "media_assets_license_agreement_id_idx" ON "media_assets"("license_agreement_id");

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_license_agreement_id_fkey" FOREIGN KEY ("license_agreement_id") REFERENCES "license_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_channels" ADD CONSTRAINT "creator_channels_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_terms" ADD CONSTRAINT "license_terms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_videos" ADD CONSTRAINT "creator_videos_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_agreements" ADD CONSTRAINT "license_agreements_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_agreements" ADD CONSTRAINT "license_agreements_workspace_id_org_id_fkey" FOREIGN KEY ("workspace_id", "org_id") REFERENCES "workspaces"("id", "org_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- One open licence (requested or active) per creator and workspace.
CREATE UNIQUE INDEX "license_agreements_open_key" ON "license_agreements"("creator_id", "workspace_id") WHERE "status" IN ('requested', 'active');
-- A licensed video always records the licence it came under.
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_license_rights_check" CHECK ("license_agreement_id" IS NULL OR "rights" = 'license');
ALTER TABLE "license_agreements" ADD CONSTRAINT "license_agreements_not_paid_check" CHECK ("type" <> 'paid');

-- Server-only tables: row level security on, no policies (the app connects as the service role).
ALTER TABLE "creator_channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "license_terms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "creator_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "license_agreements" ENABLE ROW LEVEL SECURITY;
