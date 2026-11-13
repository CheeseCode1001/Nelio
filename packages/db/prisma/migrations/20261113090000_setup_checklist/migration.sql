-- Remember when a workspace dismissed the setup checklist on the Command Center (ON-05).
ALTER TABLE "workspaces" ADD COLUMN "setup_checklist_dismissed_at" TIMESTAMPTZ(6);
