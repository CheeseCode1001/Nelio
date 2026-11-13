import type { AccountType, MatrixRole, Surface } from "@nelio/domain";
import type { ScreenId } from "@nelio/config";

export interface ShellWorkspace {
  workspaceId: string;
  slug: string;
  name: string;
  kind: "primary" | "client";
  accountType: AccountType;
  orgSlug: string;
  orgName: string;
}

export interface ShellAccount {
  fullName: string;
  email: string;
  surfaces: Surface[];
  agencySlug?: string | null;
  portalSlug?: string | null;
}

/**
 * Data that later milestones supply. Each is null until its source exists, and the control that shows it
 * is then not rendered at all (never a made-up number): credits (Milestone 8), approvals count and
 * notifications (Milestones 3 and 7), Pause all (Milestone 3).
 */
export interface ShellExtras {
  credits: { left: number; used: number; allocation: number; planLabel: string } | null;
  approvalsWaiting: number | null;
  unreadNotifications: number | null;
  pauseAvailable: boolean;
  /** The workspace is paused (SY-09): the top bar offers Resume instead of Pause all. */
  paused?: boolean;
}

export interface ShellProps {
  current: ShellWorkspace;
  workspaces: ShellWorkspace[];
  account: ShellAccount;
  role: MatrixRole;
  extras: ShellExtras;
  showUnbuilt: boolean;
  /** Screen the page belongs to. When omitted, it is worked out from the address. */
  active?: ScreenId;
  /** Development previews render inert links. */
  preview?: boolean;
}
