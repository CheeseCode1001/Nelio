// Connection check for the hosted dev Redis. Prints only the result, never the address or password.
import IORedis from "ioredis";

const url = process.env.NELIO_REDIS_URL;
if (!url) { console.error("NELIO_REDIS_URL is not set"); process.exit(1); }
const r = new IORedis(url, { maxRetriesPerRequest: 1, connectTimeout: 10000, lazyConnect: true, retryStrategy: () => null });
r.on("error", () => {});
try {
  await r.connect();
  const pong = await r.ping();
  const policy = (await r.config("GET", "maxmemory-policy").catch(() => []))[1] ?? "(not readable)";
  const ver = (await r.info("server")).match(/redis_version:(\S+)/)?.[1];
  await r.set("nelio:ping", "ok", "EX", 30);
  console.log(`ping=${pong} version=${ver} maxmemory-policy=${policy} write=${await r.get("nelio:ping")}`);
} catch (e) {
  console.error(`connect failed: ${(e && e.code) || ""} ${String(e && e.message).replace(/rediss?:\/\/\S+/g, "[url]")}`);
  process.exitCode = 1;
} finally { r.disconnect(); }
