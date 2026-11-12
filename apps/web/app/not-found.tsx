import { ButtonLink } from "@nelio/ui";
import type { Metadata } from "next";
import { ErrorPage } from "@/components/system/error-page";

export const metadata: Metadata = { title: "Page not found" };

/** SY-03 Not found. */
export default function NotFound() {
  return (
    <ErrorPage
      illustration="lost"
      title="We can’t find that page"
      text="It may have moved, or the link is wrong. Your agents are fine."
      actions={<ButtonLink href="/auth/continue" variant="cta" size="lg" arrow>Go to Command Center</ButtonLink>}
    />
  );
}
