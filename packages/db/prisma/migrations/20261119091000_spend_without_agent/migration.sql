-- Work started by hand (processing an upload, rendering a clip) has no agent, but its spend is recorded the same way.
ALTER TABLE "agent_spend" ALTER COLUMN "agent_id" DROP NOT NULL;
