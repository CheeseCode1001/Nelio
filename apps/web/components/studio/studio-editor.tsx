"use client";

import {
  CAPTION_STYLES, CLIP_FORMATS, captionChunks, clampClip, describeChanges, formatRange, formatStamp, renderEstimate,
  type CaptionStyle, type ClipFormat, type ClipSnapshot,
} from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, Chip, GlassChip, Icon, KeyValues, PlayDisc, ResponsiveDialog, SelectField, ShortFrame, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { editWithWordsAction, saveVersionAction, startRenderAction } from "@/lib/actions/studio";
import type { StudioData, StudioMoment } from "@/lib/studio";

export interface StudioHrefs { library: string; variants: string }

const SPEAKER_TONE = ["text-accent-text", "text-ai-text", "text-ok-text", "text-warn-text"];

function fromMoment(m: StudioMoment, kit: string | null): ClipSnapshot {
  return { startMs: m.startMs, endMs: m.endMs, hook: m.hook, captionStyle: "bold_pop", captionSize: 100, format: "9:16", brandKitId: kit };
}

function initialSnapshot(d: StudioData): ClipSnapshot {
  if (d.project) return d.project.saved;
  const kit = d.brandKits[0]?.id ?? null;
  if (d.moments[0]) return fromMoment(d.moments[0], kit);
  return { ...clampClip(0, 30_000, d.asset.durationMs), hook: d.asset.title.slice(0, 48), captionStyle: "bold_pop", captionSize: 100, format: "9:16", brandKitId: kit };
}

const same = (a: ClipSnapshot, b: ClipSnapshot) => JSON.stringify(a) === JSON.stringify(b);

/** Header: breadcrumb, title and the Versions / Variants / Render actions (CL-03). */
export function StudioHeader({ d, hrefs, onVersions, onRender, renderDisabled, estimate }: { d: StudioData; hrefs: StudioHrefs; onVersions?: () => void; onRender?: () => void; renderDisabled?: boolean; estimate: number }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
          <a href={hrefs.library} className="tap-target text-muted no-underline hover:text-text">Clipping Studio</a> › {d.asset.title}
        </nav>
        <h1 className="m-0 break-words font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">{d.asset.title} · Studio</h1>
        <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-muted">{d.asset.sub}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" icon="clock" onClick={onVersions} disabled={!onVersions}>Versions</Button>
        <ButtonLink variant="secondary" icon="grid" href={hrefs.variants}>Variants</ButtonLink>
        <Button icon="film" onClick={onRender} disabled={renderDisabled || !onRender}>Render · ≈{estimate} cr</Button>
      </div>
    </header>
  );
}

/** CL-03 editor: moments, transcript, preview, timeline, style and Edit with words. */
export function StudioEditor({ slug, d, hrefs, preview }: { slug?: string; d: StudioData; hrefs: StudioHrefs; preview?: { unsaved?: boolean; estimate?: boolean; queued?: boolean } }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(d.project?.id ?? null);
  const [saved, setSaved] = useState<ClipSnapshot>(() => initialSnapshot(d));
  const [snap, setSnap] = useState<ClipSnapshot>(() => (preview?.unsaved ? { ...initialSnapshot(d), endMs: initialSnapshot(d).endMs - 2000, captionSize: 120 } : initialSnapshot(d)));
  const [hasProject, setHasProject] = useState(Boolean(d.project) || Boolean(preview?.unsaved));
  const [queued, setQueued] = useState(Boolean(d.render) || Boolean(preview?.queued));
  const [estimateOpen, setEstimateOpen] = useState(Boolean(preview?.estimate));
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [pending, start] = useTransition();
  const [aiPending, startAi] = useTransition();

  const blocked = d.blocked;
  const changes = describeChanges(saved, snap);
  const unsaved = hasProject && !same(saved, snap);
  const clipMs = snap.endMs - snap.startMs;
  const estimate = renderEstimate(clipMs / 1000);
  const words = useMemo(() => d.words.map(([s, e, w]) => ({ s, e, w, sp: 0 })), [d.words]);
  const chunks = useMemo(() => captionChunks(words, snap.startMs, snap.endMs, snap.captionStyle), [words, snap.startMs, snap.endMs, snap.captionStyle]);
  // The moment last picked stays selected while it's trimmed; one that no longer overlaps the clip is cleared.
  const [momentId, setMomentId] = useState<string | null>(() => d.moments.find((m) => m.startMs === initialSnapshot(d).startMs)?.id ?? null);
  const picked = d.moments.find((m) => m.id === momentId);
  const selectedMoment = picked && picked.endMs > snap.startMs && picked.startMs < snap.endMs ? picked.id : null;

  // ------------------------------------------------------------- preview playback
  const video = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0); // ms into the clip
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.currentTime = snap.startMs / 1000;
  }, [snap.startMs]);
  const onTime = () => {
    const v = video.current;
    if (!v) return;
    const ms = v.currentTime * 1000;
    if (ms >= snap.endMs) {
      v.pause();
      v.currentTime = snap.startMs / 1000;
      setT(0);
      return;
    }
    setT(Math.max(0, ms - snap.startMs));
  };
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime * 1000 < snap.startMs || v.currentTime * 1000 >= snap.endMs) v.currentTime = snap.startMs / 1000;
      void v.play().catch(() => {});
    } else v.pause();
  };
  const seek = (fraction: number) => {
    const v = video.current;
    const ms = Math.round(Math.min(1, Math.max(0, fraction)) * clipMs);
    setT(ms);
    if (v) v.currentTime = (snap.startMs + ms) / 1000;
  };
  const overlay = t < 3000 || !playing ? snap.hook.toUpperCase() : chunks.find((c) => t >= c.start && t < c.end)?.text ?? "";

  // ------------------------------------------------------------- edits
  const set = (patch: Partial<ClipSnapshot>) => {
    setNote(null);
    setSnap((s) => {
      const next = { ...s, ...patch };
      return { ...next, ...clampClip(next.startMs, next.endMs, d.asset.durationMs) };
    });
  };
  const pickMoment = (m: StudioMoment) => {
    const next = { ...snap, startMs: m.startMs, endMs: m.endMs, hook: m.hook };
    setMomentId(m.id);
    setSnap(next);
    if (!hasProject) setSaved(next);
    setNote(null);
  };

  // Transcript: select text across lines to set the clip; click a line to start the clip there.
  const transcript = useRef<HTMLDivElement>(null);
  const lineFor = (n: Node | null) => (n instanceof Element ? n : n?.parentElement)?.closest<HTMLElement>("[data-line]");
  const onSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const a = lineFor(sel.anchorNode);
    const b = lineFor(sel.focusNode);
    if (!a || !b || !transcript.current?.contains(a) || !transcript.current.contains(b)) return;
    const ia = Number(a.dataset.line), ib = Number(b.dataset.line);
    const first = d.lines[Math.min(ia, ib)], last = d.lines[Math.max(ia, ib)];
    if (first && last) set({ startMs: first.start, endMs: last.end });
  };
  const startAt = (i: number, extend: boolean) => {
    const l = d.lines[i];
    if (!l) return;
    if (extend) set({ endMs: Math.max(l.end, snap.startMs + 1) });
    else set({ startMs: l.start, endMs: l.start + clipMs });
  };
  useEffect(() => {
    const box = transcript.current;
    const first = box?.querySelector<HTMLElement>("[data-in='true']");
    if (box && first) box.scrollTop = first.offsetTop - box.offsetTop - 8;
  }, [snap.startMs]);

  const save = () => {
    if (!slug) return setSaved(snap);
    setError(null);
    start(async () => {
      const r = await saveVersionAction(slug, d.asset.id, projectId, snap);
      if (!r.ok) return setError(r.error);
      setProjectId(r.projectId);
      setSaved(snap);
      setHasProject(true);
      router.refresh();
    });
  };
  const render = () => {
    if (!slug) {
      setEstimateOpen(false);
      setQueued(true);
      return;
    }
    setError(null);
    start(async () => {
      const r = await startRenderAction(slug, d.asset.id, projectId, snap);
      setEstimateOpen(false);
      if (!r.ok) return setError(r.error);
      setProjectId(r.projectId);
      setSaved(snap);
      setHasProject(true);
      setQueued(true);
      router.refresh();
    });
  };
  const applyWords = () => {
    if (!editText.trim()) return;
    if (!slug) return setNote("Previews don’t call Nelio AI.");
    setError(null);
    startAi(async () => {
      const r = await editWithWordsAction(slug, d.asset.id, snap, editText);
      if (!r.ok) return setError(r.error);
      setNote(r.summary);
      if (r.understood) {
        setSnap(r.snapshot);
        setHasProject(true);
        setEditText("");
      }
    });
  };

  const kit = d.brandKits.find((k) => k.id === snap.brandKitId) ?? null;
  const fmt = CLIP_FORMATS[snap.format];
  const playhead = clipMs ? t / clipMs : 0;

  return (
    <div className="flex flex-col gap-5">
      <StudioHeader d={d} hrefs={hrefs} estimate={estimate} onVersions={() => setVersionsOpen(true)} onRender={() => setEstimateOpen(true)} renderDisabled={Boolean(blocked) || queued} />

      {blocked ? <Banner tone="err" title={blocked.title} text={blocked.text} action={<ButtonLink href={hrefs.library} variant="secondary" size="sm">Pick another source</ButtonLink>} /> : null}
      {queued ? <Banner tone="blue" title="Render queued" text="About 3 minutes. You can leave this page; we’ll notify you." /> : null}
      {unsaved && !queued ? <Banner tone="blue" title="You have unsaved edits" text={changes} action={<Button variant="secondary" size="sm" onClick={save} loading={pending}>Save version</Button>} /> : null}
      {error ? <Banner tone="err" title="That didn’t work" text={error} /> : null}

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:[grid-template-columns:minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Column 1: moments and transcript */}
        <div className="flex min-w-0 flex-col gap-3.5">
          <Card className="gap-2.5">
            <CardHead title="Best moments" right={<span className="text-[12.5px] font-medium text-muted">Ranked by Nelio AI</span>} />
            {d.moments.length ? (
              <div className="flex flex-col gap-2.5" role="listbox" aria-label="Best moments">
                {d.moments.map((m) => {
                  const on = m.id === selectedMoment;
                  return (
                    <button key={m.id} type="button" role="option" aria-selected={on} onClick={() => pickMoment(m)} className={cn("flex cursor-pointer flex-col gap-2 rounded-[20px] border-2 p-3.5 text-left", on ? "border-accent bg-accent-tint" : "border-border bg-surface-1")}>
                      <span className="text-[15px] font-bold text-text">“{m.title}”</span>
                      <span className="flex flex-wrap gap-1.5">
                        <Chip tone="ai" icon="sparkle">score {m.score}</Chip>
                        <Chip icon="clock">{formatRange(m.startMs, m.endMs)}</Chip>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="m-0 text-sm text-muted">Nelio AI didn’t find a standalone moment. Select text in the transcript to make a clip yourself.</p>
            )}
            <span className="text-[12.5px] font-medium text-muted">Scores estimate how well a moment works as a short, not a promise of views.</span>
          </Card>

          <Card>
            <CardHead title="Transcript" right={<span className="text-[12.5px] font-medium text-muted">Select text to set the clip</span>} />
            {d.lines.length ? (
              <div ref={transcript} onMouseUp={onSelect} onTouchEnd={onSelect} className="relative -mx-1 flex max-h-[420px] flex-col gap-0.5 overflow-y-auto px-1">
                {d.lines.map((l, i) => {
                  const inClip = l.end > snap.startMs && l.start < snap.endMs;
                  return (
                    <div
                      key={i}
                      data-line={i}
                      data-in={inClip}
                      tabIndex={0}
                      aria-label={`${formatStamp(l.start)}, speaker ${l.sp + 1}: ${l.text}. Press Enter to start the clip here, Shift and Enter to end it here.`}
                      onClick={(e) => { if (window.getSelection()?.isCollapsed) startAt(i, e.shiftKey); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); startAt(i, e.shiftKey); } }}
                      className={cn("flex cursor-text gap-3 rounded-xl px-2.5 py-2", inClip && "bg-accent-tint")}
                    >
                      <span className="w-[42px] flex-none text-xs text-muted">{formatStamp(l.start)}</span>
                      <span className={cn("w-10 flex-none text-xs font-extrabold", SPEAKER_TONE[l.sp % SPEAKER_TONE.length])}>S{l.sp + 1}</span>
                      <span className="min-w-0 text-sm text-text">{l.text}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="m-0 text-sm text-muted">No speech was found in this video, so there’s nothing to select. You can still render the clip.</p>
            )}
          </Card>
        </div>

        {/* Column 2: preview and timeline */}
        <div className="flex min-w-0 flex-col gap-3.5">
          <ShortFrame
            label="Clip preview"
            aspect={`${fmt.width}/${fmt.height}`}
            className={cn("mx-auto", snap.format === "9:16" ? "max-w-[340px]" : "")}
            media={
              d.videoUrl ? (
                <video
                  ref={video}
                  src={`${d.videoUrl}#t=${snap.startMs / 1000}`}
                  poster={d.posterUrl ?? undefined}
                  playsInline
                  preload="metadata"
                  onTimeUpdate={onTime}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : d.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                <img src={d.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
              ) : null
            }
            hook={overlay || null}
            hookStyle={{ fontSize: Math.round(15 * (snap.captionSize / 100)) }}
            chips={<Chip tone="blue" icon="shield">{d.asset.rightsLabel}</Chip>}
            center={<PlayDisc playing={playing} onClick={toggle} disabled={!d.videoUrl} />}
            title={d.moments.find((m) => m.id === selectedMoment)?.title ?? snap.hook}
            meta={`${formatRange(snap.startMs, snap.endMs).replace("–", " → ")} · ${Math.round(clipMs / 1000)} s · ${snap.format}`}
            right={<GlassChip icon="type">{CAPTION_STYLES[snap.captionStyle].label}</GlassChip>}
          />

          <Card>
            <div className="flex items-center gap-2.5">
              <h3 className="m-0 font-display text-[17px] font-bold text-text">Timeline</h3>
              <span className="grow" />
              <span className="text-[12.5px] font-medium text-muted">{formatRange(0, clipMs).replace("–", " – ")}</span>
              <button type="button" onClick={toggle} disabled={!d.videoUrl} aria-label={playing ? "Pause" : "Play"} className="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface-1 text-text">
                <Icon name={playing ? "pause" : "play"} size={18} />
              </button>
            </div>
            <div className="relative flex flex-col gap-2">
              {(["Video", "Captions", "Brand", "Audio"] as const).map((track) => (
                <div key={track} className="flex items-center gap-2.5">
                  <span className="w-[70px] flex-none text-xs font-bold text-muted">{track}</span>
                  <div
                    className="relative h-[38px] min-w-0 grow cursor-pointer rounded-xl bg-surface-2"
                    onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); }}
                    aria-hidden="true"
                  >
                    {track === "Video" ? <span className="absolute inset-y-[5px] left-0 right-0 rounded-[9px] border-2 border-outline bg-violet" /> : null}
                    {track === "Audio" ? <span className="absolute inset-y-[5px] left-0 right-0 rounded-[9px] border-2 border-outline bg-cyan" /> : null}
                    {track === "Captions"
                      ? chunks.map((c, i) => (
                          <span key={i} className="absolute inset-y-[5px] rounded-[9px] border-2 border-outline bg-yellow" style={{ left: `${(c.start / clipMs) * 100}%`, width: `max(6px, calc(${((c.end - c.start) / clipMs) * 100}% - 3px))` }} />
                        ))
                      : null}
                    {track === "Brand" && kit ? (
                      <>
                        <span className="absolute inset-y-[5px] left-0 w-[22px] rounded-[9px] border-2 border-outline bg-pink" />
                        <span className="absolute inset-y-[5px] right-0 w-[22px] rounded-[9px] border-2 border-outline bg-pink" />
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
              <span aria-hidden="true" className="pointer-events-none absolute -top-1 -bottom-1 w-[3px] rounded-sm bg-accent" style={{ left: `calc(80px + (100% - 80px) * ${playhead})` }} />
            </div>
            <span className="sr-only" role="status">{`Clip ${formatRange(snap.startMs, snap.endMs)}`}</span>
          </Card>
        </div>

        {/* Column 3: style and Edit with words */}
        <div className="flex min-w-0 flex-col gap-3.5 md:col-span-2 md:grid md:grid-cols-2 md:items-start xl:col-span-1 xl:flex">
          <Card>
            <CardHead title="Style" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <SelectField label="Caption style" name="captionStyle" value={snap.captionStyle} onChange={(e) => set({ captionStyle: e.target.value as CaptionStyle })} options={Object.entries(CAPTION_STYLES).map(([value, s]) => ({ value, label: s.label }))} />
              <SelectField label="Brand kit" name="brandKit" value={snap.brandKitId ?? ""} onChange={(e) => set({ brandKitId: e.target.value || null })} options={[...d.brandKits.map((k) => ({ value: k.id, label: k.name })), { value: "", label: "No brand kit" }]} />
              <SelectField label="Format" name="format" value={snap.format} onChange={(e) => set({ format: e.target.value as ClipFormat })} options={Object.entries(CLIP_FORMATS).map(([value, f]) => ({ value, label: f.label }))} />
              <SelectField label="Hook" name="hook" value={snap.hook} onChange={(e) => set({ hook: e.target.value })} options={[...new Set([snap.hook, ...d.moments.map((m) => m.hook)])].map((h) => ({ value: h, label: `“${h}”` }))} />
            </div>
            {snap.captionSize !== 100 ? <span className="text-[12.5px] font-medium text-muted">Captions at {snap.captionSize}% size</span> : null}
          </Card>

          <Card>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-[38px] flex-none items-center justify-center rounded-[14px] bg-ai-tint text-ai-text"><Icon name="wand" size={19} /></span>
              <h3 className="m-0 font-display text-[17px] font-bold text-text">Edit with words</h3>
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); applyWords(); }}>
              <label htmlFor="edit-words" className="sr-only">Describe an edit</label>
              <input id="edit-words" value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Cut the first pause and make captions bigger" maxLength={300} className="box-border min-h-12 min-w-0 grow rounded-full border-2 border-border bg-surface-1 px-4 py-3 text-sm text-text" />
              <Button type="submit" variant="ai" loading={aiPending} disabled={!editText.trim()}>Apply</Button>
            </form>
            {note ? <p role="status" className="m-0 text-[13px] text-muted">{note}</p> : null}
          </Card>
        </div>
      </div>

      <ResponsiveDialog open={estimateOpen} onOpenChange={setEstimateOpen} title="Render this clip?" maxWidth={440} hideTitle>
        <div className="flex items-center gap-3.5">
          <span className="inline-flex size-[35px] flex-none items-center justify-center rounded-[14px] bg-lime-tint text-lime-text"><Icon name="film" size={18} /></span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="m-0 font-display text-[26px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">Render this clip?</h2>
            <p className="m-0 text-sm text-muted">You’ll see the actual cost when it’s done. If it fails, credits are refunded.</p>
          </div>
        </div>
        {/* Balance and "after" rows arrive with the wallet (Milestone 8); until then only the estimate is shown. */}
        <KeyValues pairs={[[`Render 1 clip · 1080p`, `≈ ${estimate} credits`]]} />
        {unsaved ? <p className="m-0 text-[13px] text-muted">Your unsaved edits are saved as a new version first.</p> : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="ghost" onClick={() => setEstimateOpen(false)}>Cancel</Button>
          <span className="grow" />
          <Button variant="cta" arrow onClick={render} loading={pending}>Render</Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog open={versionsOpen} onOpenChange={setVersionsOpen} title="Versions" maxWidth={480}>
        {d.revisions.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {d.revisions.map((r) => (
              <li key={r.number} className="flex items-center gap-3 rounded-row border border-border px-4 py-3">
                <div className="min-w-0 grow">
                  <div className="text-sm font-bold text-text">Version {r.number}{d.project?.version === r.number ? " · current" : ""}</div>
                  <div className="text-[13px] text-muted">{r.when} · {formatRange(r.snapshot.startMs, r.snapshot.endMs)}{r.note ? ` · ${r.note}` : ""}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { setSnap(r.snapshot); setHasProject(true); setVersionsOpen(false); }} disabled={same(r.snapshot, snap)}>Restore</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-muted">No saved versions yet. Save your edits or render the clip to keep a version.</p>
        )}
        <Button variant="ghost" onClick={() => setVersionsOpen(false)}>Close</Button>
      </ResponsiveDialog>
    </div>
  );
}
