import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { ExportsLoading, ExportsPage } from "@/components/studio/exports-page";
import { EXPORTS_SAMPLE as SAMPLE } from "@/components/studio/sample";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "CL-05 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

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
