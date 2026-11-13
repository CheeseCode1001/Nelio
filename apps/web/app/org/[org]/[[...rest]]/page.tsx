import { screenForPath } from "@nelio/config";
import { db } from "@nelio/db";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NotBuiltYet } from "@/components/system/not-built";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Development stand-in for organization screens (agency, billing) until Milestones 7 and 8.
 * Only owners and admins of the organization get past the access check; everyone else sees Access denied.
 */
export default async function UnbuiltOrgScreen({ params }: { params: Promise<{ org: string; rest?: string[] }> }) {
  const { org, rest = [] } = await params;
  const session = await requireSession(`/org/${org}`);
  const row = await db().organization.findFirst({ where: { slug: org, deletedAt: null }, select: { id: true } });
  if (!row || !session.actor.orgs.some((o) => o.orgId === row.id)) redirect("/denied");
  const def = screenForPath("org", rest.length ? `/${rest.join("/")}` : "");
  if (!def) notFound();
  return (
    <main id="main" className="flex grow flex-col p-4 md:p-8">
      <NotBuiltYet title={def.title} screen={`${def.id} ${def.title}`} milestone={def.milestone} />
    </main>
  );
}
