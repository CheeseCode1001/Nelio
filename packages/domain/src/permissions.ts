import type { MatrixRole } from "./roles";

/**
 * Permission matrix, transcribed cell for cell from B_INFORMATION_ARCHITECTURE.md §6.
 * F full · A only in assigned workspaces · O own items only · V view only ·
 * P per-platform decision on assigned items · R request only · - no access.
 * Column order: CR BO AO AA WM ED AV CA CO PA.
 */
export type Access = "F" | "A" | "O" | "V" | "P" | "R" | "-";

const row = (cells: string): Record<MatrixRole, Access> => {
  const c = cells.trim().split(/\s+/) as Access[];
  if (c.length !== 10) throw new Error(`matrix row needs 10 cells, got ${c.length}`);
  const [CR, BO, AO, AA, WM, ED, AV, CA, CO, PA] = c as [Access, Access, Access, Access, Access, Access, Access, Access, Access, Access];
  return { CR, BO, AO, AA, WM, ED, AV, CA, CO, PA };
};

export const MATRIX = {
  // Organization & billing
  "billing.view": row("F F F F V - - - - V"),
  "billing.manage": row("F F F F - - - - - -"),
  "billing.set_limits": row("F F F F R - - - - -"),
  "org.delete_or_transfer": row("F F F - - - - - - -"),
  // Workspaces & team
  "workspace.create_client": row("- - F F - - - - - -"),
  "team.manage_staff": row("- F F F A - - - - -"),
  "team.manage_client_approvers": row("- - F F A - - - - -"),
  "team.change_roles": row("- F F F - - - - - -"),
  "approval_policy.set": row("F F F F A - - - - -"),
  "audit.view": row("F F F F A - - - - F"),
  "workspace.emergency_pause": row("F F F F A - - - - F"),
  // Social connections
  "connections.manage": row("F F F F A - - - - -"),
  "connections.view": row("F F F F A A A - - V"),
  // Agents & strategy
  "strategist.use": row("F F F F A A - - - -"),
  "agent.activate": row("F F F F A R - - - -"),
  "agent.authorize_autonomous": row("F F F F A - - - - -"),
  "agent.pause_resume": row("F F F F A A - - - F"),
  "agent.set_budget": row("F F F F A - - - - -"),
  "activity.view": row("F F F F A A A - - V"),
  // Media & content
  "media.upload": row("F F F F A A - - - -"),
  "content.edit": row("F F F F A A - - - -"),
  "content.render": row("F F F F A A - - - -"),
  "content.comment": row("F F F F A A A A - -"),
  // Approvals & publishing
  "approval.submit": row("F F F F A A - - - -"),
  "approval.decide": row("F F F F A - - P - -"),
  "publish.schedule": row("F F F F A A - - - -"),
  "publish.retry_reconcile": row("F F F F A A - - - F"),
  // Analytics
  "analytics.view": row("V V V V A A A V - V"),
  // Licensing (user side)
  "licensing.browse": row("F F F F A A - - - V"),
  "licensing.request": row("F F F F A R - - - -"),
  // Licensing (owner side)
  "creator.manage_terms": row("- - - - - - - - O -"),
  "creator.view_usage": row("- - - - - - - - O -"),
  "licensing.review": row("- - - - - - - - - F"),
  // Platform admin
  "admin.operate": row("- - - - - - - - - F"),
  "admin.support_access": row("- - - - - - - - - F"),
} as const satisfies Record<string, Record<MatrixRole, Access>>;

export type Capability = keyof typeof MATRIX;
export const CAPABILITIES = Object.keys(MATRIX) as Capability[];

export function accessFor(role: MatrixRole, capability: Capability): Access {
  return MATRIX[capability][role];
}
