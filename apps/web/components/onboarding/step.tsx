import { Button, ButtonLink, Heading, StepProgress, Text, type PanelColor, type PhotoKey } from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/shell";

/** Photo panel per step (generator `onb`). */
const SIDES: Record<1 | 2 | 3 | 4, { color: PanelColor; photos: PhotoKey[]; title: string }> = {
  1: { color: "yellow", photos: ["p6", "p10", "p1", "p2"], title: "Made for creators, brands and agencies." },
  2: { color: "cyan", photos: ["p8", "p1", "p7", "p4"], title: "Tell us what you want more of." },
  3: { color: "pink", photos: ["p2", "p3", "p10", "p5"], title: "Connect once. Post everywhere." },
  4: { color: "lime", photos: ["p1", "p6", "p8", "p10"], title: "You stay in control. Always." },
};

export function OnboardingHeaderRight({ step, skipHref }: { step: number; skipHref: string }) {
  return (
    <>
      <span className="text-[13px] font-bold text-muted">Step {step} of 4</span>
      <Link href={skipHref} className="box-border inline-flex min-h-11 items-center rounded-full px-[18px] py-2.5 text-sm font-bold text-text no-underline hover:text-text">Skip for now</Link>
    </>
  );
}

/** One onboarding step: progress, title, intro, the form, and the Back / Continue row. */
export function OnboardingStep({ step, title, intro, skipHref, children }: { step: 1 | 2 | 3 | 4; title: string; intro: string; skipHref: string; children: ReactNode }) {
  return (
    <AuthShell side={SIDES[step]} width={600} header={<OnboardingHeaderRight step={step} skipHref={skipHref} />}>
      <StepProgress total={4} current={step} />
      <Heading size={40} as="h1">{title}</Heading>
      <Text size={16}>{intro}</Text>
      {children}
    </AuthShell>
  );
}

/** Back (ghost) and the ink Continue button with the lime arrow (generator `foot`). */
export function OnboardingFoot({ backHref, label = "Continue" }: { backHref?: string; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {backHref ? <ButtonLink href={backHref} variant="ghost">Back</ButtonLink> : null}
      <span className="grow" />
      <Button type="submit" variant="cta" size="lg" arrow>{label}</Button>
    </div>
  );
}
