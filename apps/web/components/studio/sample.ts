import { photoSrc } from "@nelio/ui";
import type { ExportsData } from "@/lib/exports";
import type { StudioData } from "@/lib/studio";

/** Sample data for the development previews and loading states of CL-03 and CL-05. */
export const EXPORTS_SAMPLE: ExportsData = {
  trial: { used: 1, cap: 2 },
  rows: [
    { id: "r1", title: "“5 budgeting myths” · Hook A", format: "9:16 · 1080p", status: "rendering", chip: { label: "rendering", tone: "blue", icon: "refresh" }, progress: 40, credits: "18 → —", posterUrl: photoSrc("p5"), downloadUrl: null, duration: "0:42", source: "Money Talk · ep 12" },
    { id: "r2", title: "“Stop budgeting like this”", format: "9:16 · 1080p", status: "ready", chip: { label: "ready", tone: "ok", icon: "check" }, progress: null, credits: "20 → 17", posterUrl: photoSrc("p1"), downloadUrl: "#download", duration: "0:42", source: "Money Talk · ep 13" },
    { id: "r3", title: "“Rent hacks that work”", format: "9:16 · 1080p", status: "failed", chip: { label: "failed · refunded", tone: "err", icon: "x" }, progress: null, credits: "15 → 0", posterUrl: photoSrc("p7"), downloadUrl: null, duration: "0:42", source: "Money Talk · ep 11" },
  ],
};

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

export const STUDIO_SAMPLE: StudioData = {
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
