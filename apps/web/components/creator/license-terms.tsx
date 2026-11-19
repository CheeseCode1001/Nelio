"use client";

import { EXPIRY_CHOICES, PLATFORM_LABEL, checkUpload, formatBytes, termsSummary, type LicenseKind, type LicensePlatform, type LicenseUse } from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, Checkbox, Chip, Field, Icon, KeyValues, Meter, Motion, PageHead, ResponsiveDialog, SelectField, Sk, Switch, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import {
  cancelCreatorUploadAction, completeCreatorUploadAction, publishTermsAction, removeCreatorVideoAction, setVideoExcludedAction, signCreatorPartsAction, startCreatorUploadAction,
} from "@/lib/actions/creator";
import type { TermsData, VideoRow } from "@/lib/creator";
import { readDuration, sendParts, uploadErrorText } from "@/lib/multipart-client";

const TEXTAREA = "box-border min-h-[100px] w-full resize-y rounded-input border-2 border-border bg-surface-1 px-4 py-3 font-body text-sm text-text placeholder:text-muted";

const USE_OPTIONS: { value: string; label: string; uses: LicenseUse[] }[] = [
  { value: "both", label: "Clips and compilations", uses: ["clips", "compilations"] },
  { value: "clips", label: "Clips only", uses: ["clips"] },
  { value: "compilations", label: "Compilations only", uses: ["compilations"] },
];
const PLATFORM_SETS: LicensePlatform[][] = [["instagram", "youtube", "tiktok"], ["instagram", "youtube", "tiktok", "facebook"], ["instagram", "youtube"], ["instagram"], ["youtube"], ["tiktok"]];
const setKey = (ps: LicensePlatform[]) => [...ps].sort().join(",");
const setLabel = (ps: LicensePlatform[]) => (ps.length === 1 ? `${PLATFORM_LABEL[ps[0]!]} only` : ps.length === 2 ? `${PLATFORM_LABEL[ps[0]!]} and ${PLATFORM_LABEL[ps[1]!]}` : ps.map((p) => PLATFORM_LABEL[p]).join(", "));
const REASONS = ["Licensed music", "Guest footage", "Third-party footage", "Other"] as const;

function Radio({ name, value, checked, onChange, title, sub, disabled }: { name: string; value: string; checked: boolean; onChange: () => void; title: string; sub: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-2.5", disabled && "opacity-60")}>
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="mt-0.5 size-5 flex-none accent-[var(--n-acc)]" />
      <label htmlFor={id} className="text-sm font-semibold text-text">
        {title}
        <span className="block text-[13px] font-normal text-muted">{sub}</span>
      </label>
    </div>
  );
}

// ------------------------------------------------------------------ Videos (creator uploads; not drawn on the boards)

type Upload = { name: string; size: number; sent: number; videoId: string | null };

function VideoLibrary({ videos, storageReady, preview }: { videos: VideoRow[]; storageReady: boolean; preview?: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exclude, setExclude] = useState<VideoRow | null>(null);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [pending, start] = useTransition();
  useEffect(() => () => abort.current?.abort(), []);

  async function pick(f: File) {
    if (preview) return;
    setError(null);
    const durationSec = await readDuration(f);
    const problem = checkUpload({ name: f.name, type: f.type, size: f.size, durationSec });
    if (problem) { setError(problem.text); return; }
    const started = await startCreatorUploadAction({ name: f.name, type: f.type, size: f.size, durationSec });
    if (!started.ok) { setError(started.error); return; }
    const ac = new AbortController();
    abort.current = ac;
    setUpload({ name: f.name, size: f.size, sent: 0, videoId: started.videoId });
    try {
      const parts = await sendParts({ file: f, partSize: started.partSize, partCount: started.partCount, sign: (p) => signCreatorPartsAction(started.videoId, p), onProgress: (sent) => setUpload((u) => (u ? { ...u, sent } : u)), signal: ac.signal });
      const fin = await completeCreatorUploadAction(started.videoId, parts);
      if (!fin.ok) throw new Error(fin.error);
      toast.success(`${f.name} uploaded`, { description: "It’s now part of what you license." });
      setUpload(null);
      router.refresh();
    } catch (e) {
      setUpload(null);
      if (ac.signal.aborted) return;
      setError(uploadErrorText(e));
    }
  }
  const cancel = async () => {
    abort.current?.abort();
    if (upload?.videoId) await cancelCreatorUploadAction(upload.videoId);
    setUpload(null);
  };
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    if (preview) return;
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error("That didn’t work", { description: "error" in r ? r.error : undefined });
      else toast.success(done);
      setExclude(null);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHead
        title="Your videos"
        sub="Licensees clip from the videos you upload here."
        right={
          <>
            <input ref={input} type="file" accept="video/mp4,video/quicktime,.mp4,.mov,.m4v" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void pick(f); }} />
            <Button variant="secondary" size="sm" icon="upload" disabled={!storageReady || Boolean(upload)} onClick={() => input.current?.click()}>Upload video</Button>
          </>
        }
      />
      {!storageReady ? <Banner tone="neutral" title="Uploads aren’t switched on yet" text="Video storage isn’t set up for this deployment." /> : null}
      {error ? <Banner tone="err" title="That video didn’t upload" text={error} /> : null}
      {upload ? (
        <div className="flex flex-col gap-2 rounded-row border border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="min-w-0 grow truncate text-sm font-semibold text-text">{upload.name}</span>
            <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
          </div>
          <Meter pct={(upload.sent / Math.max(1, upload.size)) * 100} right={`${formatBytes(upload.sent)} of ${formatBytes(upload.size)}`} ariaLabel={`Uploading ${upload.name}`} />
        </div>
      ) : null}
      {videos.length ? (
        <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
          {videos.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <span className="inline-flex size-[38px] flex-none items-center justify-center rounded-[14px] bg-surface-2 text-muted"><Icon name="film" size={18} /></span>
              <div className="min-w-0 grow basis-[160px]">
                <div className="truncate text-sm font-semibold text-text">{v.title}</div>
                <div className="text-[13px] text-muted">{v.status === "uploading" ? "Uploading…" : v.meta}</div>
              </div>
              {v.excluded ? <Chip tone="warn">excluded</Chip> : null}
              <div className="flex gap-1.5">
                {v.excluded
                  ? <Button variant="secondary" size="sm" disabled={pending} onClick={() => act(() => setVideoExcludedAction(v.id, false), `${v.title} included`)}>Include</Button>
                  : <Button variant="secondary" size="sm" disabled={pending || v.status !== "ready"} onClick={() => { setReason(REASONS[0]); setExclude(v); }}>Exclude</Button>}
                <Button variant="ghost" size="sm" disabled={pending} onClick={() => act(() => removeCreatorVideoAction(v.id), `${v.title} removed`)} aria-label={`Remove ${v.title}`}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      ) : !upload ? (
        <p className="m-0 text-sm text-muted">No videos yet. Upload the videos you’re happy for others to clip.</p>
      ) : null}
      <ResponsiveDialog open={Boolean(exclude)} onOpenChange={(o) => { if (!o) setExclude(null); }} title={`Exclude ${exclude?.title ?? "this video"}?`} description="Excluded videos can’t be clipped by anyone, including people who already have a license.">
        <div className="flex flex-col gap-3.5">
          <SelectField label="Why?" name="exclude-reason" value={reason} onChange={(e) => setReason(e.target.value)} options={REASONS.map((r) => ({ value: r, label: r }))} />
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setExclude(null)}>Keep it</Button>
            <Button variant="primary" loading={pending} onClick={() => exclude && act(() => setVideoExcludedAction(exclude.id, true, reason), `${exclude.title} excluded`)}>Exclude video</Button>
          </div>
        </div>
      </ResponsiveDialog>
    </Card>
  );
}

// ------------------------------------------------------------------ LI-07

/** LI-07 Licensing terms: Filled, Unverified (can't publish yet) and Saved, desktop and mobile. */
export function LicenseTerms({ d, hrefs, preview, saved: savedInitially, displayName }: { d: TermsData; hrefs: { verify: string }; preview?: boolean; saved?: boolean; displayName: string }) {
  const router = useRouter();
  const [type, setType] = useState<LicenseKind>(d.terms.licenseType === "paid" ? "free" : d.terms.licenseType);
  const [uses, setUses] = useState(USE_OPTIONS.find((o) => o.uses.length === d.terms.allowedUses.length && o.uses.every((u) => d.terms.allowedUses.includes(u)))?.value ?? "both");
  const [platforms, setPlatforms] = useState(setKey(d.terms.platforms.length ? d.terms.platforms : ["instagram", "youtube", "tiktok"]));
  const [commercial, setCommercial] = useState(d.terms.commercial);
  const [attribution, setAttribution] = useState(d.terms.attribution);
  const [expires, setExpires] = useState(d.terms.expiresMonths === null ? "never" : String(d.terms.expiresMonths));
  const [thirdParty, setThirdParty] = useState(d.terms.hasThirdParty);
  const [note, setNote] = useState(d.terms.thirdPartyNote);
  const [saved, setSaved] = useState(Boolean(savedInitially));
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pending, start] = useTransition();

  const sets = [...PLATFORM_SETS];
  if (!sets.some((s) => setKey(s) === platforms)) sets.push(platforms.split(",") as LicensePlatform[]);
  const current = {
    licenseType: type,
    allowedUses: USE_OPTIONS.find((o) => o.value === uses)!.uses,
    platforms: (sets.find((s) => setKey(s) === platforms) ?? []) as LicensePlatform[],
    commercial,
    attribution: attribution.trim(),
    edits: d.terms.edits.length ? d.terms.edits : (["captions", "crops", "trims"] as const).slice(),
    expiresMonths: expires === "never" ? null : Number(expires),
    excludedCount: d.videos.filter((v) => v.excluded).length,
  };
  const summary = termsSummary(current);
  const excluded = d.videos.filter((v) => v.excluded);

  const publish = () => {
    if (preview) { setSaved(true); return; }
    setError(null);
    start(async () => {
      const r = await publishTermsAction({ ...current, hasThirdParty: thirdParty, thirdPartyNote: note });
      if (!r.ok) { setError({ text: r.error, field: r.field }); toast.error("Terms not published", { description: r.error }); return; }
      setSaved(true);
      toast.success("Terms published", { description: "Your listing is live in the marketplace." });
      router.refresh();
    });
  };
  const fieldError = (f: string) => (error?.field === f ? error.text : undefined);

  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead
          title="Your licensing terms"
          sub="These apply to everyone who licenses your content."
          actions={
            <>
              <Button variant="secondary" icon="eye" onClick={() => setPreviewOpen(true)}>Preview listing</Button>
              <Button variant="primary" onClick={publish} loading={pending} disabled={!d.verified}>Publish terms</Button>
            </>
          }
        />
        {!d.verified ? <Banner tone="warn" title="Verify a channel first" text="Terms go live once at least one channel is verified." action={<ButtonLink href={hrefs.verify} variant="secondary" size="sm">Verify</ButtonLink>} /> : null}
        {d.verified && d.listing === "suspended" ? <Banner tone="warn" title="Your listing is under review" text="Ownership is being checked. Your terms are saved but hidden, and existing licenses are paused." /> : null}
        {saved && d.verified && d.listing !== "suspended" ? <Banner tone="ok" title="Terms published" text="Your listing is live in the marketplace." /> : null}
        {error && !error.field ? <Banner tone="err" title="Terms not published" text={error.text} /> : null}
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Card>
          <CardHead title="License type" />
          <div role="radiogroup" aria-label="License type" className="flex flex-col gap-3.5">
            <Radio name="type" value="free" checked={type === "free"} onChange={() => setType("free")} title="Free license" sub="Anyone verified can clip within these rules." />
            <Radio name="type" value="private" checked={type === "private"} onChange={() => setType("private")} title="Private agreements only" sub="You approve each request." />
            <Radio name="type" value="paid" checked={false} onChange={() => undefined} title="Paid licensing" sub="Coming later, once payouts are ready." disabled />
          </div>
          <CardHead title="Rules" />
          <SelectField label="Allowed uses" name="allowed-uses" value={uses} onChange={(e) => setUses(e.target.value)} options={USE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} error={fieldError("allowedUses")} />
          <SelectField label="Platforms" name="platforms" value={platforms} onChange={(e) => setPlatforms(e.target.value)} options={sets.map((s) => ({ value: setKey(s), label: setLabel(s) }))} error={fieldError("platforms")} />
          <Switch id="commercial" label="Allow commercial use" checked={commercial} onChange={setCommercial} />
          <Field label="Attribution text" name="attribution" placeholder="@yourhandle" value={attribution} onChange={(e) => setAttribution(e.target.value)} maxLength={80} error={fieldError("attribution")} hint="Shown on every post that uses your videos." />
          <SelectField
            label="Expires"
            name="expires"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            options={EXPIRY_CHOICES.map((m) => (m === null ? { value: "never", label: "When I revoke it" } : { value: String(m), label: `${m} months after license starts` }))}
            error={fieldError("expiresMonths")}
          />
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHead title="Third-party rights" right={<Chip tone="warn">Important</Chip>} />
            <Checkbox label="Some of my videos contain music or footage I don’t own" checked={thirdParty} onChange={(e) => setThirdParty(e.target.checked)} />
            {thirdParty ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="third-party-note" className="text-[13px] font-bold text-text">Which ones?</label>
                <textarea id="third-party-note" className={TEXTAREA} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} aria-invalid={Boolean(fieldError("thirdPartyNote"))} placeholder="Ep 7 (licensed music), Ep 12 (guest footage)" />
                {fieldError("thirdPartyNote") ? <span role="alert" className="text-[13px] font-semibold text-err-text">{fieldError("thirdPartyNote")}</span> : <span className="text-[13px] text-muted">Then exclude those videos below so no one can clip them.</span>}
              </div>
            ) : null}
          </Card>
          <Card>
            <CardHead title="Excluded videos" />
            {excluded.length ? (
              <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
                {excluded.map((v) => <ExcludedRow key={v.id} v={v} preview={preview} />)}
              </ul>
            ) : (
              <p className="m-0 text-sm text-muted">None. Every video you upload can be licensed.</p>
            )}
          </Card>
          <VideoLibrary videos={d.videos} storageReady={d.storageReady} preview={preview} />
        </div>
      </div>
      <ResponsiveDialog open={previewOpen} onOpenChange={setPreviewOpen} title={`${displayName} · listing preview`} description="This is what businesses see before they license your videos.">
        <div className="flex flex-col gap-3">
          <Chip tone={type === "free" ? "ok" : "blue"} className="w-fit">{type === "free" ? "Free" : "Private"}</Chip>
          <KeyValues pairs={[["Allowed", summary.uses], ["Platforms", summary.platforms || "—"], ["Commercial use", summary.commercial], ["Attribution", attribution.trim() ? summary.attribution : "—"], ["Edits", summary.edits], ["Expires", summary.expires], ["Scope", summary.scope]]} />
        </div>
      </ResponsiveDialog>
    </Motion>
  );
}

function ExcludedRow({ v, preview }: { v: VideoRow; preview?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className="inline-flex size-[38px] flex-none items-center justify-center rounded-[14px] bg-warn-tint text-warn-text"><Icon name={v.excludeReason === "Licensed music" ? "music" : "film"} size={18} /></span>
      <div className="min-w-0 grow">
        <div className="truncate text-sm font-semibold text-text">{v.title}</div>
        <div className="text-[13px] text-muted">{v.excludeReason ?? "Excluded"}</div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() => {
          if (preview) return;
          start(async () => {
            const r = await setVideoExcludedAction(v.id, false);
            if (!r.ok) toast.error("That didn’t work", { description: r.error });
            router.refresh();
          });
        }}
      >
        Include
      </Button>
    </li>
  );
}

export function LicenseTermsLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={280} h={36} /><Sk w={300} h={15} /></div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-[18px]">{Array.from({ length: 7 }, (_, i) => <Sk key={i} w={i % 2 ? "100%" : "45%"} h={i % 2 ? 44 : 13} r={i % 2 ? 14 : 6} />)}</div>
        <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-[18px]"><Sk w="40%" h={16} /><Sk w="90%" h={13} /><Sk w="100%" h={100} r={14} /></div>
      </div>
      <span className="sr-only" role="status">Loading your terms…</span>
    </div>
  );
}
