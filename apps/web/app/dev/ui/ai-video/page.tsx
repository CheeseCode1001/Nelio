import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AiVideoPage } from "@/components/content/ai-video";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "CS-03 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of CS-03: ?state=filled|notified. */
export default async function AiVideoPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CS-03" preview>
      <AiVideoPage key={state} interested={state === "notified"} hrefs={{ content: "/dev/ui/content", studio: "/dev/ui/media" }} />
    </AppShell>
  );
}
