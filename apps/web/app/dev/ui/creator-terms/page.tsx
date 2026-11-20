import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/creator/creator-shell";
import { LicenseTerms, LicenseTermsLoading } from "@/components/creator/license-terms";
import { SAMPLE_CREATOR, SAMPLE_TERMS } from "@/components/creator/sample";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "LI-07 preview", robots: { index: false } };

/** Development-only preview of LI-07: ?state=filled|unverified|saved|loading|empty. */
export default async function TermsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "unverified" ? { ...SAMPLE_TERMS, verified: false, listing: "draft" as const, published: false } : state === "empty" ? { ...SAMPLE_TERMS, videos: [], published: false, terms: { ...SAMPLE_TERMS.terms, hasThirdParty: false, thirdPartyNote: "", attribution: "" } } : SAMPLE_TERMS;
  return (
    <CreatorShell {...SAMPLE_CREATOR} active="LI-07">
      {state === "loading" ? <LicenseTermsLoading /> : <LicenseTerms key={state} d={d} displayName="Chef Kemi" hrefs={{ verify: "#LI-06" }} saved={state === "saved"} preview />}
    </CreatorShell>
  );
}
