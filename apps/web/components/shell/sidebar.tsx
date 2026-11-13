"use client";

import { NavItemContent, Sticker, cn, navItemClass, type NavIconName } from "@nelio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeFromPath, resolveNav, screenHref } from "./nav-model";
import type { ShellProps } from "./types";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Operator sidebar (generator `sidebar`, B §3.1). Full width at 1280 px and up, an icon rail between 768 and
 * 1279 px (B §3.3), and hidden below 768 px where the bottom tab bar takes over.
 */
export function Sidebar(p: ShellProps) {
  const pathname = usePathname();
  const groups = resolveNav({ ...p, active: p.active ?? activeFromPath(pathname, p.current.slug) });
  const credits = p.extras.credits;
  const pct = credits ? Math.round((credits.used / Math.max(1, credits.allocation)) * 100) : 0;
  return (
    <nav aria-label="Main" className="hidden flex-none flex-col gap-0.5 border-r border-border bg-surface-1 px-3 py-[18px] md:flex md:w-[76px] xl:w-[250px] xl:px-3.5">
      {groups.map((g) => (
        <div key={g.label ?? "top"} className="flex flex-col gap-0.5">
          {g.label ? (
            <div className="px-3.5 pb-1.5 pt-4 text-[11px] font-extrabold uppercase tracking-[0.09em] text-muted max-xl:sr-only">{g.label}</div>
          ) : null}
          {g.items.map((it) => (
            <Link key={it.id} href={it.href} aria-current={it.active ? "page" : undefined} title={it.label} className={cn(navItemClass(it.active), "max-xl:justify-center max-xl:px-0")}>
              <NavItemContent icon={it.icon as NavIconName} label={it.label} active={it.active} labelClassName="max-xl:sr-only" />
              {it.badge ? (
                <span className="ml-auto box-border inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-ai px-[7px] text-xs font-extrabold text-outline max-xl:absolute max-xl:right-1 max-xl:top-0.5 max-xl:ml-0 max-xl:h-[18px] max-xl:min-w-[18px] max-xl:px-1 max-xl:text-[11px]">
                  {it.badge}
                  <span className="sr-only"> waiting</span>
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ))}
      {credits ? (
        <div className="relative mt-5 hidden flex-col gap-2 rounded-[22px] bg-lime p-4 text-outline xl:flex">
          <div className="absolute -top-3 right-2.5">
            <Sticker fill="yellow" rotate={6} size={13}>{credits.planLabel}</Sticker>
          </div>
          <div className="flex justify-between text-[12.5px] font-extrabold">
            <span>Credits used</span>
            <span>{fmt(credits.used)} / {fmt(credits.allocation)}</span>
          </div>
          <div role="progressbar" aria-label="Credits used" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-[rgba(11,11,20,0.15)]">
            <div className="h-full bg-outline" style={{ width: `${pct}%` }} />
          </div>
          <Link href={screenHref(p, "BI-01")} className="text-[13px] font-extrabold text-outline no-underline hover:text-outline">Billing &amp; usage →</Link>
        </div>
      ) : null}
    </nav>
  );
}
