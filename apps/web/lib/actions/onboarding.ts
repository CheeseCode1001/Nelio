"use server";

import { db } from "@nelio/db";
import { accountTypeSchema } from "@nelio/domain";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAudience } from "@nelio/config";
import { GOALS, homeFor, requireOnboarding } from "../onboarding";

/** ON-01: account type. An organization that already has client workspaces stays an agency. */
export async function saveAccountTypeAction(form: FormData): Promise<void> {
  const ctx = await requireOnboarding("/onboarding/account-type");
  const parsed = accountTypeSchema.safeParse(form.get("accountType"));
  if (parsed.success && parsed.data !== ctx.org.accountType && !(ctx.org.hasClientWorkspaces && parsed.data !== "agency")) {
    const client = db();
    await client.$transaction([
      client.organization.update({ where: { id: ctx.org.id }, data: { accountType: parsed.data } }),
      client.auditEvent.create({ data: { orgId: ctx.org.id, actorUserId: ctx.session.user.id, action: "organization.account_type_changed", targetType: "organization", targetId: ctx.org.id, metadata: { from: ctx.org.accountType, to: parsed.data } } }),
    ]);
  }
  await db().user.update({ where: { id: ctx.session.user.id }, data: { onboardingStep: 1 } });
  redirect("/onboarding/goals");
}

const goalsSchema = z.object({
  goals: z.array(z.enum(GOALS)).max(GOALS.length),
  niche: z.string().trim().max(120).transform((v) => v || null),
  audience: z.string().refine(isAudience).nullable(),
});

/** ON-02: goals, niche and main audience for the workspace. */
export async function saveGoalsAction(form: FormData): Promise<void> {
  const ctx = await requireOnboarding("/onboarding/goals");
  const parsed = goalsSchema.safeParse({ goals: form.getAll("goals"), niche: String(form.get("niche") ?? ""), audience: form.get("audience") || null });
  if (parsed.success) {
    await db().workspace.update({ where: { id: ctx.workspace.id }, data: parsed.data });
  }
  await db().user.update({ where: { id: ctx.session.user.id }, data: { onboardingStep: 2 } });
  redirect("/onboarding/connect");
}

/** ON-03: nothing to save until platform sign-in exists (Milestone 6). */
export async function continueFromConnectAction(): Promise<void> {
  const ctx = await requireOnboarding("/onboarding/connect");
  await db().user.update({ where: { id: ctx.session.user.id }, data: { onboardingStep: 3 } });
  redirect("/onboarding/automation");
}

/**
 * ON-04: default automation mode. Autonomous is a preference only: no agent publishes until its own
 * authorization dialog is confirmed (D-05). The Free plan cannot choose it (D-11).
 */
export async function saveAutomationAction(form: FormData): Promise<void> {
  const ctx = await requireOnboarding("/onboarding/automation");
  const parsed = z.enum(["manual", "assisted", "autonomous"]).safeParse(form.get("mode"));
  const mode = parsed.success && !(parsed.data === "autonomous" && ctx.org.plan === "free") ? parsed.data : "assisted";
  const client = db();
  await client.$transaction([
    client.organization.update({ where: { id: ctx.org.id }, data: { automationMode: mode } }),
    client.user.update({ where: { id: ctx.session.user.id }, data: { onboardingStep: 4, onboardingCompletedAt: new Date() } }),
    client.auditEvent.create({ data: { orgId: ctx.org.id, actorUserId: ctx.session.user.id, action: "onboarding.completed", targetType: "organization", targetId: ctx.org.id, metadata: { automationMode: mode } } }),
  ]);
  redirect("/onboarding/done");
}

/** "Skip for now" from any step goes to the Command Center; the checklist there keeps what's left (D-04). */
export async function skipOnboardingAction(): Promise<void> {
  const ctx = await requireOnboarding("/onboarding");
  redirect(homeFor(ctx));
}
