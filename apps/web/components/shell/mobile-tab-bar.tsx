"use client";

import { NavItemContent, ResponsiveDialog, TabIcon, cn, navItemClass, type NavIconName, type TabName } from "@nelio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { activeFromPath, resolveNav } from "./nav-model";
import type { ShellProps } from "./types";

/**
 * Mobile bottom tab bar (B §3.2): Home, Activity, Approvals, Calendar, More. Tabs whose screens are not
 * available yet are left out; More opens a bottom sheet with the rest of the sidebar (MB-05).
 */
export function MobileTabBar(p: ShellProps) {
  const [more, setMore] = useState(false);
  const pathname = usePathname();
  const groups = resolveNav({ ...p, active: p.active ?? activeFromPath(pathname, p.current.slug) });
  const all = groups.flatMap((g) => g.items);
  // Board order (B §3.2): Home, Activity, Approvals, Calendar, More.
  const ORDER = ["home", "activity", "approvals", "calendar"] as const;
  const tabs = all.filter((it) => it.tab).sort((a, b) => ORDER.indexOf(a.tab!) - ORDER.indexOf(b.tab!));
  const rest = groups.map((g) => ({ ...g, items: g.items.filter((it) => !it.tab) })).filter((g) => g.items.length);
  const moreActive = rest.some((g) => g.items.some((it) => it.active));

  const tab = (key: TabName, label: string, active: boolean, badge: number | null, el: (cls: string, inner: React.ReactNode) => React.ReactNode) =>
    el(
      cn("relative flex min-h-[52px] flex-1 flex-col items-center gap-1 border-0 bg-transparent pt-2.5 text-[11px] no-underline", active ? "font-extrabold text-accent-text" : "font-semibold text-muted"),
      <>
        <span aria-hidden="true" className={cn("absolute left-1/2 top-0 h-[3px] w-7 -translate-x-1/2 rounded-b-[3px]", active ? "bg-accent" : "bg-transparent")} />
        <span className="relative inline-flex">
          <TabIcon name={key} active={active} />
          {badge ? (
            <span className="absolute -right-[9px] -top-[3px] box-border inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface-1 bg-ai px-[5px] text-[11px] font-extrabold text-outline">
              {badge}
              <span className="sr-only"> waiting</span>
            </span>
          ) : null}
        </span>
        {label}
      </>,
    );

  return (
    <>
      <nav aria-label="Main" className="sticky bottom-0 z-[5] mt-auto flex border-t border-border bg-surface-1 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:hidden">
        {tabs.map((it) =>
          tab(it.tab!, it.tab === "home" ? "Home" : it.label, it.active, it.badge, (cls, inner) => (
            <Link key={it.id} href={it.href} aria-current={it.active ? "page" : undefined} className={cls}>{inner}</Link>
          )),
        )}
        {rest.length
          ? tab("more", "More", moreActive || more, null, (cls, inner) => (
              <button key="more" type="button" onClick={() => setMore(true)} aria-haspopup="dialog" className={cls}>{inner}</button>
            ))
          : null}
      </nav>
      <ResponsiveDialog open={more} onOpenChange={setMore} title="More" description="Everything else in this workspace.">
        <div className="flex flex-col gap-0.5">
          {rest.map((g) => (
            <div key={g.label ?? "top"} className="flex flex-col gap-0.5">
              {g.label ? <div className="px-3.5 pb-1.5 pt-3 text-[11px] font-extrabold uppercase tracking-[0.09em] text-muted">{g.label}</div> : null}
              {g.items.map((it) => (
                <Link key={it.id} href={it.href} onClick={() => setMore(false)} aria-current={it.active ? "page" : undefined} className={navItemClass(it.active)}>
                  <NavItemContent icon={it.icon as NavIconName} label={it.label} active={it.active} />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </ResponsiveDialog>
    </>
  );
}
