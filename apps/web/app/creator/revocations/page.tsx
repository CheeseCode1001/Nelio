import type { Metadata } from "next";
import { Revocations } from "@/components/creator/revocations";
import { loadRevocations, requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Revocations" };

/** LI-09 Revoke a license. */
export default async function RevocationsPage() {
  const c = await requireCreator("/creator/revocations");
  const d = await loadRevocations(c);
  return <Revocations d={d} />;
}
