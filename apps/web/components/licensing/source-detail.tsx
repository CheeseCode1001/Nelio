"use client";

import { EXPIRY_CHOICES, PLATFORM_LABEL, type LicensePlatform } from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, Checkbox, Chip, Icon, KeyValues, Motion, PersonAvatar, PlatformBadge, PlayDisc, ResponsiveDialog, SelectField, Sk, cn, Ghost } from "@nelio/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { toast } from "@/components/feedback/toaster";
import { acceptFreeLicenseAction, cancelRequestAction, importLicensedVideoAction, requestPrivateLicenseAction } from "@/lib/actions/licensing";
import type { SourceData } from "@/lib/licensing";
import { SAMPLE_SOURCE } from "./sample";

const TEXTAREA = "box-border min-h-[100px] w-full resize-y rounded-input border-2 border-border bg-surface-1 px-4 py-3 font-body text-sm text-text placeholder:text-muted";
const THUMB = ["bg-orange", "bg-lime", "bg-cyan", "bg-yellow", "bg-pink", "bg-violet"];
const TYPE_CHIP = { free: { tone: "ok", label: "Free" }, private: { tone: "blue", label: "Private" }, paid: { tone: "neutral", label: "Paid · later" } } as const;

export interface SourceHrefs { marketplace: string; mine: string; studio: string; request: string; source: string; studioBase: string }

function Feature({ f }: { f: NonNullable<SourceData["feature"]> }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play(); else v.pause();
  };
  return (
    <div role="img" aria-label={`Source video ${f.title}`} className="relative aspect-video w-full overflow-hidden rounded-[22px] border-2 border-outline bg-violet">
      {f.videoUrl ? (
        <video ref={video} src={f.videoUrl} poster={f.posterUrl ?? undefined} preload="none" playsInline className="absolute inset-0 size-full object-cover" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      ) : f.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
        <img src={f.posterUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"><PlayDisc playing={playing} onClick={toggle} disabled={!f.videoUrl} /></div>
      <div className="absolute bottom-3 left-3 z-[2] max-w-[calc(100%-24px)]">
        <span className="inline-flex max-w-full truncate rounded-full bg-ink px-2.5 py-1 text-[12.5px] font-bold text-on-ink">{f.title}</span>
      </div>
    </div>
  );
}

function Shorts({ items, onClip, busy }: { items: SourceData["shorts"]; onClip?: (id: string) => void; busy?: string | null }) {
  const strip = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * 182 * 2, behavior: "smooth" });
  return (
    <Card>
      <CardHead
        title={onClip ? "Pick a video to clip" : "Popular with licensees"}
        sub={onClip ? "Your license covers these. Scroll sideways for more." : "Scroll sideways for more shorts"}
        right={
          <div className="flex gap-2">
            <button type="button" aria-label="Previous Popular shorts" onClick={() => scroll(-1)} className="tap-target inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface-1 text-text"><Icon name="chev" size={18} className="rotate-180" /></button>
            <button type="button" aria-label="Next Popular shorts" onClick={() => scroll(1)} className="tap-target inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-ink text-on-ink"><Icon name="chev" size={18} /></button>
          </div>
        }
      />
      <div ref={strip} role="region" aria-label="Popular shorts, scroll sideways for more" tabIndex={0} className="flex snap-x gap-3 overflow-x-auto pb-2.5 pr-14">
        {items.map((s, i) => (
          <div key={s.id} className="w-[150px] flex-none snap-start md:w-[170px]">
            <div role="img" aria-label={`Short video: ${s.title}`} className={cn("relative aspect-[9/16] w-full overflow-hidden rounded-[22px] border-2 border-outline", THUMB[i % THUMB.length])}>
              {s.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                <img src={s.posterUrl} alt="" className="absolute inset-0 size-full object-cover" />
              ) : null}
              <div className="absolute inset-x-2.5 bottom-[38%] text-center">
                <span className="rounded-lg border-2 border-outline bg-yellow px-2.5 py-[3px] font-display text-[15px] font-extrabold uppercase leading-[1.6] text-outline [box-decoration-break:clone]">{s.title}</span>
              </div>
              {onClip ? (
                <div className="absolute inset-x-2.5 bottom-2.5 z-[2] flex justify-center">
                  <Button variant="cta" size="sm" icon="scissors" loading={busy === s.id} disabled={Boolean(busy)} onClick={() => onClip(s.id)} aria-label={`Clip ${s.title}`}>Clip this</Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ LI-03 dialogs

function DialogHead({ d, title, sub }: { d: SourceData; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <PersonAvatar initials={d.initials} color={d.color} size={52} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="m-0 font-display text-2xl font-extrabold leading-tight tracking-[-0.02em] text-text">{title}</h2>
        <span className="text-[12.5px] font-medium text-muted">{sub}</span>
      </div>
    </div>
  );
}

function AcceptDialog({ d, wsName, open, onOpenChange, slug, done, preview }: { d: SourceData; wsName: string; open: boolean; onOpenChange: (o: boolean) => void; slug?: string; done: () => void; preview?: boolean }) {
  const [rules, setRules] = useState(false);
  const [revocable, setRevocable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const s = d.summary!;
  const accept = () => {
    setError(null);
    if (!rules || !revocable) { setError("Tick both boxes to accept the license."); return; }
    if (preview || !slug) { done(); return; }
    start(async () => {
      const r = await acceptFreeLicenseAction(slug, d.id, { rules, revocable });
      if (!r.ok) { setError(r.error); return; }
      toast.success(`Licensed ${d.name}’s videos`, { description: "Find them under Import licensed in the Clipping Studio." });
      done();
    });
  };
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={`License from ${d.name}`} hideTitle>
      <div className="flex flex-col gap-[18px]">
        <DialogHead d={d} title={`License from ${d.name}`} sub={`Free license · for ${wsName}`} />
        <KeyValues pairs={[["Scope", s.scope], ["Platforms", s.platforms], ["Commercial use", s.commercial], ["Attribution", d.terms!.attribution ? `“${d.terms!.attribution}” on every post` : "Not required"]]} />
        <Checkbox label="I’ll follow the attribution and platform rules" checked={rules} onChange={(e) => setRules(e.target.checked)} />
        <Checkbox label="I understand the owner can revoke this license, which stops future posts" checked={revocable} onChange={(e) => setRevocable(e.target.checked)} />
        {error ? <Banner tone="err" title="Not accepted yet" text={error} /> : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cta" arrow loading={pending} onClick={accept}>Accept free license</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

const monthsLabel = (m: number | null) => (m === null ? "Until they revoke it" : `${m} months`);

function RequestDialog({ d, open, onOpenChange, slug, onSent, preview }: { d: SourceData; open: boolean; onOpenChange: (o: boolean) => void; slug?: string; onSent: () => void; preview?: boolean }) {
  const allowed = d.terms!.platforms;
  const max = d.terms!.expiresMonths;
  const lengths = EXPIRY_CHOICES.filter((m) => (max === null ? true : m !== null && m <= max));
  const platformOptions = [...(allowed.length > 1 ? [{ value: allowed.join(","), label: allowed.map((p) => PLATFORM_LABEL[p]).join(", ") }] : []), ...allowed.map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))];
  const [note, setNote] = useState("");
  const [platforms, setPlatforms] = useState(platformOptions[platformOptions.length > 1 ? 1 : 0]?.value ?? "");
  const [months, setMonths] = useState(String(lengths.includes(6) ? 6 : lengths[lengths.length - 1] ?? "never"));
  const [rules, setRules] = useState(false);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [pending, start] = useTransition();
  const send = () => {
    setError(null);
    if (note.trim().length < 3) { setError({ field: "note", text: "Say what you’ll use it for." }); return; }
    if (!rules) { setError({ field: "confirm", text: "Tick the box to send the request." }); return; }
    if (preview || !slug) { onSent(); return; }
    start(async () => {
      const r = await requestPrivateLicenseAction(slug, d.id, { note, platforms: platforms.split(",") as LicensePlatform[], months: months === "never" ? null : Number(months), rules });
      if (!r.ok) { setError({ text: r.error, field: r.field }); return; }
      onSent();
    });
  };
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={`Request from ${d.name}`} hideTitle>
      <div className="flex flex-col gap-[18px]">
        <DialogHead d={d} title={`Request from ${d.name}`} sub="Private license · they approve each request" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="request-note" className="text-[13px] font-bold text-text">What will you use it for?</label>
          <textarea id="request-note" className={TEXTAREA} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} aria-invalid={error?.field === "note"} placeholder="Short clips for my channel about…" />
          {error?.field === "note" ? <span role="alert" className="text-[13px] font-semibold text-err-text">{error.text}</span> : null}
        </div>
        <SelectField label="Platforms" name="request-platforms" value={platforms} onChange={(e) => setPlatforms(e.target.value)} options={platformOptions} error={error?.field === "platforms" ? error.text : undefined} />
        <SelectField label="How long?" name="request-months" value={months} onChange={(e) => setMonths(e.target.value)} options={lengths.map((m) => ({ value: m === null ? "never" : String(m), label: monthsLabel(m) }))} error={error?.field === "months" ? error.text : undefined} />
        <Checkbox label="I’ll follow the attribution and platform rules" checked={rules} onChange={(e) => setRules(e.target.checked)} error={error?.field === "confirm" ? error.text : undefined} />
        {error && !["note", "platforms", "months", "confirm"].includes(error.field ?? "") ? <Banner tone="err" title="Not sent" text={error.text} /> : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cta" arrow loading={pending} onClick={send}>Send request</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

function OutcomeDialog({ open, onOpenChange, art, title, text, done }: { open: boolean; onOpenChange: (o: boolean) => void; art: ReactNode; title: string; text: string; done: () => void }) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={title} hideTitle>
      <div className="flex flex-col items-center gap-3.5 py-2 text-center">
        {art}
        <h2 className="m-0 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-text">{title}</h2>
        <p className="m-0 max-w-[420px] text-[15px] leading-[1.55] text-muted">{text}</p>
        <Button variant="cta" arrow onClick={done}>Done</Button>
      </div>
    </ResponsiveDialog>
  );
}

// ------------------------------------------------------------------ LI-02

type Dialog = "accept" | "request" | "sent" | "approved" | "declined" | null;

/** LI-02 Source detail & terms (Filled, Loading, Private, Suspended, Licensed) with LI-03 Request / accept as a dialog (bottom sheet on phones). */
export function SourceDetail({ d, wsName, slug, hrefs, canAccept, initialDialog = null, preview }: { d: SourceData; wsName: string; slug?: string; hrefs: SourceHrefs; canAccept: boolean; initialDialog?: Dialog; preview?: boolean }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(initialDialog);
  const [pending, start] = useTransition();
  const close = () => {
    setDialog(null);
    if (!preview && initialDialog) router.replace(hrefs.source, { scroll: false });
  };
  const finish = (to: string) => {
    setDialog(null);
    if (preview) return;
    router.push(to);
    router.refresh();
  };
  const [clipping, setClipping] = useState<string | null>(null);
  const licensed = d.mine.kind === "active" && d.mine.status.kind !== "suspended" && d.listing !== "suspended";
  const clip = (id: string) => {
    if (preview || !slug) return;
    setClipping(id);
    void importLicensedVideoAction(slug, id).then((r) => {
      if (!r.ok) { setClipping(null); toast.error("Can’t clip this video", { description: r.error }); return; }
      toast.success("Added to your Clipping Studio", { description: "Nelio AI is finding the best moments." });
      router.push(`${hrefs.studioBase}/${r.assetId}`);
    });
  };
  const type = d.terms?.licenseType ?? "free";
  const chip = TYPE_CHIP[type];
  const s = d.summary;

  let cta: ReactNode = null;
  if (d.listing === "suspended") {
    cta = <Banner tone="err" title="This listing is suspended" text="Ownership is under review. Existing licenses are paused." />;
  } else if (d.mine.kind === "active") {
    cta = <Banner tone="ok" title="You already have this license" text={d.mine.until ? `Active until ${d.mine.until}. Pick a video below to clip it.` : "Active until the owner revokes it. Pick a video below to clip it."} action={<ButtonLink href={hrefs.studio} variant="secondary" size="sm">Open studio</ButtonLink>} />;
  } else if (d.mine.kind === "requested") {
    const id = d.mine.agreementId;
    cta = <Banner tone="blue" title="Request sent" text="We’ll notify you when they decide." action={<Button variant="secondary" size="sm" loading={pending} onClick={() => !preview && slug && start(async () => { const r = await cancelRequestAction(slug, id); if (!r.ok) toast.error("That didn’t work", { description: r.error }); router.refresh(); })}>Cancel request</Button>} />;
  } else if (d.mine.kind === "ended" && d.mine.why === "revoked") {
    cta = <Banner tone="err" title={`${d.name} revoked your license`} text="New clips and posts using it are on hold. See My licenses for what’s affected." action={<ButtonLink href={hrefs.mine} variant="secondary" size="sm">My licenses</ButtonLink>} />;
  } else if (type === "paid") {
    cta = <Button variant="secondary" size="lg" full disabled>Notify me when paid licensing opens</Button>;
  } else if (type === "free" && !canAccept) {
    cta = <Banner tone="neutral" title="Ask a manager to accept" text="Editors can request private licenses; free licenses are accepted by a workspace manager." />;
  } else {
    const renew = d.mine.kind === "ended";
    cta = <Button variant="cta" size="lg" arrow full onClick={() => setDialog(type === "free" ? "accept" : "request")}>{type === "free" ? (renew ? "Renew free license" : "Get free license") : renew ? "Request a new license" : "Request a private license"}</Button>;
  }

  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="text-[13px] font-semibold text-muted"><Link href={hrefs.marketplace} className="tap-target text-muted no-underline hover:text-text">Licensing</Link> › {d.name}</nav>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">{d.name}</h1>
              {d.verified ? <Chip tone="ok" icon="check">verified</Chip> : null}
            </div>
            <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-muted">{d.channelLine}</p>
          </div>
        </header>
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:[grid-template-columns:minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {d.feature ? <Card><Feature f={d.feature} /></Card> : null}
          {d.terms && d.terms.excludedCount > 0 ? <Banner tone="warn" title={`${d.terms.excludedCount} video${d.terms.excludedCount === 1 ? " is" : "s are"} excluded`} text="They contain licensed music or guest footage the owner doesn’t control. We skip them automatically." /> : null}
          {licensed && d.shorts.length ? <Shorts items={d.shorts} onClip={clip} busy={clipping} /> : d.shorts.length > 1 ? <Shorts items={d.shorts} /> : null}
        </div>
        <Card className="lg:self-start">
          <CardHead title="License terms" right={<Chip tone={chip.tone}>{chip.label}</Chip>} />
          {s ? (
            <KeyValues
              pairs={[
                ["Allowed", s.uses],
                ["Platforms", <span key="p" className="inline-flex flex-wrap justify-end gap-1">{d.platforms.map((p) => <PlatformBadge key={p} platform={p} size={24} />)}</span>],
                ["Commercial use", <Chip key="c" tone={d.terms!.commercial ? "ok" : "err"}>{s.commercial}</Chip>],
                ["Attribution", s.attribution],
                ["Edits", s.edits],
                ["Expires", d.mine.kind === "active" ? (d.mine.until ?? "When revoked") : s.expires],
                ["Scope", s.scope],
              ]}
            />
          ) : null}
          {cta}
        </Card>
      </div>
      {d.terms ? (
        <>
          <AcceptDialog d={d} wsName={wsName} open={dialog === "accept"} onOpenChange={(o) => (o ? setDialog("accept") : close())} slug={slug} done={() => finish(hrefs.mine)} preview={preview} />
          <RequestDialog d={d} open={dialog === "request"} onOpenChange={(o) => (o ? setDialog("request") : close())} slug={slug} onSent={() => setDialog("sent")} preview={preview} />
        </>
      ) : null}
      <OutcomeDialog open={dialog === "sent"} onOpenChange={(o) => !o && finish(hrefs.mine)} art={<PersonAvatar initials={d.initials} color={d.color} size={64} />} title={`Request sent to ${d.name}`} text="We’ll notify you when they decide. Most owners reply within 2 days." done={() => finish(hrefs.mine)} />
      <OutcomeDialog open={dialog === "approved"} onOpenChange={(o) => !o && close()} art={<span className="inline-flex size-16 items-center justify-center rounded-full bg-lime text-outline"><Icon name="check" size={30} strokeWidth={2.6} /></span>} title={`${d.name} said yes!`} text={`${d.decided?.months ? `${d.decided.months}-month` : "Open-ended"} private license, ${d.decided?.platforms || "on their platforms"}. You can use it now.`} done={() => finish(hrefs.mine)} />
      <OutcomeDialog open={dialog === "declined"} onOpenChange={(o) => !o && close()} art={<PersonAvatar initials={d.initials} color={d.color} size={64} />} title={`${d.name} declined`} text={d.decided?.note ? `Their note: “${d.decided.note}”` : "They didn’t leave a note. You can browse other creators in the marketplace."} done={() => finish(hrefs.marketplace)} />
    </Motion>
  );
}

/** LI-02 Loading: the source page itself, ghosted. */
export function SourceDetailLoading() {
  return <Ghost><SourceDetail d={SAMPLE_SOURCE} wsName="" hrefs={{ marketplace: "#", mine: "#", studio: "#", request: "#", source: "#", studioBase: "#" }} canAccept preview /></Ghost>;
}
