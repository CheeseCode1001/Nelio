import { safeNextPath } from "@nelio/domain";
import { Heading, Illustration, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MfaForm } from "@/components/auth/forms";
import { MfaSetup } from "@/components/auth/mfa-setup";
import { AuthShell } from "@/components/auth/shell";
import { getSessionUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Two-step verification" };

/**
 * AU-05 Two-step verification. States: enter code, setup, wrong code.
 * Not built yet: recovery codes (drawn on the Setup board). The auth service has no recovery codes,
 * so they need our own implementation; tracked as B-13 and shown nowhere until they work.
 */
export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string; setup?: string }> }) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next, "");
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.[0]; // verified authenticator-app factors only

  if (sp.setup === "1" && !factor) {
    return (
      <AuthShell>
        <Heading size={34} as="h1">Set up two-step verification</Heading>
        <Text size={15}>Scan with your authenticator app, then enter the code.</Text>
        <MfaSetup next={next} />
      </AuthShell>
    );
  }
  if (!factor) redirect(next || "/auth/continue");
  if (user.aal === "aal2") redirect(next || "/auth/continue");

  return (
    <AuthShell>
      <div className="flex justify-center">
        <Illustration name="verify" width={220} />
      </div>
      <Heading size={34} as="h1">Enter your 6-digit code</Heading>
      <Text size={15}>From your authenticator app.</Text>
      <MfaForm factorId={factor.id} next={next} />
    </AuthShell>
  );
}
