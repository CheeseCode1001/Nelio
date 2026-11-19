/**
 * Platform admin: confirm or reject a channel check done by hand (LI-06), until the admin screens arrive (AD-04, Milestone 9).
 *   pnpm --filter @nelio/worker-node admin:channel list
 *   pnpm --filter @nelio/worker-node admin:channel approve <channelId> <adminEmail>
 *   pnpm --filter @nelio/worker-node admin:channel reject <channelId> <adminEmail> "reason shown to the creator"
 * Approve only after seeing the creator's code in the channel description or bio at the claimed link.
 */
import { db, notify } from "@nelio/db";

const [cmd, id, email, ...rest] = process.argv.slice(2);
const client = db();

async function main() {
  if (cmd === "list") {
    const rows = await client.creatorChannel.findMany({ where: { status: "pending", method: "manual" }, orderBy: { createdAt: "asc" }, include: { creator: { select: { displayName: true } } } });
    for (const r of rows) console.log(`${r.id}  ${r.platform}  ${r.url}  code=${(r.evidence as { code?: string }).code}  creator=${r.creator.displayName}`);
    if (!rows.length) console.log("No checks waiting.");
    return;
  }
  if ((cmd !== "approve" && cmd !== "reject") || !id || !email) throw new Error("Usage: list | approve <channelId> <adminEmail> | reject <channelId> <adminEmail> <reason>");
  const admin = await client.user.findFirst({ where: { email, isPlatformAdmin: true }, select: { id: true } });
  if (!admin) throw new Error("That email isn’t a platform admin.");
  await client.$transaction(async (tx) => {
    const ch = await tx.creatorChannel.findFirst({ where: { id, status: "pending", method: "manual" }, include: { creator: { select: { id: true, userId: true } } } });
    if (!ch) throw new Error("No pending manual check with that id.");
    const now = new Date();
    if (cmd === "approve") {
      await tx.creatorChannel.update({ where: { id }, data: { status: "verified", verifiedAt: now, failureReason: null, evidence: { ...(ch.evidence as object), reviewedBy: admin.id, reviewedAt: now.toISOString() } } });
      await tx.creatorProfile.update({ where: { id: ch.creator.id }, data: { verificationStatus: "verified" } });
    } else {
      await tx.creatorChannel.update({ where: { id }, data: { status: "failed", failureReason: rest.join(" ") || "We couldn’t find your code at that link.", evidence: { ...(ch.evidence as object), reviewedBy: admin.id, reviewedAt: now.toISOString() } } });
    }
    await tx.auditEvent.create({ data: { actorUserId: admin.id, actorType: "platform_admin", action: cmd === "approve" ? "creator_channel.verified" : "creator_channel.failed", targetType: "creator_channel", targetId: id, metadata: { method: "manual" } } });
    await notify(tx, { userId: ch.creator.userId, category: "licenses", title: cmd === "approve" ? "Your channel is verified" : "We couldn’t verify your channel", body: cmd === "approve" ? "You can publish your licensing terms now." : (rest.join(" ") || "We couldn’t find your code at that link."), href: "/creator/verify", dedupeKey: `channel:${id}:${cmd}:${now.getTime()}` });
  });
  console.log(`${cmd === "approve" ? "Verified" : "Rejected"} ${id}`);
}

main().then(() => process.exit(0), (e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
