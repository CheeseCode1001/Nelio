import { hrefFor, type ScreenId } from "@nelio/config";
import { db } from "@nelio/db";
import { BigTitle, Bubble, ButtonLink, Chip, Illustration, Row, RowList, Sticker, Text, type IconName, type Tone } from "@nelio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/shell";
import { homeFor, requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Your studio is ready" };

const NEXT: { title: string; sub: string; icon: IconName; tone: Tone; screen: ScreenId; chip?: ReactNode }[] = [
  { title: "Upload your first video", sub: "We’ll find the best moments", icon: "upload", tone: "lime", screen: "CL-02", chip: <Chip tone="blue">Start here</Chip> },
  { title: "Add your brand kit", sub: "Colours, fonts and caption style", icon: "palette", tone: "warn", screen: "ST-06", chip: <Chip tone="neutral">2 min</Chip> },
  { title: "Create your first agent", sub: "Or ask Nelio AI to plan one", icon: "bot", tone: "ai", screen: "APP-06" },
  { title: "Choose notifications", sub: "Approvals, renders, spending", icon: "bell", tone: "blue", screen: "ST-04" },
];

/** ON-05 All set. The same list stays on the Command Center checklist until it's done. */
export default async function OnboardingDone() {
  const ctx = await requireOnboarding("/onboarding/done");
  const org = await db().organization.findUniqueOrThrow({ where: { id: ctx.org.id }, select: { slug: true } });
  const href = (id: ScreenId) => hrefFor(id, { ws: ctx.workspace.slug, org: org.slug });
  return (
    <AuthShell width={620}>
      <div className="relative flex justify-center">
        <Illustration name="success" width={300} />
        <div className="absolute right-[30px] top-2.5">
          <Sticker fill="yellow" rotate={6} icon="star" size={14}>You’re in!</Sticker>
        </div>
      </div>
      <BigTitle size={52} className="md:text-[48px]">Your studio is ready.</BigTitle>
      <Text size={16}>Here’s what to do next. It stays on your dashboard until it’s done.</Text>
      <RowList>
        {NEXT.map((n) => (
          <Row key={n.title} title={n.title}>
            <Link href={href(n.screen)} className="flex items-center gap-3 px-4 py-3 text-text no-underline hover:text-text">
              <Bubble icon={n.icon} tone={n.tone} size={40} />
              <span className="min-w-0 grow">
                <span className="block text-sm font-semibold text-text">{n.title}</span>
                <span className="mt-0.5 block text-[13px] text-muted">{n.sub}</span>
              </span>
              {n.chip}
            </Link>
          </Row>
        ))}
      </RowList>
      <ButtonLink href={homeFor(ctx)} variant="cta" size="lg" arrow>Go to Command Center</ButtonLink>
    </AuthShell>
  );
}
