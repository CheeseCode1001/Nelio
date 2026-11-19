import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { CAPTION_STYLES, CLIP_FORMATS, type ClipSnapshot, type Line } from "@nelio/domain";
import { z } from "zod";

/** Nelio AI in the web app: short interactive edits only. Long jobs run in the worker. */
const MODEL = process.env.NELIO_AI_MODEL || "claude-opus-5-5";

export const isNelioAiConfigured = () => Boolean(process.env.AI_API_KEY);

let client: Anthropic | null = null;
function ai(): Anthropic {
  client ??= new Anthropic({ apiKey: process.env.AI_API_KEY, maxRetries: 2, timeout: 60_000 });
  return client;
}

const EditSchema = z.object({
  start_s: z.number().nonnegative(),
  end_s: z.number().positive(),
  hook: z.string().min(1).max(60),
  caption_style: z.enum(Object.keys(CAPTION_STYLES) as [keyof typeof CAPTION_STYLES]),
  caption_size: z.number().int().min(80).max(140),
  format: z.enum(Object.keys(CLIP_FORMATS) as [keyof typeof CLIP_FORMATS]),
  summary: z.string().min(2).max(120),
  understood: z.boolean(),
});

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["start_s", "end_s", "hook", "caption_style", "caption_size", "format", "summary", "understood"],
  properties: {
    start_s: { type: "number", description: "Clip start in seconds of the source video. Snap to the start of a transcript line or word gap." },
    end_s: { type: "number", description: "Clip end in seconds. The clip must stay 8 to 90 seconds long." },
    hook: { type: "string", description: "On-screen hook text shown for the first 3 seconds, 2 to 6 words." },
    caption_style: { type: "string", enum: Object.keys(CAPTION_STYLES) },
    caption_size: { type: "integer", description: "Caption size as a percentage of default: 80, 90, 100, 110, 120, 130 or 140." },
    format: { type: "string", enum: Object.keys(CLIP_FORMATS) },
    summary: { type: "string", description: "One short sentence telling the creator what you changed, e.g. 'Trimmed the opening pause and made captions bigger.'" },
    understood: { type: "boolean", description: "False if the request can't be done with these settings; then return the settings unchanged and explain in summary." },
  },
} as const;

const SYSTEM = `You are Nelio AI inside a short-video editor. The creator describes an edit in plain words and you return the new clip settings.
You can only change: clip start and end (trim), the hook text, caption style (${Object.entries(CAPTION_STYLES).map(([k, v]) => `${k} = ${v.label}`).join(", ")}), caption size, and format (${Object.keys(CLIP_FORMATS).join(", ")}).
Change only what was asked; keep everything else exactly as it is. Use the word timings to find pauses and sentence boundaries. Never invent words for the hook that contradict what is said.`;

export type EditResult = { snapshot: ClipSnapshot; summary: string; understood: boolean };

/** Applies a plain-words edit to a clip. Throws on service problems; the caller shows a friendly message. */
export async function editWithWords(args: { request: string; snapshot: ClipSnapshot; lines: Line[]; words: [number, number, string][] }): Promise<EditResult> {
  const { snapshot: s } = args;
  // Context: the lines around the clip and word timings inside it, so pauses can be found.
  const near = args.lines.filter((l) => l.end > s.startMs - 20_000 && l.start < s.endMs + 20_000);
  const inside = args.words.filter(([a, b]) => b > s.startMs - 2000 && a < s.endMs + 2000);
  const content = [
    `Current settings: start ${(s.startMs / 1000).toFixed(2)} s, end ${(s.endMs / 1000).toFixed(2)} s, hook "${s.hook}", caption_style ${s.captionStyle}, caption_size ${s.captionSize}, format ${s.format}.`,
    `Transcript lines near the clip:\n${near.map((l) => `[${(l.start / 1000).toFixed(1)}-${(l.end / 1000).toFixed(1)}] S${l.sp}: ${l.text}`).join("\n")}`,
    `Word timings in and around the clip (start-end s, word):\n${inside.map(([a, b, w]) => `${(a / 1000).toFixed(2)}-${(b / 1000).toFixed(2)} ${w}`).join("\n")}`,
    `Edit request: ${args.request}`,
  ].join("\n\n");
  const response = await ai().beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") return { snapshot: s, summary: "Nelio AI can’t make that edit.", understood: false };
  const out = response.content.find((b) => b.type === "text");
  if (!out || out.type !== "text") throw new Error("no reply");
  const r = EditSchema.parse(JSON.parse(out.text));
  return {
    understood: r.understood,
    summary: r.summary,
    snapshot: { ...s, startMs: Math.round(r.start_s * 1000), endMs: Math.round(r.end_s * 1000), hook: r.hook.trim(), captionStyle: r.caption_style, captionSize: r.caption_size, format: r.format },
  };
}

const HooksSchema = z.object({ question: z.string().min(2).max(48), number: z.string().min(2).max(48) });

/** CL-04: two alternative hooks for a clip, a question and one built around a number, grounded in what's said. */
export async function writeVariantHooks(args: { hook: string; clipText: string }): Promise<{ question: string; number: string }> {
  const response = await ai().beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["question", "number"],
          properties: {
            question: { type: "string", description: "The hook rewritten as a short question, 2 to 6 words, e.g. 'Are you budgeting wrong?'" },
            number: { type: "string", description: "A hook built around a number from or implied by the clip, 2 to 6 words, e.g. '3 budget mistakes'" },
          },
        },
      },
    },
    system: "You are Nelio AI. You write on-screen hooks for short vertical videos: 2 to 6 words, plain language, true to what the speaker says, no clickbait claims, no emoji.",
    messages: [{ role: "user", content: `Current hook: "${args.hook}"\n\nWhat is said in the clip:\n${args.clipText.slice(0, 6000)}\n\nWrite a question hook and a number hook.` }],
  });
  const out = response.content.find((b) => b.type === "text");
  if (response.stop_reason === "refusal" || !out || out.type !== "text") throw new Error("no hooks");
  const r = HooksSchema.parse(JSON.parse(out.text));
  return { question: r.question.trim(), number: r.number.trim() };
}
