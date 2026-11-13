"use server";

import { db } from "@nelio/db";
import { z } from "zod";
import { getSession } from "../auth";
import { writePreferenceCookies } from "../preferences";

const schema = z.object({ theme: z.enum(["light", "dark", "system"]), reduceMotion: z.boolean() });

/** ST-03: saves theme and motion to the account ("Saved to your account") and to this browser's cookies. */
export async function saveAppearanceAction(input: { theme: string; reduceMotion: boolean }): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const session = await getSession();
  if (!session || session.user.needsMfa) return { ok: false };
  await db().user.update({ where: { id: session.user.id }, data: { theme: parsed.data.theme, reduceMotion: parsed.data.reduceMotion } });
  await writePreferenceCookies(parsed.data);
  return { ok: true };
}
