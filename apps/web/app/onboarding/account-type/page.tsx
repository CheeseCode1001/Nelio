import { ChoiceCard } from "@nelio/ui";
import type { Metadata } from "next";
import { OnboardingFoot, OnboardingStep } from "@/components/onboarding/step";
import { saveAccountTypeAction } from "@/lib/actions/onboarding";
import { homeFor, requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "How will you use Nelio?" };

const TYPES = [
  { value: "creator", title: "Creator", sub: "I make content for my own channels.", icon: "smile", tone: "lime" },
  { value: "business", title: "Business", sub: "I post for my brand with a small team.", icon: "grid", tone: "blue" },
  { value: "agency", title: "Agency", sub: "I manage content for clients.", icon: "users", tone: "ai" },
] as const;

/** ON-01 Account type. States: filled, Agency selected. */
export default async function AccountTypeStep() {
  const ctx = await requireOnboarding("/onboarding/account-type");
  return (
    <OnboardingStep step={1} title="How will you use Nelio?" intro="This shapes your workspace. You can change it later." skipHref={homeFor(ctx)}>
      <form action={saveAccountTypeAction} className="flex flex-col gap-4 md:gap-[18px]">
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="sr-only">Account type</legend>
          {TYPES.map((t) => (
            <ChoiceCard
              key={t.value}
              name="accountType"
              value={t.value}
              defaultChecked={ctx.org.accountType === t.value}
              title={t.title}
              sub={t.sub}
              icon={t.icon}
              tone={t.tone}
              locked={ctx.org.hasClientWorkspaces && t.value !== "agency"}
            />
          ))}
        </fieldset>
        <OnboardingFoot />
      </form>
    </OnboardingStep>
  );
}
