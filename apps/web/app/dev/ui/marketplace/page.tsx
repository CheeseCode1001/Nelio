import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Marketplace, MarketplaceLoading } from "@/components/licensing/marketplace";
import { SAMPLE_MARKET } from "@/components/licensing/sample";
import { devUiEnabled } from "@/lib/dev-ui";
import { PreviewShell } from "../workspace-sample";

export const metadata: Metadata = { title: "LI-01 preview", robots: { index: false } };

/** Development-only preview of LI-01: ?state=filled|empty|nomatch|loading. */
export default async function MarketplacePreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d =
    state === "empty" ? { ...SAMPLE_MARKET, cards: [] }
    : state === "nomatch" ? { ...SAMPLE_MARKET, cards: [], filtered: true, filters: { ...SAMPLE_MARKET.filters, niche: "Food & cooking", platform: "instagram" as const, commercial: true } }
    : SAMPLE_MARKET;
  return <PreviewShell active="LI-01">{state === "loading" ? <MarketplaceLoading /> : <Marketplace key={state} d={d} hrefs={{ mine: "#LI-04", sourceBase: "/dev/ui/source?" }} preview />}</PreviewShell>;
}
