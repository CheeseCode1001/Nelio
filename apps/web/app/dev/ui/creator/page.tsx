import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorOverview, CreatorOverviewLoading } from "@/components/creator/creator-overview";
import { CreatorShell } from "@/components/creator/creator-shell";
import { SAMPLE_CREATOR, SAMPLE_OVERVIEW } from "@/components/creator/sample";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "LI-05 preview", robots: { index: false } };

/** Development-only preview of LI-05: ?state=filled|empty|loading|unverified. */
export default async function CreatorOverviewPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { ...SAMPLE_OVERVIEW, stats: { active: 0, clips: 0, published: 0, pending: 0 }, requests: [], uses: [] } : state === "unverified" ? { ...SAMPLE_OVERVIEW, verified: false } : SAMPLE_OVERVIEW;
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-05">
      {state === "loading" ? <CreatorOverviewLoading /> : <CreatorOverview d={d} hrefs={{ verify: "#LI-06", terms: "#LI-07", usage: "#LI-08", listing: "#listing" }} preview />}
    </CreatorShell>
  );
}
