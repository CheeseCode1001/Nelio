import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Channel ownership check with YouTube sign-in (LI-06). Read-only scope, used once: we list the channels the
 * signed-in Google account owns, then revoke the token. No token is stored. Runs on a Google Cloud OAuth
 * client in "Testing" mode (decision 20 Nov 2026) until the app passes Google verification (B-01).
 */

const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const REVOKE = "https://oauth2.googleapis.com/revoke";
const CHANNELS = "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&maxResults=50";
const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

/** Short-lived cookie holding the sign-in state and PKCE verifier. */
export const COOKIE = "nelio_yt_verify";

export const youtubeConfigured = () => Boolean(process.env.NELIO_GOOGLE_CLIENT_ID && process.env.NELIO_GOOGLE_CLIENT_SECRET);

export const appOrigin = (fallback: string) => (process.env.NEXT_PUBLIC_APP_URL || fallback).replace(/\/$/, "");
export const callbackUrl = (origin: string) => `${origin}/api/creator/verify/youtube/callback`;

const b64url = (b: Buffer) => b.toString("base64url");

/** A fresh state and PKCE pair. The browser keeps them in a short-lived, http-only cookie. */
export function newAttempt(): { state: string; verifier: string; challenge: string } {
  const verifier = b64url(randomBytes(32));
  return { state: b64url(randomBytes(24)), verifier, challenge: b64url(createHash("sha256").update(verifier).digest()) };
}

export function authUrl(origin: string, a: { state: string; challenge: string }): string {
  const q = new URLSearchParams({
    client_id: process.env.NELIO_GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: SCOPE,
    state: a.state,
    code_challenge: a.challenge,
    code_challenge_method: "S256",
    access_type: "online",
    include_granted_scopes: "false",
    prompt: "select_account",
  });
  return `${AUTH}?${q}`;
}

export type OwnedChannel = { id: string; title: string; handle: string | null };

/** Exchanges the code, reads the account's channels, and revokes the token straight away. */
export async function ownedChannels(origin: string, code: string, verifier: string): Promise<OwnedChannel[]> {
  const t = await fetch(TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.NELIO_GOOGLE_CLIENT_ID!, client_secret: process.env.NELIO_GOOGLE_CLIENT_SECRET!, redirect_uri: callbackUrl(origin), grant_type: "authorization_code", code_verifier: verifier }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!t.ok) throw new Error(`token ${t.status}`);
  const { access_token: token } = (await t.json()) as { access_token?: string };
  if (!token) throw new Error("no token");
  try {
    const r = await fetch(CHANNELS, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`channels ${r.status}`);
    const body = (await r.json()) as { items?: { id: string; snippet?: { title?: string; customUrl?: string } }[] };
    return (body.items ?? []).map((i) => ({ id: i.id, title: i.snippet?.title ?? "YouTube channel", handle: i.snippet?.customUrl ? (i.snippet.customUrl.startsWith("@") ? i.snippet.customUrl : `@${i.snippet.customUrl}`).toLowerCase() : null }));
  } finally {
    await fetch(REVOKE, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token }), signal: AbortSignal.timeout(5_000) }).catch(() => undefined);
  }
}
