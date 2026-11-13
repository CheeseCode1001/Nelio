import type { ActivityData } from "@/lib/activity";

/** The Activity boards' sample data (APP-03), for the development preview only. */
export const ACTIVITY_SAMPLE: ActivityData = {
  items: [
    { runId: "r1", title: "Transcribing podcast_ep12.mp4", sub: "Budget Shorts · Balanced · started 14:02", bucket: "running", chip: { label: "running", tone: "blue", icon: "refresh" }, agent: { color: "lime", shape: "circle" } },
    { runId: "r2", title: "Scene detection", sub: "Budget Shorts · waiting for transcript", bucket: "queued", chip: { label: "queued", tone: "neutral", icon: "clock" }, agent: { color: "lime", shape: "circle" } },
    { runId: "r3", title: "Render “Jollof on a budget”", sub: "Needs 40 credits, 24 left in this agent’s budget", bucket: "blocked", chip: { label: "blocked · budget", tone: "warn", icon: "lock" }, agent: { color: "pink", shape: "blob" } },
    { runId: "r4", title: "“5 budgeting myths” → Acme client", sub: "Waiting for client approval", bucket: "needs_approval", chip: { label: "needs approval", tone: "warn", icon: "alert" }, agent: { color: "blue", shape: "square" } },
    { runId: "r5", title: "Upload to Instagram", sub: "Finished, but Instagram hasn’t confirmed yet. No retry until we know.", bucket: "running", chip: { label: "confirming", tone: "blue", icon: "clock" }, agent: { color: "pink", shape: "blob" } },
    { runId: "r6", title: "Upload to YouTube", sub: "Daily upload limit reached. Retry after 00:00 UTC.", bucket: "failed", chip: { label: "failed", tone: "err", icon: "x" }, agent: { color: "lime", shape: "circle" } },
    { runId: "r7", title: "Render “Stop budgeting like this”", sub: "36 credits used (estimated 40) · 4 refunded", bucket: "done", chip: { label: "done", tone: "ok", icon: "check" }, agent: { color: "lime", shape: "circle" } },
  ],
  counts: { all: 7, running: 2, queued: 3, blocked: 1, needs_approval: 4, failed: 1, done: 1 },
  panel: {
    runId: "r1", agentName: "Budget Shorts", agent: { color: "lime", shape: "circle" }, number: 128, started: "Started 14:02 · triggered by schedule", estimated: 52, used: 18, canPause: true,
    steps: [
      { title: "Upload & check file", detail: "2.1 GB · 48 min", status: "done", icon: "check", tone: "lime" },
      { title: "Transcribe", detail: "Balanced quality", status: "running", icon: "refresh", tone: "blue" },
      { title: "Detect scenes", detail: "Waits for transcript", status: "queued", icon: "clock", tone: "neutral" },
      { title: "Rank moments", detail: "Nelio AI", status: "queued", icon: "clock", tone: "neutral" },
      { title: "Render previews", detail: "3 clips", status: "queued", icon: "clock", tone: "neutral" },
    ],
    log: [{ at: "14:02", title: "Budget Shorts · run #128", detail: "triggered by schedule" }, { at: "14:02", title: "Upload & check file", detail: "Budget Shorts · run #128" }],
  },
  hasAgents: true,
  workspacePaused: false,
};
