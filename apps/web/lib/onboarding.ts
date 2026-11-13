import "server-only";
import { db } from "@nelio/db";
import type { AccountType } from "@nelio/domain";
import { redirect } from "next/navigation";
import { homePathFor, requireSession, type Session } from "./auth";

export const GOALS = ["Grow followers", "Repurpose long videos", "Post consistently", "Drive sales", "Build a community", "Manage clients"] as const;

/** Main audience options. Nigeria first (the operator's home market); "Global" for everyone else. */
export const AUDIENCES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Global"] as const;

export interface OnboardingContext {
  session: Session;
  org: { id: string; name: string; accountType: AccountType; plan: string; automationMode: "manual" | "assisted" | "autonomous" | null; hasClientWorkspaces: boolean };
  workspace: { id: string; slug: string; goals: string[]; niche: string | null; audience: string | null };
  firstName: string;
}

/**
 * Onboarding belongs to the owner of an organization (D-04). Invitees, client approvers and content owners
 * have nothing to set up here and go straight to their home.
 */
export async function requireOnboarding(path: string): Promise<OnboardingContext> {
  const session = await requireSession(path);
  const owned = session.actor.orgs.find((o) => o.role === "owner");
  if (!owned) redirect(await homePathFor(session));
  const client = db();
  const org = await client.organization.findUniqueOrThrow({
    where: { id: owned.orgId },
    select: { id: true, name: true, accountType: true, plan: true, automationMode: true, workspaces: { where: { deletedAt: null }, select: { id: true, slug: true, kind: true, goals: true, niche: true, audience: true }, orderBy: { createdAt: "asc" } } },
  });
  const primary = org.workspaces.find((w) => w.kind === "primary") ?? org.workspaces[0];
  if (!primary) redirect(await homePathFor(session));
  return {
    session,
    org: { id: org.id, name: org.name, accountType: org.accountType, plan: org.plan, automationMode: org.automationMode, hasClientWorkspaces: org.workspaces.some((w) => w.kind === "client") },
    workspace: { id: primary.id, slug: primary.slug, goals: primary.goals, niche: primary.niche, audience: primary.audience },
    firstName: session.user.fullName.split(/\s+/)[0] ?? session.user.fullName,
  };
}

export const homeFor = (ctx: OnboardingContext) => `/w/${ctx.workspace.slug}/home`;
