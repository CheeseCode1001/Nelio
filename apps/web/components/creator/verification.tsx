"use client";

import { Banner, Button, Chip, EmptyState, Field, Motion, PageHead, PlatformBadge, ResponsiveDialog, Sk, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { claimChannelAction, requestManualCheckAction } from "@/lib/actions/creator";
import type { ChannelRow, VerificationData } from "@/lib/creator";

const BADGE = { youtube: "yt", instagram: "ig", tiktok: "tt", facebook: "fb" } as const;
const CHIP = { verified: "ok", pending: "blue", failed: "err" } as const;

const RESULTS: Record<string, { tone: "ok" | "err" | "warn" | "neutral"; title: string; text?: string }> = {
  verified: { tone: "ok", title: "Channel verified", text: "You can publish your licensing terms now." },
  failed: { tone: "err", title: "That sign-in didn’t own the channel", text: "Sign in with the Google account that owns it." },
  nochannel: { tone: "warn", title: "No YouTube channel on that account", text: "Sign in with the Google account that owns your channel." },
  taken: { tone: "warn", title: "Already verified by someone else", text: "If it’s yours, contact support and we’ll look into it." },
  canceled: { tone: "neutral", title: "Sign-in canceled", text: "Nothing changed." },
  error: { tone: "err", title: "Sign-in didn’t work", text: "Try again in a moment." },
  unavailable: { tone: "warn", title: "YouTube sign-in is in development", text: "Ask us to check your channel by hand instead." },
};

type Platform = "youtube" | "instagram";
type Mode = { platform: Platform; manual: boolean };

/** "Verify a channel": sign in with YouTube, or a check by hand (Instagram until its sign-in is approved, B-01). A bottom sheet on phones. */
function VerifyDialog({ mode, onClose, youtubeReady, preview }: { mode: Mode | null; onClose: () => void; youtubeReady: boolean; preview?: boolean }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>(mode?.platform ?? "youtube");
  const [manual, setManual] = useState(mode?.manual ?? false);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const byHand = manual || platform === "instagram" || !youtubeReady;

  const go = () => {
    setError(null);
    if (preview) return;
    start(async () => {
      if (byHand) {
        const r = await requestManualCheckAction({ platform, link });
        if (!r.ok) { setError(r.error); return; }
        setCode(r.code);
        router.refresh();
        return;
      }
      const r = await claimChannelAction(link);
      if (!r.ok) { setError(r.error); return; }
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- an API route that redirects to Google sign-in needs a full page load
      window.location.assign(`/api/creator/verify/youtube${r.claimId ? `?claim=${r.claimId}` : ""}`);
    });
  };

  return (
    <ResponsiveDialog open={Boolean(mode)} onOpenChange={(o) => { if (!o) { setCode(null); onClose(); } }} title={code ? "Add this code" : "Verify a channel"} description={code ? "Then we can confirm the channel is yours." : "We check ownership by having you sign in with that platform."}>
      {code ? (
        <div className="flex flex-col gap-3.5">
          <div className="rounded-row bg-surface-2 px-4 py-3.5 text-center font-display text-[26px] font-extrabold tracking-[0.04em] text-text">{code}</div>
          <p className="m-0 text-sm text-muted">Add it to your {platform === "youtube" ? "channel description" : "Instagram bio"} and leave it there until your channel shows as verified. A Nelio admin checks within 1–2 working days.</p>
          <div className="flex justify-end"><Button variant="primary" onClick={() => { setCode(null); onClose(); }}>Done</Button></div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div role="radiogroup" aria-label="Platform" className="grid grid-cols-2 gap-2.5">
            {(["youtube", "instagram"] as const).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={platform === p} onClick={() => setPlatform(p)} className={cn("flex min-h-14 cursor-pointer items-center gap-2.5 rounded-row border-2 bg-surface-1 px-3.5 py-2.5 text-left text-sm font-bold text-text", platform === p ? "border-accent" : "border-border")}>
                <PlatformBadge platform={BADGE[p]} size={30} />
                {p === "youtube" ? "YouTube" : "Instagram"}
              </button>
            ))}
          </div>
          {platform === "instagram" ? <Banner tone="neutral" title="Instagram sign-in is in development" text="It needs Meta’s approval. Until then we check by hand with a code in your bio." /> : null}
          {platform === "youtube" && !youtubeReady ? <Banner tone="neutral" title="YouTube sign-in is in development" text="Until it’s switched on, we check by hand with a code in your channel description." /> : null}
          <Field
            label={byHand ? "Channel link" : "Channel link (optional)"}
            name="channel-link"
            placeholder={platform === "youtube" ? "youtube.com/@yourname" : "instagram.com/yourname"}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            hint={byHand ? undefined : "Leave empty to verify every channel the Google account owns."}
            error={error ?? undefined}
          />
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {platform === "youtube" && youtubeReady ? (
              <Button variant="ghost" size="sm" onClick={() => setManual((m) => !m)}>{manual ? "Sign in with YouTube instead" : "Check by hand instead"}</Button>
            ) : null}
            <Button variant={byHand ? "primary" : "cta"} arrow={!byHand} loading={pending} onClick={go}>{byHand ? "Get my code" : "Continue with YouTube"}</Button>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}

function ChannelItem({ c, onRetry }: { c: ChannelRow; onRetry: (m: Mode) => void }) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <PlatformBadge platform={BADGE[c.platform]} size={44} />
      <div className="min-w-0 grow basis-[180px]">
        <div className="truncate text-sm font-semibold text-text">{c.title}</div>
        <div className="text-[13px] text-muted">{c.sub}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={CHIP[c.status]}>{c.status}</Chip>
        {c.retry ? <Button variant="secondary" size="sm" onClick={() => onRetry({ platform: c.platform === "instagram" ? "instagram" : "youtube", manual: c.retry === "manual" })}>Try again</Button> : null}
      </div>
    </li>
  );
}

/** LI-06 Verification: Filled, Pending, Failed and Empty, desktop and mobile. */
export function Verification({ d, result, preview }: { d: VerificationData; result?: string; preview?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const r = result ? RESULTS[result] : undefined;
  const open = (m: Mode) => setMode(m);
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead title="Verify your channels" sub="We check ownership by having you sign in with that platform." actions={<Button variant="primary" onClick={() => open({ platform: "youtube", manual: false })}>Verify a channel</Button>} />
        {r ? <Banner tone={r.tone} title={r.title} text={r.text} /> : null}
        {d.channels.length ? (
          <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
            {d.channels.map((c) => <ChannelItem key={c.id} c={c} onRetry={open} />)}
            <li className="flex flex-wrap items-center gap-3 px-4 py-3">
              <PlatformBadge platform="tt" size={44} />
              <div className="min-w-0 grow basis-[180px]">
                <div className="text-sm font-semibold text-text">TikTok</div>
                <div className="text-[13px] text-muted">Coming later</div>
              </div>
              <Chip tone="neutral">Coming later</Chip>
            </li>
          </ul>
        ) : (
          <EmptyState
            illustration="verify"
            title="No channels yet"
            text="Verify at least one channel before your licensing terms can go live."
            actions={
              <>
                <Button variant="cta" arrow onClick={() => open({ platform: "youtube", manual: false })}>Verify with YouTube</Button>
                <Button variant="secondary" onClick={() => open({ platform: "instagram", manual: true })}>Verify with Instagram</Button>
              </>
            }
          />
        )}
      </div>
      {mode ? <VerifyDialog key={`${mode.platform}-${mode.manual}`} mode={mode} onClose={() => setMode(null)} youtubeReady={d.youtubeReady} preview={preview} /> : null}
    </Motion>
  );
}

export function VerificationLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={280} h={36} /><Sk w={340} h={15} /></div>
      <div className="flex flex-col rounded-row border border-border bg-surface-1">
        {Array.from({ length: 3 }, (_, i) => <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"><Sk w={44} h={44} r={13} /><div className="flex grow flex-col gap-2"><Sk w="40%" h={13} /><Sk w="60%" h={11} /></div><Sk w={70} h={24} r={12} /></div>)}
      </div>
      <span className="sr-only" role="status">Loading your channels…</span>
    </div>
  );
}
