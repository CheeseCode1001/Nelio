/** What a step handler reports. Handlers never fake success: unavailable work comes back as "blocked". */
export type StepOutcome =
  | { status: "done"; actualCredits: number; detail?: string }
  | { status: "blocked"; reason: string; text: string };

export interface StepContext {
  stepId: string;
  kind: string;
  runId: string;
  run: { id: string; kind: "agent" | "process" | "render"; number: number; orgId: string; workspaceId: string; assetId: string | null; renderId: string | null };
  /** Null for work a person started by hand (processing an upload, rendering a clip). */
  agent: { id: string; name: string; sourceRefs: unknown; destinationRefs: unknown } | null;
  signal: AbortSignal;
  /** Updates the step's one-line detail while it runs ("61%"), for the Activity panel and Studio. */
  progress: (detail: string) => Promise<void>;
}
export type StepHandler = (ctx: StepContext) => Promise<StepOutcome>;

/** A failure worth retrying (network, provider 5xx). Anything else thrown is treated the same way. */
export class RetryableStepError extends Error {}
