import "server-only";
import { db } from "@nelio/db";
import type { IconName, Tone } from "@nelio/ui";

export const NOTIFICATION_FILTERS = ["all", "approvals", "publishing", "licenses", "billing", "security"] as const;
export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];
export const NOTIFICATION_FILTER_LABEL: Record<NotificationFilter, string> = { all: "All", approvals: "Approvals", publishing: "Publishing", licenses: "Licenses", billing: "Billing", security: "Security" };

/** Icon and colour per category, as on the NT-01 board. Agent notices (budgets, failed steps) use the bot. */
export const CATEGORY_LOOK: Record<string, { icon: IconName; tone: Tone }> = {
  approvals: { icon: "check", tone: "ok" },
  publishing: { icon: "film", tone: "lime" },
  licenses: { icon: "shield", tone: "blue" },
  billing: { icon: "wallet", tone: "warn" },
  security: { icon: "search", tone: "ai" },
  agents: { icon: "bot", tone: "warn" },
};

export interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  unread: boolean;
  ago: string;
  icon: IconName;
  tone: Tone;
}

/** "2m", "10m", "1h", "3h", "1d", "2w" (NT-01 board). */
export function shortAgo(at: Date, now = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - at.getTime()) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 14 ? `${d}d` : `${Math.floor(d / 7)}w`;
}

export async function loadNotifications(userId: string, filter: NotificationFilter, take = 50): Promise<{ rows: NotificationRow[]; unread: number; total: number }> {
  const client = db();
  const now = new Date();
  const [rows, unread, total] = await Promise.all([
    client.notification.findMany({
      where: { userId, ...(filter === "all" ? {} : { category: filter }) },
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, title: true, body: true, href: true, readAt: true, createdAt: true, category: true },
    }),
    client.notification.count({ where: { userId, readAt: null } }),
    client.notification.count({ where: { userId } }),
  ]);
  return {
    rows: rows.map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.href, unread: !n.readAt, ago: shortAgo(n.createdAt, now), ...(CATEGORY_LOOK[n.category] ?? CATEGORY_LOOK.agents!) })),
    unread,
    total,
  };
}

export async function unreadCount(userId: string): Promise<number> {
  return db().notification.count({ where: { userId, readAt: null } });
}
