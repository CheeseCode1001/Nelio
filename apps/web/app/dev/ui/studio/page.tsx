import { photoSrc } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { StudioLoading, StudioPage } from "@/components/studio/studio-page";
import { devUiEnabled } from "@/lib/dev-ui";
import type { StudioData } from "@/lib/studio";

export const metadata: Metadata = { title: "CL-03 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

const LINES: [number, number, number, string][] = [
  [12000, 15500, 0, "Okay, stop budgeting like this. Seriously."],
  [16000, 20500, 0, "Everyone tells you to write down every naira you spend."],
  [21000, 23500, 1, "And nobody actually does that."],
  [24000, 30500, 0, "Exactly. So here’s what works instead."],
  [31000, 54000, 0, "Pay yourself first, then spend the rest guilt-free."],
];
const words: [number, number, string][] = LINES.flatMap(([s, e, , text]) => {
  const ws = text.split(" ");
  const step = (e - s) / ws.length;
  return ws.map((w, i) => [Math.round(s + i * step), Math.round(s + (i + 1) * step - 60), w] as [number, number, string]);
});

const SAMPLE: StudioData = {
  asset: { id: "a1", filename: "podcast_ep12.mp4", title: "podcast_ep12", durationMs: 48 * 60_000, sub: "Source: your upload · 48 min", rightsLabel: "Own upload · rights r-881", status: "ready" },
  mode: "ready",
  blocked: null,
  processing: null,
  moments: [
    { id: "m1", rank: 1, title: "Stop budgeting like this", hook: "Stop budgeting like this", score: 82, startMs: 12000, endMs: 54000 },
    { id: "m2", rank: 2, title: "The 50/30/20 myth", hook: "The 50/30/20 myth", score: 74, startMs: 190000, endMs: 231000 },
    { id: "m3", rank: 3, title: "Why savings fail", hook: "Why savings fail", score: 61, startMs: 422000, endMs: 460000 },
    { id: "m4", rank: 4, title: "Rent hacks that work", hook: "Rent hacks that work", score: 58, startMs: 760000, endMs: 795000 },
  ],
  lines: LINES.map(([start, end, sp, text]) => ({ start, end, sp, text })),
  words,
  project: null,
  revisions: [],
  brandKits: [{ id: "00000000-0000-4000-8000-000000000001", name: "Ada Studio", accent: "#FFD43B" }],
  render: null,
  videoUrl: null,
  posterUrl: photoSrc("p9"),
};

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
