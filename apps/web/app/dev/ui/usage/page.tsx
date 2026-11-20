import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { SAMPLE_CREATOR, SAMPLE_USAGE } from "@/components/creator/sample";
import { Usage, UsageLoading } from "@/components/creator/usage";
import { devUiEnabled } from "@/lib/dev-ui";
import type { UsageTab } from "@/lib/creator";

export const metadata: Metadata = { title: "LI-08 preview", robots: { index: false } };

/** Development-only preview of LI-08: ?state=filled|empty|loading, &tab=all|published|scheduled|on_hold. */
export default async function UsagePreview({ searchParams }: { searchParams: Promise<{ state?: string; tab?: string }> }) {
  if (!devUiEnabled()) notFound();
  const { state = "filled", tab = "all" } = await searchParams;
  const t = (["all", "published", "scheduled", "on_hold"].includes(tab) ? tab : "all") as UsageTab;
  const rows = t === "all" ? SAMPLE_USAGE : SAMPLE_USAGE.filter((r) => r.status === t);
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-08">
      {state === "loading" ? <UsageLoading /> : <Usage d={{ rows: state === "empty" ? [] : rows, tab: t, any: state !== "empty" }} hrefs={{ tab: (x) => `/dev/ui/usage?tab=${x}`, csv: "#csv" }} />}
    </CreatorShell>
  );
}
