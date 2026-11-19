import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourceDetail } from "@/components/licensing/source-detail";
import { loadSource } from "@/lib/licensing";
import { requireLicensing } from "../../access";

export const metadata: Metadata = { title: "Licensing" };

const UUID = /^[0-9a-f-]{36}$/i;

/** LI-02 Source detail & terms. */
export default async function SourceRoute({ params }: { params: Promise<{ ws: string; id: string }> }) {
  const { ws, id } = await params;
  const { workspace, hrefs, canAccept } = await requireLicensing(ws);
  const d = UUID.test(id) ? await loadSource(id, workspace.workspaceId) : null;
  if (!d) notFound();
  return <SourceDetail d={d} wsName={workspace.name} slug={workspace.slug} canAccept={canAccept} hrefs={{ ...hrefs, request: `${hrefs.source(id)}/request`, source: hrefs.source(id) }} />;
}
