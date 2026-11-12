import { db, findWorkspaceFor } from "@nelio/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Client Portal" };

/** CP-01 Client portal home is a Milestone 7 screen. The membership check is real. */
export default async function PortalPage({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const session = await requireSession(`/portal/${ws}`);
  const workspace = await findWorkspaceFor(db(), session.actor, ws);
  if (!workspace) redirect("/denied");
  return <NotBuiltYet title={workspace.name} screen="CP-01 Client Portal" milestone={7} />;
}
