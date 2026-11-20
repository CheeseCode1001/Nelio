import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { Revocations, RevocationsLoading } from "@/components/creator/revocations";
import { SAMPLE_CREATOR, SAMPLE_REVOCATIONS } from "@/components/creator/sample";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "LI-09 preview", robots: { index: false } };

/** Development-only preview of LI-09: ?state=filled|dialog|done|empty|loading. */
export default async function RevocationsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { past: [], active: [] } : state === "done" ? { ...SAMPLE_REVOCATIONS, past: [{ id: "r2", who: "Campus Hub", when: "Today", held: 1, flagged: 1 }, ...SAMPLE_REVOCATIONS.past] } : SAMPLE_REVOCATIONS;
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-09">
      {state === "loading" ? <RevocationsLoading /> : <Revocations key={state} d={d} preview initialOpen={state === "dialog"} initialDone={state === "done" ? { who: "Campus Hub", held: 1, flagged: 1 } : undefined} />}
    </CreatorShell>
  );
}
