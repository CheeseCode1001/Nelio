import { db } from "@nelio/db";
import webpush from "web-push";

/**
 * Delivers a notification's email and push copies. Channels whose service is not configured are marked
 * "skipped" with the reason, never "sent". The in-app copy needs no delivery: it is the notification row.
 */
export async function deliverNotification(notificationId: string): Promise<string> {
  const n = await db().notification.findUnique({
    where: { id: notificationId },
    include: { deliveries: { where: { status: { in: ["pending", "failed"] } } }, user: { select: { email: true, fullName: true, pushSubscriptions: true } } },
  });
  if (!n) return "missing";
  const results: string[] = [];
  for (const d of n.deliveries) {
    const r = d.channel === "email" ? await sendEmail(n) : d.channel === "push" ? await sendPush(n) : { status: "skipped" as const, error: null };
    await db().notificationDelivery.update({
      where: { id: d.id },
      data: { status: r.status, attempts: { increment: 1 }, lastError: r.error, sentAt: r.status === "sent" ? new Date() : null },
    });
    results.push(`${d.channel}:${r.status}`);
    if (r.status === "failed" && d.attempts + 1 < 5) throw new Error(`${d.channel} delivery failed: ${r.error}`);
  }
  return results.join(" ") || "nothing to deliver";
}

type Loaded = NonNullable<Awaited<ReturnType<typeof loadForTypes>>>;
async function loadForTypes() {
  return db().notification.findFirst({ include: { user: { select: { email: true, fullName: true, pushSubscriptions: true } } } });
}
type Result = { status: "sent" | "skipped" | "failed"; error: string | null };

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(n: Loaded): Promise<Result> {
  const key = process.env.NELIO_EMAIL_API_KEY;
  const from = process.env.NELIO_EMAIL_FROM;
  if (!key || !from) return { status: "skipped", error: "email service not configured" };
  const link = n.href ? `${appUrl()}${n.href}` : appUrl();
  const html = `<p style="font:16px/1.5 Inter,Arial,sans-serif;color:#0B0B14"><strong>${esc(n.title)}</strong></p>`
    + (n.body ? `<p style="font:15px/1.5 Inter,Arial,sans-serif;color:#5B6175">${esc(n.body)}</p>` : "")
    + `<p><a href="${esc(link)}" style="font:15px Inter,Arial,sans-serif;color:#1E40D8">Open Nelio</a></p>`
    + `<p style="font:12px/1.5 Inter,Arial,sans-serif;color:#5B6175">You can change which emails you get in Account → Notifications.</p>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "idempotency-key": `notification-${n.id}` },
      body: JSON.stringify({ from, to: [n.user.email], subject: n.title, html, text: `${n.title}\n\n${n.body ?? ""}\n\n${link}` }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return { status: "sent", error: null };
    return { status: res.status >= 500 || res.status === 429 ? "failed" : "skipped", error: `email service answered ${res.status}` };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message.slice(0, 200) : "network error" };
  }
}

let vapidReady: boolean | null = null;
function vapid(): boolean {
  if (vapidReady !== null) return vapidReady;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.NELIO_VAPID_PRIVATE_KEY;
  const subject = process.env.NELIO_VAPID_SUBJECT;
  vapidReady = Boolean(pub && priv && subject);
  if (vapidReady) webpush.setVapidDetails(subject!, pub!, priv!);
  return vapidReady;
}

async function sendPush(n: Loaded): Promise<Result> {
  if (!vapid()) return { status: "skipped", error: "push keys not configured" };
  const subs = n.user.pushSubscriptions;
  if (subs.length === 0) return { status: "skipped", error: "no device has turned on notifications" };
  const payload = JSON.stringify({ title: n.title, body: n.body ?? "", href: n.href ?? "/", tag: n.id });
  let sent = 0;
  let lastError: string | null = null;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 24 * 3600, timeout: 15000 });
      sent++;
      await db().pushSubscription.update({ where: { id: s.id }, data: { lastSuccessAt: new Date() } });
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db().pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
      else lastError = `push service answered ${code ?? "error"}`;
    }
  }
  if (sent > 0) return { status: "sent", error: null };
  return lastError ? { status: "failed", error: lastError } : { status: "skipped", error: "device subscriptions expired" };
}
