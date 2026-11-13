"use server";

import { db } from "@nelio/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "../auth";
import { loadNotifications, type NotificationRow } from "../notifications";

async function me() {
  const s = await getSession();
  return s && !s.user.needsMfa ? s : null;
}

/** Latest notifications for the top-bar panel (NT-01 Panel board). */
export async function recentNotificationsAction(): Promise<{ ok: true; rows: NotificationRow[]; unread: number } | { ok: false }> {
  const s = await me();
  if (!s) return { ok: false };
  const r = await loadNotifications(s.user.id, "all", 4);
  return { ok: true, rows: r.rows, unread: r.unread };
}

export async function markAllReadAction(): Promise<{ ok: boolean }> {
  const s = await me();
  if (!s) return { ok: false };
  await db().notification.updateMany({ where: { userId: s.user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markReadAction(id: string): Promise<{ ok: boolean }> {
  const s = await me();
  if (!s || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false };
  // Scoped to the signed-in person: another person's notification id changes nothing.
  await db().notification.updateMany({ where: { id, userId: s.user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true };
}

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000).refine((u) => u.startsWith("https://"), "Push endpoints are HTTPS"),
  keys: z.object({ p256dh: z.string().min(20).max(200), auth: z.string().min(8).max(100) }),
});

/** Saves this device's push subscription for the signed-in person. Re-subscribing moves the endpoint. */
export async function savePushSubscriptionAction(raw: unknown, userAgent: string): Promise<{ ok: boolean; error?: string }> {
  const s = await me();
  if (!s) return { ok: false, error: "Please sign in again." };
  const parsed = subscriptionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "This browser returned an unusable subscription." };
  const { endpoint, keys } = parsed.data;
  await db().pushSubscription.upsert({
    where: { endpoint },
    create: { userId: s.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent.slice(0, 200) },
    update: { userId: s.user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent.slice(0, 200) },
  });
  return { ok: true };
}

export async function removePushSubscriptionAction(endpoint: string): Promise<{ ok: boolean }> {
  const s = await me();
  if (!s) return { ok: false };
  await db().pushSubscription.deleteMany({ where: { endpoint, userId: s.user.id } });
  return { ok: true };
}
