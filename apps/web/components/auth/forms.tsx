"use client";

import { Banner, Button, ButtonLink, Checkbox, Field, Motion, SelectField, Text } from "@nelio/ui";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import {
  acceptInviteAction, acceptInviteSignUpAction, contentOwnerJoinAction, logInAction, requestResetAction, resendVerificationAction,
  setNewPasswordAction, signUpAction, verifyMfaAction, type FormState,
} from "@/lib/actions/auth";

const EMPTY: FormState = {};
const TextLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="font-bold text-accent-text no-underline hover:text-text">{children}</Link>
);
const GENERIC = <Banner tone="err" title="Something went wrong on our side" text="Nothing was saved. Try again in a moment." />;
const LOCKED = (
  <Banner tone="err" title="Too many tries" text="Wait 15 minutes, or reset your password now." action={<ButtonLink href="/reset-password" variant="secondary" size="sm">Reset</ButtonLink>} />
);

function Form({ action, children, deps }: { action: (form: FormData) => void; children: ReactNode; deps: unknown[] }) {
  // Re-runs the entrance for banners that arrive after a submit.
  return (
    <form action={action} noValidate>
      <Motion className="flex flex-col gap-4 md:gap-[18px]" deps={deps}>{children}</Motion>
    </form>
  );
}

// ------------------------------------------------------------------ AU-01
export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, EMPTY);
  const e = state.fieldErrors ?? {};
  return (
    <Form action={action} deps={[state.banner]}>
      {state.banner === "taken" ? (
        <Banner tone="warn" title="That email already has an account" text="Log in instead, or reset your password." action={<ButtonLink href="/login" variant="secondary" size="sm">Log in</ButtonLink>} />
      ) : state.banner === "locked" ? LOCKED : state.banner === "error" ? GENERIC : null}
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} error={e.fullName} required />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={e.email} required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters" error={e.password} required />
      <Checkbox
        name="acceptTerms"
        error={e.acceptTerms}
        label={<>I agree to the <TextLink href="/legal/terms">Terms of Service</TextLink> and <TextLink href="/legal/privacy">Privacy Policy</TextLink></>}
      />
      <Button type="submit" size="lg" full loading={pending}>{pending ? "Creating your account…" : "Create account"}</Button>
      <Text size={13}>
        Already have an account? <TextLink href="/login">Log in</TextLink> · Own content? <TextLink href="/creators/join">Join as a content owner</TextLink>
      </Text>
    </Form>
  );
}

// ------------------------------------------------------------------ AU-02
export function LogInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(logInAction, EMPTY);
  const e = state.fieldErrors ?? {};
  return (
    <Form action={action} deps={[state.banner]}>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={e.email} required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" error={e.password} required />
      {state.banner === "wrong" ? (
        <Banner tone="err" title="That email and password don’t match" text="Check for typos, or reset your password." />
      ) : state.banner === "locked" ? LOCKED : null}
      <Button type="submit" size="lg" full loading={pending}>{pending ? "Logging in…" : "Log in"}</Button>
      <Text size={13}>
        <TextLink href="/reset-password">Forgot password?</TextLink> · <TextLink href="/signup">Create account</TextLink>
      </Text>
    </Form>
  );
}

// ------------------------------------------------------------------ AU-03
const RESEND_WAIT = 45;

export function VerifyEmailActions({ email, expired }: { email: string; expired: boolean }) {
  const [state, action, pending] = useActionState(resendVerificationAction, EMPTY);
  const [left, setLeft] = useState(expired ? 0 : RESEND_WAIT);
  // Restart the wait when a new result arrives (state adjusted during render, not in an effect).
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.banner === "resent") setLeft(RESEND_WAIT);
  }
  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  const clock = `0:${String(left).padStart(2, "0")}`;
  return (
    <Form action={action} deps={[state.banner]}>
      <input type="hidden" name="email" value={email} />
      {state.banner === "resent" ? <Banner tone="ok" title="Sent again" text="Give it a minute and check spam too." /> : state.banner === "locked" ? (
        <Banner tone="err" title="Too many emails for now" text="Wait a few minutes, then ask for a new link." />
      ) : null}
      {expired ? (
        <Button type="submit" size="lg" full loading={pending} disabled={!email}>Send a new link</Button>
      ) : (
        <>
          <ButtonLink href="mailto:" size="lg" full>Open email app</ButtonLink>
          <Button type="submit" variant="secondary" full disabled={left > 0 || pending || !email} aria-live="polite">
            {left > 0 ? `Resend link · available in ${clock}` : "Resend link"}
          </Button>
        </>
      )}
    </Form>
  );
}

// ------------------------------------------------------------------ AU-04
export function ResetRequestForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(requestResetAction, EMPTY);
  return (
    <Form action={action} deps={[state.banner]}>
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={state.fieldErrors?.email} required />
      <Button type="submit" size="lg" full loading={pending}>{expired ? "Send a new link" : "Send reset link"}</Button>
      {state.banner === "sent" ? <Banner tone="ok" title="Check your email" text="If that address has an account, a link is on its way." /> : state.banner === "locked" ? (
        <Banner tone="err" title="Too many emails for now" text="Wait a few minutes, then ask for a new link." />
      ) : null}
    </Form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(setNewPasswordAction, EMPTY);
  const e = state.fieldErrors ?? {};
  return (
    <Form action={action} deps={[state.banner]}>
      {state.banner === "expired" ? (
        <Banner tone="warn" title="This reset link expired" text="Links last 1 hour. Request a new one." action={<ButtonLink href="/reset-password" variant="secondary" size="sm">New link</ButtonLink>} />
      ) : state.banner === "error" ? GENERIC : null}
      <Field label="New password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters" error={e.password} required />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" error={e.confirm} required />
      <Button type="submit" size="lg" full loading={pending}>Save and log in</Button>
    </Form>
  );
}

// ------------------------------------------------------------------ AU-05
/** Six single-digit boxes that behave like one field: typing advances, Backspace goes back, paste fills all. */
export function MfaForm({ factorId, next }: { factorId: string; next: string }) {
  const [state, action, pending] = useActionState(verifyMfaAction, EMPTY);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const wrong = state.banner === "wrong";
  // Clear the boxes when a result arrives (state adjusted during render); the effect only moves focus.
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.banner) setDigits(Array(6).fill(""));
  }
  useEffect(() => {
    if (state.banner) refs.current[0]?.focus();
  }, [state]);
  const set = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      const next6 = clean.slice(0, 6).split("");
      setDigits([...next6, ...Array(6 - next6.length).fill("")]);
      refs.current[Math.min(next6.length, 5)]?.focus();
      return;
    }
    setDigits((d) => d.map((x, j) => (j === i ? clean : x)));
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <Form action={action} deps={[state.banner]}>
      <input type="hidden" name="factorId" value={factorId} />
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="code" value={digits.join("")} />
      <fieldset className="m-0 flex justify-center gap-2 border-0 p-0">
        <legend className="sr-only">6-digit code</legend>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            aria-label={`Digit ${i + 1}`}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            autoFocus={i === 0}
            onChange={(ev) => set(i, ev.target.value)}
            onKeyDown={(ev) => { if (ev.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
            onFocus={(ev) => ev.target.select()}
            className={`box-border h-16 w-[46px] rounded-2xl border-2 bg-surface-1 text-center font-display text-[26px] font-extrabold text-text focus:border-accent sm:w-[54px] ${wrong ? "border-err-text" : "border-border"}`}
          />
        ))}
      </fieldset>
      {wrong ? <Banner tone="err" title="That code didn’t work" text="Codes change every 30 seconds. Try the newest one." /> : state.banner === "locked" ? (
        <Banner tone="err" title="Too many tries" text="Wait a few minutes, then try the newest code." />
      ) : null}
      <Button type="submit" size="lg" full loading={pending} disabled={digits.join("").length !== 6}>Verify</Button>
    </Form>
  );
}

// ------------------------------------------------------------------ AU-06
export function AcceptInviteSignUpForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInviteSignUpAction, EMPTY);
  const e = state.fieldErrors ?? {};
  return (
    <Form action={action} deps={[state.banner]}>
      <input type="hidden" name="token" value={token} />
      {state.banner === "taken" ? (
        <Banner tone="warn" title="That email already has an account" text="Log in to accept this invite." action={<ButtonLink href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`} variant="secondary" size="sm">Log in</ButtonLink>} />
      ) : state.banner === "expired" ? <Banner tone="warn" title="This invite expired" text="Invites last 7 days. Ask for a new one." /> : state.banner === "locked" ? LOCKED : state.banner === "error" ? GENERIC : null}
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} error={e.fullName} required />
      <Field label="Create a password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters" error={e.password} required />
      <Button type="submit" size="lg" full loading={pending}>Accept and continue</Button>
    </Form>
  );
}

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInviteAction, EMPTY);
  return (
    <Form action={action} deps={[state.banner]}>
      <input type="hidden" name="token" value={token} />
      {state.banner === "mismatch" ? <Banner tone="warn" title="This invite is for a different email" text="Switch to the invited account to accept it." /> : state.banner ? (
        <Banner tone="warn" title="This invite expired" text="Invites last 7 days. Ask for a new one." />
      ) : null}
      <Button type="submit" size="lg" full loading={pending}>Accept and continue</Button>
    </Form>
  );
}

// ------------------------------------------------------------------ AU-07
const PLATFORMS = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Somewhere else" },
];

export function ContentOwnerJoinForm() {
  const [state, action, pending] = useActionState(contentOwnerJoinAction, EMPTY);
  const e = state.fieldErrors ?? {};
  return (
    <Form action={action} deps={[state.banner]}>
      {state.banner === "taken" ? (
        <Banner tone="warn" title="That email already has an account" text="Log in instead, or reset your password." action={<ButtonLink href="/login" variant="secondary" size="sm">Log in</ButtonLink>} />
      ) : state.banner === "locked" ? LOCKED : state.banner === "error" ? GENERIC : null}
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} error={e.fullName} required />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={e.email} required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" error={e.password} required />
      <SelectField label="Where is your content?" name="platform" options={PLATFORMS} defaultValue={state.values?.platform ?? "youtube"} error={e.platform} />
      <Button type="submit" size="lg" full loading={pending}>Create free account</Button>
    </Form>
  );
}
