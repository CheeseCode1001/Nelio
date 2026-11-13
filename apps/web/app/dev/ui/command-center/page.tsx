import { MATRIX_ROLES, type MatrixRole } from "@nelio/domain";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommandCenter, CommandCenterLoading, CommandCenterStrip } from "@/components/command-center/command-center";
import type { CommandCenterState } from "@/components/command-center/model";
import { SAMPLE_EXTRAS, sampleFor } from "@/components/command-center/sample";
import type { ConnectionState, InstallState } from "@/components/pwa/pwa";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "APP-01 preview", robots: { index: false } };

const STATES: CommandCenterState[] = ["filled", "empty", "loading", "paused", "trial", "pastdue"];
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/**
 * Development-only preview of every APP-01 state with the design's sample data (handoff §3, §10).
 * /dev/ui/command-center?state=filled|empty|loading|paused|trial|pastdue&role=CR|ED|AV|...
 *   &install=prompt|ios|installed (SY-01) &connection=offline|reconnecting|synced (SY-02)
 * Not available in production builds unless NEXT_PUBLIC_DEV_UI=true.
 */
export default async function CommandCenterPreview({ searchParams }: { searchParams: Promise<{ state?: string; role?: string; install?: string; connection?: string }> }) {
  if (!devUiEnabled()) notFound();
  const sp = await searchParams;
  const state = (STATES as string[]).includes(sp.state ?? "") ? (sp.state as CommandCenterState) : "filled";
  const role = (MATRIX_ROLES as readonly string[]).includes(sp.role ?? "") ? (sp.role as MatrixRole) : "CR";
  const data = state === "loading" ? null : sampleFor(state);
  const href = (id: string) => `#${id}`;
  const install = (["prompt", "ios", "installed"] as const).find((x) => x === sp.install) as InstallState | undefined;
  const connection = (["offline", "reconnecting", "synced"] as const).find((x) => x === sp.connection) as ConnectionState | undefined;
  return (
    <AppShell
      current={WS}
      workspaces={[WS]}
      account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }}
      role={role}
      extras={state === "empty" ? { ...SAMPLE_EXTRAS, approvalsWaiting: null } : SAMPLE_EXTRAS}
      showUnbuilt
      active="APP-01"
      preview
      forceInstall={install}
      forceConnection={connection}
      strip={data?.strip ? <CommandCenterStrip strip={data.strip} href={href} resumeAvailable /> : null}
    >
      {data ? <CommandCenter data={data} href={href} /> : <CommandCenterLoading />}
    </AppShell>
  );
}
