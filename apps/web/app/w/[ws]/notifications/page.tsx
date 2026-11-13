import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/notifications-page";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";
import { NOTIFICATION_FILTERS, loadNotifications, type NotificationFilter } from "@/lib/notifications";

export const metadata: Metadata = { title: "Notifications" };

/** NT-01 Notifications. A person's notifications follow them across workspaces. */
export default async function NotificationsRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<{ filter?: string }> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { session, workspace } = await requireWorkspace(ws);
  const filter: NotificationFilter = (NOTIFICATION_FILTERS as readonly string[]).includes(sp.filter ?? "") ? (sp.filter as NotificationFilter) : "all";
  const d = await loadNotifications(session.user.id, filter);
  const base = hrefForWorkspace(workspace)("NT-01");
  return <NotificationsPage d={d} filter={filter} hrefs={{ filter: (f) => (f === "all" ? base : `${base}?filter=${f}`), preferences: "/account/notifications" }} />;
}
