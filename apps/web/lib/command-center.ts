import "server-only";
import { db } from "@nelio/db";
import type { AgentColor } from "@nelio/ui";
import { greetingFor, type CommandCenterData, type LiveItem, type NeedItem } from "@/components/command-center/model";
import { loadActivity } from "./activity";
import { loadAgents, type AgentShape } from "./agents";
import type { Session } from "./auth";

/**
 * Builds APP-01 from real data only. Agents, their activity and spend exist from Milestone 3; drafts,
 * approvals, publishing and the credit wallet arrive in Milestones 4 to 8, so the hero, the pipeline and
 * those stats stay empty (never invented) until their data exists.
 */
export async function loadCommandCenter(session: Session, workspaceId: string): Promise<CommandCenterData> {
  const now = new Date();
  const ws = await db().workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { timezone: true, setupChecklistDismissedAt: true, slug: true } });
  const [agents, activity] = await Promise.all([loadAgents(workspaceId, now), loadActivity(workspaceId, null, now)]);

  const hasAgents = agents.cards.length > 0;
  const live: LiveItem[] = activity.items.slice(0, 3).map((i) => ({ key: i.runId, title: i.title, sub: i.sub, agent: { color: i.agent.color as AgentColor, shape: i.agent.shape as AgentShape }, status: i.chip }));
  const needs: NeedItem[] = agents.cards
    .filter((a) => a.stateName === "budget_reached")
    .map((a) => ({ key: `budget-${a.id}`, title: `${a.name} paused: budget reached`, sub: `${a.budget.used.toLocaleString("en-US")} of ${a.budget.limit.toLocaleString("en-US")} credits this week`, icon: "wallet", tone: "warn", action: { label: "Fix", screen: "APP-04" } }));
  const used = agents.cards.reduce((n, a) => n + a.budget.used, 0);
  const budget = agents.cards.reduce((n, a) => n + a.budget.limit, 0);

  return {
    firstName: session.user.fullName.split(/\s+/)[0] ?? session.user.fullName,
    greeting: greetingFor(now, ws.timezone),
    hero: null,
    stats: hasAgents
      ? {
          agentsActive: agents.cards.filter((a) => a.stateName === "active").length,
          agentsPaused: agents.cards.filter((a) => a.stateName !== "active").length,
          waiting: needs.length,
          waitingClients: 0,
          published: 0,
          creditsUsed: used,
          creditBudget: budget,
        }
      : null,
    checklist: { done: hasAgents ? ["agent"] : [], dismissed: ws.setupChecklistDismissedAt !== null },
    agents: agents.cards.slice(0, 4),
    pipeline: null,
    needs,
    live,
    strip: null,
  };
}
