import { db, INVITATION_TTL_DAYS, newInvitationToken } from "@nelio/db";
import { can, createInvitationSchema } from "@nelio/domain";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * POST /api/workspaces/invitations: invite a person to one workspace.
 * Permissions follow B §6: staff invitations need "team.manage_staff", client approvers need
 * "team.manage_client_approvers", and managers may only invite Editors and Viewers (note 2).
 * The token is returned once and only its hash is stored. Email delivery arrives with the notification
 * service in Milestone 3; until then the caller shares the link.
 */
export async function POST(request: NextRequest) {
  // Same-origin check: a page on another site cannot make a signed-in person send invitations.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (session.user.needsMfa) return NextResponse.json({ error: "mfa_required" }, { status: 403 });

  const parsed = createInvitationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", fields: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) }, { status: 422 });
  }
  const { email, workspaceId, role } = parsed.data;

  const client = db();
  const ws = await client.workspace.findFirst({ where: { id: workspaceId, deletedAt: null }, select: { id: true, orgId: true, org: { select: { accountType: true } } } });
  const ref = ws ? { workspaceId: ws.id, orgId: ws.orgId } : null;
  const decision = ref ? can(session.actor, role === "client_approver" ? "team.manage_client_approvers" : "team.manage_staff", ref) : null;
  // Unknown and forbidden workspaces get the same answer.
  if (!ws || !ref || !decision?.allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (decision.as === "WM" && role === "manager") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (role === "client_approver" && ws.org.accountType !== "agency") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { token, tokenHash } = newInvitationToken();
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 86_400_000);
  const invitation = await client.$transaction(async (tx) => {
    const inv = await tx.invitation.create({
      data: { orgId: ref.orgId, workspaceId: ref.workspaceId, email, workspaceRole: role, tokenHash, invitedByUserId: session.user.id, expiresAt },
      select: { id: true },
    });
    await tx.auditEvent.create({
      data: { orgId: ref.orgId, workspaceId: ref.workspaceId, actorUserId: session.user.id, action: "invitation.created", targetType: "invitation", targetId: inv.id, metadata: { role } },
    });
    return inv;
  });
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.json({ id: invitation.id, expiresAt: expiresAt.toISOString(), inviteUrl: `${base}/invite/${token}` }, { status: 201 });
}
