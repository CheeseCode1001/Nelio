// Checks each service key in .env.local with one harmless call. Prints only results, never values.
// Usage: pnpm --filter @nelio/worker-node check:keys
import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import IORedis from "ioredis";

const env = process.env;
const scrub = (s) => String(s).replace(/(rediss?|https?):\/\/\S+/g, "[url]").replace(/[A-Za-z0-9_\-]{24,}/g, "[redacted]");
const results = [];
const report = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

// Video storage: write, read back and delete one small test object.
try {
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID ?? "", secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "" },
  });
  await s3.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET }));
  const Key = `_checks/key-check-${Date.now()}.txt`;
  await s3.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key, Body: "ok", ContentType: "text/plain" }));
  const got = await (await s3.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key }))).Body.transformToString();
  await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key }));
  report("Video storage", got === "ok", "bucket reachable; write, read and delete work");
} catch (e) {
  report("Video storage", false, `${e.name ?? ""} ${scrub(e.message)}`);
}

// Transcription: list projects (read-only).
try {
  const r = await fetch("https://api.deepgram.com/v1/projects", { headers: { authorization: `Token ${env.DEEPGRAM_API_KEY}` }, signal: AbortSignal.timeout(20000) });
  const body = r.ok ? await r.json() : null;
  report("Transcription", r.ok, r.ok ? `key accepted; ${body?.projects?.length ?? 0} project(s)` : `answered ${r.status}`);
} catch (e) {
  report("Transcription", false, scrub(e.message));
}

// Nelio AI: list models (read-only, no tokens spent), then one tiny message to confirm billing works.
try {
  const h = { "x-api-key": env.AI_API_KEY ?? "", "anthropic-version": "2023-06-01", "content-type": "application/json" };
  const m = await fetch("https://api.anthropic.com/v1/models", { headers: h, signal: AbortSignal.timeout(20000) });
  if (!m.ok) report("Nelio AI", false, `models answered ${m.status}`);
  else {
    const models = (await m.json()).data?.map((x) => x.id) ?? [];
    const model = models.find((id) => id.startsWith("claude-haiku")) ?? models[0];
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: h, body: JSON.stringify({ model, max_tokens: 5, messages: [{ role: "user", content: "Reply with: ok" }] }), signal: AbortSignal.timeout(30000) });
    const j = await r.json().catch(() => ({}));
    report("Nelio AI", r.ok, r.ok ? `key accepted; ${models.length} models available; a 5-token test reply worked` : `message answered ${r.status} ${j?.error?.type ?? ""}`);
  }
} catch (e) {
  report("Nelio AI", false, scrub(e.message));
}

// Redis.
try {
  const r = new IORedis(env.NELIO_REDIS_URL ?? "", { maxRetriesPerRequest: 1, connectTimeout: 10000, lazyConnect: true, retryStrategy: () => null });
  r.on("error", () => {});
  await r.connect();
  report("Redis", (await r.ping()) === "PONG", "connected");
  r.disconnect();
} catch (e) {
  report("Redis", false, `${scrub(e.message)} (is your current IP allowed on Render?)`);
}

console.log(results.join("\n"));
process.exit(results.some((x) => x.startsWith("FAIL")) ? 1 : 0);
