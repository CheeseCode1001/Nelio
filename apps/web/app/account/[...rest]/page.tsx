import { screenForPath } from "@nelio/config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false } };

/** Development stand-in for account screens (profile, security, notifications, privacy) until Milestone 9. */
export default async function UnbuiltAccountScreen({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  await requireSession(`/account/${rest.join("/")}`);
  const def = screenForPath("account", `/${rest.join("/")}`);
  if (!def) notFound();
  return <NotBuiltYet title={def.title} screen={`${def.id} ${def.title}`} milestone={def.milestone} />;
}
