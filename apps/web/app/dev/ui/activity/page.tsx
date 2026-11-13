import { Button } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityLoading, ActivityPage } from "@/components/activity/activity-page";
import { ACTIVITY_SAMPLE } from "@/components/activity/sample";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import type { ActivityFilter } from "@/lib/activity";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-03 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of APP-03: ?state=filled|empty|loading|reconnecting|synced|filtered. */
export default async function ActivityPreview({ searchParams }: { searchParams: Promise<{ state?: string; filter?: string }> }) {
  if (!devUiEnabled()) notFound();
  const sp = await searchParams;
  const state = sp.state ?? "filled";
  const d = state === "empty" ? { ...ACTIVITY_SAMPLE, items: [], panel: null, hasAgents: false } : state === "filtered" ? { ...ACTIVITY_SAMPLE, items: ACTIVITY_SAMPLE.items.filter((i) => i.bucket !== "failed"), counts: { ...ACTIVITY_SAMPLE.counts, failed: 0 } } : ACTIVITY_SAMPLE;
  const filter: ActivityFilter = state === "filtered" ? "failed" : "all";
  const hrefs = { filter: (f: ActivityFilter) => `/dev/ui/activity?filter=${f}`, run: (id: string) => `/dev/ui/activity?run=${id}`, newAgent: "#APP-06", upload: "#CL-02" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="APP-03" preview>
      {state === "loading" ? <ActivityLoading /> : (
        <ActivityPage d={d} filter={filter} hrefs={hrefs} live={{ topic: null, preview: state === "reconnecting" ? "reconnecting" : state === "synced" ? "synced" : "live" }} headerAction={<Button variant="secondary" icon="pause">Pause all</Button>} />
      )}
    </AppShell>
  );
}
