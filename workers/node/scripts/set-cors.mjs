// Lets browsers upload straight to the media bucket with signed URLs (and read the ETag of each part).
// Origins: NEXT_PUBLIC_APP_URL plus local development. Usage: pnpm --filter @nelio/worker-node storage:cors
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const env = process.env;
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID ?? "", secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "" },
  // The storage service rejects the optional checksum headers newer clients add by default.
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
const origins = [...new Set([env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"].filter(Boolean).map((o) => o.replace(/\/$/, "")))];
try {
  await s3.send(new PutBucketCorsCommand({
    Bucket: env.R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ["PUT", "GET", "HEAD"], AllowedHeaders: ["content-type"], ExposeHeaders: ["ETag"], MaxAgeSeconds: 3600 }],
    },
  }));
  const got = await s3.send(new GetBucketCorsCommand({ Bucket: env.R2_BUCKET }));
  console.log(`CORS set for: ${got.CORSRules?.[0]?.AllowedOrigins?.join(", ")}`);
} catch (e) {
  console.log(`Could not set CORS: ${e.name} (${e.$metadata?.httpStatusCode ?? "?"}) ${String(e.message).slice(0, 160)}. Add it in the storage dashboard instead.`);
  process.exitCode = 1;
}
