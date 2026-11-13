import { Card, CardTitle, Chip, PlatformBadge, Small, type IconName, type Platform, type Tone } from "@nelio/ui";
import type { Metadata } from "next";
import { OnboardingFoot, OnboardingStep } from "@/components/onboarding/step";
import { continueFromConnectAction } from "@/lib/actions/onboarding";
import { devUiEnabled } from "@/lib/dev-ui";
import { homeFor, requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Connect your accounts" };

type RowState = "in_development" | "later" | "done" | "limit";
const ROW: Record<RowState, { chip: string; tone: Tone; icon: IconName; sub: string }> = {
  // Decision D-06: until a platform's app review passes, its sign-in is "In development", never a working button.
  in_development: { chip: "In development", tone: "warn", icon: "clock", sub: "We’ll tell you when it’s ready." },
  later: { chip: "Coming later", tone: "neutral", icon: "clock", sub: "We’ll tell you when it’s ready." },
  done: { chip: "Connected · @adastudio", tone: "ok", icon: "check", sub: "You can add more later." },
  limit: { chip: "Plan limit: 1 account", tone: "warn", icon: "lock", sub: "Upgrade to connect more." },
};

function PlatformRow({ platform, name, state }: { platform: Platform; name: string; state: RowState }) {
  const r = ROW[state];
  return (
    <Card className="!p-4">
      <div className="flex flex-wrap items-center gap-3.5">
        <PlatformBadge platform={platform} size={44} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle>{name}</CardTitle>
          <Small>{r.sub}</Small>
        </div>
        <span className="grow" />
        <Chip tone={r.tone} icon={r.icon}>{r.chip}</Chip>
      </div>
    </Card>
  );
}

/**
 * ON-03 Connect accounts. States drawn: filled, one connected, plan limit. No platform is approved yet, so
 * real accounts see "In development" (YouTube, Instagram) and "Coming later" (TikTok, Facebook).
 * Development previews: ?state=connected or ?state=limit.
 */
export default async function ConnectStep({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const ctx = await requireOnboarding("/onboarding/connect");
  const preview = devUiEnabled() ? (await searchParams).state : undefined;
  const ig: RowState = preview === "connected" || preview === "limit" ? "done" : "in_development";
  const yt: RowState = preview === "limit" ? "limit" : "in_development";
  return (
    <OnboardingStep step={3} title="Connect your accounts" intro="Optional. Agents can only post to accounts you connect." skipHref={homeFor(ctx)}>
      <form action={continueFromConnectAction} className="flex flex-col gap-4 md:gap-[18px]">
        <div className="flex flex-col gap-2.5">
          <PlatformRow platform="ig" name="Instagram" state={ig} />
          <PlatformRow platform="yt" name="YouTube" state={yt} />
          <PlatformRow platform="tt" name="TikTok" state="later" />
          <PlatformRow platform="fb" name="Facebook" state="later" />
        </div>
        <OnboardingFoot backHref="/onboarding/goals" />
      </form>
    </OnboardingStep>
  );
}
