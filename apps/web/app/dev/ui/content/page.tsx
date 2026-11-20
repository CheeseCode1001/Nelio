import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { ContentStudio, ContentStudioLoading } from "@/components/content/content-studio";
import { SAMPLE_DRAFTS as DRAFTS } from "@/components/content/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "CS-01 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of CS-01: ?state=filled|empty|loading. */
export default async function ContentPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const hrefs = { compose: "/dev/ui/composer", script: "/dev/ui/composer?state=script", caption: "/dev/ui/composer", aiVideo: "/dev/ui/ai-video", licensing: "#LI-01", drafts: "#PB-02" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CS-01" preview>
      {state === "loading" ? <ContentStudioLoading /> : <ContentStudio drafts={state === "empty" ? [] : DRAFTS} hrefs={hrefs} />}
    </AppShell>
  );
}
