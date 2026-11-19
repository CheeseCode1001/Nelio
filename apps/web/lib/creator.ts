import "server-only";
import { db } from "@nelio/db";
import { LICENSE_EDITS, LICENSE_PLATFORMS, LICENSE_USES, PLATFORM_LABEL, formatBytes, formatDuration, relativeTime, type LicenseEdit, type LicenseKind, type LicensePlatform, type LicenseUse, type ListingStatusName, type TermsSnapshot } from "@nelio/domain";
import { redirect } from "next/navigation";
import { requireSession, type Session } from "./auth";

/** Short platform codes the UI badges use. */
export const BADGE: Record<LicensePlatform, "ig" | "yt" | "tt" | "fb"> = { instagram: "ig", youtube: "yt", tiktok: "tt", facebook: "fb" };

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";

const COLORS = ["#FF7A2F", "#59D8FF", "#B6F24A", "#FFD43B", "#FF4FB8", "#8B5CF6"];
export const colorFor = (s: string) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]!;

export interface CreatorContext {
  session: Session;
  creatorId: string;
  displayName: string;
  firstName: string;
  initials: string;
}

/** For /creator pages: signed in, and a content owner. Everyone else gets SY-04 Access denied. */
export async function requireCreator(next = "/creator"): Promise<CreatorContext> {
  const session = await requireSession(next);
  if (!session.actor.isContentOwner) redirect("/denied");
  const p = await db().creatorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true, displayName: true } });
  if (!p) redirect("/denied");
  return { session, creatorId: p.id, displayName: p.displayName, firstName: p.displayName.split(/\s+/)[0] ?? p.displayName, initials: initialsOf(p.displayName) };
}

export interface CreatorShellData {
  name: string;
  email: string;
  initials: string;
  userId: string | null;
  unread: number;
  surfaces: string[];
  operatorHref: string | null;
}

// ------------------------------------------------------------------ LI-05 Overview

export interface RequestRow { id: string; who: string; initials: string; color: string; title: string; sub: string; note: string | null; terms: TermsSnapshot }
export interface UseRow { id: string; who: string; video: string; platform: "ig" | "yt" | "tt" | "fb" | null; when: string }
export interface OverviewData {
  firstName: string;
  verified: boolean;
  listing: ListingStatusName;
  stats: { active: number; clips: number; published: number; pending: number };
  requests: RequestRow[];
  uses: UseRow[];
}

export function readTerms(json: unknown): TermsSnapshot {
  const t = (json ?? {}) as Partial<TermsSnapshot>;
  return {
    licenseType: (t.licenseType ?? "free") as LicenseKind,
    allowedUses: (t.allowedUses ?? ["clips"]).filter((u): u is LicenseUse => (LICENSE_USES as readonly string[]).includes(u)),
    platforms: (t.platforms ?? []).filter((p): p is LicensePlatform => (LICENSE_PLATFORMS as readonly string[]).includes(p)),
    commercial: Boolean(t.commercial),
    attribution: String(t.attribution ?? ""),
    edits: (t.edits ?? []).filter((e): e is LicenseEdit => (LICENSE_EDITS as readonly string[]).includes(e)),
    expiresMonths: typeof t.expiresMonths === "number" ? t.expiresMonths : null,
    excludedCount: Number(t.excludedCount ?? 0),
  };
}

export function requestSub(t: TermsSnapshot): string {
  return [t.platforms.map((p) => PLATFORM_LABEL[p]).join(", "), t.commercial ? "commercial use" : "non-commercial", t.expiresMonths ? `${t.expiresMonths} months` : "until revoked"].filter(Boolean).join(" · ");
}

export async function loadOverview(c: CreatorContext, now = new Date()): Promise<OverviewData> {
  const client = db();
  const licensed = { asset: { license: { creatorId: c.creatorId } } };
  const [profile, verified, active, pendingRows, clips, published, recent] = await Promise.all([
    client.creatorProfile.findUniqueOrThrow({ where: { id: c.creatorId }, select: { listingStatus: true } }),
    client.creatorChannel.count({ where: { creatorId: c.creatorId, status: "verified" } }),
    client.licenseAgreement.count({ where: { creatorId: c.creatorId, status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    client.licenseAgreement.findMany({ where: { creatorId: c.creatorId, status: "requested" }, orderBy: { createdAt: "asc" }, take: 20, select: { id: true, type: true, terms: true, requestNote: true, workspace: { select: { name: true } } } }),
    client.clipProject.count({ where: licensed }),
    client.post.count({ where: { state: "published", render: { project: licensed } } }),
    client.post.findMany({
      where: { state: { in: ["scheduled", "published", "on_hold"] }, render: { project: licensed } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, platforms: true, updatedAt: true, render: { select: { project: { select: { asset: { select: { filename: true, workspace: { select: { name: true } } } } } } } } },
    }),
  ]);
  return {
    firstName: c.firstName,
    verified: verified > 0,
    listing: profile.listingStatus,
    stats: { active, clips, published, pending: pendingRows.length },
    requests: pendingRows.map((r) => {
      const t = readTerms(r.terms);
      return { id: r.id, who: r.workspace.name, initials: initialsOf(r.workspace.name), color: colorFor(r.workspace.name), title: `${r.workspace.name} wants a ${r.type === "private" ? "private" : "free"} license`, sub: requestSub(t), note: r.requestNote, terms: t };
    }),
    uses: recent.map((p) => {
      const plat = p.platforms[0] as LicensePlatform | undefined;
      return { id: p.id, who: p.render?.project.asset.workspace.name ?? "—", video: p.render?.project.asset.filename ?? "—", platform: plat && BADGE[plat] ? BADGE[plat] : null, when: relativeTime(p.updatedAt, now) };
    }),
  };
}

// ------------------------------------------------------------------ LI-07 Terms and the creator's videos

export interface VideoRow { id: string; title: string; meta: string; status: "uploading" | "ready" | "failed"; excluded: boolean; excludeReason: string | null }
export interface TermsData {
  verified: boolean;
  listing: ListingStatusName;
  published: boolean;
  terms: TermsSnapshot & { hasThirdParty: boolean; thirdPartyNote: string };
  videos: VideoRow[];
  storageReady: boolean;
}

export const DEFAULT_TERMS: TermsData["terms"] = { licenseType: "free", allowedUses: ["clips", "compilations"], platforms: ["instagram", "youtube", "tiktok"], commercial: false, attribution: "", edits: ["captions", "crops", "trims"], expiresMonths: 12, excludedCount: 0, hasThirdParty: false, thirdPartyNote: "" };

export async function loadTerms(c: CreatorContext, storageReady: boolean): Promise<TermsData> {
  const client = db();
  const [profile, verified, terms, videos] = await Promise.all([
    client.creatorProfile.findUniqueOrThrow({ where: { id: c.creatorId }, select: { listingStatus: true } }),
    client.creatorChannel.count({ where: { creatorId: c.creatorId, status: "verified" } }),
    client.licenseTerms.findUnique({ where: { creatorId: c.creatorId } }),
    client.creatorVideo.findMany({ where: { creatorId: c.creatorId, deletedAt: null, status: { not: "failed" } }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const excludedCount = videos.filter((v) => v.excluded).length;
  return {
    verified: verified > 0,
    listing: profile.listingStatus,
    published: Boolean(terms?.publishedAt),
    terms: terms
      ? { ...readTerms(terms), excludedCount, hasThirdParty: terms.hasThirdParty, thirdPartyNote: terms.thirdPartyNote }
      : { ...DEFAULT_TERMS, attribution: "", excludedCount },
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      meta: [v.durationSec ? formatDuration(v.durationSec) : null, formatBytes(Number(v.sizeBytes))].filter(Boolean).join(" · "),
      status: v.status as VideoRow["status"],
      excluded: v.excluded,
      excludeReason: v.excludeReason,
    })),
    storageReady,
  };
}

// ------------------------------------------------------------------ LI-10 Payouts

export const PAYOUTS_FEATURE = "creator_payouts";

export async function loadPayouts(c: CreatorContext): Promise<{ notified: boolean }> {
  const row = await db().featureInterest.findUnique({ where: { userId_feature: { userId: c.session.user.id, feature: PAYOUTS_FEATURE } }, select: { id: true } });
  return { notified: Boolean(row) };
}
