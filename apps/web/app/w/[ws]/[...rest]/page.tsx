import { screenForPath } from "@nelio/config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotBuiltYet } from "@/components/system/not-built";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Development stand-in for workspace screens whose milestone has not landed (decision T-5). Access is
 * already checked by the workspace layout. Addresses that match no designed screen are a real Not found.
 */
export default async function UnbuiltWorkspaceScreen({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  const def = screenForPath("workspace", `/${rest.join("/")}`);
  if (!def) notFound();
  return <NotBuiltYet title={def.title} screen={`${def.id} ${def.title}`} milestone={def.milestone} />;
}
