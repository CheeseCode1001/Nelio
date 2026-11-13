import type { AgentDetailData } from "@/lib/agent-detail";
import type { AgentsPageData } from "@/lib/agents";
import { SAMPLE_FILLED } from "@/components/command-center/sample";

/** The Agents boards' sample data (APP-04), for the development preview only. */
const cards: AgentsPageData["cards"] = SAMPLE_FILLED.agents.map((a, i) => ({ ...a, stateName: (["active", "paused", "budget_reached"] as const)[i] ?? "active" }));

export const AGENTS_SAMPLE: AgentsPageData = {
  cards,
  rows: [
    { id: "ag_budget", name: "Budget Shorts", color: "lime", shape: "circle", mode: { label: "Assisted", tone: "blue", icon: "check" }, state: { label: "active", tone: "blue", icon: "zap" }, thisWeek: "3 drafts", budget: { used: 180, limit: 300 }, nextRun: "Today 15:00" },
    { id: "ag_podcast", name: "Podcast Clipper", color: "blue", shape: "square", mode: { label: "Manual", tone: "neutral", icon: "pen" }, state: { label: "paused", tone: "neutral", icon: "pause" }, thisWeek: "—", budget: { used: 0, limit: 200 }, nextRun: "—" },
    { id: "ag_recipe", name: "Recipe Reels", color: "pink", shape: "blob", mode: { label: "Autonomous", tone: "ai", icon: "zap" }, state: { label: "budget reached", tone: "warn", icon: "alert" }, thisWeek: "2 posts", budget: { used: 300, limit: 300 }, nextRun: "Mon 00:00" },
  ],
  counted: 3,
  limit: 5,
  planLabel: "Creator Pro",
  atLimit: false,
  upgrade: { label: "Business", agents: 10 },
  workspacePaused: false,
};

export const AGENTS_SAMPLE_EMPTY: AgentsPageData = { ...AGENTS_SAMPLE, cards: [], rows: [], counted: 0 };
/** The Limit board keeps "3 of 5" in the header and shows the banner (board copy, 5 of 5). */
export const AGENTS_SAMPLE_LIMIT: AgentsPageData = { ...AGENTS_SAMPLE, counted: 5, atLimit: true };


/** The Agent detail boards' sample data (APP-05), for the development preview only. */
export const AGENT_DETAIL_SAMPLE: AgentDetailData = {
  id: "ag_budget",
  name: "Budget Shorts",
  goal: "I clip your podcast into 3 shorts a week and wait for your approval.",
  color: "lime",
  shape: "circle",
  state: "active",
  stateChip: { label: "active", tone: "blue", icon: "zap" },
  modeChip: { label: "Assisted", tone: "blue", icon: "check" },
  createdBy: "Ada",
  runsOn: "runs on schedule",
  workspacePaused: false,
  policy: { goal: "Grow Shorts with budgeting tips for students", schedule: "mwf_1800", brandRules: "Friendly, no slang. Captions in brand yellow. Always credit licensed creators.", maxPostsPerDay: 1, maxPostsPerWeek: 3 },
  budget: {
    weeklyBudget: 300, perRunLimit: 60, used: 180, resets: "Resets Monday 00:00",
    days: [{ label: "Mon", credits: 132 }, { label: "Tue", credits: 48 }, { label: "Wed", credits: 0 }, { label: "Thu", credits: 0 }, { label: "Fri", credits: 0 }, { label: "Sat", credits: 0 }, { label: "Sun", credits: 0 }],
    estimated: 192, actual: 180, refunded: 12,
  },
  runs: [
    { id: "r128", number: 128, started: "Today 14:02", steps: "2 of 5", credits: "52 → 18 so far", result: { label: "running", tone: "blue", icon: "refresh" }, reason: null },
    { id: "r127", number: 127, started: "Mon 18:00", steps: "5 of 5", credits: "48 → 44", result: { label: "done", tone: "ok", icon: "check" }, reason: null },
    { id: "r126", number: 126, started: "Fri 18:00", steps: "3 of 5", credits: "40 → 12", result: { label: "blocked", tone: "warn", icon: "alert" }, reason: "license" },
    { id: "r125", number: 125, started: "Wed 18:00", steps: "5 of 5", credits: "45 → 45", result: { label: "done", tone: "ok", icon: "check" }, reason: null },
  ],
};
