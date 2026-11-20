import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "";
  }
})();

const dev = process.env.NODE_ENV !== "production";

// Object storage (path-style R2): the browser shows signed posters and videos and uploads parts straight to it.
const storageOrigin = process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "";

// Content Security Policy. Next.js needs inline scripts for hydration data; 'unsafe-eval' is development-only (React refresh).
// `frameAncestors` is 'none' in production; development allows same-origin framing for the UI audit.
const cspWith = (frameAncestors: string) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${storageOrigin ? ` ${storageOrigin}` : ""}`,
  `media-src 'self' blob:${storageOrigin ? ` ${storageOrigin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}${storageOrigin ? ` ${storageOrigin}` : ""}`,
  `frame-ancestors ${frameAncestors}`,
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = (frame: "none" | "self") => [
  { key: "Content-Security-Policy", value: cspWith(frame === "none" ? "'none'" : "'self'") },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: frame === "none" ? "DENY" : "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@nelio/ui", "@nelio/domain", "@nelio/db", "@nelio/config"],
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  async headers() {
    // Development lets the app frame itself so the UI audit can load every page; production never allows framing.
    return [{ source: "/:path*", headers: securityHeaders(dev ? "self" : "none") }];
  },
};

export default config;
