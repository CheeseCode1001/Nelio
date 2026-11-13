"use client";

import { Button } from "@nelio/ui";

/** Reloads when the connection is back. The ink CTA is this page's one primary action. */
export function RetryButton() {
  return (
    <Button variant="cta" arrow onClick={() => window.location.reload()} className="mt-1">
      Try again
    </Button>
  );
}
