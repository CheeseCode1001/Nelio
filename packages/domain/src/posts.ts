/**
 * Post drafts (CS-02): what each platform accepts and the plain-words problems shown under each field.
 * Limits follow each platform's published rules for Reels and Shorts.
 */
export const POST_KINDS = ["script", "caption", "clip_caption"] as const;
export type PostKind = (typeof POST_KINDS)[number];
export const POST_KIND_LABEL: Record<PostKind, string> = { script: "Script", caption: "Caption", clip_caption: "Clip + caption" };

export const DESTINATIONS = ["instagram", "youtube"] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const LIMITS = {
  instagram: { caption: 2200, firstComment: 2200, hashtags: 30 },
  youtube: { title: 100, description: 5000 },
  script: 20_000,
} as const;

export interface PostContent {
  instagram: { caption: string; firstComment: string };
  youtube: { title: string; description: string };
  script: string;
}

export const emptyContent = (): PostContent => ({ instagram: { caption: "", firstComment: "" }, youtube: { title: "", description: "" }, script: "" });

/** Reads stored content defensively (older drafts may miss fields). */
export function readContent(raw: unknown): PostContent {
  const r = (raw ?? {}) as Partial<PostContent>;
  const e = emptyContent();
  return {
    instagram: { caption: String(r.instagram?.caption ?? e.instagram.caption), firstComment: String(r.instagram?.firstComment ?? "") },
    youtube: { title: String(r.youtube?.title ?? ""), description: String(r.youtube?.description ?? "") },
    script: String(r.script ?? ""),
  };
}

export type FieldKey = "instagram.caption" | "instagram.firstComment" | "youtube.title" | "youtube.description" | "script";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Problems per field, worded as on the board ("100 characters max for Shorts titles (you have 104)"). */
export function validatePost(kind: PostKind, c: PostContent): Partial<Record<FieldKey, string>> {
  const out: Partial<Record<FieldKey, string>> = {};
  if (kind === "script") {
    if (c.script.length > LIMITS.script) out.script = `${fmt(LIMITS.script)} characters max for a script (you have ${fmt(c.script.length)})`;
    return out;
  }
  if (c.instagram.caption.length > LIMITS.instagram.caption) out["instagram.caption"] = `${fmt(LIMITS.instagram.caption)} characters max for Instagram captions (you have ${fmt(c.instagram.caption.length)})`;
  const tags = (c.instagram.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
  if (tags > LIMITS.instagram.hashtags) out["instagram.caption"] = `${LIMITS.instagram.hashtags} hashtags max on Instagram (you have ${tags})`;
  if (c.instagram.firstComment.length > LIMITS.instagram.firstComment) out["instagram.firstComment"] = `${fmt(LIMITS.instagram.firstComment)} characters max for a comment (you have ${fmt(c.instagram.firstComment.length)})`;
  if (c.youtube.title.length > LIMITS.youtube.title) out["youtube.title"] = `${LIMITS.youtube.title} characters max for Shorts titles (you have ${c.youtube.title.length})`;
  if (c.youtube.description.length > LIMITS.youtube.description) out["youtube.description"] = `${fmt(LIMITS.youtube.description)} characters max for Shorts descriptions (you have ${fmt(c.youtube.description.length)})`;
  return out;
}

export const hashtagsIn = (text: string): string[] => [...new Set((text.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.slice(1)))];

/** A draft's name: the clip it uses, else the first line of its text. */
export function draftTitle(kind: PostKind, c: PostContent, clipName?: string | null): string {
  if (clipName) return clipName.slice(0, 80);
  const text = (kind === "script" ? c.script : c.instagram.caption || c.youtube.title).trim();
  const first = text.split(/\n/)[0]?.replace(/#[\p{L}\p{N}_]+/gu, "").trim() ?? "";
  return first ? (first.length > 60 ? `${first.slice(0, 57)}…` : first) : kind === "script" ? "Untitled script" : "Untitled post";
}

/** "2h ago", "Yesterday", "12 Nov". */
export function relativeTime(at: Date, now: Date, tz = "UTC"): string {
  const s = Math.max(0, Math.round((now.getTime() - at.getTime()) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
  if (day(at) === day(now)) return `${Math.floor(s / 3600)}h ago`;
  if (day(at) === day(new Date(now.getTime() - 86_400_000))) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(at);
}
