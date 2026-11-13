-- Onboarding step 2 (ON-02): goals, niche and main audience per workspace.
ALTER TABLE "workspaces" ADD COLUMN "goals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "workspaces" ADD COLUMN "niche" TEXT;
ALTER TABLE "workspaces" ADD COLUMN "audience" TEXT;
