import type { Metadata } from "next";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Usage" };

/** LI-08 Usage audit is built later in Milestone 5. */
export default async function Page() {
  await requireCreator("/creator/usage");
  return <NotBuiltYet title="Usage" screen="LI-08 Usage audit" milestone={5} />;
}
