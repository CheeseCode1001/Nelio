import {
  AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CopyObjectCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand,
  PutObjectCommand, S3Client, UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Object storage for media. Server and worker only: browsers receive short-lived signed URLs, never keys.
 * Path-style addressing and checksums "when required" keep it compatible with the storage service.
 */
let client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
}

function s3(): S3Client {
  if (!isStorageConfigured()) throw new Error("Storage is not configured (R2_* settings).");
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}
const bucket = () => process.env.R2_BUCKET!;

/** Upload parts are 16 MB (the last may be smaller); a 2 GB file is at most 128 parts. */
export const PART_SIZE = 16 * 1024 * 1024;

export async function startMultipart(key: string, contentType: string): Promise<string> {
  const r = await s3().send(new CreateMultipartUploadCommand({ Bucket: bucket(), Key: key, ContentType: contentType }));
  if (!r.UploadId) throw new Error("Storage did not start the upload.");
  return r.UploadId;
}

/** Signed PUT URLs for the given part numbers, valid for one hour. */
export async function signParts(key: string, uploadId: string, parts: number[]): Promise<{ part: number; url: string }[]> {
  return Promise.all(parts.map(async (part) => ({ part, url: await getSignedUrl(s3(), new UploadPartCommand({ Bucket: bucket(), Key: key, UploadId: uploadId, PartNumber: part }), { expiresIn: 3600 }) })));
}

export async function completeMultipart(key: string, uploadId: string, parts: { part: number; etag: string }[]): Promise<void> {
  await s3().send(new CompleteMultipartUploadCommand({
    Bucket: bucket(), Key: key, UploadId: uploadId,
    MultipartUpload: { Parts: [...parts].sort((a, b) => a.part - b.part).map((p) => ({ PartNumber: p.part, ETag: p.etag })) },
  }));
}

export async function abortMultipart(key: string, uploadId: string): Promise<void> {
  await s3().send(new AbortMultipartUploadCommand({ Bucket: bucket(), Key: key, UploadId: uploadId })).catch(() => {});
}

export async function headObject(key: string): Promise<{ size: number; contentType: string | null } | null> {
  try {
    const r = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return { size: Number(r.ContentLength ?? 0), contentType: r.ContentType ?? null };
  } catch {
    return null;
  }
}

/** A short-lived link to read an object (playback, thumbnails, downloads). */
export async function signedGetUrl(key: string, opts: { expiresIn?: number; downloadName?: string } = {}): Promise<string> {
  return getSignedUrl(s3(), new GetObjectCommand({
    Bucket: bucket(), Key: key,
    ...(opts.downloadName ? { ResponseContentDisposition: `attachment; filename="${opts.downloadName.replace(/[^\w.\- ]/g, "_")}"` } : {}),
  }), { expiresIn: opts.expiresIn ?? 900 });
}

/** Server-side copy inside the bucket (a licensed creator video into the licensee's workspace). Files over 5 GB aren't accepted at upload. */
export async function copyObject(from: string, to: string, contentType: string): Promise<void> {
  await s3().send(new CopyObjectCommand({ Bucket: bucket(), CopySource: `${bucket()}/${from.split("/").map(encodeURIComponent).join("/")}`, Key: to, ContentType: contentType, MetadataDirective: "REPLACE" }));
}

export async function putObject(key: string, body: Uint8Array | Buffer | string, contentType: string): Promise<void> {
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));
}

export async function getObjectStream(key: string) {
  const r = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  return r.Body as unknown as NodeJS.ReadableStream;
}

export async function deleteObject(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key })).catch(() => {});
}

/** Where a workspace's files live. Keys never contain the original filename (it is stored in the database). */
export const storageKeys = {
  source: (workspaceId: string, assetId: string, ext: string) => `ws/${workspaceId}/media/${assetId}/source.${ext}`,
  poster: (workspaceId: string, assetId: string) => `ws/${workspaceId}/media/${assetId}/poster.jpg`,
  audio: (workspaceId: string, assetId: string) => `ws/${workspaceId}/media/${assetId}/audio.m4a`,
  preview: (workspaceId: string, assetId: string, rank: number) => `ws/${workspaceId}/media/${assetId}/preview-${rank}.mp4`,
  render: (workspaceId: string, renderId: string) => `ws/${workspaceId}/renders/${renderId}.mp4`,
  /** A creator's own video offered for licensing (Milestone 5). Licensees get a copy under their workspace. */
  creatorVideo: (creatorId: string, videoId: string, ext: string) => `creators/${creatorId}/videos/${videoId}/source.${ext}`,
  creatorPoster: (creatorId: string, videoId: string) => `creators/${creatorId}/videos/${videoId}/poster.jpg`,
};
