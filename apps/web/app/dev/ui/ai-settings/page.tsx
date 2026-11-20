import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AiSettingsLoading, AiSettingsPage } from "@/components/settings/ai-settings";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "ST-07 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of ST-07: ?state=filled|viewonly|loading. */
export default async function AiSettingsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="ST-07" preview>
      {state === "loading" ? <AiSettingsLoading /> : <AiSettingsPage key={state} saved={{ quality: "balanced", language: "en-NG", suggestPostTimes: true }} canEdit={state !== "viewonly"} aiReady />}
    </AppShell>
  );
}
