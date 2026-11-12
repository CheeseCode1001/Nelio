import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Creator Portal" };

/** LI-05 Creator portal overview is a Milestone 5 screen. Only content owners get in. */
export default async function CreatorPage() {
  const session = await requireSession("/creator");
  if (!session.actor.isContentOwner) redirect("/denied");
  return <NotBuiltYet title="Creator Portal" screen="LI-05 Creator Portal" milestone={5} />;
}
