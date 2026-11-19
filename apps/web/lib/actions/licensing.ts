"use server";

import { db, findWorkspaceFor, notify, recordActivity, type WorkspaceSummary } from "@nelio/db";
import { EXPIRY_CHOICES, LICENSE_PLATFORMS, can, expiresAtFor, type LicensePlatform, type TermsSnapshot } from "@nelio/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, type Session } from "../auth";
import { readTerms } from "../creator";

type Fail = { ok: false; error: string; field?: string };

async function authorize(slug: string): Promise<{ session: Session; ws: WorkspaceSummary; full: boolean } | Fail> {
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false, error: "Please sign in again." };
  const ws = await findWorkspaceFor(db(), session.actor, slug);
  if (!ws) return { ok: false, error: "You don’t have permission to do that here." };
  const d = can(session.actor, "licensing.request", ws);
  if (!d.allowed) return { ok: false, error: "You don’t have permission to license content here." };
  return { session, ws, full: d.access === "F" || d.access === "A" };
}

/** The creator's published, listed terms, or why they can't be licensed right now. */
async function sourceTerms(creatorId: string): Promise<{ ok: true; terms: TermsSnapshot; version: number; userId: string; name: string } | Fail> {
  const p = await db().creatorProfile.findUnique({
    where: { id: creatorId },
    select: { userId: true, displayName: true, listingStatus: true, channels: { where: { status: "verified" }, select: { id: true }, take: 1 }, terms: true, _count: { select: { videos: { where: { excluded: true, deletedAt: null } } } } },
  });
  if (!p || !p.terms?.publishedAt) return { ok: false, error: "This creator isn’t licensing their videos right now." };
  if (p.listingStatus === "suspended") return { ok: false, error: "This listing is suspended while ownership is reviewed." };
  if (p.listingStatus !== "listed" || !p.channels.length) return { ok: false, error: "This creator isn’t licensing their videos right now." };
  if (p.terms.licenseType === "paid") return { ok: false, error: "Paid licensing is coming later." };
  return { ok: true, terms: { ...readTerms(p.terms), excludedCount: p._count.videos }, version: p.terms.version, userId: p.userId, name: p.displayName };
}

/** An active licence whose date has passed is closed first, so a renewal can start (one open licence per creator). */
async function closeLapsed(tx: Parameters<Parameters<ReturnType<typeof db>["$transaction"]>[0]>[0], creatorId: string, workspaceId: string) {
  await tx.licenseAgreement.updateMany({ where: { creatorId, workspaceId, status: "active", expiresAt: { lte: new Date() } }, data: { status: "expired" } });
}

const isUniqueClash = (e: unknown) => typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002";

// ------------------------------------------------------------------ LI-03 Accept a free licence

export async function acceptFreeLicenseAction(slug: string, creatorId: string, confirm: { rules: boolean; revocable: boolean }): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  if (!a.full) return { ok: false, error: "Ask a workspace manager to accept licences." };
  if (!confirm.rules || !confirm.revocable) return { ok: false, field: "confirm", error: "Tick both boxes to accept the license." };
  const src = await sourceTerms(creatorId);
  if (!src.ok) return src;
  if (src.terms.licenseType !== "free") return { ok: false, error: "This creator approves each request. Send a request instead." };
  // A revoked licence can't be taken back on free terms: the owner decides again.
  const last = await db().licenseAgreement.findFirst({ where: { creatorId, workspaceId: a.ws.workspaceId, status: { in: ["active", "revoked", "expired"] } }, orderBy: { createdAt: "desc" }, select: { status: true } });
  if (last?.status === "revoked") return { ok: false, error: "The owner revoked your license, so it can’t be accepted again here." };
  const now = new Date();
  try {
    await db().$transaction(async (tx) => {
      await closeLapsed(tx, creatorId, a.ws.workspaceId);
      const ag = await tx.licenseAgreement.create({
        data: { creatorId, orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "free", status: "active", terms: src.terms, termsVersion: src.version, requestedById: a.session.user.id, startsAt: now, expiresAt: expiresAtFor(src.terms, now), decidedAt: now },
        select: { id: true },
      });
      await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.accepted", targetType: "license_agreement", targetId: ag.id, metadata: { creatorId, type: "free", termsVersion: src.version, confirmed: ["attribution_and_platforms", "revocable"] } } });
      await recordActivity(tx, { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "license.active", status: "done", title: `Licensed ${src.name}’s videos`, detail: `Free license · by ${a.session.user.fullName}` });
      await notify(tx, { userId: src.userId, category: "licenses", title: `${a.ws.name} licensed your videos`, body: "Free license on your published terms.", href: "/creator", dedupeKey: `license:${ag.id}:accepted` });
    });
  } catch (e) {
    if (isUniqueClash(e)) return { ok: false, error: "You already have a license or a request open with this creator." };
    throw e;
  }
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ LI-03 Request a private licence

const requestSchema = z.object({
  note: z.string().trim().min(3).max(600),
  platforms: z.array(z.enum(LICENSE_PLATFORMS)).min(1).max(4),
  months: z.number().int().nullable(),
  rules: z.boolean(),
});

export async function requestPrivateLicenseAction(slug: string, creatorId: string, input: z.input<typeof requestSchema>): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    const f = parsed.error.issues[0]?.path[0];
    return { ok: false, field: String(f ?? ""), error: f === "note" ? "Say what you’ll use it for." : f === "platforms" ? "Pick at least one platform." : "Check the request and try again." };
  }
  const v = parsed.data;
  if (!v.rules) return { ok: false, field: "confirm", error: "Tick the box to send the request." };
  const src = await sourceTerms(creatorId);
  if (!src.ok) return src;
  if (v.platforms.some((p) => !src.terms.platforms.includes(p as LicensePlatform))) return { ok: false, field: "platforms", error: "Pick platforms the creator allows." };
  if (!(EXPIRY_CHOICES as readonly (number | null)[]).includes(v.months) || (src.terms.expiresMonths !== null && (v.months === null || v.months > src.terms.expiresMonths))) return { ok: false, field: "months", error: "Pick a length the creator allows." };
  const snapshot: TermsSnapshot = { ...src.terms, licenseType: "private", platforms: v.platforms as LicensePlatform[], expiresMonths: v.months };
  try {
    await db().$transaction(async (tx) => {
      await closeLapsed(tx, creatorId, a.ws.workspaceId);
      const ag = await tx.licenseAgreement.create({
        data: { creatorId, orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, type: "private", status: "requested", terms: snapshot, termsVersion: src.version, requestNote: v.note, requestedById: a.session.user.id },
        select: { id: true },
      });
      await tx.auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.requested", targetType: "license_agreement", targetId: ag.id, metadata: { creatorId, platforms: v.platforms, months: v.months } } });
      await notify(tx, { userId: src.userId, category: "licenses", title: `${a.ws.name} wants a private license`, body: v.note.slice(0, 140), href: "/creator", dedupeKey: `license:${ag.id}:requested` });
    });
  } catch (e) {
    if (isUniqueClash(e)) return { ok: false, error: "You already have a license or a request open with this creator." };
    throw e;
  }
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}

export async function cancelRequestAction(slug: string, agreementId: string): Promise<{ ok: true } | Fail> {
  const a = await authorize(slug);
  if ("ok" in a) return a;
  const r = await db().licenseAgreement.updateMany({ where: { id: agreementId, workspaceId: a.ws.workspaceId, status: "requested" }, data: { status: "canceled", decidedAt: new Date() } });
  if (!r.count) return { ok: false, error: "That request was already answered." };
  await db().auditEvent.create({ data: { orgId: a.ws.orgId, workspaceId: a.ws.workspaceId, actorUserId: a.session.user.id, action: "license.request_canceled", targetType: "license_agreement", targetId: agreementId } });
  revalidatePath(`/w/${slug}/licensing`, "layout");
  return { ok: true };
}
