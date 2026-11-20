import type { Metadata } from "next";
import { Payouts } from "@/components/creator/payouts";
import { loadPayouts, requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Payouts" };

/** LI-10 Payouts: "coming later" (B-08). */
export default async function PayoutsPage() {
  const c = await requireCreator("/creator/payouts");
  const d = await loadPayouts(c);
  return <Payouts notified={d.notified} />;
}
