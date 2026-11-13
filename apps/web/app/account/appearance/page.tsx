import { db } from "@nelio/db";
import { PageHead } from "@nelio/ui";
import type { Metadata } from "next";
import { AccountTabs } from "@/components/account/account-tabs";
import { AppearanceForm } from "@/components/account/appearance-form";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Appearance" };

/** ST-03 Appearance. States: filled (Light selected), Dark selected. Light is the default (D-21). */
export default async function AppearancePage() {
  const session = await requireSession("/account/appearance");
  const prefs = await db().user.findUniqueOrThrow({ where: { id: session.user.id }, select: { theme: true, reduceMotion: true } });
  return (
    <>
      <PageHead eyebrow="Settings" title="Account" />
      <AccountTabs active="ST-03" />
      <AppearanceForm initialTheme={prefs.theme} initialReduceMotion={prefs.reduceMotion} />
    </>
  );
}
