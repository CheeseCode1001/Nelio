import { photoSrc } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { ExportsLoading, ExportsPage } from "@/components/studio/exports-page";
import { devUiEnabled } from "@/lib/dev-ui";
import type { ExportsData } from "@/lib/exports";

export const metadata: Metadata = { title: "CL-05 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const SAMPLE: ExportsData = {
  trial: { used: 1, cap: 2 },
  rows: [
    { id: "r1", title: "“5 budgeting myths” · Hook A", format: "9:16 · 1080p", status: "rendering", chip: { label: "rendering", tone: "blue", icon: "refresh" }, progress: 40, credits: "18 → —", posterUrl: photoSrc("p5"), downloadUrl: null },
    { id: "r2", title: "“Stop budgeting like this”", format: "9:16 · 1080p", status: "ready", chip: { label: "ready", tone: "ok", icon: "check" }, progress: null, credits: "20 → 17", posterUrl: photoSrc("p1"), downloadUrl: "#download" },
    { id: "r3", title: "“Rent hacks that work”", format: "9:16 · 1080p", status: "failed", chip: { label: "failed · refunded", tone: "err", icon: "x" }, progress: null, credits: "15 → 0", posterUrl: photoSrc("p7"), downloadUrl: null },
  ],
};

/** Development-only preview of CL-05: ?state=filled|empty|loading|trial. */
export default async function ExportsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { rows: [], trial: null } : state === "trial" ? { ...SAMPLE, trial: { used: 2, cap: 2 } } : SAMPLE;
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-05" preview>
      {state === "loading" ? <ExportsLoading /> : <ExportsPage d={d} hrefs={{ studio: "/dev/ui/media", plans: "#BI-02" }} />}
    </AppShell>
  );
}
