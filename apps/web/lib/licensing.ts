import "server-only";
import { db, isStorageConfigured, signedGetUrl } from "@nelio/db";
import {
  LICENSE_PLATFORMS, STATUS_LABEL, effectiveStatus, termsSummary,
  type AgreementStatusName, type EffectiveStatus, type LicenseKind, type LicensePlatform, type ListingStatusName, type TermsSnapshot,
} from "@nelio/domain";
import { BADGE, colorFor, initialsOf, readTerms } from "./creator";

type Badge = "ig" | "yt" | "tt" | "fb";
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
export const fmtDate = (d: Date) => dateFmt.format(d);

async function posterUrl(key: string | null): Promise<string | null> {
  if (!key || !isStorageConfigured()) return null;
  try { return await signedGetUrl(key, { expiresIn: 3600 }); } catch { return null; }
}

/** The published terms of a creator, as a snapshot (what an agreement would copy). */
async function publishedTerms(creatorId: string): Promise<TermsSnapshot | null> {
  const [t, excluded] = await Promise.all([
    db().licenseTerms.findUnique({ where: { creatorId } }),
    db().creatorVideo.count({ where: { creatorId, excluded: true, deletedAt: null } }),
  ]);
  if (!t?.publishedAt) return null;
  return { ...readTerms(t), excludedCount: excluded };
}

// ------------------------------------------------------------------ LI-01 Marketplace

export interface SourceCard { id: string; name: string; sub: string; license: LicenseKind; platforms: Badge[]; licensees: number; posterUrl: string | null; verified: boolean }
export interface MarketFilters { q: string; niche: string; type: "all" | "free" | "private"; platform: "" | LicensePlatform; commercial: boolean; verified: boolean }
export interface MarketplaceData { cards: SourceCard[]; niches: string[]; filters: MarketFilters; filtered: boolean }

export function readFilters(sp: Record<string, string | undefined>): MarketFilters {
  const platform = (LICENSE_PLATFORMS as readonly string[]).includes(sp.on ?? "") ? (sp.on as LicensePlatform) : "";
  return {
    q: (sp.q ?? "").slice(0, 80),
    niche: (sp.niche ?? "").slice(0, 60),
    type: sp.type === "free" || sp.type === "private" ? sp.type : "all",
    platform,
    commercial: sp.commercial === "1",
    verified: sp.verified !== "0",
  };
}

/** Listed creators with published terms. Suspended listings are hidden; a licence is never inferred from visibility. */
export async function loadMarketplace(f: MarketFilters): Promise<MarketplaceData> {
  const client = db();
  const now = new Date();
  const rows = await client.creatorProfile.findMany({
    where: {
      listingStatus: "listed",
      terms: { publishedAt: { not: null }, ...(f.type !== "all" ? { licenseType: f.type } : {}), ...(f.platform ? { platforms: { has: f.platform } } : {}), ...(f.commercial ? { commercial: true } : {}) },
      ...(f.verified ? { channels: { some: { status: "verified" } } } : {}),
      ...(f.niche ? { niche: f.niche } : {}),
      ...(f.q ? { OR: [{ displayName: { contains: f.q, mode: "insensitive" as const } }, { bio: { contains: f.q, mode: "insensitive" as const } }, { niche: { contains: f.q, mode: "insensitive" as const } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: {
      id: true, displayName: true, bio: true, niche: true,
      terms: { select: { licenseType: true, platforms: true } },
      channels: { where: { status: "verified" }, select: { id: true }, take: 1 },
      videos: { where: { status: "ready", deletedAt: null, excluded: false }, orderBy: { createdAt: "desc" }, select: { posterKey: true } },
      _count: { select: { agreements: { where: { status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } } } },
    },
  });
  const niches = (await client.creatorProfile.findMany({ where: { listingStatus: "listed", niche: { not: null } }, distinct: ["niche"], select: { niche: true }, orderBy: { niche: "asc" } })).map((n) => n.niche!);
  const cards = await Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      name: r.displayName,
      sub: [r.bio || r.niche, `${r.videos.length} video${r.videos.length === 1 ? "" : "s"}`].filter(Boolean).join(" · "),
      license: (r.terms?.licenseType ?? "free") as LicenseKind,
      platforms: (r.terms?.platforms ?? []).filter((p): p is LicensePlatform => p in BADGE).map((p) => BADGE[p]),
      licensees: r._count.agreements,
      posterUrl: await posterUrl(r.videos.find((v) => v.posterKey)?.posterKey ?? null),
      verified: r.channels.length > 0,
    })),
  );
  const filtered = Boolean(f.q || f.niche || f.type !== "all" || f.platform || f.commercial);
  return { cards, niches, filters: f, filtered };
}

// ------------------------------------------------------------------ LI-02 Source detail, LI-03 Request

export interface ShortCard { id: string; title: string; posterUrl: string | null }
export type MyState =
  | { kind: "none" }
  | { kind: "requested"; agreementId: string }
  | { kind: "active"; agreementId: string; until: string | null; status: EffectiveStatus }
  | { kind: "declined"; note: string | null }
  | { kind: "ended"; why: "expired" | "revoked"; agreementId: string };

export interface SourceData {
  id: string;
  name: string;
  initials: string;
  color: string;
  verified: boolean;
  channelLine: string;
  listing: ListingStatusName;
  terms: TermsSnapshot | null;
  summary: ReturnType<typeof termsSummary> | null;
  platforms: Badge[];
  feature: { title: string; posterUrl: string | null; videoUrl: string | null } | null;
  shorts: ShortCard[];
  mine: MyState;
  /** The latest decision on a private request, for LI-03 Approved / Declined. */
  decided: { kind: "approved" | "declined"; note: string | null; months: number | null; platforms: string } | null;
}

export async function loadSource(creatorId: string, workspaceId: string, now = new Date()): Promise<SourceData | null> {
  const client = db();
  const p = await client.creatorProfile.findFirst({
    where: { id: creatorId, listingStatus: { in: ["listed", "suspended"] } },
    select: {
      id: true, displayName: true, listingStatus: true,
      channels: { where: { status: "verified" }, select: { platform: true } },
      videos: { where: { status: "ready", deletedAt: null, excluded: false }, select: { id: true, title: true, posterKey: true, storageKey: true } },
    },
  });
  if (!p) return null;
  const terms = await publishedTerms(p.id);
  if (!terms && p.listingStatus === "listed") return null;
  // "Popular with licensees": the creator's videos licensees have clipped most. Only counts cross workspaces, never content.
  const uses = p.videos.length
    ? await client.mediaAsset.groupBy({ by: ["creatorVideoId"], where: { creatorVideoId: { in: p.videos.map((v) => v.id) }, deletedAt: null }, _count: { _all: true } })
    : [];
  const count = new Map(uses.map((u) => [u.creatorVideoId!, u._count._all]));
  const ranked = [...p.videos].sort((a, b) => (count.get(b.id) ?? 0) - (count.get(a.id) ?? 0));
  const first = ranked.find((v) => v.posterKey) ?? ranked[0];
  const latest = await client.licenseAgreement.findFirst({ where: { creatorId: p.id, workspaceId }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, expiresAt: true, type: true, decisionNote: true, decidedAt: true, terms: true } });
  let mine: MyState = { kind: "none" };
  if (latest?.status === "requested") mine = { kind: "requested", agreementId: latest.id };
  else if (latest?.status === "active") {
    const st = effectiveStatus({ status: "active", expiresAt: latest.expiresAt, type: latest.type }, p.listingStatus, now);
    mine = st.kind === "expired" ? { kind: "ended", why: "expired", agreementId: latest.id } : { kind: "active", agreementId: latest.id, until: latest.expiresAt ? fmtDate(latest.expiresAt) : null, status: st };
  } else if (latest?.status === "expired" || latest?.status === "revoked") mine = { kind: "ended", why: latest.status, agreementId: latest.id };
  else if (latest?.status === "declined") mine = { kind: "declined", note: latest.decisionNote };
  const decidedTerms = latest ? readTerms(latest.terms) : null;
  const channelNames = [...new Set(p.channels.map((c) => ({ youtube: "YouTube channel", instagram: "Instagram account", tiktok: "TikTok account", facebook: "Facebook page" })[c.platform] ?? "channel"))];
  return {
    id: p.id,
    name: p.displayName,
    initials: initialsOf(p.displayName),
    color: colorFor(p.displayName),
    verified: p.channels.length > 0,
    channelLine: [p.channels.length ? `Verified ${channelNames.join(" and ")}` : "Not verified yet", `${p.videos.length} video${p.videos.length === 1 ? "" : "s"} in scope`].join(" · "),
    listing: p.listingStatus,
    terms,
    summary: terms ? termsSummary(terms) : null,
    platforms: (terms?.platforms ?? []).map((x) => BADGE[x]),
    feature: first ? { title: `${p.displayName} · ${first.title}`, posterUrl: await posterUrl(first.posterKey), videoUrl: isStorageConfigured() ? await signedGetUrl(first.storageKey, { expiresIn: 3600 }).catch(() => null) : null } : null,
    shorts: await Promise.all(ranked.slice(0, 8).map(async (v) => ({ id: v.id, title: v.title, posterUrl: await posterUrl(v.posterKey) }))),
    mine,
    decided: latest && latest.type === "private" && latest.decidedAt && (latest.status === "active" || latest.status === "declined")
      ? { kind: latest.status === "active" ? "approved" : "declined", note: latest.decisionNote, months: decidedTerms?.expiresMonths ?? null, platforms: decidedTerms?.platforms.map((x) => ({ instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" })[x]).join(", ") ?? "" }
      : null,
  };
}

// ------------------------------------------------------------------ LI-04 My licenses

export interface LicenseRow {
  id: string;
  creatorId: string;
  name: string;
  initials: string;
  color: string;
  type: LicenseKind;
  status: EffectiveStatus;
  statusLabel: string;
  expires: string;
  affected: string;
  stored: AgreementStatusName;
}
export interface AffectedPost { id: string; title: string; state: "scheduled" | "on_hold" | "published"; line: string; flagged: boolean }
export interface MyLicensesData {
  rows: LicenseRow[];
  revoked: { name: string; held: number; flagged: number } | null;
  expired: { name: string; creatorId: string; drafts: number } | null;
  affected: AffectedPost[];
}

export async function loadMyLicenses(workspaceId: string, now = new Date()): Promise<MyLicensesData> {
  const client = db();
  const list = await client.licenseAgreement.findMany({
    where: { workspaceId, status: { in: ["active", "requested", "revoked", "expired"] } },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    select: { id: true, status: true, type: true, expiresAt: true, revokedAt: true, updatedAt: true, creator: { select: { id: true, displayName: true, listingStatus: true } } },
  });
  // Keep the newest agreement per creator.
  const seen = new Set<string>();
  const latest = list.filter((a) => (seen.has(a.creator.id) ? false : (seen.add(a.creator.id), true)));
  const ids = latest.map((a) => a.id);
  const posts = ids.length
    ? await client.post.findMany({
        where: { workspaceId, render: { project: { asset: { licenseAgreementId: { in: ids } } } } },
        select: { id: true, title: true, state: true, rightsFlag: true, platforms: true, updatedAt: true, render: { select: { project: { select: { asset: { select: { licenseAgreementId: true } } } } } } },
      })
    : [];
  const byAgreement = new Map<string, typeof posts>();
  for (const p of posts) {
    const k = p.render!.project.asset.licenseAgreementId!;
    byAgreement.set(k, [...(byAgreement.get(k) ?? []), p]);
  }
  const rows: LicenseRow[] = latest.map((a) => {
    const st = effectiveStatus({ status: a.status, expiresAt: a.expiresAt, type: a.type }, a.creator.listingStatus, now);
    const ps = byAgreement.get(a.id) ?? [];
    const n = (s: string) => ps.filter((p) => p.state === s).length;
    const parts = [[n("draft"), "draft"], [n("scheduled") + n("on_hold") + n("needs_approval"), "scheduled"], [n("published"), "published"]].filter(([c]) => (c as number) > 0).map(([c, w]) => `${c} ${w}${w === "draft" && (c as number) > 1 ? "s" : ""}`);
    return {
      id: a.id,
      creatorId: a.creator.id,
      name: a.creator.displayName,
      initials: initialsOf(a.creator.displayName),
      color: colorFor(a.creator.displayName),
      type: a.type,
      status: st,
      statusLabel: STATUS_LABEL(st),
      expires: a.status === "revoked" ? "—" : a.expiresAt ? fmtDate(a.expiresAt) : "When revoked",
      affected: parts.length ? parts.join(" · ") : "—",
      stored: a.status,
    };
  });
  const revokedRow = rows.find((r) => r.status.kind === "revoked");
  const revokedPosts = revokedRow ? byAgreement.get(revokedRow.id) ?? [] : [];
  const expiredRow = rows.find((r) => r.status.kind === "expired");
  return {
    rows,
    revoked: revokedRow ? { name: revokedRow.name, held: revokedPosts.filter((p) => p.state === "on_hold").length, flagged: revokedPosts.filter((p) => p.rightsFlag === "review").length } : null,
    expired: expiredRow ? { name: expiredRow.name, creatorId: expiredRow.creatorId, drafts: (byAgreement.get(expiredRow.id) ?? []).filter((p) => p.state === "draft").length } : null,
    affected: revokedPosts
      .filter((p) => p.state === "on_hold" || p.rightsFlag === "review")
      .map((p) => ({
        id: p.id,
        title: p.title,
        state: p.state as AffectedPost["state"],
        flagged: p.rightsFlag === "review",
        line: p.rightsFlag === "review" ? `Published on ${p.platforms.map((x) => ({ instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" })[x as LicensePlatform] ?? x).join(", ") || "a platform"} · flagged for review` : "Scheduled · now on hold",
      })),
  };
}

/** Active licences this workspace can clip under right now (CL-02 "Import licensed", slice 5). */
export async function activeLicenseCount(workspaceId: string, now = new Date()): Promise<number> {
  return db().licenseAgreement.count({ where: { workspaceId, status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }], creator: { listingStatus: { not: "suspended" } } } });
}
