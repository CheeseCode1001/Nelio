import { emailSchema } from "@nelio/domain";
import { Heading, Illustration, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { VerifyEmailActions } from "@/components/auth/forms";
import { AuthShell } from "@/components/auth/shell";

export const metadata: Metadata = { title: "Check your inbox" };

/** AU-03 Verify email. States: filled, resent, link expired. */
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; state?: string }> }) {
  const sp = await searchParams;
  const parsed = emailSchema.safeParse(sp.email);
  const email = parsed.success ? parsed.data : "";
  const expired = sp.state === "expired";
  return (
    <AuthShell>
      <div className="flex justify-center">
        <Illustration name={expired ? "denied" : "notifications"} width={260} />
      </div>
      <Heading size={34} as="h1">{expired ? "That link expired" : "Check your inbox"}</Heading>
      <Text size={15}>
        {expired ? "No worries, we’ll send a fresh one." : email ? `We sent a link to ${email}. It expires in 24 hours.` : "We sent you a link. It expires in 24 hours."}
      </Text>
      <VerifyEmailActions email={email} expired={expired} />
    </AuthShell>
  );
}
