/**
 * Screen registry: every operator-app screen with its route (B §5) and the milestone that builds it
 * (DESIGN_TRACEABILITY.md §5). Navigation, the command palette and the "not built yet" stand-in all read this.
 */
export const CURRENT_MILESTONE = 2;

// Read from the host app's environment (Next.js inlines NEXT_PUBLIC_* values at build time).
declare const process: { env: Record<string, string | undefined> };

export type Scope = "workspace" | "org" | "account";

export interface ScreenDef {
  id: string;
  title: string;
  /** Path after /w/[ws], /org/[org] or /account. Empty string is the scope's root. */
  path: string;
  scope: Scope;
  milestone: number;
}

const s = (id: string, title: string, scope: Scope, path: string, milestone: number): ScreenDef => ({ id, title, scope, path, milestone });

export const SCREENS = [
  s("APP-01", "Command Center", "workspace", "/home", 2),
  s("APP-02", "Strategist", "workspace", "/strategist", 3),
  s("APP-03", "Activity", "workspace", "/activity", 3),
  s("APP-04", "Agents", "workspace", "/agents", 3),
  s("APP-06", "Create agent", "workspace", "/agents/new", 3),
  s("NT-01", "Notifications", "workspace", "/notifications", 3),
  s("CL-01", "Clipping Studio", "workspace", "/media", 4),
  s("CL-02", "Upload", "workspace", "/media/upload", 4),
  s("CL-05", "Exports", "workspace", "/exports", 4),
  s("CS-01", "Content Studio", "workspace", "/content", 4),
  s("ST-06", "Brand kits", "workspace", "/settings/brand-kits", 4),
  s("ST-07", "AI & processing", "workspace", "/settings/ai", 4),
  s("LI-01", "Licensing", "workspace", "/licensing", 5),
  s("LI-04", "My licenses", "workspace", "/licensing/mine", 5),
  s("PB-01", "Calendar", "workspace", "/calendar", 6),
  s("PB-02", "Drafts", "workspace", "/drafts", 6),
  s("IN-01", "Connections", "workspace", "/connections", 6),
  s("ST-08", "Integration status", "workspace", "/settings/integrations", 6),
  s("PB-04", "Approvals", "workspace", "/approvals", 7),
  s("AN-01", "Analytics", "workspace", "/analytics", 7),
  s("ST-05", "Workspace members", "workspace", "/settings/members", 7),
  s("ST-10", "Settings", "workspace", "/settings", 9),
  s("AG-01", "Agency hub", "org", "", 7),
  s("AG-02", "Clients", "org", "/clients", 7),
  s("AG-04", "Team", "org", "/team", 7),
  s("AG-06", "Audit log", "org", "/audit", 7),
  s("BI-01", "Billing & usage", "org", "/billing", 8),
  s("BI-02", "Plans", "org", "/plans", 8),
  s("BI-05", "Spend limits", "org", "/limits", 8),
  s("ST-01", "Profile", "account", "/profile", 9),
  s("ST-02", "Security", "account", "/security", 9),
  s("ST-03", "Appearance", "account", "/appearance", 2),
  s("ST-04", "Notification preferences", "account", "/notifications", 9),
  s("ST-09", "Privacy & data", "account", "/privacy", 9),
] as const satisfies readonly ScreenDef[];

export type ScreenId = (typeof SCREENS)[number]["id"];

export function screen(id: ScreenId): ScreenDef {
  return SCREENS.find((x) => x.id === id)!;
}

export const isBuilt = (def: ScreenDef) => def.milestone <= CURRENT_MILESTONE;

/** Absolute href for a screen. Org screens need the organization slug. */
export function hrefFor(id: ScreenId, ctx: { ws: string; org: string }): string {
  const d = screen(id);
  if (d.scope === "workspace") return `/w/${ctx.ws}${d.path}`;
  if (d.scope === "org") return `/org/${ctx.org}${d.path}`;
  return `/account${d.path}`;
}

/** Finds the registered screen for a path inside a scope ("/drafts", "/settings/ai"), longest match first. */
export function screenForPath(scope: Scope, path: string): ScreenDef | null {
  const p = path === "/" ? "" : path.replace(/\/$/, "");
  const candidates = SCREENS.filter((x) => x.scope === scope && (p === x.path || p.startsWith(`${x.path}/`)));
  return candidates.sort((a, b) => b.path.length - a.path.length)[0] ?? null;
}

/**
 * Traceability decision T-5: until its milestone, an unbuilt screen is hidden from navigation behind a flag.
 * The flag is on in development so the whole navigation can be reviewed, and off in production builds.
 */
export function showUnbuiltInNav(): boolean {
  const flag = process.env.NEXT_PUBLIC_NAV_SHOW_UNBUILT;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export interface NavItem {
  id: ScreenId;
  icon: string;
  label: string;
  /** Bottom-tab key on mobile (B §3.2). */
  tab?: "home" | "activity" | "approvals" | "calendar";
}

/** Sidebar groups (B §3.1, generator NAV). */
export const NAV_GROUPS: { label: string | null; agencyOnly?: boolean; items: NavItem[] }[] = [
  { label: null, items: [{ id: "APP-01", icon: "home", label: "Command Center", tab: "home" }, { id: "APP-03", icon: "activity", label: "Activity", tab: "activity" }] },
  { label: "AI", items: [{ id: "APP-02", icon: "spark", label: "Strategist" }, { id: "APP-04", icon: "bot", label: "Agents" }] },
  { label: "Create", items: [{ id: "CL-01", icon: "scissors", label: "Clipping Studio" }, { id: "CS-01", icon: "pen", label: "Content Studio" }, { id: "CL-05", icon: "download", label: "Exports" }] },
  { label: "Publish", items: [{ id: "PB-01", icon: "calendar", label: "Calendar", tab: "calendar" }, { id: "PB-02", icon: "file", label: "Drafts" }, { id: "PB-04", icon: "check", label: "Approvals", tab: "approvals" }] },
  { label: "Grow", items: [{ id: "AN-01", icon: "chart", label: "Analytics" }, { id: "LI-01", icon: "shield", label: "Licensing" }] },
  { label: "Workspace", items: [{ id: "IN-01", icon: "link", label: "Connections" }, { id: "ST-06", icon: "palette", label: "Brand kits" }, { id: "ST-10", icon: "gear", label: "Settings" }] },
  { label: "Agency", agencyOnly: true, items: [{ id: "AG-01", icon: "grid", label: "Agency hub" }, { id: "AG-02", icon: "users", label: "Clients" }, { id: "AG-04", icon: "users", label: "Team" }, { id: "AG-06", icon: "list", label: "Audit log" }] },
];
