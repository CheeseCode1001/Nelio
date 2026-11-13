import { ButtonLink, EmptyState, Motion, PageHead, Sk, SkRows, cn } from "@nelio/ui";
import Link from "next/link";
import { NOTIFICATION_FILTERS, NOTIFICATION_FILTER_LABEL, type NotificationFilter, type NotificationRow } from "@/lib/notifications";
import { MarkAllReadButton } from "./mark-all-read";
import { NotificationList } from "./notification-list";
import { PushCard } from "./push-card";

export interface NotificationsData { rows: NotificationRow[]; unread: number; total: number }

/** NT-01 Notifications: Filled, Empty (all caught up) and a filtered view; Loading is NotificationsLoading. */
export function NotificationsPage({ d, filter, hrefs, preview }: { d: NotificationsData; filter: NotificationFilter; hrefs: { filter: (f: NotificationFilter) => string; preferences: string }; preview?: "ask" | "prompt" }) {
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <PageHead
          title="Notifications"
          actions={
            <>
              <MarkAllReadButton disabled={d.unread === 0} />
              <ButtonLink href={hrefs.preferences} variant="ghost" icon="gear">Preferences</ButtonLink>
            </>
          }
        />
        <nav aria-label="Filter notifications" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
          {NOTIFICATION_FILTERS.map((f) => (
            <Link key={f} href={hrefs.filter(f)} scroll={false} aria-current={f === filter ? "page" : undefined} className={cn("tap-target inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", f === filter ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}>
              {NOTIFICATION_FILTER_LABEL[f]}
            </Link>
          ))}
        </nav>
      </div>
      <div data-enter="" className="flex flex-col gap-4">
        {d.rows.length ? (
          <NotificationList rows={d.rows} />
        ) : (
          <EmptyState
            illustration="notifications"
            title={filter === "all" ? "You’re all caught up" : `No ${NOTIFICATION_FILTER_LABEL[filter].toLowerCase()} notifications`}
            text="We’ll let you know when something needs you: approvals, finished renders, expiring licenses and spending alerts."
            actions={<ButtonLink href={hrefs.preferences} variant="secondary">Notification settings</ButtonLink>}
          />
        )}
        <PushCard preview={preview} />
      </div>
    </Motion>
  );
}

export function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex items-end justify-between gap-4"><Sk w={240} h={36} /><Sk w={260} h={44} r={22} /></div>
      <Sk w={460} h={48} r={24} className="max-w-full" />
      <SkRows n={6} />
      <span className="sr-only" role="status">Loading notifications…</span>
    </div>
  );
}
