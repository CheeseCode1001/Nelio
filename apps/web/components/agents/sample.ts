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
