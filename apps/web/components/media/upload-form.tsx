"use client";

import { gooeyToast } from "goey-toast";
import { toast } from "@/components/feedback/toaster";
import { CAPTION_LANGUAGES, QUALITY_HELP, QUALITY_LABEL, checkUpload, formatBytes, formatDuration, processingEstimate, type Quality } from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, Chip, Icon, Illustration, Meter, SelectField, cn, TEXTAREA_CLASS, LABEL_CLASS } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cancelUploadAction, completeUploadAction, signPartsAction, startProcessingAction, startUploadAction } from "@/lib/actions/media";
import { readDuration, sendParts, uploadErrorText } from "@/lib/multipart-client";

type Rights = "own" | "permission" | "license";
type FileInfo = { name: string; size: number; type: string; durationSec: number | null };
type Phase =
  | { k: "idle" }
  | { k: "wrongtype"; text: string }
  | { k: "uploading"; file: FileInfo; sent: number; etaSec: number | null }
  | { k: "uploaded"; file: FileInfo }
  | { k: "failed"; file: FileInfo; text: string };

export interface UploadPreview { phase: Phase; rights?: Rights | null; norights?: boolean }

const TEXTAREA = TEXTAREA_CLASS;

/** CL-02 Upload: Filled, Uploading, Wrongtype, Norights. Balance and Lowcredits arrive with the credit wallet (Milestone 8). */
export function UploadForm({ slug, defaults, preview, studioBase, licensesHref }: { slug?: string; defaults: { quality: Quality; language: string }; preview?: UploadPreview; studioBase: string; licensesHref?: string }) {
  const id = useId();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>(preview?.phase ?? { k: "idle" });
  const [assetId, setAssetId] = useState<string | null>(null);
  const [rights, setRights] = useState<Rights | null>(preview?.rights ?? null);
  const [note, setNote] = useState("");
  const [quality, setQuality] = useState<Quality>(defaults.quality);
  const [language, setLanguage] = useState(defaults.language);
  const [norights, setNorights] = useState(preview?.norights ?? false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => () => abort.current?.abort(), []);

  const file = phase.k === "uploading" || phase.k === "uploaded" || phase.k === "failed" ? phase.file : null;
  const estimate = file?.durationSec ? processingEstimate(file.durationSec, quality) : null;

  async function pick(f: File) {
    if (preview) return;
    setError(null);
    const durationSec = f.type.startsWith("video/") || /\.(mp4|m4v|mov)$/i.test(f.name) ? await readDuration(f) : null;
    const info: FileInfo = { name: f.name, size: f.size, type: f.type, durationSec };
    const problem = checkUpload({ name: f.name, type: f.type, size: f.size, durationSec });
    if (problem) { setPhase({ k: "wrongtype", text: problem.text }); return; }
    if (!slug) return;
    const started = await startUploadAction(slug, { name: f.name, type: f.type, size: f.size, durationSec });
    if (!started.ok) { setPhase(started.field === "file" ? { k: "wrongtype", text: started.error } : { k: "failed", file: info, text: started.error }); return; }
    setAssetId(started.assetId);
    const t0 = Date.now();
    setPhase({ k: "uploading", file: info, sent: 0, etaSec: null });
    const ac = new AbortController();
    abort.current = ac;
    // Progress toast (Delight board): stays while the file uploads, so leaving the form still shows it.
    const toastId = `upload-${started.assetId}`;
    gooeyToast.info(`Uploading ${info.name}`, { id: toastId, description: `0 of ${formatBytes(info.size)} · keep this tab open`, duration: Infinity });
    let lastToast = 0;
    const report = (sent: number) => {
      const etaSec = sent > 0 ? (((Date.now() - t0) / sent) * (info.size - sent)) / 1000 : null;
      setPhase({ k: "uploading", file: info, sent, etaSec });
      if (Date.now() - lastToast > 1000) {
        lastToast = Date.now();
        gooeyToast.update(toastId, { description: `${formatBytes(sent)} of ${formatBytes(info.size)} · keep this tab open${etaSec !== null ? ` · ${etaSec < 60 ? "less than a minute" : `about ${Math.ceil(etaSec / 60)} min`}` : ""}` });
      }
    };
    try {
      const done = await sendParts({ file: f, partSize: started.partSize, partCount: started.partCount, sign: (parts) => signPartsAction(slug, started.assetId, parts), onProgress: report, signal: ac.signal });
      const fin = await completeUploadAction(slug, started.assetId, done);
      if (!fin.ok) throw new Error(fin.error);
      setPhase({ k: "uploaded", file: info });
      gooeyToast.dismiss(toastId);
      toast.success(`${info.name} uploaded`, { description: "Tell us who owns it to start processing." });
    } catch (e) {
      gooeyToast.dismiss(toastId);
      if (ac.signal.aborted) return;
      const msg = uploadErrorText(e);
      setPhase({ k: "failed", file: info, text: msg });
      toast.error(`${info.name} didn’t upload`, { description: msg });
    }
  }

  async function start() {
    if (preview || !slug) return;
    if (!rights) { setNorights(true); return; }
    if (!assetId || phase.k !== "uploaded") return;
    setStarting(true);
    setError(null);
    const r = await startProcessingAction(slug, assetId, { rights, rightsNote: note, quality, language });
    setStarting(false);
    if (!r.ok) { if (r.field === "rights") setNorights(true); setError(r.error); return; }
    router.push(`${studioBase}/${assetId}`);
  }

  async function cancel() {
    abort.current?.abort();
    if (slug && assetId) await cancelUploadAction(slug, assetId);
    setAssetId(null);
    setPhase({ k: "idle" });
  }

  const pct = phase.k === "uploading" ? Math.min(100, (phase.sent / Math.max(1, phase.file.size)) * 100) : 100;
  const eta = phase.k === "uploading" ? phase.etaSec : null;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        {/* The file */}
        <input ref={input} type="file" accept="video/mp4,video/quicktime,.mp4,.mov,.m4v" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void pick(f); }} />
        {file ? (
          <div className="flex flex-col gap-3 rounded-[32px] border-[3px] border-dashed border-accent bg-accent-tint p-5 md:p-8">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="inline-flex h-[72px] w-12 flex-none items-center justify-center rounded-xl border-2 border-outline bg-cyan text-outline"><Icon name="film" size={20} /></span>
              <div className="min-w-0 grow">
                <div className="truncate font-display text-lg font-bold text-text">{file.name}</div>
                <div className="text-[13px] text-muted">{formatBytes(file.size)} · {formatDuration(file.durationSec)} · {file.name.split(".").pop()?.toUpperCase()}</div>
              </div>
              {phase.k === "uploading" ? <Chip tone="blue" icon="upload">Uploading {Math.floor(pct)}%</Chip> : phase.k === "uploaded" ? <Chip tone="ok" icon="check">Uploaded</Chip> : <Chip tone="err" icon="alert">Stopped</Chip>}
            </div>
            {phase.k === "uploading" ? (
              <>
                <Meter pct={pct} ariaLabel={`Uploading ${Math.floor(pct)}%`} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                  <button type="button" onClick={cancel} className="tap-target cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-text">Cancel</button>
                  <span>{formatBytes(phase.sent)} of {formatBytes(phase.file.size)}{eta !== null ? ` · ${eta < 60 ? "less than a minute" : `about ${Math.ceil(eta / 60)} min`} left` : ""}</span>
                </div>
              </>
            ) : phase.k === "failed" ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="alert" className="m-0 text-sm font-semibold text-err-text">{phase.text}</p>
                <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>Choose file again</Button>
              </div>
            ) : null}
          </div>
        ) : phase.k === "wrongtype" ? (
          <div className="flex flex-col items-center gap-3 rounded-[32px] border-[3px] border-dashed border-err-text bg-err-tint p-6 text-center md:p-8">
            <Illustration name="notfound_content" width={180} />
            <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.03em] text-text md:text-[26px]">We can’t use that file</h2>
            <p role="alert" className="m-0 text-sm text-muted">{phase.text}</p>
            <Button icon="upload" onClick={() => input.current?.click()}>Choose another file</Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) void pick(f); }}
            className={cn("flex flex-col items-center gap-3 rounded-[32px] border-[3px] border-dashed border-accent bg-accent-tint p-6 text-center md:p-8", drag && "bg-surface-1")}
          >
            <Illustration name="upload" width={220} />
            <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.03em] text-text md:text-[26px]">Drop a video here</h2>
            <p className="m-0 text-sm text-muted">MP4 or MOV · up to 2 GB · up to 2 hours (provisional)</p>
            <Button icon="upload" onClick={() => input.current?.click()}>Choose file</Button>
          </div>
        )}

        {/* Who owns it */}
        <Card>
          <CardHead title="Who owns this video?" right={<span className="ml-auto"><Chip tone="warn">Required</Chip></span>} />
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0" aria-describedby={norights && !rights ? `${id}-nr` : undefined}>
            <legend className="sr-only">Who owns this video?</legend>
            {([["own", "I own this content", "I made it, or my company did."], ["permission", "I have the owner’s permission", "You may be asked for proof later."], ["license", "It’s from a Nelio license", "Pick an active license instead."]] as const).map(([v, t, sub]) => (
              <label key={v} className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-[1.4] text-text">
                <input type="radio" name={`${id}-rights`} value={v} checked={rights === v} onChange={() => { setRights(v); setNorights(false); }} className="mt-px size-5 flex-none accent-accent" />
                <span>{t}<span className="block text-[13px] font-normal text-muted">{sub}</span></span>
              </label>
            ))}
          </fieldset>
          {norights && !rights ? <div id={`${id}-nr`}><Banner tone="err" title="Tell us who owns this video" text="Pick an option before we can process it." /></div> : null}
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${id}-note`} className={LABEL_CLASS}>Notes or proof (optional)</label>
            <textarea id={`${id}-note`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. link to agreement" className={TEXTAREA} />
          </div>
          {rights === "license" ? <Banner tone="blue" title="Pick an active license instead" text="Licensed videos come straight from the creator, so there’s nothing to upload. Open the creator from My licenses and choose “Clip this”." action={licensesHref ? <ButtonLink href={licensesHref} variant="secondary" size="sm">My licenses</ButtonLink> : undefined} /> : null}
          <Banner tone="blue" title="Public videos aren’t automatically licensed" text="If you found it online, you need the owner’s permission or a Nelio license." />
        </Card>
      </div>

      {/* Processing */}
      <Card>
        <CardHead title="Processing" />
        <div role="radiogroup" aria-label="Processing quality" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
          {(["fast", "balanced", "high"] as const).map((q) => (
            <button key={q} type="button" role="radio" aria-checked={quality === q} onClick={() => setQuality(q)} className={cn("tap-target min-h-10 cursor-pointer whitespace-nowrap rounded-full border-0 px-4 py-[9px] text-sm font-bold", quality === q ? "bg-ink text-on-ink" : "bg-transparent text-muted")}>
              {QUALITY_LABEL[q]}
            </button>
          ))}
        </div>
        <p className="m-0 text-[13px] text-muted">{QUALITY_HELP[quality === "high" ? "balanced" : quality]}{quality !== "fast" ? ` ${QUALITY_HELP.high}` : ""}</p>
        <SelectField label="Caption language" value={language} onChange={(e) => setLanguage(e.target.value)} options={CAPTION_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))} />
        <dl className="m-0 flex flex-col">
          <div className="flex justify-between gap-3 border-b border-border py-[11px]">
            <dt className="text-[13px] text-muted">Estimated cost</dt>
            <dd className="m-0 text-right text-sm font-bold text-text">{estimate !== null ? `≈ ${estimate} credits` : "—"}</dd>
          </div>
        </dl>
        <p className="m-0 text-[12.5px] text-muted">Credit amounts are provisional until launch. You’ll always see the estimate before anything runs.</p>
        {error ? <p role="alert" className="m-0 text-[13px] font-semibold text-err-text">{error}</p> : null}
        <Button variant="cta" arrow size="lg" full loading={starting} disabled={(phase.k !== "uploaded" && !preview) || rights === "license"} onClick={start}>Start processing</Button>
      </Card>
    </div>
  );
}
