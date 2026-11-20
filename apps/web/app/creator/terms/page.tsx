import { isStorageConfigured } from "@nelio/db";
import type { Metadata } from "next";
import { LicenseTerms } from "@/components/creator/license-terms";
import { loadTerms, requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Licensing terms" };

/** LI-07 Licensing terms, with the creator's own videos. */
export default async function TermsPage() {
  const c = await requireCreator("/creator/terms");
  const d = await loadTerms(c, isStorageConfigured());
  return <LicenseTerms d={d} displayName={c.displayName} hrefs={{ verify: "/creator/verify" }} />;
}
