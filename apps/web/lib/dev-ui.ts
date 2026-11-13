/** Development previews (/dev/ui) exist in local development only, unless explicitly enabled for a staging build. */
export function devUiEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEV_UI === "true";
}
