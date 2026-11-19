import { db } from "@nelio/db";
import { claimMatches } from "@nelio/domain";
import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { COOKIE, appOrigin, ownedChannels, youtubeConfigured, type OwnedChannel } from "@/lib/youtube-verify";

const NOT_OWNER = "That sign-in didn’t own this channel. Sign in with the owner account.";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Google sends the creator back here. We check the state, read the channels they own, and record the result. */
export async function GET(req: NextRequest) {
  const origin = appOrigin(req.nextUrl.origin);
  const done = (result: string) => {
    const res = NextResponse.redirect(`${origin}/creator/verify?result=${result}`);
    res.cookies.set(COOKIE, "", { maxAge: 0, path: "/api/creator/verify/youtube" });
    return res;
  };
  let saved: { s: string; v: string; c: string | null; p: string } | null = null;
  try { saved = JSON.parse(req.cookies.get(COOKIE)?.value ?? "null"); } catch { saved = null; }
  const state = req.nextUrl.searchParams.get("state") ?? "";
  if (!saved || !state || !same(state, saved.s)) return done("error");
  if (req.nextUrl.searchParams.get("error")) return done("canceled");
  const code = req.nextUrl.searchParams.get("code");
  if (!code || !youtubeConfigured()) return done("error");

  const session = await getSession();
  const client = db();
  const creator = session ? await client.creatorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } }) : null;
  if (!session || !creator || creator.id !== saved.p) return done("error");

  let owned: OwnedChannel[];
  try {
    owned = await ownedChannels(origin, code, saved.v);
  } catch {
    return done("error");
  }

  const now = new Date();
  const result = await client.$transaction(async (tx) => {
    const audit = (action: string, targetId: string, metadata: object) => tx.auditEvent.create({ data: { actorUserId: session.user.id, action, targetType: "creator_channel", targetId, metadata } });
    /** Records one owned channel as verified for this creator. Another creator's verified channel is never taken over. */
    const verify = async (ch: OwnedChannel, claimId: string | null): Promise<"verified" | "taken"> => {
      const existing = await tx.creatorChannel.findUnique({ where: { platform_externalId: { platform: "youtube", externalId: ch.id } } });
      if (existing && existing.creatorId !== creator.id && existing.status === "verified") return "taken";
      const data = { title: ch.title, handle: ch.handle, url: `https://www.youtube.com/channel/${ch.id}`, status: "verified" as const, method: "oauth", failureReason: null, verifiedAt: now, evidence: { channelId: ch.id, checkedAt: now.toISOString(), via: "youtube_signin" } };
      if (existing && existing.creatorId === creator.id) {
        await tx.creatorChannel.update({ where: { id: existing.id }, data });
        if (claimId && claimId !== existing.id) await tx.creatorChannel.delete({ where: { id: claimId } });
        await audit("creator_channel.verified", existing.id, { platform: "youtube", channelId: ch.id });
      } else if (existing) {
        // An unverified claim by someone else: the person who proved ownership gets the channel.
        await tx.creatorChannel.update({ where: { id: existing.id }, data: { ...data, creatorId: creator.id } });
        if (claimId && claimId !== existing.id) await tx.creatorChannel.delete({ where: { id: claimId } });
        await audit("creator_channel.verified", existing.id, { platform: "youtube", channelId: ch.id, tookOverClaim: true });
      } else if (claimId) {
        await tx.creatorChannel.update({ where: { id: claimId }, data: { ...data, externalId: ch.id } });
        await audit("creator_channel.verified", claimId, { platform: "youtube", channelId: ch.id });
      } else {
        const row = await tx.creatorChannel.create({ data: { creatorId: creator.id, platform: "youtube", externalId: ch.id, ...data } });
        await audit("creator_channel.verified", row.id, { platform: "youtube", channelId: ch.id });
      }
      return "verified";
    };

    let outcome: string;
    if (saved.c) {
      const claim = await tx.creatorChannel.findFirst({ where: { id: saved.c, creatorId: creator.id } });
      if (!claim) return "error";
      const match = owned.find((o) => claimMatches(claim, o));
      if (!match) {
        await tx.creatorChannel.update({ where: { id: claim.id }, data: { status: "failed", failureReason: NOT_OWNER } });
        await audit("creator_channel.failed", claim.id, { platform: "youtube", owned: owned.length });
        outcome = "failed";
      } else {
        outcome = await verify(match, claim.id);
      }
    } else if (!owned.length) {
      outcome = "nochannel";
    } else {
      const results = [];
      for (const ch of owned) results.push(await verify(ch, null));
      outcome = results.includes("verified") ? "verified" : "taken";
    }
    if (await tx.creatorChannel.count({ where: { creatorId: creator.id, status: "verified" } })) {
      await tx.creatorProfile.update({ where: { id: creator.id }, data: { verificationStatus: "verified" } });
    }
    return outcome;
  });
  return done(result);
}
