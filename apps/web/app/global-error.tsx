"use client";

/** Last-resort error screen when the root layout itself fails. Self-contained: no shared layout, fonts or styles. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24, textAlign: "center", background: "#F4F6FB", color: "#0B0B14", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ margin: 0, fontSize: 33, fontWeight: 800, letterSpacing: "-0.045em" }}>Something went wrong on our side</h1>
        <p style={{ margin: 0, maxWidth: 520, fontSize: 17, lineHeight: 1.55, color: "#5B6175" }}>
          Try again in a moment.{error.digest ? ` If it keeps happening, quote error ID ${error.digest} to support.` : ""}
        </p>
        <button type="button" onClick={reset} style={{ minHeight: 44, padding: "14px 24px", borderRadius: 999, border: "2px solid #0B0B14", background: "#0B0B14", color: "#FFFFFF", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
