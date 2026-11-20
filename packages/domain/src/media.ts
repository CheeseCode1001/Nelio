/**
 * Media rules shared by the upload form, the server and the worker. Limits and credit rates are provisional
 * until the cost benchmark (decision D-10); they reproduce the boards' examples.
 */

export const ACCEPTED_TYPES = { "video/mp4": "mp4", "video/quicktime": "mov" } as const;
export type AcceptedType = keyof typeof ACCEPTED_TYPES;
export const MAX_UPLOAD_BYTES = 2 * 1024 ** 3; // 2 GB
export const MAX_DURATION_SEC = 2 * 60 * 60; // 2 hours

/** Accepts by declared type, falling back to the extension (some browsers report an empty type for .mov). */
export function videoTypeFor(filename: string, declared: string): AcceptedType | null {
  if (declared in ACCEPTED_TYPES) return declared as AcceptedType;
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "mp4" || ext === "m4v") return "video/mp4";
  if (ext === "mov") return "video/quicktime";
  return null;
}

export type UploadProblem = { code: "type" | "size" | "duration" | "empty"; text: string };

/** CL-02 Wrongtype and the limits, in the board's wording. */
export function checkUpload(file: { name: string; type: string; size: number; durationSec?: number | null }): UploadProblem | null {
  if (!videoTypeFor(file.name, file.type)) return { code: "type", text: `${file.name} isn’t a video. Upload MP4 or MOV up to 2 GB.` };
  if (file.size <= 0) return { code: "empty", text: `${file.name} is empty.` };
  if (file.size > MAX_UPLOAD_BYTES) return { code: "size", text: `${file.name} is larger than 2 GB. Trim it or export a smaller file.` };
  if (file.durationSec && file.durationSec > MAX_DURATION_SEC) return { code: "duration", text: `${file.name} is longer than 2 hours. Split it into parts first.` };
  return null;
}

export type Quality = "fast" | "balanced" | "high";
export const QUALITY_LABEL: Record<Quality, string> = { fast: "Fast", balanced: "Balanced", high: "High quality" };
export const QUALITY_HELP: Record<Quality, string> = {
  fast: "Fast: quickest and cheapest; fine for clear speech.",
  balanced: "Balanced: good accuracy for most speech.",
  high: "High quality is slower and costs more; best for accents, music or noisy audio.",
};

/** Credits per minute of source video for the whole processing run (transcribe, scenes, rank, previews). */
const PER_MINUTE: Record<Quality, number> = { fast: 0.17, balanced: 0.42, high: 0.85 };

export function processingEstimate(durationSec: number, quality: Quality): number {
  return Math.max(1, Math.ceil((durationSec / 60) * PER_MINUTE[quality]));
}

/** How a processing estimate is split across its steps (the runner reserves per step). */
export function processingSplit(total: number): { check_file: number; transcribe: number; detect_scenes: number; rank_moments: number; build_previews: number } {
  const transcribe = Math.round(total * 0.6);
  const detect = Math.round(total * 0.1);
  const rank = Math.round(total * 0.15);
  return { check_file: 0, transcribe, detect_scenes: detect, rank_moments: rank, build_previews: Math.max(0, total - transcribe - detect - rank) };
}

/** Rendering one clip at 1080p: about 0.43 credits per second of output (a 42-second clip ≈ 18). */
export function renderEstimate(clipSec: number): number {
  return Math.max(1, Math.ceil(clipSec * 0.43));
}

/** "48 min", "1 h 12 min", "0:42" for clips under a minute and a half. */
export function formatDuration(sec: number | null | undefined, style: "long" | "clock" = "long"): string {
  if (sec === null || sec === undefined || !Number.isFinite(sec)) return "—";
  const s = Math.round(sec);
  if (style === "clock") {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
  }
  const m = Math.round(s / 60);
  if (m < 60) return `${Math.max(1, m)} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** "2.3 GB", "640 MB". */
export function formatBytes(n: number): string {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${Math.round(n / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

export const CAPTION_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-US", label: "English (US)" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
] as const;
