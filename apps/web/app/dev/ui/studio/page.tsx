import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { StudioLoading, StudioPage } from "@/components/studio/studio-page";
import { STUDIO_SAMPLE as SAMPLE } from "@/components/studio/sample";
import { devUiEnabled } from "@/lib/dev-ui";
import type { StudioData } from "@/lib/studio";

export const metadata: Metadata = { title: "CL-03 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };


/** Development-only preview of CL-03: ?state=filled|processing|loading|blocked|unsaved|estimate|queued. */
export default async function StudioPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d: StudioData =
    state === "processing"
      ? {
          ...SAMPLE, mode: "processing", moments: [], lines: [], words: [],
          processing: {
            steps: [
              { title: "Upload & check file", detail: "2.1 GB · 48 min", state: "done" },
              { title: "Transcribe", detail: "Balanced quality · 61%", state: "running" },
              { title: "Detect scenes", detail: null, state: "queued" },
              { title: "Rank moments", detail: "Nelio AI", state: "queued" },
              { title: "Build previews", detail: null, state: "queued" },
            ],
            estimate: 22, used: 9, eta: "This takes about 6 minutes for a 48-minute video. You can leave; we’ll notify you.",
          },
        }
      : state === "blocked"
        ? { ...SAMPLE, mode: "blocked", blocked: { title: "Can’t render: this video can’t be used", text: "The file couldn’t be read as a video. Upload it again or pick another source." } }
        : SAMPLE;
  const hrefs = { library: "/dev/ui/media", variants: "#CL-04" };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CL-01" preview>
      {state === "loading" ? <StudioLoading /> : <StudioPage key={state} d={d} hrefs={hrefs} preview={{ unsaved: state === "unsaved", estimate: state === "estimate", queued: state === "queued" }} />}
    </AppShell>
  );
}
