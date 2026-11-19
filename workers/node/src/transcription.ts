/**
 * Transcription adapters (Master Prompt 2: provider-agnostic, explicit fallback, quality modes). Each adapter
 * turns an audio URL into words with times in milliseconds and speaker numbers. Only configured adapters are
 * used; the product never names the provider.
 */
export interface Word { w: string; s: number; e: number; sp: number }
export type Quality = "fast" | "balanced" | "high";

export class TranscriptionUnavailable extends Error {}
export class TranscriptionRetryable extends Error {}

interface Adapter {
  id: string;
  configured(): boolean;
  transcribe(audioUrl: string, opts: { quality: Quality; language: string; signal: AbortSignal }): Promise<Word[]>;
}

/** Language codes the adapter accepts; regional variants without their own model fall back to the base language. */
function providerLanguage(lang: string): string {
  const supported = new Set(["en", "en-US", "en-GB", "en-AU", "en-IN", "fr", "es", "pt", "de", "hi"]);
  if (supported.has(lang)) return lang;
  return lang.split("-")[0] ?? "en";
}

const speechAdapter: Adapter = {
  id: "speech-a",
  configured: () => Boolean(process.env.DEEPGRAM_API_KEY),
  async transcribe(audioUrl, { quality, language, signal }) {
    // Fast uses the previous-generation model; Balanced and High use the current one. High also asks for
    // numerals and filler words, which helps noisy or accented audio at a higher cost.
    const params = new URLSearchParams({
      model: quality === "fast" ? "nova-2" : "nova-3",
      smart_format: "true",
      punctuate: "true",
      diarize: "true",
      language: providerLanguage(language),
      ...(quality === "high" ? { numerals: "true", filler_words: "true" } : {}),
    });
    let res: Response;
    try {
      res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
        method: "POST",
        headers: { authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ url: audioUrl }),
        signal,
      });
    } catch (e) {
      // Network failures (reset, DNS, timeout) are worth another try; keep the low-level cause for diagnosis.
      const cause = (e as { cause?: { code?: string; message?: string } }).cause;
      throw new TranscriptionRetryable(`network: ${cause?.code ?? cause?.message ?? (e instanceof Error ? e.message : "error")}`);
    }
    if (res.status === 429 || res.status >= 500) throw new TranscriptionRetryable(`transcription answered ${res.status}`);
    if (!res.ok) throw new Error(`transcription answered ${res.status}`);
    const j = (await res.json()) as { results?: { channels?: { alternatives?: { words?: { word: string; punctuated_word?: string; start: number; end: number; speaker?: number }[] }[] }[] } };
    const words = j.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];
    return words.map((x) => ({ w: x.punctuated_word ?? x.word, s: Math.round(x.start * 1000), e: Math.round(x.end * 1000), sp: x.speaker ?? 0 }));
  },
};

const ADAPTERS: Adapter[] = [speechAdapter];

/** Uses the first configured adapter and falls back to the next on a retryable failure. */
export async function transcribe(audioUrl: string, opts: { quality: Quality; language: string; signal: AbortSignal }): Promise<{ words: Word[]; adapter: string }> {
  const ready = ADAPTERS.filter((a) => a.configured());
  if (!ready.length) throw new TranscriptionUnavailable("Transcription isn’t set up for this deployment.");
  let last: unknown = null;
  for (const a of ready) {
    try {
      return { words: await a.transcribe(audioUrl, opts), adapter: a.id };
    } catch (e) {
      last = e;
      if (!(e instanceof TranscriptionRetryable)) throw e;
    }
  }
  throw last instanceof Error ? last : new TranscriptionRetryable("transcription failed");
}
