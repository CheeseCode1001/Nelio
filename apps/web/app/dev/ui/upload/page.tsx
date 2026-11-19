import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { UploadPage } from "@/components/media/upload-page";
import type { UploadPreview } from "@/components/media/upload-form";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "CL-02 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const FILE = { name: "podcast_ep13.mp4", size: 2.3 * 1024 ** 3, type: "video/mp4", durationSec: 52 * 60 };

/** Development-only preview of CL-02: ?state=filled|uploading|wrongtype|norights. */
export default async function UploadPreviewPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const preview: UploadPreview =
    state === "uploading" ? { phase: { k: "uploading", file: FILE, sent: 1.5 * 1024 ** 3, etaSec: 50 }, rights: "own" }
    : state === "wrongtype" ? { phase: { k: "wrongtype", text: "party_photos.zip isn’t a video. Upload MP4 or MOV up to 2 GB." }, rights: "own" }
    : state === "norights" ? { phase: { k: "uploaded", file: FILE }, rights: null, norights: true }
    : { phase: { k: "idle" }, rights: "own" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-01" preview>
      <UploadPage defaults={{ quality: "balanced", language: "en-NG" }} libraryHref="#CL-01" studioBase="#CL-03" preview={preview} />
    </AppShell>
  );
}
