"use client";

import { Button, Chip, Icon, IconButton, Illustration, Logo, TopStrip, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ------------------------------------------------------------------ Service worker registration
/**
 * Registers the service worker in production builds (and in development only with NEXT_PUBLIC_PWA_DEV=true,
 * because a worker caching development bundles gets in the way of hot reload).
 */
export function ServiceWorker() {
  useEffect(() => {
    const enabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_PWA_DEV === "true";
    if (!enabled || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installability is a convenience; the app works without the worker.
    });
  }, []);
  return null;
}

// ------------------------------------------------------------------ SY-02 Offline strip
export type ConnectionState = "online" | "offline" | "reconnecting" | "synced";

/**
 * SY-02: strip under the top bar while offline, then "Reconnecting…" and "Back online · everything synced" once the
 * page's data has been refreshed. While offline every form submission is blocked, so nothing is queued.
 */
export function OfflineStatus({ force }: { force?: ConnectionState }) {
  const router = useRouter();
  const [state, setState] = useState<ConnectionState>("online");

  useEffect(() => {
    // A page opened without a connection is the service worker's offline page, so this only tracks changes.
    if (force) return;
    let timer: number | undefined;
    const goOffline = () => {
      window.clearTimeout(timer);
      setState("offline");
    };
    const goOnline = () => {
      setState("reconnecting");
      router.refresh();
      timer = window.setTimeout(() => {
        setState("synced");
        timer = window.setTimeout(() => setState("online"), 4000);
      }, 1200);
    };
    const blockSubmit = (e: Event) => {
      if (!navigator.onLine) {
        e.preventDefault();
        e.stopPropagation();
        setState("offline");
      }
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    document.addEventListener("submit", blockSubmit, true);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      document.removeEventListener("submit", blockSubmit, true);
      window.clearTimeout(timer);
    };
  }, [force, router]);

  const s = force ?? state;
  if (s === "online") return null;
  if (s === "offline") return <TopStrip tone="warn" icon="wifioff" text="You’re offline. Showing what was last loaded. Approving, publishing and editing are paused." />;
  if (s === "reconnecting") return <TopStrip tone="blue" icon="refresh" text="Reconnecting…" />;
  return <TopStrip tone="ok" icon="check" text="Back online · everything synced" />;
}

// ------------------------------------------------------------------ SY-01 Install prompt
export type InstallState = "prompt" | "ios" | "installed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED = "nelio.install.dismissed";
const VISITS = "nelio.visits";
const SESSION = "nelio.visit.counted";

/** Per-browser conveniences only; every read and write tolerates blocked storage. */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

/** Counts one visit per browser session; the prompt appears from the second visit (audit G, PWA). */
function countVisit(): number {
  let n = Number(store.get(VISITS) ?? "0");
  try {
    if (!sessionStorage.getItem(SESSION)) {
      sessionStorage.setItem(SESSION, "1");
      n += 1;
      store.set(VISITS, String(n));
    }
  } catch {
    /* ignore */
  }
  return n;
}

const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIosSafari = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);

/** SY-01: install card, bottom right on desktop and above the tab bar on phones. */
export function InstallPrompt({ force }: { force?: InstallState }) {
  const [state, setState] = useState<InstallState | null>(force ?? null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (force) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (countVisit() >= 2 && !store.get(DISMISSED) && !isStandalone()) setState("prompt");
    };
    const onInstalled = () => {
      setDeferred(null);
      setState("installed");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Safari on iPhone has no install event: show the instructions instead, a moment after the page settles.
    const iosTimer = isIosSafari() && !isStandalone() && countVisit() >= 2 && !store.get(DISMISSED) ? window.setTimeout(() => setState("ios"), 1500) : undefined;
    return () => {
      window.clearTimeout(iosTimer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [force]);

  if (!state) return null;
  const dismiss = () => {
    if (!force) store.set(DISMISSED, String(Date.now()));
    setState(null);
  };
  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "dismissed") dismiss();
  };

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="install-title"
      className={cn(
        "fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 box-border flex flex-col gap-3 rounded-sheet border-2 border-outline bg-surface-1 p-5 shadow-sticker-card",
        "md:inset-x-auto md:bottom-6 md:right-6 md:w-[420px]",
      )}
    >
      {state === "installed" ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-ok-text"><Icon name="check" size={22} strokeWidth={3} /></span>
            <h2 id="install-title" className="m-0 font-display text-lg font-bold text-text">Nelio is installed</h2>
            <span className="grow" />
            <IconButton icon="x" label="Dismiss" onClick={dismiss} />
          </div>
          <p className="m-0 text-sm leading-[1.55] text-muted">Open it from your home screen for faster approvals.</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="grow" />
            <IconButton icon="x" label="Dismiss" onClick={dismiss} />
          </div>
          {state === "ios" ? (
            <>
              <h2 id="install-title" className="m-0 font-display text-lg font-bold text-text">Add Nelio to your Home Screen</h2>
              <p className="m-0 text-sm leading-[1.55] text-muted">Tap Share, then “Add to Home Screen”.</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip tone="blue">1 Share</Chip>
                <Icon name="arrowr" size={14} />
                <Chip tone="blue">2 Add to Home Screen</Chip>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3.5">
                <Illustration name="success" width={110} />
                <div>
                  <h2 id="install-title" className="m-0 font-display text-lg font-bold text-text">Install Nelio on this device</h2>
                  <p className="m-0 text-sm leading-[1.55] text-muted">Approve posts and get alerts faster, from your home screen.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon="download" onClick={install} disabled={!deferred && !force}>Install</Button>
                <Button variant="ghost" onClick={dismiss}>Not now</Button>
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
}
