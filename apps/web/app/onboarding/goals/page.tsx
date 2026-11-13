import { Field, FieldGrid, PillCheckbox, SelectField } from "@nelio/ui";
import type { Metadata } from "next";
import { OnboardingFoot, OnboardingStep } from "@/components/onboarding/step";
import { saveGoalsAction } from "@/lib/actions/onboarding";
import { AUDIENCES, GLOBAL_AUDIENCE, GOALS, homeFor, requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "What are you going for?" };

/** ON-02 Goals & niche. */
export default async function GoalsStep() {
  const ctx = await requireOnboarding("/onboarding/goals");
  return (
    <OnboardingStep step={2} title="What are you going for?" intro="Pick as many as you like." skipHref={homeFor(ctx)}>
      <form action={saveGoalsAction} className="flex flex-col gap-4 md:gap-[18px]">
        <fieldset className="m-0 flex flex-wrap gap-2.5 border-0 p-0">
          <legend className="sr-only">Goals</legend>
          {GOALS.map((g) => <PillCheckbox key={g} name="goals" value={g} label={g} defaultChecked={ctx.workspace.goals.includes(g)} />)}
        </fieldset>
        <FieldGrid>
          <Field label="Your niche" name="niche" defaultValue={ctx.workspace.niche ?? ""} placeholder="e.g. personal finance for students" maxLength={120} />
          <SelectField label="Main audience" name="audience" defaultValue={ctx.workspace.audience ?? GLOBAL_AUDIENCE} options={AUDIENCES.map((a) => ({ value: a, label: a }))} />
        </FieldGrid>
        <OnboardingFoot backHref="/onboarding/account-type" />
      </form>
    </OnboardingStep>
  );
}
