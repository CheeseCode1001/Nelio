import type { Metadata } from "next";
import { Usage } from "@/components/creator/usage";
import { USAGE_TABS, loadUsage, requireCreator, type UsageTab } from "@/lib/creator";

export const metadata: Metadata = { title: "Usage" };

/** LI-08 Usage audit: every scheduled, published or held post made from the creator’s videos. */
export default async function UsagePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const c = await requireCreator("/creator/usage");
  const sp = await searchParams;
  const tab: UsageTab = (USAGE_TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as UsageTab) : "all";
  const d = await loadUsage(c, tab);
  return <Usage d={d} hrefs={{ tab: (t) => (t === "all" ? "/creator/usage" : `/creator/usage?tab=${t}`), csv: "/creator/usage/export" }} />;
}
