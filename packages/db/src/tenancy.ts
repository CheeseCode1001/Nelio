import { createHash, randomBytes } from "node:crypto";
import {
  canSeeWorkspace, slugify, type AccountType, type Actor, type OrgRole, type WorkspaceRef, type WorkspaceRole,
} from "@nelio/domain";
import type { Db, Tx } from "./client";

type Client = Db | Tx;

/** Loads everything the permission checks need about one user. Called once per request. */
export async function loadActor(client: Client, userId: string): Promise<Actor | null> {
  const user = await client.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      isPlatformAdmin: true,
      creatorProfile: { select: { id: true } },
      orgMemberships: { where: { org: { deletedAt: null } }, select: { orgId: true, role: true, org: { select: { accountType: true } } } },
      workspaceMemberships: { where: { workspace: { deletedAt: null } }, select: { workspaceId: true, orgId: true, role: true } },
    },
  });
  if (!user) return null;
  return {
    userId: user.id,
    isPlatformAdmin: user.isPlatformAdmin,
    isContentOwner: Boolean(user.creatorProfile),
    orgs: user.orgMemberships.map((m) => ({ orgId: m.orgId, role: m.role, accountType: m.org.accountType })),
    workspaces: user.workspaceMemberships.map((m) => ({ workspaceId: m.workspaceId, orgId: m.orgId, role: m.role })),
  };
}

export interface WorkspaceSummary extends WorkspaceRef {
  slug: string;
  name: string;
  kind: "primary" | "client";
  orgName: string;
  orgSlug: string;
  accountType: AccountType;
}

/**
 * The only way application code lists workspaces: filtered by the actor's memberships in SQL,
 * so a workspace the actor does not belong to never leaves the database (isolation rule AC-02).
 */
export async function listWorkspacesFor(client: Client, actor: Actor): Promise<WorkspaceSummary[]> {
  const orgIds = actor.orgs.map((o) => o.orgId);
  const wsIds = actor.workspaces.map((w) => w.workspaceId);
  if (orgIds.length === 0 && wsIds.length === 0) return [];
  const rows = await client.workspace.findMany({
    where: { deletedAt: null, OR: [{ orgId: { in: orgIds } }, { id: { in: wsIds } }] },
    select: { id: true, orgId: true, slug: true, name: true, kind: true, org: { select: { name: true, slug: true, accountType: true } } },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({ workspaceId: r.id, orgId: r.orgId, slug: r.slug, name: r.name, kind: r.kind, orgName: r.org.name, orgSlug: r.org.slug, accountType: r.org.accountType }));
}

/**
 * Resolves a workspace slug for an actor. Returns null both when the workspace does not exist and when
 * the actor has no access, so callers cannot tell the two apart (SY-04 never confirms a workspace exists).
 */
export async function findWorkspaceFor(client: Client, actor: Actor, slug: string): Promise<WorkspaceSummary | null> {
  const r = await client.workspace.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, orgId: true, slug: true, name: true, kind: true, org: { select: { name: true, slug: true, accountType: true } } },
  });
  if (!r) return null;
  const ref = { workspaceId: r.id, orgId: r.orgId };
  if (!canSeeWorkspace(actor, ref)) return null;
  return { ...ref, slug: r.slug, name: r.name, kind: r.kind, orgName: r.org.name, orgSlug: r.org.slug, accountType: r.org.accountType };
}

async function uniqueSlug(client: Client, table: "organization" | "workspace", name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 6; i++) {
    const slug = i === 0 ? base : `${base}-${randomBytes(2).toString("hex")}`;
    const taken =
      table === "organization"
        ? await client.organization.findUnique({ where: { slug }, select: { id: true } })
        : await client.workspace.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${randomBytes(6).toString("hex")}`;
}

export interface BootstrapInput {
  userId: string;
  email: string;
  fullName: string;
  /** Operators get an organization and a default workspace. Content owners and invitees do not. */
  kind: "operator" | "content_owner" | "invitee";
  accountType?: AccountType;
  primaryPlatform?: string;
}

/**
 * Creates the application records for a new Supabase Auth user. Safe to call again:
 * an existing user is returned unchanged, so a retried request cannot create a second organization.
 */
export async function bootstrapUser(client: Db, input: BootstrapInput): Promise<{ created: boolean; workspaceSlug: string | null }> {
  return client.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id: input.userId }, select: { id: true } });
    if (existing) {
      const ws = await tx.workspace.findFirst({
        where: { deletedAt: null, org: { memberships: { some: { userId: input.userId } } } },
        select: { slug: true },
        orderBy: { createdAt: "asc" },
      });
      return { created: false, workspaceSlug: ws?.slug ?? null };
    }
    await tx.user.create({ data: { id: input.userId, email: input.email, fullName: input.fullName } });
    await tx.auditEvent.create({ data: { actorUserId: input.userId, action: "user.created", targetType: "user", targetId: input.userId, metadata: { kind: input.kind } } });

    if (input.kind === "content_owner") {
      await tx.creatorProfile.create({ data: { userId: input.userId, displayName: input.fullName, primaryPlatform: input.primaryPlatform ?? "other" } });
      await tx.auditEvent.create({ data: { actorUserId: input.userId, action: "creator_profile.created", targetType: "user", targetId: input.userId } });
      return { created: true, workspaceSlug: null };
    }
    if (input.kind === "invitee") return { created: true, workspaceSlug: null };

    const first = input.fullName.trim().split(/\s+/)[0] ?? "My";
    const name = `${first} Studio`;
    const org = await tx.organization.create({
      data: { name, slug: await uniqueSlug(tx, "organization", name), accountType: input.accountType ?? "creator" },
    });
    await tx.organizationMembership.create({ data: { orgId: org.id, userId: input.userId, role: "owner" } });
    const ws = await tx.workspace.create({ data: { orgId: org.id, name, slug: await uniqueSlug(tx, "workspace", name), kind: "primary" } });
    await tx.auditEvent.create({
      data: { orgId: org.id, workspaceId: ws.id, actorUserId: input.userId, action: "organization.created", targetType: "organization", targetId: org.id },
    });
    return { created: true, workspaceSlug: ws.slug };
  });
}

// ---------------------------------------------------------------- invitations

export const INVITATION_TTL_DAYS = 7;

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newInvitationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInvitationToken(token) };
}

export type InvitationState = "valid" | "expired" | "accepted" | "revoked" | "not_found";

export interface InvitationView {
  state: InvitationState;
  id?: string;
  email?: string;
  orgName?: string;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  inviterName?: string;
  orgRole?: OrgRole | null;
  workspaceRole?: WorkspaceRole | null;
}

export async function findInvitation(client: Client, token: string, now = new Date()): Promise<InvitationView> {
  const inv = await client.invitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: {
      id: true, email: true, orgRole: true, workspaceRole: true, expiresAt: true, acceptedAt: true, revokedAt: true,
      org: { select: { name: true } }, workspace: { select: { name: true, slug: true } }, invitedBy: { select: { fullName: true } },
    },
  });
  if (!inv) return { state: "not_found" };
  const state: InvitationState = inv.revokedAt ? "revoked" : inv.acceptedAt ? "accepted" : inv.expiresAt <= now ? "expired" : "valid";
  return {
    state, id: inv.id, email: inv.email, orgName: inv.org.name, workspaceName: inv.workspace?.name ?? null,
    workspaceSlug: inv.workspace?.slug ?? null, inviterName: inv.invitedBy.fullName, orgRole: inv.orgRole, workspaceRole: inv.workspaceRole,
  };
}

export type AcceptResult =
  | { ok: true; workspaceSlug: string | null; role: OrgRole | WorkspaceRole }
  | { ok: false; reason: Exclude<InvitationState, "valid"> | "email_mismatch" };

/**
 * Accepts an invitation for a signed-in user. The invitation is bound to the invited email address,
 * is single-use, and the membership it creates is exactly the one the inviter chose.
 */
export async function acceptInvitation(client: Db, input: { token: string; userId: string; userEmail: string }, now = new Date()): Promise<AcceptResult> {
  return client.$transaction(async (tx) => {
    const inv = await tx.invitation.findUnique({ where: { tokenHash: hashInvitationToken(input.token) }, include: { workspace: { select: { slug: true } } } });
    if (!inv) return { ok: false, reason: "not_found" } as const;
    if (inv.revokedAt) return { ok: false, reason: "revoked" } as const;
    if (inv.acceptedAt) return { ok: false, reason: "accepted" } as const;
    if (inv.expiresAt <= now) return { ok: false, reason: "expired" } as const;
    if (inv.email.toLowerCase() !== input.userEmail.toLowerCase()) return { ok: false, reason: "email_mismatch" } as const;

    // Single use: only one concurrent request can flip acceptedAt from null.
    const claimed = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: now, acceptedByUserId: input.userId } });
    if (claimed.count !== 1) return { ok: false, reason: "accepted" } as const;

    if (inv.workspaceId && inv.workspaceRole) {
      await tx.workspaceMembership.upsert({
        where: { workspaceId_userId: { workspaceId: inv.workspaceId, userId: input.userId } },
        create: { workspaceId: inv.workspaceId, orgId: inv.orgId, userId: input.userId, role: inv.workspaceRole },
        update: { role: inv.workspaceRole },
      });
    } else if (inv.orgRole) {
      await tx.organizationMembership.upsert({
        where: { orgId_userId: { orgId: inv.orgId, userId: input.userId } },
        create: { orgId: inv.orgId, userId: input.userId, role: inv.orgRole },
        update: {},
      });
    }
    await tx.auditEvent.create({
      data: {
        orgId: inv.orgId, workspaceId: inv.workspaceId, actorUserId: input.userId, action: "invitation.accepted",
        targetType: "invitation", targetId: inv.id, metadata: { role: inv.workspaceRole ?? inv.orgRole },
      },
    });
    return { ok: true, workspaceSlug: inv.workspace?.slug ?? null, role: (inv.workspaceRole ?? inv.orgRole)! } as const;
  });
}
