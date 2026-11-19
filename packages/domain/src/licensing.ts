/**
 * Licensing rules (Milestone 5, LI-01 to LI-10). A licence is the only thing that lets a workspace use a
 * creator's video: public visibility, a creator's silence or an old agreement never count. Every use
 * (processing, rendering, scheduling, publishing) re-checks the licence with `checkUse`.
 */

export const LICENSE_PLATFORMS = ["instagram", "youtube", "tiktok", "facebook"] as const;
export type LicensePlatform = (typeof LICENSE_PLATFORMS)[number];
export const PLATFORM_LABEL: Record<LicensePlatform, string> = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" };

export const LICENSE_USES = ["clips", "compilations"] as const;
export type LicenseUse = (typeof LICENSE_USES)[number];

export const LICENSE_EDITS = ["captions", "crops", "trims"] as const;
export type LicenseEdit = (typeof LICENSE_EDITS)[number];

export type LicenseKind = "free" | "private" | "paid";
export type AgreementStatusName = "requested" | "active" | "declined" | "revoked" | "expired" | "canceled";
export type ListingStatusName = "draft" | "listed" | "suspended";

export const LICENSE_KIND_LABEL: Record<LicenseKind, string> = { free: "Free", private: "Private", paid: "Paid · later" };

/** What the creator offers (LI-07) and what an agreement snapshots (LI-03). */
export type TermsSnapshot = {
  licenseType: LicenseKind;
  allowedUses: LicenseUse[];
  platforms: LicensePlatform[];
  commercial: boolean;
  attribution: string;
  edits: LicenseEdit[];
  /** Months from the start; null = until revoked. */
  expiresMonths: number | null;
  /** Videos left out because of third-party music or footage. */
  excludedCount: number;
};

export const EXPIRY_CHOICES = [3, 6, 12, 24, null] as const;
export const ATTRIBUTION_MAX = 80;
/** "ends in N days" shows from this many days before expiry (LI-04). */
export const EXPIRING_SOON_DAYS = 14;

const DAY = 86_400_000;

export type TermsProblem = { field: keyof TermsSnapshot | "verification"; message: string };

/** Terms a creator can publish (LI-07 "Publish terms"). Paid is never publishable until payouts exist (B-08). */
export function validateTerms(t: TermsSnapshot, opts: { verified: boolean }): TermsProblem[] {
  const out: TermsProblem[] = [];
  if (!opts.verified) out.push({ field: "verification", message: "Verify a channel before you publish terms." });
  if (t.licenseType === "paid") out.push({ field: "licenseType", message: "Paid licensing is coming later. Choose free or private." });
  if (t.allowedUses.length === 0) out.push({ field: "allowedUses", message: "Allow at least one use." });
  if (t.platforms.length === 0) out.push({ field: "platforms", message: "Pick at least one platform." });
  if (!t.attribution.trim()) out.push({ field: "attribution", message: "Add the attribution licensees must show." });
  if (t.attribution.length > ATTRIBUTION_MAX) out.push({ field: "attribution", message: `Keep attribution under ${ATTRIBUTION_MAX} characters.` });
  if (t.expiresMonths !== null && !(EXPIRY_CHOICES as readonly (number | null)[]).includes(t.expiresMonths)) out.push({ field: "expiresMonths", message: "Pick an expiry from the list." });
  return out;
}

export function expiresAtFor(terms: Pick<TermsSnapshot, "expiresMonths">, start: Date): Date | null {
  if (terms.expiresMonths === null) return null;
  const d = new Date(start);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + terms.expiresMonths);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

export type AgreementLike = { status: AgreementStatusName; expiresAt: Date | null; type: LicenseKind };

/** The status a person sees (LI-04), taking the clock into account. */
export type EffectiveStatus =
  | { kind: "requested" }
  | { kind: "active"; endsInDays: number | null }
  | { kind: "expiring"; endsInDays: number }
  | { kind: "expired" }
  | { kind: "revoked" }
  | { kind: "declined" }
  | { kind: "canceled" }
  | { kind: "suspended" };

export function effectiveStatus(a: AgreementLike, listing: ListingStatusName, now: Date): EffectiveStatus {
  if (a.status !== "active") return { kind: a.status } as EffectiveStatus;
  if (a.expiresAt && a.expiresAt.getTime() <= now.getTime()) return { kind: "expired" };
  if (listing === "suspended") return { kind: "suspended" };
  if (!a.expiresAt) return { kind: "active", endsInDays: null };
  const days = Math.ceil((a.expiresAt.getTime() - now.getTime()) / DAY);
  return days <= EXPIRING_SOON_DAYS ? { kind: "expiring", endsInDays: days } : { kind: "active", endsInDays: days };
}

export const STATUS_LABEL = (s: EffectiveStatus): string => {
  switch (s.kind) {
    case "expiring": return s.endsInDays <= 1 ? "ends today" : `ends in ${s.endsInDays} days`;
    case "requested": return "requested";
    default: return s.kind;
  }
};

/** What someone wants to do with a licensed video. */
export type LicensedUse = {
  action: "process" | "render" | "schedule" | "publish";
  platform?: string;
  commercial?: boolean;
  videoExcluded?: boolean;
};

export type UseCheck = { ok: true } | { ok: false; code: "no_license" | "expired" | "revoked" | "suspended" | "excluded" | "platform" | "commercial"; message: string };

/** The one gate every licensed use goes through (LI-04, LI-09; launch gate "expired/revoked rights stop future processing"). */
export function checkUse(a: (AgreementLike & { terms: Pick<TermsSnapshot, "platforms" | "commercial"> }) | null, listing: ListingStatusName, use: LicensedUse, now: Date): UseCheck {
  if (!a || a.status === "requested" || a.status === "declined" || a.status === "canceled") return { ok: false, code: "no_license", message: "There's no active licence for this video." };
  const st = effectiveStatus(a, listing, now);
  if (st.kind === "revoked") return { ok: false, code: "revoked", message: "The owner revoked this licence. New clips, renders and posts are on hold." };
  if (st.kind === "expired") return { ok: false, code: "expired", message: "This licence has expired. Renew it to keep using the video." };
  if (st.kind === "suspended") return { ok: false, code: "suspended", message: "This owner's listing is under review, so their licences are paused." };
  if (use.videoExcluded) return { ok: false, code: "excluded", message: "The owner excluded this video (third-party music or footage)." };
  if (use.platform && !(a.terms.platforms as string[]).includes(use.platform)) return { ok: false, code: "platform", message: `The licence doesn't allow ${PLATFORM_LABEL[use.platform as LicensePlatform] ?? use.platform}.` };
  if (use.commercial && !a.terms.commercial) return { ok: false, code: "commercial", message: "The licence doesn't allow commercial use." };
  return { ok: true };
}

/** What happens to existing content when a licence stops (LI-09 "Stops right away" / "Flagged for review"). */
export type PostLike = { id: string; state: "draft" | "needs_approval" | "scheduled" | "on_hold" | "published" | "failed" };
export function revocationImpact(posts: PostLike[]): { hold: string[]; flag: string[]; drafts: number } {
  return {
    hold: posts.filter((p) => p.state === "scheduled" || p.state === "needs_approval").map((p) => p.id),
    flag: posts.filter((p) => p.state === "published").map((p) => p.id),
    drafts: posts.filter((p) => p.state === "draft").length,
  };
}

/** The attribution line that must be on every post (CS-02 Licensed state). */
export function attributionMissing(attribution: string, caption: string): boolean {
  const a = attribution.trim().toLowerCase();
  return a.length > 0 && !caption.toLowerCase().includes(a);
}

export function termsSummary(t: TermsSnapshot): { platforms: string; commercial: string; attribution: string; expires: string; scope: string; uses: string; edits: string } {
  const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  return {
    platforms: t.platforms.map((p) => PLATFORM_LABEL[p]).join(", "),
    commercial: t.commercial ? "Allowed" : "Not allowed",
    attribution: t.attribution ? `Required: “${t.attribution}”` : "Not required",
    expires: t.expiresMonths === null ? "Until revoked" : `${t.expiresMonths} months after the licence starts`,
    scope: t.excludedCount > 0 ? `All videos except ${t.excludedCount} flagged` : "All videos",
    uses: t.allowedUses.length === 2 ? "Clips and compilations" : t.allowedUses[0] === "compilations" ? "Compilations" : "Clips",
    edits: list(t.edits.map((e, i) => (i === 0 ? e[0]!.toUpperCase() + e.slice(1) : e))),
  };
}

/** What a pasted channel link names (LI-06). Only YouTube and Instagram links are understood. */
export type ChannelClaim = { platform: "youtube" | "instagram"; handle: string | null; externalId: string | null; url: string };

export function parseChannelLink(platform: "youtube" | "instagram", raw: string): ChannelClaim | null {
  const text = raw.trim();
  if (!text) return null;
  if (platform === "youtube") {
    const bare = text.match(/^@([\w.-]{3,30})$/);
    if (bare) return { platform, handle: `@${bare[1]!.toLowerCase()}`, externalId: null, url: `https://www.youtube.com/@${bare[1]}` };
    let u: URL;
    try { u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
    if (!/(^|\.)youtube\.com$/i.test(u.hostname)) return null;
    const id = u.pathname.match(/^\/channel\/(UC[\w-]{22})\/?/);
    if (id) return { platform, handle: null, externalId: id[1]!, url: `https://www.youtube.com/channel/${id[1]}` };
    const h = u.pathname.match(/^\/@([\w.-]{3,30})\/?/);
    if (h) return { platform, handle: `@${h[1]!.toLowerCase()}`, externalId: null, url: `https://www.youtube.com/@${h[1]}` };
    return null;
  }
  const bare = text.match(/^@?([\w.]{1,30})$/);
  if (bare && !text.includes(".com")) return { platform, handle: `@${bare[1]!.toLowerCase()}`, externalId: null, url: `https://www.instagram.com/${bare[1]}/` };
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
  if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
  const h = u.pathname.match(/^\/([\w.]{1,30})\/?$/);
  return h ? { platform, handle: `@${h[1]!.toLowerCase()}`, externalId: null, url: `https://www.instagram.com/${h[1]}/` } : null;
}

/** Does a channel the person proved they own (by signing in) match what they claimed? */
export function claimMatches(claim: { handle: string | null; externalId: string | null }, owned: { id: string; handle: string | null }): boolean {
  if (claim.externalId) return claim.externalId === owned.id;
  if (claim.handle) return Boolean(owned.handle) && claim.handle.toLowerCase() === owned.handle!.toLowerCase();
  return false;
}
