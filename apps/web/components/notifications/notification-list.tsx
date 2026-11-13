"use client";

import { Bubble, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { markReadAction } from "@/lib/actions/notifications";
import type { NotificationRow } from "@/lib/notifications";

/** Notification rows (NT-01 list and the top-bar panel). Opening one marks it read, then follows its link. */
export function NotificationList({ rows, compact, onOpen }: { rows: NotificationRow[]; compact?: boolean; onOpen?: () => void }) {
  const router = useRouter();
  return (
    <ul className={cn("m-0 list-none overflow-hidden p-0", compact ? "rounded-[18px] border border-border" : "rounded-card border border-border bg-surface-1 shadow-card")}>
      {rows.map((n) => (
        <li key={n.id} className="border-b border-border last:border-b-0">
          <button
            type="button"
            onClick={async () => {
              onOpen?.();
              if (n.unread) await markReadAction(n.id);
              if (n.href) router.push(n.href);
              else router.refresh();
            }}
            className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-text hover:bg-surface-2"
          >
            <span aria-hidden="true" className={cn("size-2 flex-none rounded-full", n.unread ? "bg-accent" : "bg-transparent")} />
            <Bubble icon={n.icon} tone={n.tone} size={compact ? 32 : 36} />
            <span className="min-w-0 grow">
              <span className="block text-sm font-semibold">{n.title}{n.unread ? <span className="sr-only"> (unread)</span> : null}</span>
              {n.body ? <span className="block text-[13px] text-muted">{n.body}</span> : null}
            </span>
            <span className="flex-none self-start pt-0.5 text-[12.5px] text-muted">{n.ago}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
