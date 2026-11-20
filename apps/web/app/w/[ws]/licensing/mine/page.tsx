import type { Metadata } from "next";
import { MyLicenses } from "@/components/licensing/my-licenses";
import { loadMyLicenses } from "@/lib/licensing";
import { requireLicensing } from "../access";

export const metadata: Metadata = { title: "My licenses" };

/** LI-04 My licenses. */
export default async function MyLicensesRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  const { workspace, hrefs } = await requireLicensing(ws);
  const d = await loadMyLicenses(workspace.workspaceId);
  return <MyLicenses slug={workspace.slug} d={d} hrefs={{ marketplace: hrefs.marketplace, sourceBase: hrefs.sourceBase, affected: "#affected" }} />;
}
