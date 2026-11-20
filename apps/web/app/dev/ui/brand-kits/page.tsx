import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { BrandKitsLoading, BrandKitsPage, type Kit } from "@/components/settings/brand-kits";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "ST-06 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const KIT: Kit = { id: "k1", name: "Ada Studio", colours: ["#FFD43B", "#0B0B14", "#FF4FB8", "#FFFFFF"], captionFont: "Plus Jakarta Sans", captionStyle: "bold_pop", voice: "Friendly, clear, no slang. Explain like a smart friend.", isDefault: true };

/** Development-only preview of ST-06: ?state=filled|editing|empty|loading. */
export default async function BrandKitsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="ST-06" preview>
      {state === "loading" ? <BrandKitsLoading /> : <BrandKitsPage key={state} kits={state === "empty" ? [] : [KIT]} current="k1" kitBase="/dev/ui/brand-kits" preview={{ editing: state === "editing" }} />}
    </AppShell>
  );
}
