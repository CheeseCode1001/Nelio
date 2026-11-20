-- Creators (no workspace) can ask to be told when payouts open (LI-10).
ALTER TABLE "feature_interest" ALTER COLUMN "org_id" DROP NOT NULL;
ALTER TABLE "feature_interest" ALTER COLUMN "workspace_id" DROP NOT NULL;
