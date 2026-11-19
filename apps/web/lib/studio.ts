import "server-only";
import { db, isStorageConfigured, signedGetUrl, storageKeys } from "@nelio/db";
import {
  clampCaptionSize, formatBytes, formatDuration, isCaptionStyle, isClipFormat, transcriptLines,
  type ClipSnapshot, type Line, type Word,
} from "@nelio/domain";

export type StepState = "done" | "running" | "queued" | "failed";
export interface StudioMoment { id: string; rank: number; title: string; hook: string; score: number; startMs: number; endMs: number }
export interface StudioRevision { number: number; when: string; note: string | null; snapshot: ClipSnapshot }

export interface StudioData {
  asset: { id: string; filename: string; title: string; durationMs: number; sub: string; rightsLabel: string; status: string };
  mode: "ready" | "processing" | "blocked";
  /** Why the video can't be rendered (CL-03 Blocked). */
  blocked: { title: string; text: string } | null;
  processing: { steps: { title: string; detail: string | null; state: StepState }[]; estimate: number; used: number; eta: string } | null;
  moments: StudioMoment[];
  lines: Line[];
  /** Compact words for caption timing: [startMs, endMs, text]. */
  words: [number, number, string][];
  project: { id: string; version: number; saved: ClipSnapshot } | null;
  revisions: StudioRevision[];
  brandKits: { id: string; name: string; accent: string }[];
  render: { status: "queued" | "rendering" } | null;
  videoUrl: string | null;
  posterUrl: string | null;
}

const STEP_STATE: Record<string, StepState> = { done: "done", running: "running", confirming: "running", queued: "queued", paused: "queued", needs_approval: "queued", blocked: "failed", failed: "failed", canceled: "failed" };

/** Rough processing time shown while a video is worked on: about 1 minute per 8 minutes of video. */
export function processingEta(durationSec: number | null): string {
  if (!durationSec) return "This usually takes a few minutes. You can leave; we’ll notify you.";
  const min = Math.max(1, Math.round(durationSec / 60 / 8));
  const len = Math.max(1, Math.round(durationSec / 60));
  return `This takes about ${min} minute${min === 1 ? "" : "s"} for a ${len}-minute video. You can leave; we’ll notify you.`;
}

function snapshotOf(p: { startMs: number; endMs: number; hook: string; captionStyle: string; captionSize: number; format: string; brandKitId: string | null }): ClipSnapshot {
  return {
    startMs: p.startMs, endMs: p.endMs, hook: p.hook,
    captionStyle: isCaptionStyle(p.captionStyle) ? p.captionStyle : "bold_pop",
    captionSize: clampCaptionSize(p.captionSize),
    format: isClipFormat(p.format) ? p.format : "9:16",
    brandKitId: p.brandKitId,
  };
}

/** CL-03 from real data: the video, its moments and transcript, the open clip project and any render in flight. */
export async function loadStudio(workspaceId: string, assetId: string, projectId: string | null, tz: string): Promise<StudioData | null> {
  const client = db();
  const asset = await client.mediaAsset.findFirst({
    where: { id: assetId, workspaceId, deletedAt: null },
    include: { transcript: { select: { words: true } }, candidates: { orderBy: { rank: "asc" } } },
  });
  if (!asset) return null;

  const project = projectId
    ? await client.clipProject.findFirst({ where: { id: projectId, workspaceId, assetId } })
    : await client.clipProject.findFirst({ where: { workspaceId, assetId }, orderBy: { updatedAt: "desc" } });
  const [run, kits, revisions, render] = await Promise.all([
    asset.status === "processing" || asset.status === "uploaded"
      ? client.agentRun.findFirst({ where: { assetId: asset.id, kind: "process" }, orderBy: { createdAt: "desc" }, include: { steps: { orderBy: { ordinal: "asc" } } } })
      : null,
    client.brandKit.findMany({ where: { workspaceId }, orderBy: [{ isDefault: "desc" }, { name: "asc" }], select: { id: true, name: true, accent: true } }),
    project ? client.projectRevision.findMany({ where: { projectId: project.id }, orderBy: { number: "desc" }, take: 20 }) : [],
    project ? client.render.findFirst({ where: { projectId: project.id, status: { in: ["queued", "rendering"] } }, orderBy: { createdAt: "desc" }, select: { status: true } }) : null,
  ]);

  const words = ((asset.transcript?.words as unknown as Word[] | undefined) ?? []);
  const durationMs = Math.round((asset.durationSec ?? 0) * 1000);
  const fmt = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

  const mode: StudioData["mode"] = asset.status === "ready" ? "ready" : asset.status === "blocked" || asset.status === "failed" ? "blocked" : "processing";
  const rightsLabel = `${asset.rights === "permission" ? "With permission" : asset.rights === "license" ? "Licensed" : "Own upload"} · rights ${asset.rightsRef}`;
  const storage = isStorageConfigured();

  return {
    asset: {
      id: asset.id,
      filename: asset.filename,
      title: asset.filename.replace(/\.[^.]+$/, ""),
      durationMs,
      sub: `Source: ${asset.rights === "license" ? "licensed video" : "your upload"} · ${formatDuration(asset.durationSec)}`,
      rightsLabel,
      status: asset.status,
    },
    mode,
    blocked: mode === "blocked" ? { title: asset.status === "failed" ? "Can’t render: processing failed" : "Can’t render: this video can’t be used", text: asset.statusText ?? "Upload the video again or pick another source." } : null,
    processing: run
      ? {
          steps: run.steps.map((s) => ({
            title: s.title,
            detail: s.kind === "check_file" && s.status !== "done" ? `${formatBytes(Number(asset.sizeBytes))}${asset.durationSec ? ` · ${formatDuration(asset.durationSec)}` : ""}` : s.detail,
            state: STEP_STATE[s.status] ?? "queued",
          })),
          estimate: run.estimatedCredits,
          used: run.steps.reduce((a, s) => a + s.actualCredits, 0),
          eta: processingEta(asset.durationSec),
        }
      : mode === "processing"
        ? { steps: [], estimate: asset.estimatedCredits, used: 0, eta: processingEta(asset.durationSec) }
        : null,
    moments: asset.candidates.map((c) => ({ id: c.id, rank: c.rank, title: c.title, hook: c.hook, score: c.score, startMs: c.startMs, endMs: c.endMs })),
    lines: transcriptLines(words),
    words: words.map((w) => [w.s, w.e, w.w]),
    project: project ? { id: project.id, version: project.version, saved: snapshotOf(project) } : null,
    revisions: revisions.map((r) => ({ number: r.number, when: fmt(r.createdAt), note: r.note, snapshot: snapshotOf({ ...(r.snapshot as unknown as ClipSnapshot), brandKitId: (r.snapshot as unknown as ClipSnapshot).brandKitId ?? null }) })),
    brandKits: kits,
    render: render ? { status: render.status as "queued" | "rendering" } : null,
    videoUrl: storage && mode === "ready" ? await signedGetUrl(asset.storageKey, { expiresIn: 3 * 3600 }).catch(() => null) : null,
    posterUrl: storage && asset.status !== "uploading" ? await signedGetUrl(storageKeys.poster(workspaceId, asset.id), { expiresIn: 3 * 3600 }).catch(() => null) : null,
  };
}
