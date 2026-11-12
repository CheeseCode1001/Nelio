// Creates (or resets) a confirmed test account in the DEV auth database, for local end-to-end checks.
// Usage, from the repository root:  node --env-file=apps/web/.env.local packages/db/scripts/create-test-user.mjs [email] [full name]
// The password is generated here and saved to apps/web/.env.local (git-ignored) as E2E_TEST_PASSWORD. Never run against production.
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const envFile = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "apps", "web", ".env.local");
const url = process.env.NELIO_DIRECT_URL || process.env.NELIO_DATABASE_URL;
if (!url) throw new Error("NELIO_DIRECT_URL is not set");
if (process.env.NODE_ENV === "production" || /prod/i.test(process.env.NEXT_PUBLIC_APP_URL ?? "")) throw new Error("refusing to run outside development");

const email = (process.argv[2] ?? "e2e.owner@nelio-test.invalid").toLowerCase();
const fullName = process.argv[3] ?? "Ada Okafor";
const key = "E2E_TEST_PASSWORD";
let password = process.env[key];
if (!password) {
  password = randomBytes(18).toString("base64url");
  if (!new RegExp(`^${key}=`, "m").test(readFileSync(envFile, "utf8"))) appendFileSync(envFile, `\n# Local end-to-end test account password (generated; dev only)\n${key}=${password}\n`);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("BEGIN");
  const meta = JSON.stringify({ full_name: fullName, signup_kind: "operator" });
  const existing = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
  let id = existing.rows[0]?.id;
  if (id) {
    await client.query("UPDATE auth.users SET encrypted_password = extensions.crypt($2, extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now() WHERE id = $1", [id, password]);
  } else {
    const r = await client.query(
      `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new)
       VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, extensions.crypt($2, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', $3::jsonb, now(), now(), '', '', '', '')
       RETURNING id`,
      [email, password, meta],
    );
    id = r.rows[0].id;
    await client.query(
      `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
       VALUES (gen_random_uuid(), $1::uuid, $1::text, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true), 'email', now(), now(), now())`,
      [id, email],
    );
  }
  await client.query("COMMIT");
  console.log(`test account ready: ${email} (id ${id}); password is in apps/web/.env.local as ${key}`);
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  await client.end();
}
