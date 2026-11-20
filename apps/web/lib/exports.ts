import "server-only";
import { db, isStorageConfigured, signedGetUrl, storageKeys } from "@nelio/db";
import { PLANS, buildVariants, clampCaptionSize, isCaptionStyle, isClipFormat, type ClipSnapshot, type PlanId, type Variant } from "@nelio/domain";
import type { IconName, Tone } from "@nelio/ui";

export interface ExportRow {
  id: string;
  title: string;
  format: string;
  status: "queued" | "rendering" | "ready" | "failed" | "canceled";
  chip: { label: string; tone: Tone; icon: IconName };
  /** 0–100 while rendering, from the worker's progress note. */
  progress: number | null;
  credits: string;
  posterUrl: string | null;
  downloadUrl: string | null;
  /** Clip card (refresh of 20 Nov 2026): length ("0:42") and the source video it was cut from. */
  duration?: string;
  source?: string;
}
export interface ExportsData { rows: ExportRow[]; trial: { used: number; cap: number } | null }

const CHIP: Record<ExportRow["status"], ExportRow["chip"]> = {
  queued: { label: "queued", tone: "blue", icon: "clock" },
  rendering: { label: "rendering", tone: "blue", icon: "refresh" },
  ready: { label: "ready", tone: "ok", icon: "check" },
  failed: { label: "failed · refunded", tone: "err", icon: "x" },
  canceled: { label: "canceled · refunded", tone: "neutral", icon: "x" },
};

const safeName = (s: string) => s.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_").slice(0, 60) || "clip";

/** CL-05 from real data: every render, newest first, with signed downloads for finished ones. */
export async function loadExports(workspaceId: string, orgId: string): Promise<ExportsData> {
  const client = db();
  const [renders, org, used] = await Promise.all([
    client.render.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { project: { select: { name: true, assetId: true, startMs: true, endMs: true, asset: { select: { filename: true } } } } },
    }),
    client.organization.findUniqueOrThrow({ where: { id: orgId }, select: { plan: true } }),
    client.render.count({ where: { orgId, status: { notIn: ["failed", "canceled"] } } }),
  ]);
  const runIds = renders.filter((r) => r.status === "rendering" && r.runId).map((r) => r.runId!);
  const steps = runIds.length ? await client.runStep.findMany({ where: { runId: { in: runIds } }, select: { runId: true, detail: true } }) : [];
  const storage = isStorageConfigured();

  const rows: ExportRow[] = [];
  for (const r of renders) {
    const status = r.status as ExportRow["status"];
    const settings = r.settings as { format?: string; startMs?: number; endMs?: number } | null;
    const secs = Math.max(0, Math.round(((settings?.endMs ?? r.project.endMs) - (settings?.startMs ?? r.project.startMs)) / 1000));
    const pct = status === "rendering" ? Number(/(\d+)%/.exec(steps.find((s) => s.runId === r.runId)?.detail ?? "")?.[1] ?? 0) : null;
    rows.push({
      id: r.id,
      title: `“${r.project.name}”${r.label ? ` · ${r.label.split(" · ")[0]}` : ""}`,
      format: `${settings?.format ?? r.format} · ${r.resolution}`,
      duration: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`,
      source: r.project.asset.filename.replace(/\.[^.]+$/, ""),
      status,
      chip: CHIP[status],
      progress: pct,
      credits: `${r.estimatedCredits} → ${status === "ready" || status === "failed" || status === "canceled" ? r.actualCredits : "—"}`,
      posterUrl: storage ? await signedGetUrl(storageKeys.poster(workspaceId, r.project.assetId), { expiresIn: 3600 }).catch(() => null) : null,
      downloadUrl: storage && status === "ready" && r.storageKey ? await signedGetUrl(r.storageKey, { expiresIn: 3600, downloadName: `${safeName(r.project.name)}${r.label ? `_${safeName(r.label)}` : ""}.mp4` }).catch(() => null) : null,
    });
  }
  const cap = PLANS[org.plan as PlanId].exports;
  return { rows, trial: cap === undefined ? null : { used: Math.min(used, cap), cap } };
}

// ------------------------------------------------------------------ CL-04

export interface VariantsData {
  asset: { id: string; title: string };
  projectId: string | null;
  /** The clip the variants start from (the saved version, or the top moment). */
  base: ClipSnapshot;
  set: { id: string; items: Variant[] } | null;
  posterUrl: string | null;
  blocked: string | null;
}

export async function loadVariants(workspaceId: string, assetId: string, projectId: string | null): Promise<VariantsData | null> {
  const client = db();
  const asset = await client.mediaAsset.findFirst({ where: { id: assetId, workspaceId, deletedAt: null }, select: { id: true, filename: true, status: true, durationSec: true, candidates: { orderBy: { rank: "asc" }, take: 1 } } });
  if (!asset) return null;
  const project = projectId
    ? await client.clipProject.findFirst({ where: { id: projectId, workspaceId, assetId } })
    : await client.clipProject.findFirst({ where: { workspaceId, assetId }, orderBy: { updatedAt: "desc" } });
  const kit = await client.brandKit.findFirst({ where: { workspaceId }, orderBy: [{ isDefault: "desc" }, { name: "asc" }], select: { id: true } });
  const top = asset.candidates[0];
  const base: ClipSnapshot = project
    ? { startMs: project.startMs, endMs: project.endMs, hook: project.hook, captionStyle: isCaptionStyle(project.captionStyle) ? project.captionStyle : "bold_pop", captionSize: clampCaptionSize(project.captionSize), format: isClipFormat(project.format) ? project.format : "9:16", brandKitId: project.brandKitId }
    : { startMs: top?.startMs ?? 0, endMs: top?.endMs ?? Math.min(30_000, Math.round((asset.durationSec ?? 30) * 1000)), hook: top?.hook ?? asset.filename.replace(/\.[^.]+$/, ""), captionStyle: "bold_pop", captionSize: 100, format: "9:16", brandKitId: kit?.id ?? null };
  return {
    asset: { id: asset.id, title: asset.filename.replace(/\.[^.]+$/, "") },
    projectId: project?.id ?? null,
    base,
    set: (project?.variants as unknown as VariantsData["set"]) ?? null,
    posterUrl: isStorageConfigured() ? await signedGetUrl(storageKeys.poster(workspaceId, asset.id), { expiresIn: 3600 }).catch(() => null) : null,
    blocked: asset.status === "ready" ? null : asset.status === "processing" ? "This video is still being processed. Variants open when it’s ready." : "This video can’t be used. Pick another source.",
  };
}

/** Sample variants for previews, built with the same rules as the real ones. */
export const sampleVariants = (base: ClipSnapshot) => buildVariants(base, { question: "Are you budgeting wrong?", number: "3 budget mistakes" });
