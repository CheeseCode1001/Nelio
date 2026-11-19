import type { Metadata } from "next";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Revocations" };

/** LI-09 Revoke a license is built later in Milestone 5. */
export default async function Page() {
  await requireCreator("/creator/revocations");
  return <NotBuiltYet title="Revocations" screen="LI-09 Revoke a license" milestone={5} />;
}
