import type { Metadata } from "next";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Verification" };

/** LI-06 Verification is built later in Milestone 5. */
export default async function Page() {
  await requireCreator("/creator/verify");
  return <NotBuiltYet title="Verification" screen="LI-06 Verification" milestone={5} />;
}
