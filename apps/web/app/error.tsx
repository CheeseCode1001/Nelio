"use client";

import { Button, ButtonLink } from "@nelio/ui";
import { ErrorPage, SUPPORT_HREF } from "@/components/system/error-page";

/** SY-05 Server error. The error ID is the framework's digest, which matches the server log entry. */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const id = error.digest ? ` quote error ID ${error.digest} to support.` : " contact support.";
  return (
    <ErrorPage
      illustration="error"
      title="Something went wrong on our side"
      text={`Try again in a moment. If it keeps happening,${id}`}
      actions={
        <>
          <Button variant="cta" size="lg" arrow onClick={reset}>Try again</Button>
          {SUPPORT_HREF ? <ButtonLink href={SUPPORT_HREF} variant="secondary" size="lg">Contact support</ButtonLink> : null}
        </>
      }
    />
  );
}
