import { BigTitle, ButtonLink, Illustration, Small, Sticker, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/shell";
import { requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Welcome" };

/** ON-FLOW step 0: welcome. Four quick questions follow, every one skippable (D-04). */
export default async function OnboardingWelcome() {
  const ctx = await requireOnboarding("/onboarding");
  return (
    <AuthShell width={640}>
      <div className="relative flex flex-col items-center gap-[22px] pt-5 text-center">
        <Illustration name="welcome" width={440} className="w-[300px] md:w-[440px]" />
        <div className="absolute right-2 top-5 md:right-10">
          <Sticker fill="yellow" rotate={8} icon="smile" size={14}>Hi {ctx.firstName}!</Sticker>
        </div>
        <BigTitle size={52} className="md:text-[64px]">Meet your agents.</BigTitle>
        <Text size={17}>Four quick questions and your studio is ready. Skip anything you like.</Text>
        <ButtonLink href="/onboarding/account-type" variant="cta" size="lg" arrow className="min-h-[60px] text-lg">Let’s go</ButtonLink>
        <Small>Takes about a minute</Small>
      </div>
    </AuthShell>
  );
}
