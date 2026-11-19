import { photoSrc } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { VariantsPage } from "@/components/studio/variants-page";
import { devUiEnabled } from "@/lib/dev-ui";
import { sampleVariants, type VariantsData } from "@/lib/exports";

export const metadata: Metadata = { title: "CL-04 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const BASE = { startMs: 12000, endMs: 54000, hook: "Stop budgeting like this", captionStyle: "bold_pop" as const, captionSize: 100, format: "9:16" as const, brandKitId: null };

/** Development-only preview of CL-04: ?state=filled|generating|blocked. */
export default async function VariantsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d: VariantsData = {
    asset: { id: "a1", title: "podcast_ep12" }, projectId: "p1", base: BASE,
    set: state === "generating" ? null : { id: "s1", items: sampleVariants(BASE) },
    posterUrl: photoSrc("p9"),
    blocked: state === "blocked" ? "This video can’t be used. Pick another source." : null,
  };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-01" preview>
      <VariantsPage key={state} d={d} hrefs={{ studio: "/dev/ui/studio", exports: "/dev/ui/exports" }} preview={{ generating: state === "generating" }} />
    </AppShell>
  );
}
