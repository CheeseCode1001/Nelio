"use client";

import type { WorkspaceSummary } from "@nelio/db";
import type { Surface } from "@nelio/domain";
import {
  CardTitle, DropdownMenu, Chip, EmptyState, Icon, Logo, NavItemContent, PersonAvatar, ResponsiveDialog, Row, RowList, Small, navItemClass, useIsMobile,
} from "@nelio/ui";
import Link from "next/link";
import { useMemo, useState } from "react";
import { signOutAction } from "@/lib/actions/auth";

const AVATAR_COLORS = ["#FFD43B", "#59D8FF", "#22C55E", "#FF4FB8", "#FF7A2F", "#9B7BFF"];
const colorFor = (s: string) => AVATAR_COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]!;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

export const workspaceKindLabel = (w: Pick<WorkspaceSummary, "kind" | "accountType">) =>
  w.kind === "client" ? "Client workspace" : w.accountType === "agency" ? "Agency workspace" : w.accountType === "business" ? "Business workspace" : "Creator workspace";

// ------------------------------------------------------------------ APP-07 Workspace switcher
function WorkspaceSwitcher({ open, onOpenChange, current, workspaces }: { open: boolean; onOpenChange: (o: boolean) => void; current: WorkspaceSummary; workspaces: WorkspaceSummary[] }) {
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
                <Link href={`/w/${w.slug}/home`} onClick={() => onOpenChange(false)} aria-current={w.workspaceId === current.workspaceId ? "page" : undefined} className="flex items-center gap-3 px-4 py-3 text-text no-underline hover:text-text">
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
export interface AccountInfo {
  fullName: string;
  email: string;
  surfaces: Surface[];
  agencySlug?: string | null;
  portalSlug?: string | null;
}

function AccountMenuBody({ account, current, onNavigate }: { account: AccountInfo; current: WorkspaceSummary; onNavigate: () => void }) {
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
      <form action={signOutAction}>
        <button type="submit" className={navItemClass(false)}>
          <NavItemContent icon="arrowr" label="Sign out" active={false} />
        </button>
      </form>
    </div>
  );
}

function AccountMenu({ account, current }: { account: AccountInfo; current: WorkspaceSummary }) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  const trigger = (
    <button type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={mobile ? () => setOpen(true) : undefined} className="cursor-pointer rounded-full border-0 bg-transparent p-0">
      <PersonAvatar initials={initials(account.fullName)} color="#FF7A2F" size={mobile ? 40 : 44} />
    </button>
  );
  if (mobile) {
    return (
      <>
        {trigger}
        <ResponsiveDialog open={open} onOpenChange={setOpen} title="Account" description="Switch surface or sign out.">
          <AccountMenuBody account={account} current={current} onNavigate={() => setOpen(false)} />
        </ResponsiveDialog>
      </>
    );
  }
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={10} className="z-50 box-border w-[340px] rounded-sheet border border-border bg-surface-1 p-4 shadow-menu outline-none">
          <AccountMenuBody account={account} current={current} onNavigate={() => setOpen(false)} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ------------------------------------------------------------------ Top bar
/**
 * Operator top bar (generator `topbar` / `mtopbar`). Milestone 1 ships the workspace switcher and the account menu.
 * Search, credits, Pause all and notifications join in Milestones 2 and 3; until then they are not rendered
 * rather than shown as dead controls (traceability decision T-5).
 */
export function TopBar({ current, workspaces, account }: { current: WorkspaceSummary; workspaces: WorkspaceSummary[]; account: AccountInfo }) {
  const [switcher, setSwitcher] = useState(false);
  return (
    <header className="sticky top-0 z-[5] flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-3 md:static md:flex-wrap md:gap-3 md:px-5">
      <Link href={`/w/${current.slug}/home`} aria-label="Command Center" className="hidden no-underline md:inline-flex">
        <Logo size={22} />
      </Link>
      <span className="hidden w-1.5 md:inline" />
      <button type="button" onClick={() => setSwitcher(true)} aria-haspopup="dialog" className="box-border flex min-h-11 min-w-0 max-w-[170px] cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-surface-1 py-1 pl-1 pr-3 text-text md:max-w-none md:gap-2.5 md:py-[5px] md:pl-[5px] md:pr-3.5">
        <PersonAvatar initials={current.name.slice(0, 1).toUpperCase()} color="#FFD43B" size={30} className="md:size-8" />
        <span className="flex min-w-0 flex-col text-left">
          <span className="truncate text-sm font-bold">{current.name}</span>
          <span className="hidden text-[11px] text-muted md:block">{workspaceKindLabel(current)}</span>
        </span>
        <Icon name="chevd" size={16} />
        <span className="sr-only">Switch workspace</span>
      </button>
      <span className="grow" />
      <AccountMenu account={account} current={current} />
      <WorkspaceSwitcher open={switcher} onOpenChange={setSwitcher} current={current} workspaces={workspaces} />
    </header>
  );
}
