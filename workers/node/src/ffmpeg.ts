import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

/** Bundled FFmpeg / FFprobe (approved stack change, 19 Nov 2026). FFMPEG_PATH / FFPROBE_PATH override them. */
const FFMPEG = process.env.FFMPEG_PATH || (ffmpegPath as unknown as string);
const FFPROBE = process.env.FFPROBE_PATH || ffprobe.path;

function run(bin: string, args: string[], signal?: AbortSignal, onStderr?: (chunk: string) => void): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => {
      const s = String(d);
      stderr = (stderr + s).slice(-200_000);
      onStderr?.(s);
    });
    const onAbort = () => p.kill("SIGKILL");
    signal?.addEventListener("abort", onAbort, { once: true });
    p.on("error", reject);
    p.on("close", (code) => {
      signal?.removeEventListener("abort", onAbort);
      if (signal?.aborted) reject(new Error("stopped: step time limit"));
      else if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${bin.includes("probe") ? "ffprobe" : "ffmpeg"} exited ${code}: ${stderr.split("\n").filter(Boolean).slice(-2).join(" | ").slice(0, 300)}`));
    });
  });
}

export interface Probe { durationSec: number; width: number | null; height: number | null; hasVideo: boolean; hasAudio: boolean; formatName: string }

/** Reads a file's streams. Works on a signed URL, so nothing is downloaded first. */
export async function probe(input: string, signal?: AbortSignal): Promise<Probe> {
  const { stdout } = await run(FFPROBE, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", input], signal);
  const j = JSON.parse(stdout) as { format?: { duration?: string; format_name?: string }; streams?: { codec_type?: string; width?: number; height?: number; side_data_list?: { rotation?: number }[]; tags?: { rotate?: string } }[] };
  const video = j.streams?.find((s) => s.codec_type === "video");
  const rotation = Math.abs(Number(video?.side_data_list?.find((x) => x.rotation !== undefined)?.rotation ?? video?.tags?.rotate ?? 0));
  const swap = rotation === 90 || rotation === 270;
  return {
    durationSec: Number(j.format?.duration ?? 0),
    width: (swap ? video?.height : video?.width) ?? null,
    height: (swap ? video?.width : video?.height) ?? null,
    hasVideo: Boolean(video),
    hasAudio: Boolean(j.streams?.some((s) => s.codec_type === "audio")),
    formatName: j.format?.format_name ?? "",
  };
}

export function ffmpeg(args: string[], signal?: AbortSignal, onStderr?: (chunk: string) => void) {
  return run(FFMPEG, ["-hide_banner", "-nostdin", "-y", ...args], signal, onStderr);
}

/** A private temporary folder for one step, removed afterwards whatever happens. */
export async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "nelio-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Parses "time=00:01:23.45" from FFmpeg's progress output into seconds. */
export function progressSeconds(chunk: string): number | null {
  const m = /time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(chunk);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}
