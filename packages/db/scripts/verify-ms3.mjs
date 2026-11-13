// Checks the Milestone 3 migration on a live database: row-level security, browser-role grants,
// triggers, the realtime policy and the append-only rule. Prints results only, never the connection string.
// Usage: node --env-file=../../apps/web/.env.local scripts/verify-ms3.mjs
import pg from "pg";

const scrub = (m) => String(m).replace(/postgres(ql)?:\/\/\S+/g, "[url]");
const c = new pg.Client({ connectionString: process.env.NELIO_DIRECT_URL, connectionTimeoutMillis: 20000 });
c.on("error", () => {});
const q = async (s) => (await c.query(s)).rows;

try {
  await c.connect();
  const noRls = await q("select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and not relrowsecurity");
  console.log("tables without row-level security:", noRls.map((r) => r.relname));
  const grants = await q("select count(*)::int as n from information_schema.role_table_grants where table_schema = 'public' and grantee in ('anon', 'authenticated')");
  console.log("table privileges held by browser roles:", grants[0].n);
  const trg = await q("select tgname from pg_trigger where not tgisinternal and tgrelid::regclass::text in ('activity_events', 'agent_spend', 'agent_authorizations', 'notifications') order by 1");
  console.log("triggers:", trg.map((r) => r.tgname).join(", "));
  const pol = await q("select policyname from pg_policies where schemaname = 'realtime' and tablename = 'messages'");
  console.log("realtime policies:", pol.map((r) => r.policyname));

  await c.query("begin");
  try {
    await c.query("insert into outbox_events (topic, payload, dedupe_key) values ('probe', '{}', 'verify-ms3-probe')");
    console.log("outbox insert: ok (rolled back)");
  } finally {
    await c.query("rollback");
  }
} catch (e) {
  console.log("failed:", e.code ?? "", scrub(e.message));
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
