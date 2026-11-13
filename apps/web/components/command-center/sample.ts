import type { CommandCenterData, CommandCenterState } from "./model";

/**
 * Sample data for reviewing APP-01 states in development only (handoff §3: boards use
 * docs/design/H_handoff/sample-data.json). Never shown in a real workspace.
 */
export const SAMPLE_FILLED: CommandCenterData = {
  firstName: "Ada",
  greeting: "morning",
  hero: {
    ready: 3,
    drafts: 9,
    videos: 2,
    shorts: [
      { caption: "5 MYTHS", bg: "#9B7BFF" },
      { caption: "STOP THIS", bg: "#FFD43B" },
      { caption: "RENT HACK", bg: "#59D8FF" },
    ],
  },
  stats: { agentsActive: 2, agentsPaused: 1, waiting: 4, waitingClients: 2, published: 12, creditsUsed: 760, creditBudget: 1000 },
  checklist: { done: ["upload", "connect"], dismissed: false },
  agents: [
    { id: "ag_budget", name: "Budget Shorts", color: "lime", shape: "circle", state: { label: "active", tone: "blue", icon: "zap" }, line: "Clips your podcast into 3 shorts a week", meta: "Next run today 15:00", budget: { used: 180, limit: 300 }, running: true },
    { id: "ag_podcast", name: "Podcast Clipper", color: "blue", shape: "square", state: { label: "paused", tone: "neutral", icon: "pause" }, line: "Paused by you on Monday", meta: "Resume re-checks budget & licenses", budget: { used: 0, limit: 200 }, running: false },
    { id: "ag_recipe", name: "Recipe Reels", color: "pink", shape: "blob", state: { label: "budget reached", tone: "warn", icon: "alert" }, line: "Autonomous · Instagram only", meta: "Resets Monday 00:00", budget: { used: 300, limit: 300 }, running: false },
  ],
  pipeline: { ideas: 6, drafts: 9, needsApproval: 4, scheduled: 7, published: 12 },
  needs: [
    { key: "approvals", title: "4 posts waiting for approval", sub: "Oldest: 2 days", icon: "check", tone: "warn", action: { label: "Review", screen: "PB-04", primary: true } },
    { key: "ig-expiry", title: "Instagram sign-in expires in 2 days", sub: "7 scheduled posts depend on it", icon: "link", tone: "err", action: { label: "Reconnect", screen: "IN-01" } },
    { key: "license", title: "License from Chef Kemi ends in 5 days", sub: "4 drafts use it", icon: "shield", tone: "blue", action: { label: "View", screen: "LI-04" } },
    { key: "budget", title: "Recipe Reels paused: budget reached", sub: "300 of 300 credits this week", icon: "wallet", tone: "warn", action: { label: "Fix", screen: "BI-05" } },
  ],
  live: [
    { key: "l1", title: "Transcribing podcast_ep12.mp4", sub: "Budget Shorts · Balanced · step 2 of 5", agent: { color: "lime", shape: "circle" }, status: { label: "running", tone: "blue", icon: "refresh" } },
    { key: "l2", title: "Render finished: “5 budgeting myths”", sub: "36 credits (estimated 40)", agent: { color: "lime", shape: "circle" }, status: { label: "done", tone: "ok", icon: "check" } },
    { key: "l3", title: "Confirming upload with Instagram", sub: "We’ll know in a moment", agent: { color: "pink", shape: "blob" }, status: { label: "confirming", tone: "blue", icon: "clock" } },
  ],
  strip: null,
};

export const SAMPLE_EMPTY: CommandCenterData = {
  firstName: "Ada",
  greeting: "morning",
  hero: null,
  stats: null,
  checklist: { done: [], dismissed: false },
  agents: [],
  pipeline: null,
  needs: [],
  live: [],
  strip: null,
};

export function sampleFor(state: Exclude<CommandCenterState, "loading">): CommandCenterData {
  switch (state) {
    case "empty":
      return SAMPLE_EMPTY;
    case "paused":
      return { ...SAMPLE_FILLED, strip: { kind: "paused", by: "Ada", at: "14:02" } };
    case "trial":
      return { ...SAMPLE_FILLED, strip: { kind: "trial", daysLeft: 2 } };
    case "pastdue":
      return { ...SAMPLE_FILLED, strip: { kind: "pastdue", daysLeft: 6 } };
    default:
      return SAMPLE_FILLED;
  }
}

/** The shell extras the boards show: 1,240 credits left, 4 approvals, 3 unread notifications. */
export const SAMPLE_EXTRAS = {
  credits: { left: 1240, used: 760, allocation: 2000, planLabel: "Pro" },
  approvalsWaiting: 4,
  unreadNotifications: 3,
  pauseAvailable: true,
};
