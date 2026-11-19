import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyLicenses, MyLicensesLoading } from "@/components/licensing/my-licenses";
import { SAMPLE_MINE } from "@/components/licensing/sample";
import { devUiEnabled } from "@/lib/dev-ui";
import { PreviewShell } from "../workspace-sample";

export const metadata: Metadata = { title: "LI-04 preview", robots: { index: false } };

/** Development-only preview of LI-04: ?state=filled|empty|loading|expired. */
export default async function MyLicensesPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d =
    state === "empty" ? { rows: [], revoked: null, expired: null, affected: [] }
    : state === "expired" ? { ...SAMPLE_MINE, revoked: null, affected: [], expired: { name: "Chef Kemi", creatorId: "s1", drafts: 4 } }
    : SAMPLE_MINE;
  return <PreviewShell active="LI-04">{state === "loading" ? <MyLicensesLoading /> : <MyLicenses d={d} hrefs={{ marketplace: "/dev/ui/marketplace", sourceBase: "/dev/ui/source?", affected: "#affected" }} />}</PreviewShell>;
}
