import { safeNextPath } from "@nelio/domain";
import { Heading } from "@nelio/ui";
import type { Metadata } from "next";
import { LogInForm } from "@/components/auth/forms";
import { AuthShell, SIDES } from "@/components/auth/shell";

export const metadata: Metadata = { title: "Log in" };

/** AU-02 Log in. States: filled, wrong password, too many attempts. */
export default async function LogInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell side={SIDES.logIn}>
      <Heading size={34} as="h1">Welcome back</Heading>
      <LogInForm next={safeNextPath(next, "")} />
    </AuthShell>
  );
}
