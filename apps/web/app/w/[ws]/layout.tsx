import { showUnbuiltInNav } from "@nelio/config";
import { db } from "@nelio/db";
import { can, roleInWorkspace, surfacesFor } from "@nelio/domain";
import type { ReactNode } from "react";
import { CommandCenterStrip } from "@/components/command-center/command-center";
import { AppShell } from "@/components/shell/app-shell";
import { hrefForWorkspace } from "@/lib/hrefs";
import { requireWorkspace } from "@/lib/auth";

/** Operator app shell. Every page under /w/[ws] is resolved against the signed-in person's memberships first. */
export default async function WorkspaceLayout({ children, params }: { children: ReactNode; params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { session, workspace, workspaces } = await requireWorkspace(ws);
  const actor = session.actor;
  const isApprover = (id: string) => actor.workspaces.some((m) => m.workspaceId === id && m.role === "client_approver") && !actor.orgs.some((o) => workspaces.find((w) => w.workspaceId === id)?.orgId === o.orgId);
  const agency = workspaces.find((w) => w.accountType === "agency" && actor.orgs.some((o) => o.orgId === w.orgId));
  const portal = workspaces.find((w) => isApprover(w.workspaceId));

  // Workspace-wide pause (J-12) is shown on every page of the workspace.
  const client = db();
  const [pause, agentCount] = await Promise.all([
    client.workspace.findUniqueOrThrow({ where: { id: workspace.workspaceId }, select: { pausedAt: true, pausedByUserId: true, timezone: true } }),
    client.agent.count({ where: { workspaceId: workspace.workspaceId, state: { not: "stopped" } } }),
  ]);
  const canPause = can(actor, "workspace.emergency_pause", workspace).allowed;
  const unread = await client.notification.count({ where: { userId: session.user.id, readAt: null } });
  const pausedBy = pause.pausedAt && pause.pausedByUserId ? await client.user.findUnique({ where: { id: pause.pausedByUserId }, select: { fullName: true } }) : null;
  const strip = pause.pausedAt ? (
    <CommandCenterStrip
      strip={{ kind: "paused", by: pausedBy?.fullName.split(" ")[0] ?? "an admin", at: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: pause.timezone }).format(pause.pausedAt) }}
      href={hrefForWorkspace(workspace)}
      resumeAvailable={canPause}
    />
  ) : null;

  return (
    <AppShell
      current={workspace}
      workspaces={workspaces.filter((w) => !isApprover(w.workspaceId))}
      account={{ fullName: session.user.fullName, email: session.user.email, surfaces: surfacesFor(actor), agencySlug: agency?.orgSlug ?? null, portalSlug: portal?.slug ?? null }}
      role={roleInWorkspace(actor, workspace) ?? "AV"}
      extras={{ credits: null, approvalsWaiting: null, unreadNotifications: unread, pauseAvailable: canPause && (agentCount > 0 || Boolean(pause.pausedAt)), paused: Boolean(pause.pausedAt), userId: session.user.id }}
      showUnbuilt={showUnbuiltInNav()}
      strip={strip}
    >
      {children}
    </AppShell>
  );
}
