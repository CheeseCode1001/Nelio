"use server";

import { acceptInvitation, db, findInvitation } from "@nelio/db";
import {
  acceptInviteSchema, contentOwnerJoinSchema, logInSchema, mfaCodeSchema, newPasswordSchema, resetRequestSchema, safeNextPath, signUpSchema,
} from "@nelio/domain";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { getSession, getSessionUser, homePathFor } from "../auth";
import { supabaseServer } from "../supabase/server";

/** Shape returned to forms. `banner` values map one-to-one to the states drawn on the boards. */
export interface FormState {
  fieldErrors?: Record<string, string>;
  banner?: "taken" | "wrong" | "locked" | "sent" | "resent" | "expired" | "mismatch" | "error";
  values?: Record<string, string>;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

async function origin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

/** The signed-in person's home path. Falls back to the router when the session cannot be read yet. */
async function homeAfterAuth(): Promise<string> {
  const session = await getSession();
  return session ? homePathFor(session) : "/auth/continue";
}

const isRateLimited = (e: { status?: number; code?: string } | null) => e?.status === 429 || e?.code === "over_request_rate_limit" || e?.code === "over_email_send_rate_limit";

// ------------------------------------------------------------------ AU-01 Sign up
export async function signUpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { fullName: String(form.get("fullName") ?? ""), email: String(form.get("email") ?? "") };
  const parsed = signUpSchema.safeParse({ ...values, password: form.get("password"), acceptTerms: form.get("acceptTerms") === "on" });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, signup_kind: "operator" },
      emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding/account-type`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") return { banner: "taken", values };
    if (isRateLimited(error)) return { banner: "locked", values };
    if (error.code === "weak_password") return { fieldErrors: { password: "Choose a stronger password" }, values };
    return { banner: "error", values };
  }
  // With email confirmation on, an existing address comes back as a user with no identities.
  if (data.user && data.user.identities?.length === 0) return { banner: "taken", values };
  if (data.session) redirect("/onboarding/account-type");
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

// ------------------------------------------------------------------ AU-02 Log in
export async function logInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  const next = safeNextPath(String(form.get("next") ?? ""), "");
  const parsed = logInSchema.safeParse({ ...values, password: form.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
    if (isRateLimited(error)) return { banner: "locked", values };
    return { banner: "wrong", values };
  }
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.nextLevel === "aal2" && level.currentLevel !== "aal2") redirect(next ? `/mfa?next=${encodeURIComponent(next)}` : "/mfa");
  redirect(next || (await homeAfterAuth()));
}

// ------------------------------------------------------------------ AU-03 Verify email
export async function resendVerificationAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { banner: "error" };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding/account-type` } });
  if (error && isRateLimited(error)) return { banner: "locked" };
  // Same answer whether or not the address has an account.
  return { banner: "resent" };
}

// ------------------------------------------------------------------ AU-04 Reset password
export async function requestResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = resetRequestSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${await origin()}/auth/callback?next=/reset-password%3Fstate%3Dnewpass` });
  if (error && isRateLimited(error)) return { banner: "locked", values };
  // Never reveals whether the address has an account (copy: "if an account exists").
  return { banner: "sent", values };
}

export async function setNewPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({ password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const user = await getSessionUser();
  if (!user) return { banner: "expired" };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choose a password you haven’t used here" } };
    if (error.code === "weak_password") return { fieldErrors: { password: "Choose a stronger password" } };
    return { banner: "error" };
  }
  redirect(await homeAfterAuth());
}

// ------------------------------------------------------------------ AU-05 Two-step verification
export async function verifyMfaAction(_prev: FormState, form: FormData): Promise<FormState> {
  const next = safeNextPath(String(form.get("next") ?? ""), "");
  const factorId = String(form.get("factorId") ?? "");
  const parsed = mfaCodeSchema.safeParse({ code: String(form.get("code") ?? "").replace(/\s/g, "") });
  if (!parsed.success || !factorId) return { banner: "wrong" };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: parsed.data.code });
  if (error) return isRateLimited(error) ? { banner: "locked" } : { banner: "wrong" };
  redirect(next || (await homeAfterAuth()));
}

// ------------------------------------------------------------------ AU-06 Accept invitation
export async function acceptInviteSignUpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const values = { fullName: String(form.get("fullName") ?? "") };
  const parsed = acceptInviteSchema.safeParse({ ...values, password: form.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const invitation = await findInvitation(db(), token);
  if (invitation.state !== "valid" || !invitation.email) return { banner: "expired", values };

  // The account is always created for the invited address, never one typed by the visitor.
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: invitation.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, signup_kind: "invitee" },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(`/invite/${token}`)}`,
    },
  });
  if (error) return isRateLimited(error) ? { banner: "locked", values } : { banner: "error", values };
  if (data.user && data.user.identities?.length === 0) return { banner: "taken", values };
  if (data.session) return acceptInviteAction(_prev, form);
  redirect(`/verify-email?email=${encodeURIComponent(invitation.email)}`);
}

export async function acceptInviteAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  const result = await acceptInvitation(db(), { token, userId: session.user.id, userEmail: session.user.email });
  if (!result.ok) return { banner: result.reason === "email_mismatch" ? "mismatch" : "expired" };
  if (result.role === "client_approver" && result.workspaceSlug) redirect(`/portal/${result.workspaceSlug}`);
  redirect(result.workspaceSlug ? `/w/${result.workspaceSlug}/home` : "/auth/continue");
}

// ------------------------------------------------------------------ AU-07 Join as content owner
export async function contentOwnerJoinAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { fullName: String(form.get("fullName") ?? ""), email: String(form.get("email") ?? ""), platform: String(form.get("platform") ?? "youtube") };
  const parsed = contentOwnerJoinSchema.safeParse({ ...values, password: form.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, signup_kind: "content_owner", platform: parsed.data.platform },
      emailRedirectTo: `${await origin()}/auth/callback?next=/creator`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") return { banner: "taken", values };
    return isRateLimited(error) ? { banner: "locked", values } : { banner: "error", values };
  }
  if (data.user && data.user.identities?.length === 0) return { banner: "taken", values };
  if (data.session) redirect("/creator");
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

// ------------------------------------------------------------------ Sign out, post-login routing
export async function signOutAction(): Promise<void> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function switchAccountAction(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(`/login?next=${encodeURIComponent(safeNextPath(`/invite/${token}`))}`);
}

export async function continueAfterAuth(): Promise<never> {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(await homePathFor(session));
}
