import "server-only";
import { can } from "@nelio/domain";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/auth";

/** Licensing pages (LI-01 to LI-04): browsing needs licensing.browse; accepting free licences needs full licensing.request. */
export async function requireLicensing(slug: string) {
  const r = await requireWorkspace(slug);
  if (!can(r.session.actor, "licensing.browse", r.workspace).allowed) redirect("/denied");
  const req = can(r.session.actor, "licensing.request", r.workspace);
  const base = `/w/${r.workspace.slug}`;
  return {
    ...r,
    canAccept: req.allowed && (req.access === "F" || req.access === "A"),
    hrefs: { marketplace: `${base}/licensing`, mine: `${base}/licensing/mine`, studio: `${base}/media?filter=licensed`, sourceBase: `${base}/licensing/sources`, source: (id: string) => `${base}/licensing/sources/${id}` },
  };
}
