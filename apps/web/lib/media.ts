import "server-only";
import { db, isStorageConfigured, signedGetUrl, storageKeys } from "@nelio/db";
import { formatBytes, formatDuration } from "@nelio/domain";
import type { IconName, Tone } from "@nelio/ui";

export const MEDIA_FILTERS = ["all", "uploads", "licensed", "clips", "exports"] as const;
export type MediaFilter = (typeof MEDIA_FILTERS)[number];
export const MEDIA_FILTER_LABEL: Record<MediaFilter, string> = { all: "All", uploads: "Uploads", licensed: "Licensed", clips: "Clips", exports: "Exports" };

export interface MediaItem {
  id: string;
  kind: "upload" | "clip" | "export";
  title: string;
  sub: string;
  chip: { label: string; tone: Tone; icon: IconName };
  poster: string | null;
  /** Hook text drawn over a clip's poster, as on the board ("STOP THIS"). */
  overlay: string | null;
  href: string;
}

const UPLOAD_CHIP: Record<string, { label: string; tone: Tone; icon: IconName }> = {
  uploading: { label: "uploading", tone: "blue", icon: "upload" },
  uploaded: { label: "needs details", tone: "warn", icon: "alert" },
  processing: { label: "processing", tone: "blue", icon: "refresh" },
  ready: { label: "ready", tone: "ok", icon: "check" },
  failed: { label: "failed", tone: "err", icon: "alert" },
  blocked: { label: "can’t be used", tone: "err", icon: "alert" },
};

function when(at: Date, now: Date, tz: string): string {
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  return day(at) === day(now) ? time : new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(at);
}

async function poster(workspaceId: string, assetId: string): Promise<string | null> {
  if (!isStorageConfigured()) return null;
  return signedGetUrl(storageKeys.poster(workspaceId, assetId), { expiresIn: 900 }).catch(() => null);
}

/** CL-01 from real data: uploads, draft clips and exports, newest first. Licensed sources arrive with licensing (MS 5). */
export async function loadMedia(workspaceId: string, filter: MediaFilter, base: { studio: string; upload: string; exports: string }, now = new Date()) {
  const client = db();
  const ws = await client.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { timezone: true } });
  const tz = ws.timezone;
  const [assets, projects, renders, storage] = await Promise.all([
    filter === "all" || filter === "uploads"
      ? client.mediaAsset.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 60, select: { id: true, filename: true, durationSec: true, status: true, statusText: true, rights: true, createdAt: true } })
      : [],
    filter === "all" || filter === "clips"
      ? client.clipProject.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 60, select: { id: true, assetId: true, name: true, hook: true, startMs: true, endMs: true, asset: { select: { filename: true } } } })
      : [],
    filter === "all" || filter === "exports"
      ? client.render.findMany({ where: { workspaceId, status: "ready" }, orderBy: { updatedAt: "desc" }, take: 60, select: { id: true, hook: true, format: true, project: { select: { name: true, assetId: true, startMs: true, endMs: true } } } })
      : [],
    client.mediaAsset.aggregate({ where: { workspaceId, deletedAt: null }, _sum: { sizeBytes: true } }),
  ]);

  const items: MediaItem[] = [];
  for (const a of assets) {
    const chip = UPLOAD_CHIP[a.status] ?? UPLOAD_CHIP.uploaded!;
    const sub = a.status === "blocked" || a.status === "failed" ? `${formatDuration(a.durationSec)} · ${a.statusText ?? "can’t be used"}` : `${formatDuration(a.durationSec)} · uploaded ${when(a.createdAt, now, tz)}`;
    items.push({
      id: a.id, kind: "upload", title: a.filename, sub, chip,
      poster: a.status === "uploading" || a.status === "uploaded" ? null : await poster(workspaceId, a.id),
      overlay: null,
      href: a.status === "uploaded" || a.status === "uploading" ? base.upload : `${base.studio}/${a.id}`,
    });
  }
  for (const p of projects) {
    items.push({
      id: p.id, kind: "clip", title: p.name, sub: `${formatDuration((p.endMs - p.startMs) / 1000, "clock")} · from ${p.asset.filename.replace(/\.[^.]+$/, "")}`,
      chip: { label: "draft clip", tone: "lime", icon: "scissors" }, poster: await poster(workspaceId, p.assetId), overlay: p.hook.toUpperCase().split(/\s+/).slice(0, 2).join(" "),
      href: `${base.studio}/${p.assetId}?project=${p.id}`,
    });
  }
  for (const r of renders) {
    items.push({
      id: r.id, kind: "export", title: r.project.name, sub: `${formatDuration((r.project.endMs - r.project.startMs) / 1000, "clock")} · ${r.format}`,
      chip: { label: "exported", tone: "ok", icon: "download" }, poster: await poster(workspaceId, r.project.assetId), overlay: r.hook.toUpperCase().split(/\s+/).slice(0, 2).join(" "),
      href: base.exports,
    });
  }
  return { items, storageUsed: formatBytes(Number(storage._sum.sizeBytes ?? 0)), anyUploads: (await client.mediaAsset.count({ where: { workspaceId, deletedAt: null } })) > 0 };
}
export type MediaData = Awaited<ReturnType<typeof loadMedia>>;
