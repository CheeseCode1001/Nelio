"use client";

/**
 * Browser side of direct multipart uploads to storage (CL-02 and the creator's videos). The server signs each
 * part; the browser sends the bytes straight to storage and never sees a storage credential.
 */

/** Reads a video's length in the browser before upload, for the estimate. Null if the browser can't tell. */
export function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    const done = (d: number | null) => { URL.revokeObjectURL(url); resolve(d); };
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : null);
    v.onerror = () => done(null);
    setTimeout(() => done(null), 8000);
    v.src = url;
  });
}

export function putPart(url: string, blob: Blob, onProgress: (n: number) => void, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.upload.onprogress = (e) => onProgress(e.loaded);
    x.onload = () => {
      const etag = x.getResponseHeader("ETag");
      if (x.status >= 200 && x.status < 300 && etag) resolve(etag);
      else reject(new Error(x.status ? `part answered ${x.status}` : "no ETag (storage CORS)"));
    };
    x.onerror = () => reject(new Error("network"));
    signal.addEventListener("abort", () => x.abort());
    x.send(blob);
  });
}

/** Sends every part (three at a time, three tries each) and returns the part list to complete the upload. */
export async function sendParts(opts: {
  file: File;
  partSize: number;
  partCount: number;
  sign: (parts: number[]) => Promise<{ ok: true; urls: { part: number; url: string }[] } | { ok: false; error: string }>;
  onProgress: (sent: number) => void;
  signal: AbortSignal;
  parallel?: number;
}): Promise<{ part: number; etag: string }[]> {
  const { file, partSize, partCount, sign, onProgress, signal } = opts;
  const sentByPart = new Map<number, number>();
  const report = () => onProgress([...sentByPart.values()].reduce((a, b) => a + b, 0));
  const done: { part: number; etag: string }[] = [];
  const queue = Array.from({ length: partCount }, (_, i) => i + 1);
  const worker = async () => {
    while (queue.length && !signal.aborted) {
      const batch = queue.splice(0, 1);
      const signed = await sign(batch);
      if (!signed.ok) throw new Error(signed.error);
      for (const { part, url } of signed.urls) {
        const blob = file.slice((part - 1) * partSize, Math.min(file.size, part * partSize));
        let etag = "";
        for (let attempt = 1; attempt <= 3 && !etag; attempt++) {
          try {
            etag = await putPart(url, blob, (n) => { sentByPart.set(part, n); report(); }, signal);
          } catch (e) {
            if (attempt === 3 || signal.aborted) throw e;
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
        sentByPart.set(part, blob.size);
        report();
        done.push({ part, etag });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.parallel ?? 3, partCount) }, worker));
  return done;
}

export const uploadErrorText = (e: unknown) =>
  e instanceof Error && /CORS|ETag/.test(e.message)
    ? "The upload was blocked by the storage settings. Ask an admin to allow uploads from this site."
    : e instanceof Error && e.message.length < 120 ? e.message : "The upload stopped. Check your connection and try again.";
