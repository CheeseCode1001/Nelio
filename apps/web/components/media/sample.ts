import { photoSrc, type PhotoKey } from "@nelio/ui";
import type { MediaData } from "@/lib/media";

const P = (n: number) => photoSrc(`p${n}` as PhotoKey);

/** Sample data for the development preview and loading state of CL-01. */
export const MEDIA_SAMPLE: MediaData = {
  storageUsed: "20 GB",
  anyUploads: true,
  licensed: 1,
  items: [
    { id: "1", kind: "upload", title: "podcast_ep12.mp4", sub: "48 min · uploaded 14:02", chip: { label: "processing", tone: "blue", icon: "refresh" }, poster: P(9), overlay: null, href: "#" },
    { id: "6", kind: "upload", title: "Chef Kemi · Ep 4", sub: "31 min · free license", chip: { label: "licensed", tone: "ai", icon: "shield" }, poster: P(4), overlay: null, href: "#" },
    { id: "2", kind: "upload", title: "interview_raw.mov", sub: "22 min · own upload", chip: { label: "ready", tone: "ok", icon: "check" }, poster: P(3), overlay: null, href: "#" },
    { id: "3", kind: "clip", title: "Stop budgeting like this", sub: "0:42 · from ep12", chip: { label: "draft clip", tone: "lime", icon: "scissors" }, poster: P(1), overlay: "STOP THIS", href: "#" },
    { id: "4", kind: "export", title: "5 budgeting myths", sub: "0:31 · 9:16", chip: { label: "exported", tone: "ok", icon: "download" }, poster: P(5), overlay: "5 MYTHS", href: "#" },
    { id: "5", kind: "upload", title: "old_vlog_2024.mp4", sub: "14 min · free license", chip: { label: "license expired", tone: "err", icon: "alert" }, poster: P(7), overlay: null, href: "#" },
  ],
};
