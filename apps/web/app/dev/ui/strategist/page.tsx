import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { StrategistPage } from "@/components/strategist/strategist-page";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-02 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of APP-02 in its "needs setup" state (the Empty board's layout). */
export default async function StrategistPreview() {
  if (!devUiEnabled()) notFound();
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="APP-02" preview>
      <StrategistPage available={false} />
    </AppShell>
  );
}
