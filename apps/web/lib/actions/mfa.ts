"use server";

import { getSessionUser } from "../auth";
import { supabaseServer } from "../supabase/server";

export type EnrollResult = { ok: true; factorId: string; qr: string; secret: string } | { ok: false };

/**
 * Starts authenticator-app enrolment (AU-05 Setup). Any half-finished earlier attempt is removed first,
 * so a person never ends up with several unverified factors.
 */
export async function enrollMfaAction(): Promise<EnrollResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  const supabase = await supabaseServer();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "Nelio", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) return { ok: false };
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}
