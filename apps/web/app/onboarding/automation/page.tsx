import { hrefFor } from "@nelio/config";
import type { Metadata } from "next";
import { AutomationChoices } from "@/components/onboarding/automation-choices";
import { OnboardingFoot, OnboardingStep } from "@/components/onboarding/step";
import { saveAutomationAction } from "@/lib/actions/onboarding";
import { devUiEnabled } from "@/lib/dev-ui";
import { db } from "@nelio/db";
import { homeFor, requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "How hands-off should agents be?" };

/**
 * ON-04 Automation mode. States: filled, Autonomous picked, Free plan (locked).
 * The Free plan has no autonomous publishing (D-11). Development preview: ?state=paid shows a paid plan.
 */
export default async function AutomationStep({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const ctx = await requireOnboarding("/onboarding/automation");
  const previewPaid = devUiEnabled() && (await searchParams).state === "paid";
  const freePlan = ctx.org.plan === "free" && !previewPaid;
  const org = await db().organization.findUniqueOrThrow({ where: { id: ctx.org.id }, select: { slug: true } });
  return (
    <OnboardingStep step={4} title="How hands-off should agents be?" intro="You can change this per agent, any time." skipHref={homeFor(ctx)}>
      <form action={saveAutomationAction} className="flex flex-col gap-4 md:gap-[18px]">
        <AutomationChoices initial={ctx.org.automationMode ?? "assisted"} freePlan={freePlan} trialHref={hrefFor("BI-02", { ws: ctx.workspace.slug, org: org.slug })} />
        <OnboardingFoot backHref="/onboarding/connect" label="Finish setup" />
      </form>
    </OnboardingStep>
  );
}
