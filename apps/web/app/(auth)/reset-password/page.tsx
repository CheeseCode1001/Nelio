import { Heading, Illustration, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { NewPasswordForm, ResetRequestForm } from "@/components/auth/forms";
import { AuthShell } from "@/components/auth/shell";

export const metadata: Metadata = { title: "Reset your password" };

/** AU-04 Reset password. States: filled, link sent, set new password, link expired. */
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  if (state === "newpass") {
    return (
      <AuthShell>
        <Heading size={34} as="h1">Choose a new password</Heading>
        <NewPasswordForm />
      </AuthShell>
    );
  }
  const expired = state === "expired";
  return (
    <AuthShell>
      <div className="flex justify-center">
        <Illustration name={expired ? "denied" : "lost"} width={240} />
      </div>
      <Heading size={34} as="h1">{expired ? "This reset link expired" : "Forgot your password?"}</Heading>
      <Text size={15}>{expired ? "Links last 1 hour. Request a new one below." : "Enter your email and we’ll send a reset link if an account exists."}</Text>
      <ResetRequestForm expired={expired} />
    </AuthShell>
  );
}
