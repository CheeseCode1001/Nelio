import "server-only";
import { db } from "@nelio/db";
import { greetingFor, type CommandCenterData } from "@/components/command-center/model";
import type { Session } from "./auth";

/**
 * Builds APP-01 from real data only. Agents, approvals, publishing, licences and credits arrive in
 * Milestones 3 to 8; until then those sections are empty and the screen shows its Empty (first-run) state.
 */
export async function loadCommandCenter(session: Session, workspaceId: string): Promise<CommandCenterData> {
  const ws = await db().workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { timezone: true, setupChecklistDismissedAt: true } });
  return {
    firstName: session.user.fullName.split(/\s+/)[0] ?? session.user.fullName,
    greeting: greetingFor(new Date(), ws.timezone),
    hero: null,
    stats: null,
    checklist: { done: [], dismissed: ws.setupChecklistDismissedAt !== null },
    agents: [],
    pipeline: null,
    needs: [],
    live: [],
    strip: null,
  };
}
