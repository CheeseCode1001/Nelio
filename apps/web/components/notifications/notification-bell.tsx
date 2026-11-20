"use client";

import { Icon, Popover, useIsMobile } from "@nelio/ui";
import Link from "next/link";
import { useCallback, useState } from "react";
import { markAllReadAction, recentNotificationsAction } from "@/lib/actions/notifications";
import type { NotificationRow } from "@/lib/notifications";
import { toast } from "@/components/feedback/toaster";
import { useRouter } from "next/navigation";
import { useLive } from "@/lib/use-live";
import { NotificationList } from "./notification-list";

const BELL = "relative box-border inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface-1 text-text no-underline hover:text-text";

/**
 * Top-bar bell. Desktop opens the NT-01 Panel (latest four, Mark all read, See all); phones go to the page.
 * The unread dot updates live from the person's private channel ("user:<id>").
 */
export function NotificationBell({ href, initialUnread, userId, preview }: { href: string; initialUnread: number; userId: string | null; preview?: NotificationRow[] }) {
  const mobile = useIsMobile();
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[] | null>(preview ? preview.slice(0, 4) : null);

  const load = useCallback(async () => {
    if (preview) return;
    const r = await recentNotificationsAction();
    if (r.ok) { setRows(r.rows); setUnread(r.unread); }
  }, [preview]);
  const router = useRouter();
  useLive(userId, "notification", (payload) => {
    setUnread((n) => n + 1);
    if (open) void load();
    // A live notification also arrives as a toast (Delight board), e.g. "Clip rendered" with a way to open it.
    const p = (payload ?? {}) as { title?: string; body?: string | null; href?: string | null; category?: string };
    if (!p.title) return;
    const opts = { description: p.body ?? undefined, action: p.href ? { label: "Open", onClick: () => router.push(p.href!) } : undefined };
    if (/couldn.t|failed|blocked|expired/i.test(p.title)) toast.error(p.title, opts);
    else if (p.category === "publishing") toast.success(p.title, opts);
    else toast.info(p.title, opts);
  });

  const label = unread ? `Notifications, ${unread} unread` : "Notifications";
  const dot = unread ? <span aria-hidden="true" className="absolute right-2 top-[7px] size-2.5 rounded-full border-2 border-surface-1 bg-ai" /> : null;

  if (mobile) {
    return <Link href={href} aria-label={label} className={BELL}><Icon name="bell" size={18} />{dot}</Link>;
  }
  return (
    <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (o) void load(); }}>
      <Popover.Trigger aria-label={label} className={BELL}><Icon name="bell" size={18} />{dot}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={10} className="z-50 box-border flex w-[380px] flex-col gap-3 rounded-sheet border border-border bg-surface-1 p-4 shadow-menu outline-none">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-display text-base font-bold text-text">Notifications</h2>
            <button type="button" disabled={!unread} onClick={async () => { if (!preview) await markAllReadAction(); setUnread(0); setRows((r) => r?.map((x) => ({ ...x, unread: false })) ?? r); }} className="tap-target cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-accent-text disabled:cursor-default disabled:text-muted">
              Mark all read
            </button>
          </div>
          {rows === null ? (
            <p className="m-0 py-6 text-center text-sm text-muted">Loading…</p>
          ) : rows.length ? (
            <NotificationList rows={rows} compact onOpen={() => setOpen(false)} />
          ) : (
            <p className="m-0 py-6 text-center text-sm text-muted">You’re all caught up.</p>
          )}
          <Link href={href} onClick={() => setOpen(false)} className="box-border flex min-h-11 items-center justify-center rounded-full border-2 border-border text-sm font-bold text-text no-underline hover:text-text">See all</Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
