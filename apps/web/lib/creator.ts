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

// ------------------------------------------------------------------ LI-06 Verification

export interface ChannelRow {
  id: string;
  platform: "youtube" | "instagram" | "tiktok" | "facebook";
  title: string;
  sub: string;
  status: "verified" | "pending" | "failed";
  /** What "Try again" does: sign in again (YouTube) or ask for a check by hand. */
  retry: "youtube" | "manual" | null;
  code: string | null;
}
export interface VerificationData { channels: ChannelRow[]; youtubeReady: boolean }

const LABEL: Record<string, string> = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });

export async function loadVerification(c: CreatorContext, youtubeReady: boolean): Promise<VerificationData> {
  const rows = await db().creatorChannel.findMany({ where: { creatorId: c.creatorId }, orderBy: { createdAt: "asc" } });
  const order = { verified: 0, pending: 1, failed: 2, unverified: 3 } as const;
  return {
    youtubeReady,
    channels: rows
      .sort((a, b) => order[a.status] - order[b.status])
      .map((r) => {
        const ev = (r.evidence ?? {}) as { code?: string };
        const manual = r.method === "manual";
        const status = r.status === "verified" ? "verified" : r.status === "failed" ? "failed" : "pending";
        const sub =
          status === "verified" ? `Verified ${r.verifiedAt ? dateFmt.format(r.verifiedAt) : ""}`.trim()
          : status === "failed" ? (r.failureReason ?? "We couldn’t confirm this channel.")
          : manual ? `Add ${ev.code ?? "your code"} to your ${r.platform === "youtube" ? "channel description" : "bio"}. We’ll check within 1–2 working days.`
          : "Sign-in not finished.";
        return {
          id: r.id,
          platform: r.platform as ChannelRow["platform"],
          title: `${LABEL[r.platform] ?? r.platform} · ${r.title}`,
          sub,
          status,
          retry: status === "verified" || (status === "pending" && manual) ? null : r.platform === "youtube" && youtubeReady && !manual ? "youtube" : "manual",
          code: manual ? (ev.code ?? null) : null,
        };
      }),
  };
}

// ------------------------------------------------------------------ LI-08 Usage audit

export const USAGE_TABS = ["all", "published", "scheduled", "on_hold"] as const;
export type UsageTab = (typeof USAGE_TABS)[number];
export interface UsageRow { id: string; who: string; video: string; clip: string; platform: "ig" | "yt" | "tt" | "fb" | null; platformName: string; status: "published" | "scheduled" | "on_hold"; held: "revoked" | "expired" | null; when: string }

export async function loadUsage(c: CreatorContext, tab: UsageTab, take = 200): Promise<{ rows: UsageRow[]; tab: UsageTab; any: boolean }> {
  const client = db();
  type S = "published" | "scheduled" | "needs_approval" | "on_hold";
  const states: S[] = tab === "published" ? ["published"] : tab === "scheduled" ? ["scheduled", "needs_approval"] : tab === "on_hold" ? ["on_hold"] : ["published", "scheduled", "needs_approval", "on_hold"];
  const where = { render: { project: { asset: { license: { creatorId: c.creatorId } } } } };
  const [posts, any] = await Promise.all([
    client.post.findMany({
      where: { ...where, state: { in: states } },
      orderBy: { updatedAt: "desc" },
      take,
      select: { id: true, state: true, platforms: true, updatedAt: true, render: { select: { project: { select: { name: true, asset: { select: { filename: true, creatorVideoId: true, workspace: { select: { name: true } }, license: { select: { status: true } } } } } } } } },
    }),
    client.post.count({ where: { ...where, state: { in: ["published", "scheduled", "needs_approval", "on_hold"] } } }),
  ]);
  const videoIds = [...new Set(posts.map((p) => p.render?.project.asset.creatorVideoId).filter((x): x is string => Boolean(x)))];
  const titles = new Map((await client.creatorVideo.findMany({ where: { id: { in: videoIds } }, select: { id: true, title: true } })).map((v) => [v.id, v.title]));
  const label: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" };
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  return {
    tab,
    any: any > 0,
    rows: posts.map((p) => {
      const a = p.render!.project.asset;
      const plat = p.platforms[0] as LicensePlatform | undefined;
      const st = a.license?.status;
      return {
        id: p.id,
        who: a.workspace.name,
        video: (a.creatorVideoId && titles.get(a.creatorVideoId)) || a.filename,
        clip: p.render!.project.name,
        platform: plat && BADGE[plat] ? BADGE[plat] : null,
        platformName: plat ? label[plat] ?? plat : "—",
        status: p.state === "published" ? "published" : p.state === "on_hold" ? "on_hold" : "scheduled",
        held: p.state === "on_hold" ? (st === "revoked" ? "revoked" : st === "expired" ? "expired" : null) : null,
        when: date.format(p.updatedAt),
      };
    }),
  };
}

// ------------------------------------------------------------------ LI-09 Revocations

export interface PastRevocation { id: string; who: string; when: string; held: number; flagged: number }
export interface ActiveLicense { id: string; who: string; type: LicenseKind; since: string; scheduled: number; published: number }
export interface RevocationsData { past: PastRevocation[]; active: ActiveLicense[] }

export async function loadRevocations(c: CreatorContext, now = new Date()): Promise<RevocationsData> {
  const client = db();
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(d);
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  const [revoked, active] = await Promise.all([
    client.licenseAgreement.findMany({ where: { creatorId: c.creatorId, status: "revoked" }, orderBy: { revokedAt: "desc" }, take: 50, select: { id: true, revokedAt: true, workspace: { select: { name: true } } } }),
    client.licenseAgreement.findMany({ where: { creatorId: c.creatorId, status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { startsAt: "desc" }, take: 100, select: { id: true, type: true, startsAt: true, workspace: { select: { name: true } } } }),
  ]);
  const impact = revoked.length ? await client.auditEvent.findMany({ where: { action: "license.revoked", targetId: { in: revoked.map((r) => r.id) } }, select: { targetId: true, metadata: true } }) : [];
  const byId = new Map(impact.map((i) => [i.targetId!, i.metadata as { held?: number; flagged?: number }]));
  type S = "scheduled" | "needs_approval" | "published";
  const count = (id: string, states: S[]) => client.post.count({ where: { state: { in: states }, render: { project: { asset: { licenseAgreementId: id } } } } });
  return {
    past: revoked.map((r) => ({ id: r.id, who: r.workspace.name, when: r.revokedAt ? (day(r.revokedAt) === day(now) ? "Today" : date.format(r.revokedAt)) : "—", held: byId.get(r.id)?.held ?? 0, flagged: byId.get(r.id)?.flagged ?? 0 })),
    active: await Promise.all(active.map(async (a) => ({ id: a.id, who: a.workspace.name, type: a.type, since: a.startsAt ? date.format(a.startsAt) : "—", scheduled: await count(a.id, ["scheduled", "needs_approval"]), published: await count(a.id, ["published"]) }))),
  };
}
