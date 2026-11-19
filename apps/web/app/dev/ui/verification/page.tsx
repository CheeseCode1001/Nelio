import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { SAMPLE_CREATOR } from "@/components/creator/sample";
import { Verification, VerificationLoading } from "@/components/creator/verification";
import { devUiEnabled } from "@/lib/dev-ui";
import type { ChannelRow } from "@/lib/creator";

export const metadata: Metadata = { title: "LI-06 preview", robots: { index: false } };

const VERIFIED: ChannelRow = { id: "c1", platform: "youtube", title: "YouTube · Chef Kemi", sub: "Verified 2 Nov 2026", status: "verified", retry: null, code: null };
const PENDING: ChannelRow = { id: "c2", platform: "instagram", title: "Instagram · @chefkemi", sub: "Add nelio-4F2K9A to your bio. We’ll check within 1–2 working days.", status: "pending", retry: null, code: "nelio-4F2K9A" };
const FAILED: ChannelRow = { id: "c3", platform: "youtube", title: "YouTube · Kemi Vlogs", sub: "That sign-in didn’t own this channel. Sign in with the owner account.", status: "failed", retry: "youtube", code: null };

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
