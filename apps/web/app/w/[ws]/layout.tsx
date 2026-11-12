import { surfacesFor } from "@nelio/domain";
import type { ReactNode } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { requireWorkspace } from "@/lib/auth";

/** Operator app shell. Every page under /w/[ws] is resolved against the signed-in person's memberships first. */
export default async function WorkspaceLayout({ children, params }: { children: ReactNode; params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { session, workspace, workspaces } = await requireWorkspace(ws);
  const agency = workspaces.find((w) => w.accountType === "agency" && session.actor.orgs.some((o) => o.orgId === w.orgId));
  const portal = workspaces.find((w) => session.actor.workspaces.some((m) => m.workspaceId === w.workspaceId && m.role === "client_approver"));
  return (
    <div className="flex grow flex-col">
      <TopBar
        current={workspace}
        workspaces={workspaces.filter((w) => !session.actor.workspaces.some((m) => m.workspaceId === w.workspaceId && m.role === "client_approver"))}
        account={{ fullName: session.user.fullName, email: session.user.email, surfaces: surfacesFor(session.actor), agencySlug: agency?.slug ?? null, portalSlug: portal?.slug ?? null }}
      />
      {children}
    </div>
  );
}
