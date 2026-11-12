/**
 * Roles (handoff §9, B §6).
 * Stored roles: organization {owner, admin}; workspace {manager, editor, viewer, client_approver}.
 * "Content owner" is a CreatorProfile on the user; "platform admin" is a separate global flag.
 */
export const ACCOUNT_TYPES = ["creator", "business", "agency"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ORG_ROLES = ["owner", "admin"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const WORKSPACE_ROLES = ["manager", "editor", "viewer", "client_approver"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** The ten columns of the permission matrix in B §6. */
export const MATRIX_ROLES = ["CR", "BO", "AO", "AA", "WM", "ED", "AV", "CA", "CO", "PA"] as const;
export type MatrixRole = (typeof MATRIX_ROLES)[number];

export const ROLE_LABELS: Record<OrgRole | WorkspaceRole | "content_owner" | "platform_admin", string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  editor: "Editor",
  viewer: "Viewer",
  client_approver: "Client approver",
  content_owner: "Content owner",
  platform_admin: "Platform admin",
};

export function matrixRoleForOrg(role: OrgRole, accountType: AccountType): MatrixRole {
  if (role === "admin") return "AA";
  return accountType === "agency" ? "AO" : accountType === "business" ? "BO" : "CR";
}

export function matrixRoleForWorkspace(role: WorkspaceRole): MatrixRole {
  return ({ manager: "WM", editor: "ED", viewer: "AV", client_approver: "CA" } as const)[role];
}

/** Surfaces a person can enter (B §2). */
export type Surface = "operator" | "agency" | "client_portal" | "creator_portal" | "admin";
