"use client";

import { CardTitle, DropdownMenu, Icon, Logo, NavItemContent, PersonAvatar, ResponsiveDialog, Small, cn, navItemClass, useIsMobile, type NavIconName } from "@nelio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { OfflineStatus } from "@/components/pwa/pwa";
import { signOutAction } from "@/lib/actions/auth";

export const CREATOR_NAV: { id: string; href: string; icon: NavIconName; label: string }[] = [
  { id: "LI-05", href: "/creator", icon: "home", label: "Overview" },
  { id: "LI-06", href: "/creator/verify", icon: "shield", label: "Verification" },
  { id: "LI-07", href: "/creator/terms", icon: "file", label: "Licensing terms" },
  { id: "LI-08", href: "/creator/usage", icon: "eye", label: "Usage" },
  { id: "LI-09", href: "/creator/revocations", icon: "x", label: "Revocations" },
  { id: "LI-10", href: "/creator/payouts", icon: "wallet", label: "Payouts" },
];

export interface CreatorShellProps {
  name: string;
  email: string;
  initials: string;
  userId: string | null;
  unread: number;
  /** Other surfaces this person can switch to (an operator workspace they also belong to). */
  operatorHref: string | null;
  /** Preview: which item is active, and inert links. */
  active?: string;
  preview?: boolean;
}

function AccountBody({ p, onNavigate }: { p: CreatorShellProps; onNavigate: () => void }) {
  const item = (href: string, icon: NavIconName, label: string, active = false) => (
    <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={navItemClass(active)}>
      <NavItemContent icon={icon} label={label} active={active} />
    </Link>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <PersonAvatar initials={p.initials} color="#FF4FB8" size={48} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle size={16}>{p.name}</CardTitle>
          <Small className="truncate">{p.email}</Small>
        </div>
      </div>
      <div className="my-2 h-px bg-border" />
      <Small className="font-extrabold">Switch surface</Small>
      {item("/creator", "shield", "Creator Portal", true)}
      {p.operatorHref ? item(p.operatorHref, "home", "Operator app") : null}
      <div className="my-2 h-px bg-border" />
      {item("/account/appearance", "sun", "Appearance")}
      <form action={signOutAction}>
        <button type="submit" className={navItemClass(false)}>
          <NavItemContent icon="arrowr" label="Sign out" active={false} />
        </button>
      </form>
    </div>
  );
}

function AccountMenu({ p }: { p: CreatorShellProps }) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  const trigger = (
    <button type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={mobile ? () => setOpen(true) : undefined} className="tap-target cursor-pointer rounded-full border-0 bg-transparent p-0">
      <PersonAvatar initials={p.initials} color="#FF4FB8" size={mobile ? 40 : 44} />
    </button>
  );
  const body = <AccountBody p={p} onNavigate={() => setOpen(false)} />;
  if (mobile) {
    return (
      <>
        {trigger}
        <ResponsiveDialog open={open} onOpenChange={setOpen} title="Account" description="Switch surface or sign out.">{body}</ResponsiveDialog>
      </>
    );
  }
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={10} className="z-50 box-border w-[340px] rounded-sheet border border-border bg-surface-1 p-4 shadow-menu outline-none">{body}</DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const activeFor = (pathname: string) => {
  const hit = [...CREATOR_NAV].reverse().find((n) => (n.href === "/creator" ? pathname === "/creator" : pathname.startsWith(n.href)));
  return hit?.id ?? "LI-05";
};

/**
 * Creator Portal frame (LI-05 to LI-10): logo with the pink "Creator Portal" sticker, notifications and account
 * on top; a side list on desktop and tablet; a sideways-scrolling tab row on phones (boards *-Mobile).
 */
export function CreatorShell({ children, ...p }: CreatorShellProps & { children: ReactNode }) {
  const pathname = usePathname();
  const active = p.active ?? activeFor(pathname);
  const href = (h: string, id: string) => (p.preview ? `#${id}` : h);
  return (
    <div className="flex min-h-dvh grow flex-col">
      <header className="sticky top-0 z-[5] flex items-center gap-2.5 border-b border-border bg-surface-1 px-4 py-3 md:static md:gap-3.5 md:px-5">
        <Link href={href("/creator", "LI-05")} aria-label="Creator Portal home" className="tap-target inline-flex no-underline">
          <Logo size={22} />
        </Link>
        <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-outline bg-pink px-3 py-1.5 text-xs font-extrabold text-outline shadow-[3px_3px_0_var(--n-ol)] md:px-3.5">
          <Icon name="shield" size={14} strokeWidth={2.4} />
          Creator Portal
        </span>
        <span className="grow" />
        <NotificationBell href={href("/creator", "LI-05")} initialUnread={p.unread} userId={p.userId} preview={p.preview ? [] : undefined} />
        <AccountMenu p={p} />
      </header>
      <OfflineStatus />
      <div className="flex grow flex-col md:flex-row md:items-stretch">
        <nav aria-label="Creator portal" className="flex-none border-b border-border bg-surface-1 md:w-[250px] md:border-b-0 md:border-r md:px-3.5 md:py-[18px]">
          <ul className="m-0 flex list-none gap-1 overflow-x-auto px-3 py-2 [scroll-snap-type:x_proximity] md:flex-col md:gap-0.5 md:overflow-visible md:p-0">
            {CREATOR_NAV.map((n) => {
              const on = n.id === active;
              return (
                <li key={n.id} className="flex-none [scroll-snap-align:start]">
                  <Link href={href(n.href, n.id)} aria-current={on ? "page" : undefined} className={cn(navItemClass(on), "whitespace-nowrap")}>
                    <NavItemContent icon={n.icon} label={n.label} active={on} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main id="main" className="box-border min-w-0 flex-1 p-4 md:p-7">
          <div className="mx-auto flex max-w-[1260px] flex-col gap-4 md:gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
