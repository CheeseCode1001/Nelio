import { Heading, Text } from "@nelio/ui";
import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/forms";
import { AuthShell, SIDES } from "@/components/auth/shell";

export const metadata: Metadata = { title: "Create your account" };

/** AU-01 Sign up. States: filled, validation errors, email already used, submitting. */
export default function SignUpPage() {
  return (
    <AuthShell side={SIDES.signUp}>
      <Heading size={34} as="h1">Create your account</Heading>
      <Text size={15}>Start free. Upgrade when your agents earn it.</Text>
      <SignUpForm />
    </AuthShell>
  );
}
