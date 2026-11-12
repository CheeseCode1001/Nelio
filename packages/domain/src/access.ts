import { accessFor, type Access, type Capability } from "./permissions";
import {
  matrixRoleForOrg,
  matrixRoleForWorkspace,
  type AccountType,
  type MatrixRole,
  type OrgRole,
  type Surface,
  type WorkspaceRole,
} from "./roles";

/** Everything the server knows about the signed-in person. Built once per request from the database. */
export interface Actor {
  userId: string;
  isPlatformAdmin: boolean;
  isContentOwner: boolean;
  orgs: { orgId: string; role: OrgRole; accountType: AccountType }[];
  workspaces: { workspaceId: string; orgId: string; role: WorkspaceRole }[];
}

/** The object being acted on. Every tenant-scoped check names the workspace's owning organization. */
export interface WorkspaceRef {
  workspaceId: string;
  orgId: string;
}

export type Decision =
  | { allowed: true; access: Exclude<Access, "-">; as: MatrixRole }
  | { allowed: false; reason: "not_a_member" | "role_forbidden" };

/**
 * Which matrix column the actor holds for a workspace, or null when they have no path to it.
 * Organization owners and admins reach every workspace of their own organization.
 * Everyone else needs an explicit workspace membership (the "A" scope in B §6).
 */
export function roleInWorkspace(actor: Actor, ws: WorkspaceRef): MatrixRole | null {
  const org = actor.orgs.find((o) => o.orgId === ws.orgId);
  if (org) return matrixRoleForOrg(org.role, org.accountType);
  const m = actor.workspaces.find((w) => w.workspaceId === ws.workspaceId && w.orgId === ws.orgId);
  return m ? matrixRoleForWorkspace(m.role) : null;
}

/** Isolation rule AC-02: no membership path means the workspace does not exist for this actor. */
export function canSeeWorkspace(actor: Actor, ws: WorkspaceRef): boolean {
  return roleInWorkspace(actor, ws) !== null;
}

export function can(actor: Actor, capability: Capability, ws: WorkspaceRef): Decision {
  const as = roleInWorkspace(actor, ws);
  if (!as) return { allowed: false, reason: "not_a_member" };
  const access = accessFor(as, capability);
  if (access === "-") return { allowed: false, reason: "role_forbidden" };
  return { allowed: true, access, as };
}

/** Capabilities that B §6 gives to agencies only, whatever the role. */
const AGENCY_ONLY: Capability[] = ["workspace.create_client", "team.manage_client_approvers"];

/** Organization-level capabilities (billing, team, client workspaces). */
export function canInOrg(actor: Actor, capability: Capability, orgId: string): Decision {
  const org = actor.orgs.find((o) => o.orgId === orgId);
  if (!org) return { allowed: false, reason: "not_a_member" };
  const as = matrixRoleForOrg(org.role, org.accountType);
  if (AGENCY_ONLY.includes(capability) && org.accountType !== "agency") return { allowed: false, reason: "role_forbidden" };
  const access = accessFor(as, capability);
  if (access === "-") return { allowed: false, reason: "role_forbidden" };
  return { allowed: true, access, as };
}

export function canAsPlatformAdmin(actor: Actor, capability: Capability): boolean {
  return actor.isPlatformAdmin && accessFor("PA", capability) !== "-";
}

export function canAsContentOwner(actor: Actor, capability: Capability): boolean {
  return actor.isContentOwner && accessFor("CO", capability) !== "-";
}

/** Surfaces listed in the account menu (B §2). */
export function surfacesFor(actor: Actor): Surface[] {
  const s: Surface[] = [];
  const operator = actor.orgs.length > 0 || actor.workspaces.some((w) => w.role !== "client_approver");
  if (operator) s.push("operator");
  if (actor.orgs.some((o) => o.accountType === "agency")) s.push("agency");
  if (actor.workspaces.some((w) => w.role === "client_approver")) s.push("client_portal");
  if (actor.isContentOwner) s.push("creator_portal");
  if (actor.isPlatformAdmin) s.push("admin");
  return s;
}

/** Top-bar visibility (handoff §9, audit G-02): credits hidden for Editor and Viewer, Pause hidden for Viewer. */
export function topBarVisibility(role: MatrixRole): { credits: boolean; pause: boolean } {
  return { credits: accessFor(role, "billing.view") !== "-", pause: accessFor(role, "agent.pause_resume") !== "-" };
}

/** Where a person lands after signing in. */
export function homeSurface(actor: Actor): Surface | "onboarding" {
  const s = surfacesFor(actor);
  return s.includes("operator") ? "operator" : (s[0] ?? "onboarding");
}
