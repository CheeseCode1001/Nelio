import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { Payouts } from "@/components/creator/payouts";
import { SAMPLE_CREATOR } from "@/components/creator/sample";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "LI-10 preview", robots: { index: false } };

/** Development-only preview of LI-10: ?state=filled|notified. */
export default async function PayoutsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-10">
      <Payouts key={state} notified={state === "notified"} preview />
    </CreatorShell>
  );
}
