import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourceDetail } from "@/components/licensing/source-detail";
import { loadSource } from "@/lib/licensing";
import { requireLicensing } from "../../../access";

export const metadata: Metadata = { title: "Request a license" };

const UUID = /^[0-9a-f-]{36}$/i;

/** LI-03 Request / accept license: the source page with its dialog open, or the creator's answer to a private request. */
export default async function RequestRoute({ params }: { params: Promise<{ ws: string; id: string }> }) {
  const { ws, id } = await params;
  const { workspace, hrefs, canAccept } = await requireLicensing(ws);
  const d = UUID.test(id) ? await loadSource(id, workspace.workspaceId) : null;
  if (!d) notFound();
  const dialog =
    d.decided && d.mine.kind === "active" ? "approved"
    : d.decided && d.mine.kind === "declined" ? "declined"
    : d.mine.kind === "none" || d.mine.kind === "ended" || d.mine.kind === "declined" ? (d.terms?.licenseType === "free" ? (canAccept ? "accept" : null) : d.terms ? "request" : null)
    : null;
  return <SourceDetail d={d} wsName={workspace.name} slug={workspace.slug} canAccept={canAccept} initialDialog={d.listing === "suspended" ? null : dialog} hrefs={{ ...hrefs, request: `${hrefs.source(id)}/request`, source: hrefs.source(id) }} />;
}
