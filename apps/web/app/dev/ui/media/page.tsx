import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { MediaLibrary, MediaLibraryLoading } from "@/components/media/media-library";
import { MEDIA_SAMPLE as SAMPLE } from "@/components/media/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "CL-01 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of CL-01: ?state=filled|empty|loading|licensed|licensed-empty. */
export default async function MediaPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { ...SAMPLE, items: [], anyUploads: false } : state === "licensed" ? { ...SAMPLE, items: SAMPLE.items.filter((i) => i.id === "6" || i.id === "5") } : state === "licensed-empty" ? { ...SAMPLE, items: [] } : SAMPLE;
  const hrefs = { filter: (f: string) => `/dev/ui/media?filter=${f}`, upload: "#CL-02", licensing: "#LI-01" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-01" preview>
      {state === "loading" ? <MediaLibraryLoading /> : <MediaLibrary d={d} filter={state.startsWith("licensed") ? "licensed" : "all"} hrefs={hrefs} />}
    </AppShell>
  );
}
