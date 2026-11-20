import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Word } from "./transcription";

/**
 * Nelio AI: the only general-purpose reasoning model (Master Prompt 2). The production key (AI_API_KEY) is kept
 * separate from developer credentials. The model can be changed without code (NELIO_AI_MODEL).
 */
export const NELIO_AI_MODEL = process.env.NELIO_AI_MODEL || "claude-opus-5-5";

export class NelioAiUnavailable extends Error {}
export class NelioAiDeclined extends Error {}

let client: Anthropic | null = null;
function ai(): Anthropic {
  if (!process.env.AI_API_KEY) throw new NelioAiUnavailable("Nelio AI isn’t set up for this deployment.");
  client ??= new Anthropic({ apiKey: process.env.AI_API_KEY, maxRetries: 3 });
  return client;
}

export const MomentSchema = z.object({
  moments: z.array(z.object({
    start_s: z.number().nonnegative(),
    end_s: z.number().positive(),
    title: z.string().min(2).max(80),
    hook: z.string().min(2).max(48),
    score: z.number().int().min(0).max(100),
    reasons: z.array(z.string().min(2).max(90)).min(1).max(3),
  })).max(8),
});
export type Moments = z.infer<typeof MomentSchema>["moments"];

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["moments"],
  properties: {
    moments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["start_s", "end_s", "title", "hook", "score", "reasons"],
        properties: {
          start_s: { type: "number", description: "Start time in seconds; must be the start time of a transcript line." },
          end_s: { type: "number", description: "End time in seconds; the clip should be 20 to 60 seconds long." },
          title: { type: "string", description: "A short quote or summary of the moment, as the creator might say it." },
          hook: { type: "string", description: "On-screen hook text, 2 to 6 words, written to stop a scroll." },
          score: { type: "integer", description: "0-100: how well this works as a standalone short. An estimate, never a promise." },
          reasons: { type: "array", items: { type: "string" }, description: "1 to 3 short, concrete reasons for the score." },
        },
      },
    },
  },
} as const;

const SYSTEM = `You are Nelio AI, helping creators turn long videos into short vertical clips.
You read a timestamped transcript and pick the moments that work best as standalone shorts (20 to 60 seconds).
A good moment makes sense without the rest of the video, opens strongly, and lands one clear idea, tip, story beat or laugh.
Prefer fewer, better moments over many weak ones; return at most 6, never overlapping.
Scores are honest estimates of standalone quality, not predictions of views. Never invent words that are not in the transcript.`;

/** Groups words into transcript lines (speaker change, sentence end, or ~12 s), as "[12.3–18.9] S0: text". */
export function transcriptLines(words: Word[]): { start: number; end: number; sp: number; text: string }[] {
  const lines: { start: number; end: number; sp: number; text: string }[] = [];
  let cur: { start: number; end: number; sp: number; text: string } | null = null;
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

/** Asks Nelio AI for the best moments. The reply is constrained to the schema and validated again here. */
export async function rankMoments(words: Word[], opts: { title: string; signal: AbortSignal }): Promise<Moments> {
  const lines = transcriptLines(words);
  const text = lines.map((l) => `[${(l.start / 1000).toFixed(1)}-${(l.end / 1000).toFixed(1)}] S${l.sp}: ${l.text}`).join("\n");
  const response = await ai().beta.messages.create(
    {
      model: NELIO_AI_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: `Video: ${opts.title}\n\nTranscript (seconds, speaker):\n${text}\n\nPick the best moments.` }],
    },
    { signal: opts.signal },
  );
  if (response.stop_reason === "refusal") throw new NelioAiDeclined("Nelio AI couldn’t rank this video.");
  const out = response.content.find((b) => b.type === "text");
  if (!out || out.type !== "text") throw new Error("Nelio AI returned no moments.");
  const parsed = MomentSchema.safeParse(JSON.parse(out.text));
  if (!parsed.success) throw new Error("Nelio AI returned moments in an unexpected shape.");
  return parsed.data.moments;
}

/** Retryable when the service is busy or briefly unavailable; everything else is a real failure. */
export function isRetryableAiError(e: unknown): boolean {
  return e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError || e instanceof Anthropic.APIConnectionError;
}
