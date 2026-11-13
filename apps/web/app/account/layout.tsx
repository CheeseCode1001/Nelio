import { showUnbuiltInNav } from "@nelio/config";
import { db, listWorkspacesFor } from "@nelio/db";
import { roleInWorkspace, surfacesFor } from "@nelio/domain";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { requireSession } from "@/lib/auth";

/**
 * Account pages (/account/...) sit in the operator shell under Settings, as drawn on the ST boards.
 * People without an operator workspace (client approvers, content owners) get the page on its own.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/account/appearance");
  const all = await listWorkspacesFor(db(), session.actor);
  const actor = session.actor;
  const isApprover = (id: string, orgId: string) => actor.workspaces.some((m) => m.workspaceId === id && m.role === "client_approver") && !actor.orgs.some((o) => o.orgId === orgId);
  const operator = all.filter((w) => !isApprover(w.workspaceId, w.orgId));
  const current = operator.find((w) => w.kind === "primary") ?? operator[0];
  if (!current) {
    return (
      <main id="main" className="mx-auto box-border flex w-full max-w-[1260px] grow flex-col gap-4 p-4 md:gap-6 md:p-8">
        {children}
      </main>
    );
  }
  const agency = operator.find((w) => w.accountType === "agency" && actor.orgs.some((o) => o.orgId === w.orgId));
  const portal = all.find((w) => isApprover(w.workspaceId, w.orgId));
  return (
    <AppShell
      current={current}
      workspaces={operator}
      account={{ fullName: session.user.fullName, email: session.user.email, surfaces: surfacesFor(actor), agencySlug: agency?.orgSlug ?? null, portalSlug: portal?.slug ?? null }}
      role={roleInWorkspace(actor, current) ?? "AV"}
      extras={{ credits: null, approvalsWaiting: null, unreadNotifications: null, pauseAvailable: false }}
      showUnbuilt={showUnbuiltInNav()}
      active="ST-10"
    >
      {children}
    </AppShell>
  );
}
