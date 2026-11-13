import type { ScreenId } from "@nelio/config";
import type { AgentColor, IconName, Platform, Tone } from "@nelio/ui";

/** Setup checklist items (ON-05 widget). The order is the board's order. */
export const CHECKLIST = [
  { key: "upload", icon: "upload", label: "Upload your first video", screen: "CL-02" },
  { key: "connect", icon: "link", label: "Connect an account", screen: "IN-01" },
  { key: "brandkit", icon: "palette", label: "Add a brand kit", screen: "ST-06" },
  { key: "agent", icon: "bot", label: "Create your first agent", screen: "APP-06" },
  { key: "notifications", icon: "bell", label: "Choose notifications", screen: "ST-04" },
] as const satisfies readonly { key: string; icon: IconName; label: string; screen: ScreenId }[];
export type ChecklistKey = (typeof CHECKLIST)[number]["key"];

export interface AgentCardData {
  id: string;
  name: string;
  color: AgentColor;
  shape: "circle" | "square" | "blob" | "pill";
  state: { label: string; tone: Tone; icon: IconName };
  line: string;
  meta: string;
  budget: { used: number; limit: number };
  running: boolean;
}

export interface NeedItem {
  key: string;
  title: string;
  sub: string;
  icon: IconName;
  tone: Tone;
  action: { label: string; screen: ScreenId; primary?: boolean };
}

export interface LiveItem {
  key: string;
  title: string;
  sub: string;
  agent: { color: AgentColor; shape: "circle" | "square" | "blob" | "pill" };
  status: { label: string; tone: Tone; icon: IconName };
}

export type StripState =
  | { kind: "paused"; by: string; at: string }
  | { kind: "trial"; daysLeft: number }
  | { kind: "pastdue"; daysLeft: number };

/** Everything APP-01 shows. Sections are null or empty when their data does not exist yet. */
export interface CommandCenterData {
  firstName: string;
  greeting: "morning" | "afternoon" | "evening";
  hero: { ready: number; drafts: number; videos: number; shorts: { caption: string; bg: string }[] } | null;
  stats: { agentsActive: number; agentsPaused: number; waiting: number; waitingClients: number; published: number; creditsUsed: number; creditBudget: number } | null;
  checklist: { done: ChecklistKey[]; dismissed: boolean };
  agents: AgentCardData[];
  pipeline: { ideas: number; drafts: number; needsApproval: number; scheduled: number; published: number } | null;
  needs: NeedItem[];
  live: LiveItem[];
  strip: StripState | null;
}

export type CommandCenterState = "filled" | "empty" | "loading" | "paused" | "trial" | "pastdue";

/** Filled vs Empty is decided by data, never by a flag: no agents, nothing waiting and no stats is a first run. */
export function isFirstRun(d: CommandCenterData): boolean {
  return d.agents.length === 0 && d.needs.length === 0 && d.stats === null && d.hero === null;
}

export function greetingFor(date: Date, timeZone: string): CommandCenterData["greeting"] {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(date));
  return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
}

export type { Platform };
