"use client";

import { AgentAvatar, Bubble, Button, Chip, Illustration, ResponsiveDialog, Small } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { pauseAllAction, pauseSummaryAction, resumeAllAction, resumeChecksAction } from "@/lib/actions/agents";

type Summary = { agents: number; queuedSteps: number; runningSteps: number };
type Check = { agentId: string; name: string; willResume: boolean; note: string };
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * SY-09 Pause all (journey J-12). "pause" shows what stops now and what is not affected; "resume" re-checks
 * every agent's budget first and says which stay paused. Both act on the server with permission checks.
 */
export function PauseAllDialog({ slug, workspaceName, mode, open, onOpenChange, preview }: { slug: string; workspaceName: string; mode: "pause" | "resume"; open: boolean; onOpenChange: (o: boolean) => void; preview?: { summary?: Summary; checks?: Check[] } }) {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(preview?.summary ?? null);
  const [checks, setChecks] = useState<Check[] | null>(preview?.checks ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open || preview) return;
    let live = true;
    void (async () => {
      if (mode === "pause") {
        const r = await pauseSummaryAction(slug);
        if (live) (r.ok ? setSummary(r.summary) : setError(r.error));
      } else {
        const r = await resumeChecksAction(slug);
        if (live) (r.ok ? setChecks(r.checks) : setError(r.error));
      }
    })();
    return () => { live = false; };
  }, [open, mode, slug, preview]);

  const confirm = () => start(async () => {
    if (preview) { onOpenChange(false); return; }
    const r = mode === "pause" ? await pauseAllAction(slug) : await resumeAllAction(slug);
    if (!r.ok) { setError(r.error); return; }
    setError(null);
    onOpenChange(false);
    router.refresh();
  });

  const rows: [string, string][] = summary
    ? [
        ["Stops now", `${plural(summary.agents, "agent")} · ${plural(summary.queuedSteps, "queued job")}`],
        ["Finishes or stops safely", summary.runningSteps ? `${plural(summary.runningSteps, "job")} in progress` : "Nothing in progress"],
        ["Not affected", "Posts already published"],
      ]
    : [];

  return (
    <ResponsiveDialog open={open} onOpenChange={(o) => { if (!o) setError(null); onOpenChange(o); }} title={mode === "pause" ? `Pause everything in ${workspaceName}?` : `Resume ${workspaceName}?`} hideTitle maxWidth={480}>
      {mode === "pause" ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-center"><Illustration name="limit" width={130} /></div>
          <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.02em] text-text">Pause everything in {workspaceName}?</h2>
          {summary ? (
            <dl className="m-0 flex flex-col">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border py-[11px]">
                  <dt className="text-[13px] text-muted">{k}</dt>
                  <dd className="m-0 text-right text-sm font-bold text-text">{v}</dd>
                </div>
              ))}
            </dl>
          ) : error ? null : <Small>Checking what’s running…</Small>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Bubble icon="play" tone="lime" />
            <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.02em] text-text">Resume {workspaceName}?</h2>
          </div>
          <p className="m-0 text-sm text-muted">Before restarting, we re-check every agent’s budget and licenses.</p>
          {checks ? (
            checks.length ? (
              <ul className="m-0 list-none overflow-hidden rounded-row border border-border p-0">
                {checks.map((c) => (
                  <li key={c.agentId} className="flex items-center gap-3 border-b border-border px-3.5 py-3 last:border-b-0">
                    <AgentAvatar size={32} animated={false} color={c.willResume ? "lime" : "pink"} shape={c.willResume ? "circle" : "blob"} />
                    <div className="min-w-0 grow">
                      <div className="text-sm font-semibold text-text">{c.name}</div>
                      <div className="text-[13px] text-muted">{c.note}</div>
                    </div>
                    <Chip tone={c.willResume ? "ok" : "neutral"} icon={c.willResume ? "check" : "pause"}>{c.willResume ? "will resume" : "stays paused"}</Chip>
                  </li>
                ))}
              </ul>
            ) : <Small>No agents to re-check.</Small>
          ) : error ? null : <Small>Re-checking agents…</Small>}
        </div>
      )}
      {error ? <p role="alert" className="m-0 mt-3 text-[13px] font-semibold text-err-text">{error}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => onOpenChange(false)} className="tap-target cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-text">Cancel</button>
        {mode === "pause" ? (
          <Button variant="danger" icon="pause" loading={pending} disabled={!summary} onClick={confirm}>Pause all</Button>
        ) : (
          <Button variant="cta" arrow loading={pending} disabled={!checks} onClick={confirm}>Resume</Button>
        )}
      </div>
    </ResponsiveDialog>
  );
}
