import { safeNextPath } from "@nelio/domain";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Landing point for links in auth emails (confirm sign-up, reset password) and for provider sign-in.
 * Exchanges the one-time code for a session, then continues to a same-site path only.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get("next"), "/auth/continue");
  const isReset = next.startsWith("/reset-password");
  const fail = () => NextResponse.redirect(new URL(isReset ? "/reset-password?state=expired" : "/verify-email?state=expired", url.origin));

  // The auth service reports an expired or already-used link in the query string.
  if (url.searchParams.get("error") || url.searchParams.get("error_code")) return fail();

  const supabase = await supabaseServer();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail();
  } else if (tokenHash && (type === "signup" || type === "email" || type === "recovery" || type === "invite" || type === "magiclink" || type === "email_change")) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail();
  } else {
    return fail();
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
