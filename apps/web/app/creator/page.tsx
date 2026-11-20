import type { Metadata } from "next";
import { CreatorOverview } from "@/components/creator/creator-overview";
import { loadOverview, requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Creator Portal" };

/** LI-05 Creator portal overview. */
export default async function CreatorPage() {
  const c = await requireCreator("/creator");
  const d = await loadOverview(c);
  return <CreatorOverview d={d} hrefs={{ verify: "/creator/verify", terms: "/creator/terms", usage: "/creator/usage", listing: `/l/${c.creatorId}` }} />;
}
