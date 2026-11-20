import type { Metadata } from "next";
import { Verification } from "@/components/creator/verification";
import { loadVerification, requireCreator } from "@/lib/creator";
import { youtubeConfigured } from "@/lib/youtube-verify";

export const metadata: Metadata = { title: "Verification" };

/** LI-06 Verification: YouTube sign-in (Google testing mode) or a check by hand. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const c = await requireCreator("/creator/verify");
  const [d, { result }] = await Promise.all([loadVerification(c, youtubeConfigured()), searchParams]);
  return <Verification d={d} result={result} />;
}
