import "server-only";
import { cookies } from "next/headers";

/** Cookies that let the root layout paint the right theme and motion before any script runs (D-21). */
export const THEME_COOKIE = "nelio-theme";
export const MOTION_COOKIE = "nelio-motion";

export type ThemePref = "light" | "dark" | "system";

export async function readPreferences(): Promise<{ theme: ThemePref; reduceMotion: boolean }> {
  const store = await cookies();
  const t = store.get(THEME_COOKIE)?.value;
  return { theme: t === "dark" || t === "system" ? t : "light", reduceMotion: store.get(MOTION_COOKIE)?.value === "reduce" };
}

/** Writes the preference cookies. Called after saving to the account and after signing in. */
export async function writePreferenceCookies(p: { theme: ThemePref; reduceMotion: boolean }) {
  const store = await cookies();
  // Not httpOnly: the Appearance page also writes them in the browser so a change applies on the very next page,
  // before the save to the account has finished. They hold display preferences only.
  const base = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === "production", httpOnly: false };
  store.set(THEME_COOKIE, p.theme, base);
  if (p.reduceMotion) store.set(MOTION_COOKIE, "reduce", base);
  else store.delete(MOTION_COOKIE);
}
