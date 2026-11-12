import { ButtonLink } from "@nelio/ui";
import type { Metadata } from "next";
import { ErrorPage, SUPPORT_HREF } from "@/components/system/error-page";

export const metadata: Metadata = { title: "No access", robots: { index: false } };

/** SY-04 Access denied. Shown for unknown and forbidden workspaces alike, so it never confirms one exists (AC-02). */
export default function DeniedPage() {
  return (
    <ErrorPage
      illustration="denied"
      title="You don’t have access to this workspace"
      text="Ask an admin to invite you, or switch to a workspace you belong to."
      actions={
        <>
          <ButtonLink href="/auth/continue" variant="cta" size="lg" arrow>Switch workspace</ButtonLink>
          {SUPPORT_HREF ? <ButtonLink href={SUPPORT_HREF} variant="secondary" size="lg">Contact support</ButtonLink> : null}
        </>
      }
    />
  );
}
