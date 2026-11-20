import { checkUse, type LicensedUse, type TermsSnapshot, type UseCheck } from "@nelio/domain";
import type { Db, Tx } from "./client";

/**
 * The licence gate for a video in a workspace (Milestone 5). Null when the video isn't licensed (own upload or
 * permission). Every licensed use re-reads the agreement, the owner's listing and the video's exclusion, so a
 * revocation, expiry or suspension stops future processing, renders and posts straight away.
 */
export interface LicenseInfo {
  agreementId: string;
  creatorName: string;
  type: "free" | "private" | "paid";
  attribution: string;
  platforms: string[];
  check: UseCheck;
}

export async function licenseForAsset(client: Db | Tx, assetId: string, use: LicensedUse, now = new Date()): Promise<LicenseInfo | null> {
  const asset = await client.mediaAsset.findUnique({
    where: { id: assetId },
    select: {
      creatorVideoId: true,
      license: { select: { id: true, status: true, expiresAt: true, type: true, terms: true, creator: { select: { displayName: true, listingStatus: true } } } },
    },
  });
  if (!asset?.license) return null;
  const a = asset.license;
  const terms = (a.terms ?? {}) as Partial<TermsSnapshot>;
  const video = asset.creatorVideoId ? await client.creatorVideo.findUnique({ where: { id: asset.creatorVideoId }, select: { excluded: true, deletedAt: true } }) : null;
  const check = checkUse(
    { status: a.status, expiresAt: a.expiresAt, type: a.type, terms: { platforms: (terms.platforms ?? []) as TermsSnapshot["platforms"], commercial: Boolean(terms.commercial) } },
    a.creator.listingStatus,
    { ...use, videoExcluded: use.videoExcluded ?? Boolean(video?.excluded) },
    now,
  );
  return { agreementId: a.id, creatorName: a.creator.displayName, type: a.type, attribution: String(terms.attribution ?? ""), platforms: (terms.platforms ?? []) as string[], check };
}
