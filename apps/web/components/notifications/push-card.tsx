"use client";

import { Bubble, Button, Illustration, ResponsiveDialog } from "@nelio/ui";
import { useEffect, useState } from "react";
import { savePushSubscriptionAction } from "@/lib/actions/notifications";

type PushState = "unknown" | "unsupported" | "ask" | "on" | "denied" | "not_configured";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** What this browser can do right now. Read once on the client; the server can't know. */
function detect(): PushState {
  if (typeof window === "undefined") return "unknown";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return "not_configured";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "granted") return "on";
  return "ask";
}

/**
 * "Get notified even when Nelio is closed" (NT-01) and the "Turn on notifications?" prompt (NT-01 Push).
 * The browser's own permission prompt only appears after the person taps Allow here.
 */
export function PushCard({ preview }: { preview?: "ask" | "prompt" }) {
  const [state, setState] = useState<PushState>(preview ? "ask" : "unknown");
  const [open, setOpen] = useState(preview === "prompt");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preview) return;
    const s = detect();
    // Permission "granted" but no subscription saved yet (new device): offer to finish turning it on.
    void (async () => {
      if (s !== "on") { setState(s); return; }
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? "on" : "ask");
    })();
  }, [preview]);

  if (state === "unknown" || state === "on" || state === "unsupported" || state === "not_configured") return null;

  const allow = async () => {
    if (preview) { setOpen(false); return; }
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState(permission === "denied" ? "denied" : "ask"); setOpen(false); return; }
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) }));
      const r = await savePushSubscriptionAction(sub.toJSON(), navigator.userAgent);
      if (!r.ok) { setError(r.error ?? "Couldn’t turn on notifications."); return; }
      setState("on");
      setOpen(false);
    } catch {
      setError("This browser couldn’t turn on notifications. Try again, or check the site’s notification setting.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-center gap-3.5 rounded-card border border-border bg-surface-1 p-4 shadow-card md:p-5">
        <Bubble icon="bell" tone="blue" />
        <div className="min-w-0 grow">
          <h2 className="m-0 font-display text-[17px] font-bold text-text">{state === "denied" ? "Notifications are blocked in this browser" : "Get notified even when Nelio is closed"}</h2>
          <p className="m-0 text-[13px] text-muted">{state === "denied" ? "Allow them in the site settings of your browser, then come back." : "Approvals and failed posts, straight to this device."}</p>
        </div>
        {state === "ask" ? <Button onClick={() => setOpen(true)}>Turn on browser notifications</Button> : null}
      </section>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Turn on notifications?" hideTitle maxWidth={460}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-center"><Illustration name="notifications" width={150} /></div>
          <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.02em] text-text">Turn on notifications?</h2>
          <p className="m-0 text-sm text-muted">We’ll only send approvals, failed posts, license and security alerts. You can change this any time.</p>
          {error ? <p role="alert" className="m-0 text-[13px] font-semibold text-err-text">{error}</p> : null}
          <div className="mt-2 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setOpen(false)} className="tap-target cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-text">Not now</button>
            <Button variant="cta" arrow loading={busy} onClick={allow}>Allow</Button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
