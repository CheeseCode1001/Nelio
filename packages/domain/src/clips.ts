/**
 * Clip editing rules shared by the Studio (CL-03), the render worker and the tests: transcript lines,
 * caption chunks, clip bounds, formats, caption styles and the captions file the renderer burns in.
 */

/** One transcribed word: text, start and end in ms, speaker number. */
export interface Word { w: string; s: number; e: number; sp: number }
export interface Line { start: number; end: number; sp: number; text: string }

export const MIN_CLIP_MS = 8_000;
export const MAX_CLIP_MS = 90_000;

/** Groups words into readable lines: a new line on a speaker change, after a sentence, or every 12 s. */
export function transcriptLines(words: Word[]): Line[] {
  const lines: Line[] = [];
  let cur: Line | null = null;
  for (const w of words) {
    if (!cur || w.sp !== cur.sp || w.s - cur.start > 12_000 || /[.?!]$/.test(cur.text)) {
      if (cur) lines.push(cur);
      cur = { start: w.s, end: w.e, sp: w.sp, text: w.w };
    } else {
      cur.end = w.e;
      cur.text += ` ${w.w}`;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Keeps a clip inside the video and between 8 and 90 seconds, moving the end first. */
export function clampClip(startMs: number, endMs: number, durationMs: number): { startMs: number; endMs: number } {
  const total = Math.max(0, Math.round(durationMs));
  let s = Math.max(0, Math.min(Math.round(startMs), Math.max(0, total - MIN_CLIP_MS)));
  let e = Math.round(endMs);
  if (e - s < MIN_CLIP_MS) e = s + MIN_CLIP_MS;
  if (e - s > MAX_CLIP_MS) e = s + MAX_CLIP_MS;
  if (e > total) {
    e = total;
    s = Math.max(0, Math.min(s, e - MIN_CLIP_MS));
  }
  return { startMs: s, endMs: e };
}

/** "0:12–0:54" from milliseconds. */
export function formatRange(startMs: number, endMs: number): string {
  const f = (ms: number) => {
    const t = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = String(t % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
  };
  return `${f(startMs)}–${f(endMs)}`;
}

/** "00:12" for a transcript line. */
export function formatStamp(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// ------------------------------------------------------------------ formats and caption styles

export const CLIP_FORMATS = {
  "9:16": { label: "9:16 vertical", width: 1080, height: 1920 },
  "1:1": { label: "1:1 square", width: 1080, height: 1080 },
  "16:9": { label: "16:9 wide", width: 1920, height: 1080 },
} as const;
export type ClipFormat = keyof typeof CLIP_FORMATS;
export const isClipFormat = (v: string): v is ClipFormat => v in CLIP_FORMATS;

export const CAPTION_STYLES = {
  bold_pop: { label: "Bold pop", words: 3, upper: true },
  clean: { label: "Clean", words: 6, upper: false },
  boxed: { label: "Boxed", words: 4, upper: false },
  minimal: { label: "Minimal", words: 4, upper: false, lower: true },
  none: { label: "No captions", words: 0, upper: false },
} as const;
export type CaptionStyle = keyof typeof CAPTION_STYLES;
export const isCaptionStyle = (v: string): v is CaptionStyle => v in CAPTION_STYLES;

/** Caption size as a percentage of the default (Edit with words can make them bigger or smaller). */
export const CAPTION_SIZES = [80, 100, 120, 140] as const;
export function clampCaptionSize(n: number): number {
  return Math.min(140, Math.max(80, Math.round(n / 10) * 10));
}

export interface Chunk { start: number; end: number; text: string }

/** Caption chunks inside a clip, timed relative to the clip start. */
export function captionChunks(words: Word[], startMs: number, endMs: number, style: CaptionStyle): Chunk[] {
  const per = CAPTION_STYLES[style].words;
  if (!per) return [];
  const lower = "lower" in CAPTION_STYLES[style];
  const inside = words.filter((w) => w.e > startMs && w.s < endMs);
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    const text = cur.map((w) => w.w).join(" ");
    chunks.push({ start: Math.max(0, cur[0]!.s - startMs), end: Math.min(endMs, cur[cur.length - 1]!.e) - startMs, text: CAPTION_STYLES[style].upper ? text.toUpperCase() : lower ? text.toLowerCase().replace(/[.,!?]+$/, "") : text });
    cur = [];
  };
  for (const w of inside) {
    const prev = cur[cur.length - 1];
    if (cur.length >= per || (prev && (w.s - prev.e > 600 || /[.?!,]$/.test(prev.w)))) flush();
    cur.push(w);
  }
  flush();
  // Hold each chunk until the next one starts, so captions don't flicker between words.
  for (let i = 0; i < chunks.length - 1; i++) {
    const gap = chunks[i + 1]!.start - chunks[i]!.end;
    if (gap > 0 && gap < 700) chunks[i]!.end = chunks[i + 1]!.start;
  }
  return chunks;
}

// ------------------------------------------------------------------ captions file (ASS) for the renderer

const assTime = (ms: number) => {
  const cs = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
};
/** "#FFD43B" → ASS "&H003BD4FF" (alpha, blue, green, red). */
export function assColour(hex: string, alpha = 0): string {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1] ?? "FFFFFF";
  const r = h.slice(0, 2), g = h.slice(2, 4), b = h.slice(4, 6);
  return `&H${alpha.toString(16).padStart(2, "0")}${b}${g}${r}`.toUpperCase();
}
const assText = (t: string) => t.replace(/\\/g, "＼").replace(/[{}]/g, "").replace(/\n/g, "\\N");

export interface AssOptions {
  format: ClipFormat;
  style: CaptionStyle;
  sizePct: number;
  font: string;
  /** Brand kit colours; defaults are the Nelio yellow and ink. */
  accent?: string;
  ink?: string;
  hook?: string;
  /** Shown for the last 1.5 s when a brand kit is applied. */
  endCard?: string;
  clipMs: number;
}

/** Builds the captions file: hook card for the first 3 s, the spoken captions, and an optional end card. */
export function buildAss(chunks: Chunk[], o: AssOptions): string {
  const { width, height } = CLIP_FORMATS[o.format];
  const base = Math.round((o.format === "16:9" ? 54 : 74) * (o.sizePct / 100));
  const accent = o.accent ?? "#FFD43B";
  const ink = o.ink ?? "#0B0B14";
  const white = "#FFFFFF";
  const capMargin = Math.round(height * (o.format === "9:16" ? 0.24 : 0.12));
  const styles = {
    bold_pop: `Style: Caption,${o.font},${base},${assColour(white)},${assColour(white)},${assColour(ink)},${assColour(ink, 0x40)},0,0,0,0,100,100,0,0,1,${Math.round(base / 10)},2,2,60,60,${capMargin},1`,
    clean: `Style: Caption,${o.font},${Math.round(base * 0.82)},${assColour(white)},${assColour(white)},${assColour(ink, 0x60)},${assColour(ink, 0x80)},0,0,0,0,100,100,0,0,1,2,3,2,80,80,${capMargin},1`,
    boxed: `Style: Caption,${o.font},${Math.round(base * 0.86)},${assColour(white)},${assColour(white)},${assColour(ink, 0x20)},${assColour(ink, 0x20)},0,0,0,0,100,100,0,0,3,${Math.round(base / 5)},0,2,80,80,${capMargin},1`,
    minimal: `Style: Caption,${o.font},${Math.round(base * 0.7)},${assColour(ink)},${assColour(ink)},${assColour(accent)},${assColour(accent)},0,0,0,0,100,100,0,0,3,${Math.round(base / 6)},0,2,80,80,${capMargin},1`,
    none: `Style: Caption,${o.font},${base},${assColour(white)},${assColour(white)},${assColour(ink)},${assColour(ink)},0,0,0,0,100,100,0,0,1,0,0,2,60,60,${capMargin},1`,
  }[o.style];
  const lines = [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    "WrapStyle: 0",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    styles,
    `Style: Hook,${o.font},${Math.round(base * 0.78)},${assColour(ink)},${assColour(ink)},${assColour(accent)},${assColour(accent)},0,0,0,0,100,100,0,0,3,${Math.round(base / 4)},0,8,80,80,${Math.round(height * 0.12)},1`,
    `Style: End,${o.font},${Math.round(base * 0.7)},${assColour(white)},${assColour(white)},${assColour(ink, 0x20)},${assColour(ink, 0x20)},0,0,0,0,100,100,0,0,3,${Math.round(base / 4)},0,5,80,80,0,1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];
  if (o.hook) lines.push(`Dialogue: 1,${assTime(0)},${assTime(Math.min(3000, o.clipMs))},Hook,,0,0,0,,${assText(o.hook.toUpperCase())}`);
  for (const c of chunks) {
    if (c.end <= c.start) continue;
    lines.push(`Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Caption,,0,0,0,,${assText(c.text)}`);
  }
  if (o.endCard && o.clipMs > 4000) lines.push(`Dialogue: 2,${assTime(o.clipMs - 1500)},${assTime(o.clipMs)},End,,0,0,0,,${assText(o.endCard)}`);
  return `${lines.join("\n")}\n`;
}

/** FFmpeg crop that fills the target format from a source frame, centred. */
export function cropFor(srcW: number, srcH: number, format: ClipFormat): { w: number; h: number; x: number; y: number } {
  const { width, height } = CLIP_FORMATS[format];
  const target = width / height;
  const even = (n: number) => Math.max(2, Math.floor(n / 2) * 2);
  if (srcW / srcH > target) {
    const w = even(srcH * target);
    return { w, h: even(srcH), x: Math.floor((srcW - w) / 2), y: 0 };
  }
  const h = even(srcW / target);
  return { w: even(srcW), h, x: 0, y: Math.floor((srcH - h) / 2) };
}

/** What a saved version holds (ProjectRevision.snapshot). */
export interface ClipSnapshot {
  startMs: number;
  endMs: number;
  hook: string;
  captionStyle: CaptionStyle;
  captionSize: number;
  format: ClipFormat;
  brandKitId: string | null;
}

/** Plain-words summary of what changed between two versions ("Trim and caption size changed"). */
export function describeChanges(a: ClipSnapshot, b: ClipSnapshot): string {
  const parts: string[] = [];
  if (a.startMs !== b.startMs || a.endMs !== b.endMs) parts.push("trim");
  if (a.hook !== b.hook) parts.push("hook");
  if (a.captionStyle !== b.captionStyle) parts.push("caption style");
  if (a.captionSize !== b.captionSize) parts.push("caption size");
  if (a.format !== b.format) parts.push("format");
  if (a.brandKitId !== b.brandKitId) parts.push("brand kit");
  if (!parts.length) return "";
  const list = parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `${list[0]!.toUpperCase()}${list.slice(1)} changed since your last save.`;
}

// ------------------------------------------------------------------ batch variants (CL-04)

export interface Variant { key: string; label: string; settings: ClipSnapshot; selected: boolean }

/** The first words of a hook, for formats with less room ("Stop budgeting like this" → "Stop budgeting"). */
export function shortHook(hook: string, words = 2): string {
  return hook.split(/\s+/).slice(0, words).join(" ");
}

/**
 * The six variants of a clip: three hooks (the clip's own, a question and a number), no captions, a square
 * cut and minimal captions. The first three are picked by default. Previews are free; only renders cost.
 */
export function buildVariants(base: ClipSnapshot, hooks: { question: string; number: string }): Variant[] {
  const v = (key: string, label: string, patch: Partial<ClipSnapshot>, selected = false): Variant => ({ key, label, settings: { ...base, captionStyle: "bold_pop", format: "9:16", ...patch }, selected });
  return [
    v("hook_a", "Hook A · bold pop", { hook: base.hook }, true),
    v("hook_b", "Hook B · question", { hook: hooks.question }, true),
    v("hook_c", "Hook C · number", { hook: hooks.number }, true),
    v("no_captions", "No captions", { hook: "", captionStyle: "none" }),
    v("square", "1:1 square", { hook: shortHook(base.hook), format: "1:1" }),
    v("minimal", "Minimal captions", { hook: base.hook.toLowerCase(), captionStyle: "minimal" }),
  ];
}
