import { checkUse, type LicensedUse, type TermsSnapshot, type UseCheck } from "@nelio/domain";
import type { Db, Tx } from "./client";
import { cancelRenderRun, notify, recordActivity, workspaceWatchers } from "./jobs";

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

/**
 * Stops a licence (LI-09 revoke, or expiry) and applies the rights recheck: queued and running renders from its
 * videos are canceled (nothing charged), scheduled and waiting posts go on hold, published posts are flagged for
 * review, and the workspace is told. Idempotent: a licence that is already stopped is left alone.
 */
export async function stopLicense(tx: Tx, args: { agreementId: string; why: "revoked" | "expired"; reason?: string | null; actorUserId?: string | null; now?: Date }): Promise<{ held: number; flagged: number; canceled: number } | null> {
  const now = args.now ?? new Date();
  const a = await tx.licenseAgreement.findFirst({ where: { id: args.agreementId, status: "active" }, select: { id: true, orgId: true, workspaceId: true, requestedById: true, creator: { select: { displayName: true } }, workspace: { select: { slug: true, name: true } } } });
  if (!a) return null;
  const claimed = await tx.licenseAgreement.updateMany({
    where: { id: a.id, status: "active" },
    data: args.why === "revoked" ? { status: "revoked", revokedAt: now, revokeReason: args.reason?.trim() || null } : { status: "expired" },
  });
  if (!claimed.count) return null;
  const linked = { render: { project: { asset: { licenseAgreementId: a.id } } } };
  const held = await tx.post.updateMany({ where: { workspaceId: a.workspaceId, state: { in: ["scheduled", "needs_approval"] }, ...linked }, data: { state: "on_hold" } });
  const flagged = args.why === "revoked" ? await tx.post.updateMany({ where: { workspaceId: a.workspaceId, state: "published", ...linked }, data: { rightsFlag: "review" } }) : { count: 0 };
  const renders = await tx.render.findMany({ where: { workspaceId: a.workspaceId, status: { in: ["queued", "rendering"] }, project: { asset: { licenseAgreementId: a.id } } }, select: { id: true } });
  let canceled = 0;
  for (const r of renders) if (await cancelRenderRun(tx, { renderId: r.id, workspaceId: a.workspaceId, byUserName: args.why === "revoked" ? `${a.creator.displayName} (license revoked)` : "Nelio (license expired)", now })) canceled++;
  const who = a.creator.displayName;
  await tx.auditEvent.create({ data: { orgId: a.orgId, workspaceId: a.workspaceId, actorUserId: args.actorUserId ?? null, actorType: args.actorUserId ? "user" : "system", action: args.why === "revoked" ? "license.revoked" : "license.expired", targetType: "license_agreement", targetId: a.id, metadata: { held: held.count, flagged: flagged.count, rendersCanceled: canceled } } });
  await recordActivity(tx, { orgId: a.orgId, workspaceId: a.workspaceId, type: args.why === "revoked" ? "license.revoked" : "license.expired", status: "blocked", title: args.why === "revoked" ? `${who} revoked your license` : `${who}’s license expired`, detail: [held.count ? `${held.count} post${held.count === 1 ? "" : "s"} on hold` : null, flagged.count ? `${flagged.count} published post${flagged.count === 1 ? "" : "s"} to review` : null].filter(Boolean).join(" · ") || "New clips and renders are stopped" });
  const people = new Set([...(await workspaceWatchers(tx, a.workspaceId)), a.requestedById]);
  for (const userId of people) {
    await notify(tx, {
      userId, orgId: a.orgId, workspaceId: a.workspaceId, category: "licenses",
      title: args.why === "revoked" ? `${who} revoked your license` : `${who}’s license expired`,
      body: args.why === "revoked" ? `${args.reason?.trim() ? `Their reason: “${args.reason.trim()}”. ` : ""}New clips and scheduled posts are on hold.${flagged.count ? ` ${flagged.count} published post${flagged.count === 1 ? " needs" : "s need"} review.` : ""}` : "New clips and renders from them are blocked. Renew it from My licenses.",
      href: `/w/${a.workspace.slug}/licensing/mine`, dedupeKey: `license:${a.id}:${args.why}`,
    });
  }
  return { held: held.count, flagged: flagged.count, canceled };
}

/** Expiry sweep (worker): closes licences whose end date passed and warns two weeks ahead. Returns how many changed. */
export async function sweepLicenses(client: Db, now = new Date()): Promise<number> {
  const due = await client.licenseAgreement.findMany({ where: { status: "active", expiresAt: { lte: now } }, select: { id: true }, take: 20 });
  let n = 0;
  for (const d of due) if (await client.$transaction((tx) => stopLicense(tx, { agreementId: d.id, why: "expired", now }))) n++;
  const soon = new Date(now.getTime() + 14 * 86_400_000);
  const ending = await client.licenseAgreement.findMany({ where: { status: "active", expiresAt: { gt: now, lte: soon } }, select: { id: true, orgId: true, workspaceId: true, requestedById: true, expiresAt: true, creator: { select: { displayName: true } }, workspace: { select: { slug: true } } }, take: 50 });
  for (const e of ending) {
    await client.$transaction(async (tx) => {
      const days = Math.ceil((e.expiresAt!.getTime() - now.getTime()) / 86_400_000);
      for (const userId of new Set([...(await workspaceWatchers(tx, e.workspaceId)), e.requestedById])) {
        const r = await notify(tx, { userId, orgId: e.orgId, workspaceId: e.workspaceId, category: "licenses", title: `${e.creator.displayName}’s license ends in ${days} day${days === 1 ? "" : "s"}`, body: "Renew it to keep making clips from their videos.", href: `/w/${e.workspace.slug}/licensing/mine`, dedupeKey: `license:${e.id}:ending` });
        if (r.created) n++;
      }
    });
  }
  return n;
}
