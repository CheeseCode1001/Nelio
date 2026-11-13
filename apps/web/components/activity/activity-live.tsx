"use client";

import { Banner, Button, Chip, ResponsiveDialog } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition, type ReactNode } from "react";
import { pauseRunAction, resumeRunAction } from "@/lib/actions/runs";
import { useLive } from "@/lib/use-live";

/**
 * Wraps the filters with the live connection state (Activity-Reconnecting / -Synced boards). New activity
 * re-reads the page from the server, at most once a second, so the list, counts and panel stay current.
 */
export function LiveStatus({ topic, preview, children }: { topic: string | null; preview?: "live" | "reconnecting" | "synced"; children: ReactNode }) {
  const router = useRouter();
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refresh = useCallback(() => {
    const wait = Math.max(0, 1000 - (Date.now() - last.current));
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      last.current = Date.now();
      router.refresh();
    }, wait);
  }, [router]);
  const actual = useLive(topic, "activity", refresh);
  const status = preview ?? actual;
  return (
    <div className="flex flex-col gap-3">
      {status === "reconnecting" ? <Banner tone="warn" title="Reconnecting…" text="Your agents keep working in the background." /> : null}
      {status === "synced" ? <Banner tone="ok" title="Back online" text="Everything is up to date." /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {children}
        {status === "live" || status === "synced" ? <span className="ml-auto"><Chip tone="ok" icon="activity">Live</Chip></span> : status === "reconnecting" ? <span className="ml-auto"><Chip tone="warn" icon="refresh">Reconnecting…</Chip></span> : null}
      </div>
    </div>
  );
}

/** "Pause run" / "Resume run" and "View log" under the run panel. */
export function RunPanelActions({ slug, runId, canPause, paused, log, title }: { slug?: string; runId: string; canPause: boolean; paused: boolean; log: { at: string; title: string; detail: string | null }[]; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        {paused ? (
          <Button variant="secondary" icon="play" loading={pending} disabled={!slug} onClick={() => start(async () => { const r = await resumeRunAction(slug!, runId); setError(r.ok ? null : r.error); router.refresh(); })}>Resume run</Button>
        ) : (
          <Button variant="secondary" icon="pause" loading={pending} disabled={!slug || !canPause} onClick={() => start(async () => { const r = await pauseRunAction(slug!, runId); setError(r.ok ? null : r.error); router.refresh(); })}>Pause run</Button>
        )}
        <Button variant="ghost" icon="list" onClick={() => setOpen(true)}>View log</Button>
      </div>
      {error ? <p role="alert" className="m-0 text-[13px] font-semibold text-err-text">{error}</p> : null}
      <ResponsiveDialog open={open} onOpenChange={setOpen} title={`Log · ${title}`} maxWidth={560}>
        {log.length ? (
          <ol className="m-0 flex max-h-[60vh] list-none flex-col overflow-y-auto p-0">
            {log.map((e, i) => (
              <li key={i} className="flex gap-3 border-b border-border py-2.5 last:border-b-0">
                <span className="w-11 flex-none text-[13px] tabular-nums text-muted">{e.at}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text">{e.title}</span>
                  {e.detail ? <span className="block text-[13px] text-muted">{e.detail}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        ) : <p className="m-0 text-sm text-muted">Nothing logged yet.</p>}
      </ResponsiveDialog>
    </div>
  );
}
