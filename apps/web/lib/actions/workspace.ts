"use server";

import { db, findWorkspaceFor } from "@nelio/db";
import { revalidatePath } from "next/cache";
import { getSession } from "../auth";

/** Hides the setup checklist on the Command Center for this workspace (any member who can see the workspace). */
export async function dismissChecklistAction(workspaceSlug: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false };
  const client = db();
  const ws = await findWorkspaceFor(client, session.actor, workspaceSlug);
  if (!ws) return { ok: false };
  await client.$transaction([
    client.workspace.update({ where: { id: ws.workspaceId }, data: { setupChecklistDismissedAt: new Date() } }),
    client.auditEvent.create({ data: { orgId: ws.orgId, workspaceId: ws.workspaceId, actorUserId: session.user.id, action: "workspace.checklist_dismissed", targetType: "workspace", targetId: ws.workspaceId } }),
  ]);
  revalidatePath(`/w/${workspaceSlug}/home`);
  return { ok: true };
}
