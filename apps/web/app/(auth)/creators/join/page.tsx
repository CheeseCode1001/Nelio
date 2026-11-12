import { Heading, Sticker, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { ContentOwnerJoinForm } from "@/components/auth/forms";
import { AuthShell, SIDES } from "@/components/auth/shell";

export const metadata: Metadata = { title: "Join as a content owner" };

/** AU-07 Join as content owner. Free, no plan step (decision D-15). */
export default function ContentOwnerJoinPage() {
  return (
    <AuthShell side={SIDES.contentOwner}>
      <Sticker fill="cyan" rotate={-3} icon="shield" size={13}>Free · no subscription</Sticker>
      <Heading size={34} as="h1">Join as a content owner</Heading>
      <Text size={15}>Let creators clip your videos on your terms. Revoke any time.</Text>
      <ContentOwnerJoinForm />
      <Text size={13}>Already use Nelio? Add the Creator Portal to your existing account.</Text>
    </AuthShell>
  );
}
