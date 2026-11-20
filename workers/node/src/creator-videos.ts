import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, isStorageConfigured, putObject, signedGetUrl, storageKeys } from "@nelio/db";
import { MAX_DURATION_SEC } from "@nelio/domain";
import { ffmpeg, probe, withTempDir } from "./ffmpeg";

/**
 * Creator videos (Milestone 5): once an upload completes, read its length and save a poster frame for the
 * marketplace. A file that isn't a readable video, or is over the length limit, is marked failed and drops
 * out of the library. One video per pass; the loop runs every few seconds.
 */
export async function checkCreatorVideos(): Promise<number> {
  if (!isStorageConfigured()) return 0;
  const client = db();
  const v = await client.creatorVideo.findFirst({ where: { status: "ready", checkedAt: null, deletedAt: null }, orderBy: { createdAt: "asc" } });
  if (!v) return 0;
  // Claim it first so two workers never take the same video.
  const claimed = await client.creatorVideo.updateMany({ where: { id: v.id, checkedAt: null }, data: { checkedAt: new Date() } });
  if (!claimed.count) return 0;
  const url = await signedGetUrl(v.storageKey, { expiresIn: 3600 });
  try {
    const p = await probe(url);
    if (!p.hasVideo || !p.durationSec || p.durationSec > MAX_DURATION_SEC) {
      await client.creatorVideo.update({ where: { id: v.id }, data: { status: "failed" } });
      return 1;
    }
    const key = storageKeys.creatorPoster(v.creatorId, v.id);
    await withTempDir(async (dir) => {
      const out = join(dir, "poster.jpg");
      await ffmpeg(["-ss", String(Math.min(p.durationSec * 0.1, 30)), "-i", url, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "4", out]);
      await putObject(key, await readFile(out), "image/jpeg");
    });
    await client.creatorVideo.update({ where: { id: v.id }, data: { durationSec: p.durationSec, posterKey: key } });
  } catch (e) {
    // Try again on a later pass.
    await client.creatorVideo.update({ where: { id: v.id }, data: { checkedAt: null } });
    throw e;
  }
  return 1;
}
