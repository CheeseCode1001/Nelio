import "server-only";
import { bootstrapUser, db, findWorkspaceFor, listWorkspacesFor, loadActor, type WorkspaceSummary } from "@nelio/db";
import { accountTypeSchema, fullNameSchema, homeSurface, type Actor } from "@nelio/domain";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseServer } from "./supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  /** Authenticator assurance level: aal2 means two-step verification was completed in this session. */
  aal: "aal1" | "aal2";
  needsMfa: boolean;
  metadata: Record<string, unknown>;
}

/** The verified Supabase Auth user for this request, or null. Never trusts unverified cookie contents. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const name = fullNameSchema.safeParse(meta.full_name);
  return {
    id: data.user.id,
    email: data.user.email,
    fullName: name.success ? name.data : data.user.email.split("@")[0]!,
    aal: level?.currentLevel === "aal2" ? "aal2" : "aal1",
    needsMfa: level?.nextLevel === "aal2" && level.currentLevel !== "aal2",
    metadata: meta,
  };
});

export interface Session {
  user: SessionUser;
  actor: Actor;
}

/**
 * Signed-in user plus their roles. Creates the application records on first use (idempotent),
 * so a person who confirmed their email in another browser still gets their workspace.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const client = db();
  let actor = await loadActor(client, user.id);
  if (!actor) {
    const kind = user.metadata.signup_kind === "content_owner" ? "content_owner" : user.metadata.signup_kind === "invitee" ? "invitee" : "operator";
    const accountType = accountTypeSchema.safeParse(user.metadata.account_type);
    await bootstrapUser(client, {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      kind,
      accountType: accountType.success ? accountType.data : undefined,
      primaryPlatform: typeof user.metadata.platform === "string" ? user.metadata.platform.slice(0, 20) : undefined,
    });
    actor = await loadActor(client, user.id);
  }
  return actor ? { user, actor } : null;
});

/** For pages: redirects to log in (or to two-step verification) when needed. */
export async function requireSession(next?: string): Promise<Session> {
  const user = await getSessionUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  if (user.needsMfa) redirect(next ? `/mfa?next=${encodeURIComponent(next)}` : "/mfa");
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Resolves `/w/[ws]` for the signed-in user. Unknown and forbidden workspaces are indistinguishable:
 * both go to SY-04 Access denied, which never confirms that a workspace exists.
 */
export async function requireWorkspace(slug: string): Promise<{ session: Session; workspace: WorkspaceSummary; workspaces: WorkspaceSummary[] }> {
  const session = await requireSession(`/w/${slug}/home`);
  const client = db();
  const workspace = await findWorkspaceFor(client, session.actor, slug);
  if (!workspace) redirect("/denied");
  // Client approvers use the Client Portal, never the operator app (B §2).
  const membership = session.actor.workspaces.find((w) => w.workspaceId === workspace.workspaceId);
  const isOrgMember = session.actor.orgs.some((o) => o.orgId === workspace.orgId);
  if (!isOrgMember && membership?.role === "client_approver") redirect(`/portal/${workspace.slug}`);
  const workspaces = await listWorkspacesFor(client, session.actor);
  return { session, workspace, workspaces };
}

/** Where a signed-in person should land. */
export async function homePathFor(session: Session): Promise<string> {
  const surface = homeSurface(session.actor);
  if (surface === "creator_portal") return "/creator";
  if (surface === "admin") return "/admin";
  const list = await listWorkspacesFor(db(), session.actor);
  if (surface === "client_portal") {
    const ws = list.find((w) => session.actor.workspaces.some((m) => m.workspaceId === w.workspaceId && m.role === "client_approver"));
    return ws ? `/portal/${ws.slug}` : "/denied";
  }
  const first = list.find((w) => w.kind === "primary") ?? list[0];
  return first ? `/w/${first.slug}/home` : "/denied";
}
