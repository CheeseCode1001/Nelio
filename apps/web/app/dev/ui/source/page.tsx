import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourceDetail, SourceDetailLoading } from "@/components/licensing/source-detail";
import { SAMPLE_SOURCE } from "@/components/licensing/sample";
import { devUiEnabled } from "@/lib/dev-ui";
import type { SourceData } from "@/lib/licensing";
import { PreviewShell } from "../workspace-sample";

export const metadata: Metadata = { title: "LI-02 preview", robots: { index: false } };

const PRIVATE: SourceData = { ...SAMPLE_SOURCE, terms: { ...SAMPLE_SOURCE.terms!, licenseType: "private", platforms: ["instagram"], expiresMonths: 12 } };
const LMT = { name: "Lagos Money Talk", initials: "LM" };

/**
 * Development-only preview of LI-02 and LI-03.
 * ?state=filled|private|suspended|licensed|requested|revoked|editor|loading, &dialog=accept|request|sent|approved|declined.
 */
export default async function SourcePreview({ searchParams }: { searchParams: Promise<{ state?: string; dialog?: string }> }) {
  if (!devUiEnabled()) notFound();
  const { state = "filled", dialog } = await searchParams;
  const d: SourceData =
    state === "private" || dialog === "request" || dialog === "sent" ? PRIVATE
    : state === "suspended" ? { ...SAMPLE_SOURCE, listing: "suspended" }
    : state === "licensed" ? { ...SAMPLE_SOURCE, mine: { kind: "active", agreementId: "a1", until: "30 Jun 2027", status: { kind: "active", endsInDays: 200 } } }
    : state === "requested" ? { ...PRIVATE, mine: { kind: "requested", agreementId: "a1" } }
    : state === "revoked" ? { ...SAMPLE_SOURCE, mine: { kind: "ended", why: "revoked", agreementId: "a1" } }
    : dialog === "approved" ? { ...PRIVATE, ...LMT, mine: { kind: "active", agreementId: "a1", until: "20 May 2027", status: { kind: "active", endsInDays: 180 } }, decided: { kind: "approved", note: null, months: 6, platforms: "Instagram" } }
    : dialog === "declined" ? { ...PRIVATE, ...LMT, mine: { kind: "declined", note: "Not licensing to new accounts right now." }, decided: { kind: "declined", note: "Not licensing to new accounts right now.", months: 6, platforms: "Instagram" } }
    : SAMPLE_SOURCE;
  const hrefs = { marketplace: "/dev/ui/marketplace", mine: "/dev/ui/my-licenses", studio: "#CL-01", studioBase: "#CL-03", request: "#LI-03", source: "/dev/ui/source" };
  const initial = (["accept", "request", "sent", "approved", "declined"] as const).find((x) => x === dialog) ?? null;
  return (
    <PreviewShell active="LI-01">
      {state === "loading" ? <SourceDetailLoading /> : <SourceDetail key={`${state}-${dialog}`} d={d} wsName="Ada Studio" hrefs={hrefs} canAccept={state !== "editor"} initialDialog={initial} preview />}
    </PreviewShell>
  );
}
