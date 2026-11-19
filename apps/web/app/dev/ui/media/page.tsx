import { photoSrc, type PhotoKey } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { MediaLibrary, MediaLibraryLoading } from "@/components/media/media-library";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";
import type { MediaData } from "@/lib/media";

export const metadata: Metadata = { title: "CL-01 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const P = (n: number) => photoSrc(`p${n}` as PhotoKey);
const SAMPLE: MediaData = {
  storageUsed: "20 GB",
  anyUploads: true,
  items: [
    { id: "1", kind: "upload", title: "podcast_ep12.mp4", sub: "48 min · uploaded 14:02", chip: { label: "processing", tone: "blue", icon: "refresh" }, poster: P(9), overlay: null, href: "#" },
    { id: "2", kind: "upload", title: "interview_raw.mov", sub: "22 min · own upload", chip: { label: "ready", tone: "ok", icon: "check" }, poster: P(3), overlay: null, href: "#" },
    { id: "3", kind: "clip", title: "Stop budgeting like this", sub: "0:42 · from ep12", chip: { label: "draft clip", tone: "lime", icon: "scissors" }, poster: P(1), overlay: "STOP THIS", href: "#" },
    { id: "4", kind: "export", title: "5 budgeting myths", sub: "0:31 · 9:16", chip: { label: "exported", tone: "ok", icon: "download" }, poster: P(5), overlay: "5 MYTHS", href: "#" },
    { id: "5", kind: "upload", title: "old_vlog_2024.mp4", sub: "14 min · can’t be used", chip: { label: "can’t be used", tone: "err", icon: "alert" }, poster: P(7), overlay: null, href: "#" },
  ],
};

/** Development-only preview of CL-01: ?state=filled|empty|loading|licensed. */
export default async function MediaPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { ...SAMPLE, items: [], anyUploads: false } : state === "licensed" ? { ...SAMPLE, items: [] } : SAMPLE;
  const hrefs = { filter: (f: string) => `/dev/ui/media?filter=${f}`, upload: "#CL-02", licensing: "#LI-01" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-01" preview>
      {state === "loading" ? <MediaLibraryLoading /> : <MediaLibrary d={d} filter={state === "licensed" ? "licensed" : "all"} hrefs={hrefs} />}
    </AppShell>
  );
}
