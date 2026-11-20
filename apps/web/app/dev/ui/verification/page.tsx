import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { SAMPLE_CHANNELS, SAMPLE_CREATOR } from "@/components/creator/sample";

const [VERIFIED, PENDING, FAILED] = SAMPLE_CHANNELS;
import { Verification, VerificationLoading } from "@/components/creator/verification";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "LI-06 preview", robots: { index: false } };


/** Development-only preview of LI-06: ?state=filled|pending|failed|empty|loading, &result= for the banner after sign-in. */
export default async function VerificationPreview({ searchParams }: { searchParams: Promise<{ state?: string; result?: string }> }) {
  if (!devUiEnabled()) notFound();
  const { state = "filled", result } = await searchParams;
  const channels = state === "empty" ? [] : state === "pending" ? [VERIFIED, PENDING] : state === "failed" ? [VERIFIED, FAILED] : [VERIFIED, PENDING, FAILED];
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-06">
      {state === "loading" ? <VerificationLoading /> : <Verification key={state} d={{ channels, youtubeReady: true }} result={result} preview />}
    </CreatorShell>
  );
}
