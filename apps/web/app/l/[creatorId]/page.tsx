import { db, listWorkspacesFor } from "@nelio/db";
import { can } from "@nelio/domain";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * A creator's shareable listing link (LI-05 "Copy listing link"). Opens their source page in the visitor's
 * first workspace that can browse licensing; anyone else sees the not-found page.
 */
export default async function ListingLink({ params }: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await params;
  if (!UUID.test(creatorId)) notFound();
  const session = await requireSession(`/l/${creatorId}`);
  const listed = await db().creatorProfile.findFirst({ where: { id: creatorId, listingStatus: "listed" }, select: { id: true } });
  if (!listed) notFound();
  const workspaces = await listWorkspacesFor(db(), session.actor);
  const ws = workspaces.find((w) => w.kind === "primary" && can(session.actor, "licensing.browse", w).allowed) ?? workspaces.find((w) => can(session.actor, "licensing.browse", w).allowed);
  if (!ws) notFound();
  redirect(`/w/${ws.slug}/licensing/sources/${creatorId}`);
}
