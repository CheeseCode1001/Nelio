"use client";

import { topBarVisibility } from "@nelio/domain";
import {
  CardTitle, Chip, DropdownMenu, EmptyState, Icon, IconButton, Logo, NavItemContent, PersonAvatar, ResponsiveDialog, Row, RowList, Small, navItemClass, useIsMobile,
} from "@nelio/ui";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { CommandPalette } from "./command-palette";
import { screenHref } from "./nav-model";
import type { ShellAccount, ShellProps, ShellWorkspace } from "./types";

const AVATAR_COLORS = ["#FFD43B", "#59D8FF", "#22C55E", "#FF4FB8", "#FF7A2F", "#9B7BFF"];
const colorFor = (s: string) => AVATAR_COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]!;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

export const workspaceKindLabel = (w: Pick<ShellWorkspace, "kind" | "accountType">) =>
  w.kind === "client" ? "Client workspace" : w.accountType === "agency" ? "Agency workspace" : w.accountType === "business" ? "Business workspace" : "Creator workspace";

// ------------------------------------------------------------------ APP-07 Workspace switcher
function WorkspaceSwitcher({ open, onOpenChange, current, workspaces, preview }: { open: boolean; onOpenChange: (o: boolean) => void; current: ShellWorkspace; workspaces: ShellWorkspace[]; preview?: boolean }) {
  const [q, setQ] = useState("");
  const found = useMemo(() => workspaces.filter((w) => w.name.toLowerCase().includes(q.trim().toLowerCase())), [q, workspaces]);
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Switch workspace" description="Choose one of the workspaces you belong to." maxWidth={500} top={80}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="ws-search" className="text-[13px] font-bold text-text">Search</label>
        <input id="ws-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workspaces" autoComplete="off" className="box-border min-h-12 w-full rounded-input border-2 border-border bg-surface-1 px-4 py-3 text-sm text-text placeholder:text-muted" />
      </div>
      {found.length === 0 ? (
        <EmptyState illustration="search" width={180} title={`No workspace called “${q.trim()}”`} text="You only see workspaces you’re a member of." />
      ) : (
        <>
          <RowList>
            {found.map((w) => (
              <Row key={w.workspaceId} title={w.name}>
                <Link href={preview ? "#" : `/w/${w.slug}/home`} onClick={() => onOpenChange(false)} aria-current={w.workspaceId === current.workspaceId ? "page" : undefined} className="flex items-center gap-3 px-4 py-3 text-text no-underline hover:text-text">
                  <PersonAvatar initials={w.name.slice(0, 1).toUpperCase()} color={colorFor(w.name)} size={40} />
                  <span className="min-w-0 grow">
                    <span className="block text-sm font-semibold text-text">{w.name}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{workspaceKindLabel(w)}</span>
                  </span>
                  {w.workspaceId === current.workspaceId ? <Chip tone="blue">current</Chip> : null}
                </Link>
              </Row>
            ))}
          </RowList>
          <Small>You only see workspaces you’re a member of.</Small>
        </>
      )}
    </ResponsiveDialog>
  );
}

// ------------------------------------------------------------------ SY-08 Account menu
function AccountMenuBody({ account, current, onNavigate, settingsHref, appearanceHref }: { account: ShellAccount; current: ShellWorkspace; onNavigate: () => void; settingsHref: string | null; appearanceHref: string }) {
  const rule = <div className="my-2 h-px bg-border" />;
  const item = (href: string, icon: Parameters<typeof NavItemContent>[0]["icon"], label: string, active = false) => (
    <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={navItemClass(active)}>
      <NavItemContent icon={icon} label={label} active={active} />
    </Link>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <PersonAvatar initials={initials(account.fullName)} color="#FF7A2F" size={48} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle size={16}>{account.fullName}</CardTitle>
          <Small className="truncate">{account.email}</Small>
        </div>
      </div>
      {rule}
      <Small className="font-extrabold">Switch surface</Small>
      {account.surfaces.includes("operator") ? item(`/w/${current.slug}/home`, "home", `Operator app · ${current.name}`, true) : null}
      {account.surfaces.includes("agency") && account.agencySlug ? item(`/org/${account.agencySlug}`, "grid", `Agency · ${current.orgName}`) : null}
      {account.surfaces.includes("client_portal") && account.portalSlug ? item(`/portal/${account.portalSlug}`, "check", "Client Portal") : null}
      {account.surfaces.includes("creator_portal") ? item("/creator", "shield", "Creator Portal") : null}
      {account.surfaces.includes("admin") ? item("/admin", "flag", "Platform admin") : null}
      {rule}
      {settingsHref ? item(settingsHref, "gear", "Account settings") : null}
      {item(appearanceHref, "sun", "Appearance")}
      <form action={signOutAction}>
        <button type="submit" className={navItemClass(false)}>
          <NavItemContent icon="arrowr" label="Sign out" active={false} />
        </button>
      </form>
    </div>
  );
}

function AccountMenu({ account, current, settingsHref, appearanceHref }: { account: ShellAccount; current: ShellWorkspace; settingsHref: string | null; appearanceHref: string }) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  const trigger = (
    <button type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={mobile ? () => setOpen(true) : undefined} className="tap-target cursor-pointer rounded-full border-0 bg-transparent p-0">
      <PersonAvatar initials={initials(account.fullName)} color="#FF7A2F" size={mobile ? 40 : 44} />
    </button>
  );
  const body = <AccountMenuBody account={account} current={current} onNavigate={() => setOpen(false)} settingsHref={settingsHref} appearanceHref={appearanceHref} />;
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

// ------------------------------------------------------------------ Top bar
// No display class here: each pill is hidden below 768 px and shown with md:flex / md:inline-flex.
const PILL = "box-border min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm no-underline";

/**
 * Operator top bar (generator `topbar` on desktop, `mtopbar` below 768 px).
 * Role rule G-02: credits hidden for Editor and Viewer, Pause all hidden for Viewer.
 * Credits, Pause all and notifications render only when their data exists (ShellExtras).
 */
export function TopBar(p: ShellProps) {
  const [switcher, setSwitcher] = useState(false);
  const [palette, setPalette] = useState(false);
  const [paletteKey, setPaletteKey] = useState(0);
  const openPalette = (open: boolean) => {
    if (open) setPaletteKey((k) => k + 1);
    setPalette(open);
  };
  const vis = topBarVisibility(p.role);
  const { credits, unreadNotifications, pauseAvailable } = p.extras;
  const settingsHref = p.showUnbuilt ? screenHref(p, "ST-01") : null;
  const appearanceHref = p.preview ? "#ST-03" : "/account/appearance";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => {
          if (!o) setPaletteKey((k) => k + 1);
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bell =
    unreadNotifications !== null ? (
      <Link href={screenHref(p, "NT-01")} aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"} className="relative box-border inline-flex size-11 flex-none items-center justify-center rounded-full border-2 border-border bg-surface-1 text-text no-underline hover:text-text">
        <Icon name="bell" size={18} />
        {unreadNotifications ? <span aria-hidden="true" className="absolute right-2 top-[7px] size-2.5 rounded-full border-2 border-surface-1 bg-ai" /> : null}
      </Link>
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-[5] flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-3 md:static md:gap-3 md:px-5 xl:flex-wrap">
        <Link href={screenHref(p, "APP-01")} aria-label="Command Center" className="tap-target hidden no-underline md:inline-flex">
          <Logo size={22} />
        </Link>
        <span className="hidden w-1.5 md:inline" />
        <button type="button" onClick={() => setSwitcher(true)} aria-haspopup="dialog" className="box-border flex min-h-11 min-w-0 max-w-[170px] cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-surface-1 py-1 pl-1 pr-3 text-text md:max-w-none md:gap-2.5 md:py-[5px] md:pl-[5px] md:pr-3.5">
          <PersonAvatar initials={p.current.name.slice(0, 1).toUpperCase()} color="#FFD43B" size={30} className="flex-none md:size-8" />
          <span className="flex min-w-0 flex-col text-left">
            <span className="truncate whitespace-nowrap text-sm font-bold">{p.current.name}</span>
            <span className="hidden whitespace-nowrap text-[11px] text-muted lg:block">{workspaceKindLabel(p.current)}</span>
          </span>
          <Icon name="chevd" size={16} />
          <span className="sr-only">Switch workspace</span>
        </button>
        <button type="button" onClick={() => openPalette(true)} className={`${PILL} hidden flex-[0_1_380px] cursor-pointer border-2 border-border bg-surface-2 text-left text-muted xl:flex`}>
          <Icon name="search" size={16} />
          <span className="grow">Search or ask Nelio AI</span>
          <kbd className="rounded-lg border border-border bg-surface-1 px-2 py-0.5 font-body text-xs text-muted">Ctrl K</kbd>
        </button>
        <span className="grow" />
        {credits && vis.credits ? (
          <Link href={screenHref(p, "BI-01")} className={`${PILL} hidden bg-lime-tint font-extrabold text-lime-text hover:text-lime-text md:inline-flex`}>
            <Icon name="zap" size={16} />
            {credits.left.toLocaleString("en-US")} left
          </Link>
        ) : null}
        {pauseAvailable && vis.pause ? (
          <Link href={p.preview ? "#SY-09" : `/w/${p.current.slug}/home?pause=1`} className={`${PILL} hidden border-2 border-border font-bold text-text hover:text-text md:inline-flex`}>
            <Icon name="pause" size={16} />
            Pause all
          </Link>
        ) : null}
        <IconButton icon="search" label="Search" onClick={() => openPalette(true)} className="xl:hidden" />
        {bell}
        <AccountMenu account={p.account} current={p.current} settingsHref={settingsHref} appearanceHref={appearanceHref} />
      </header>
      <WorkspaceSwitcher open={switcher} onOpenChange={setSwitcher} current={p.current} workspaces={p.workspaces} preview={p.preview} />
      <CommandPalette key={paletteKey} open={palette} onOpenChange={openPalette} current={p.current} workspaces={p.workspaces} showUnbuilt={p.showUnbuilt} preview={p.preview} />
    </>
  );
}
