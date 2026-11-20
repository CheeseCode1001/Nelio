"use client";

import { LIMITS, PLATFORM_LABEL, validatePost, withAttribution, type Destination, type FieldKey, type PostContent, type PostKind } from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, Chip, Icon, Motion, PlatformBadge, ResponsiveDialog, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { toast } from "@/components/feedback/toaster";
import { useState, useTransition } from "react";
import { rewriteAction, saveDraftAction } from "@/lib/actions/content";
import type { ComposerData, MediaChoice } from "@/lib/content";

const fmt = (n: number) => n.toLocaleString("en-US");
const CONTROL = "box-border w-full rounded-input border-2 bg-surface-1 px-4 py-3 font-body text-sm text-text";

function TextArea({ id, label, value, onChange, limit, error, rows = 4, note }: { id: string; label: string; value: string; onChange: (v: string) => void; limit: number; error?: string; rows?: number; note?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-text">{label}</label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={`${id}-hint`} className={cn(CONTROL, "min-h-[100px]", error ? "border-err-text" : "border-border")} />
      <div id={`${id}-hint`} className={cn("text-[12.5px]", error ? "font-semibold text-err-text" : "text-muted")}>{error ?? `${fmt(value.length)} / ${fmt(limit)}${note ? ` · ${note}` : ""}`}</div>
    </div>
  );
}

function Input({ id, label, value, onChange, error, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-text">{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-hint` : undefined} className={cn(CONTROL, "min-h-12", error ? "border-err-text" : "border-border")} />
      {error || hint ? <div id={`${id}-hint`} className={cn("text-[12.5px]", error ? "font-semibold text-err-text" : "text-muted")}>{error ?? hint}</div> : null}
    </div>
  );
}

function Thumb({ m, className }: { m: MediaChoice | null; className?: string }) {
  return (
    <span className={cn("relative flex-none overflow-hidden rounded-[10px] border-2 border-outline bg-violet", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL */}
      {m?.posterUrl ? <img src={m.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" /> : null}
    </span>
  );
}

/** CS-02 Post composer: Filled, Invalid, No account connected and script mode, desktop and mobile. */
export function Composer({ slug, d, hrefs, connected = false }: { slug?: string; d: ComposerData; hrefs: { content: string; connect: string; exports: string; draftBase: string }; connected?: boolean }) {
  const router = useRouter();
  const draftHref = (id: string) => `${hrefs.draftBase}/${id}`;
  const attributed = (c: PostContent, m: MediaChoice | null): PostContent =>
    m?.license?.attribution ? { ...c, instagram: { ...c.instagram, caption: withAttribution(c.instagram.caption, m.license.attribution) }, youtube: { ...c.youtube, description: withAttribution(c.youtube.description, m.license.attribution) } } : c;
  const [content, setContent] = useState<PostContent>(() => (d.kind === "script" ? d.content : attributed(d.content, d.media)));
  const [media, setMediaState] = useState<MediaChoice | null>(d.media);
  const setMedia = (m: MediaChoice | null) => {
    setMediaState(m);
    if (m?.license?.attribution) setContent((c) => attributed(c, m));
  };
  const [platforms, setPlatforms] = useState<Destination[]>(d.platforms);
  // Open on the platform that needs attention, so a problem is never hidden behind the other tab.
  const [tab, setTab] = useState<Destination>(() => {
    const p = validatePost(d.kind, d.content);
    return !p["instagram.caption"] && !p["instagram.firstComment"] && (p["youtube.title"] || p["youtube.description"]) ? "youtube" : (d.platforms[0] ?? "instagram");
  });
  const [picking, setPicking] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [rewriting, startRewrite] = useTransition();
  const script = d.kind === "script";
  const problems = validatePost(d.kind, content);
  const err = (k: FieldKey) => problems[k];

  const setIg = (patch: Partial<PostContent["instagram"]>) => setContent((c) => ({ ...c, instagram: { ...c.instagram, ...patch } }));
  const setYt = (patch: Partial<PostContent["youtube"]>) => setContent((c) => ({ ...c, youtube: { ...c.youtube, ...patch } }));

  const save = () => {
    if (!slug) return setNotice({ tone: "ok", text: "Previews don’t save." });
    setNotice(null);
    startSave(async () => {
      const r = await saveDraftAction(slug, d.draftId, { kind: d.kind, renderId: media?.renderId ?? null, platforms, content });
      if (!r.ok) return setNotice({ tone: "err", text: r.error });
      toast.success("Draft saved");
      if (!d.draftId) router.replace(draftHref(r.draftId));
      else router.refresh();
    });
  };
  const rewrite = () => {
    if (!slug) return setNotice({ tone: "ok", text: "Previews don’t call Nelio AI." });
    const field = script ? "script" : tab === "instagram" ? "instagram.caption" : "youtube.title";
    const text = script ? content.script : tab === "instagram" ? content.instagram.caption : content.youtube.title;
    setNotice(null);
    startRewrite(async () => {
      const r = await rewriteAction(slug, { field, text, context: media ? `${media.title}; on-screen hook: ${media.hook}` : "" });
      if (!r.ok) return setNotice({ tone: "err", text: r.error });
      if (script) setContent((c) => ({ ...c, script: r.text }));
      else if (tab === "instagram") setIg({ caption: r.text });
      else setYt({ title: r.text.slice(0, 120) });
    });
  };

  const previewText = script ? content.script : tab === "instagram" ? content.instagram.caption : content.youtube.title;
  const hasProblems = Object.keys(problems).length > 0;

  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
              <a href={hrefs.content} className="tap-target text-muted no-underline hover:text-text">Content Studio</a> › {script ? "Script" : "Compose"}
            </nav>
            <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">{d.draftId ? (script ? "Edit script" : "Edit post") : script ? "New script" : "New post"}</h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={save} loading={saving}>Save draft</Button>
            {!script ? <Button icon="check" disabled={!connected || hasProblems || !platforms.length}>Submit for approval</Button> : null}
          </div>
        </header>
        {notice ? <Banner tone={notice.tone} title={notice.tone === "ok" ? notice.text : "That didn’t work"} text={notice.tone === "err" ? notice.text : undefined} /> : null}
      </div>

      <div data-enter="" className="grid grid-cols-1 gap-4 lg:[grid-template-columns:minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          {!script ? (
            <Card>
              <CardHead title="Media" />
              <div className="flex items-center gap-3">
                <Thumb m={media} className="h-[100px] w-14" />
                <div className="flex min-w-0 grow flex-col gap-0.5">
                  <h3 className="m-0 truncate text-[15px] font-bold text-text">{media ? media.title : "No clip yet"}</h3>
                  <span className="text-[12.5px] font-medium text-muted">{media ? media.sub : d.choices.length ? "Add a rendered clip, or post text only." : "Render a clip in the Clipping Studio to add it here."}</span>
                </div>
                {d.choices.length ? <Button variant="ghost" size="sm" onClick={() => setPicking(true)}>{media ? "Change" : "Add clip"}</Button> : <ButtonLink variant="ghost" size="sm" href={hrefs.exports}>Exports</ButtonLink>}
              </div>
            </Card>
          ) : null}

          {!script ? (
            <Card>
              <CardHead title="Post to" />
              {!connected ? <Banner tone="blue" title="Connect an account to schedule" text="You can still save the draft and download the video." action={<ButtonLink href={hrefs.connect} variant="secondary" size="sm">Connect</ButtonLink>} /> : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([["instagram", "Instagram Reels", "ig"], ["youtube", "YouTube Shorts", "yt"]] as const).map(([key, name, badge]) => (
                  <section key={key} className="flex min-w-0 flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-5">
                    <div className="flex items-center gap-2.5">
                      <PlatformBadge platform={badge} size={36} />
                      <div className="flex min-w-0 flex-col gap-px">
                        <h3 className="m-0 text-[15px] font-bold text-text">{name}</h3>
                        <span className="text-[12.5px] font-medium text-muted">{connected ? d.workspace.name : "Not connected"}</span>
                      </div>
                    </div>
                    <label className="tap-target flex items-start gap-2.5 text-sm font-semibold text-text">
                      <input type="checkbox" checked={platforms.includes(key)} onChange={(e) => setPlatforms((p) => (e.target.checked ? [...p, key] : p.filter((x) => x !== key)))} className="mt-px size-5 flex-none accent-[var(--color-accent)]" />
                      {connected ? "Include" : "Include (not connected)"}
                    </label>
                  </section>
                ))}
                {([["TikTok", "tt"], ["Facebook", "fb"]] as const).map(([name, badge]) => (
                  <section key={name} className="flex min-w-0 items-center gap-2.5 rounded-card border border-border bg-surface-1 p-5">
                    <PlatformBadge platform={badge} size={36} />
                    <h3 className="m-0 text-[15px] font-bold text-text">{name}</h3>
                    <span className="grow" />
                    <Chip>Coming later</Chip>
                  </section>
                ))}
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="flex flex-wrap items-center gap-2.5">
              {!script ? (
                <div role="tablist" aria-label="Platform text" className="flex gap-0.5 rounded-full border border-border bg-surface-1 p-1">
                  {(["instagram", "youtube"] as const).map((p) => (
                    <button key={p} type="button" role="tab" aria-selected={tab === p} onClick={() => setTab(p)} className={cn("tap-target min-h-10 cursor-pointer rounded-full border-0 px-4 py-[9px] text-sm font-bold", tab === p ? "bg-ink text-on-ink" : "bg-transparent text-muted")}>
                      {p === "instagram" ? "Instagram" : "YouTube"}{(p === "instagram" ? err("instagram.caption") || err("instagram.firstComment") : err("youtube.title") || err("youtube.description")) ? <span className="sr-only"> (has a problem)</span> : null}
                    </button>
                  ))}
                </div>
              ) : <h3 className="m-0 font-display text-[17px] font-bold text-text">Script</h3>}
              <span className="grow" />
              <Button variant="ai" size="sm" icon="sparkle" onClick={rewrite} loading={rewriting}>{(script ? content.script : tab === "instagram" ? content.instagram.caption : content.youtube.title).trim() ? "Rewrite with Nelio AI" : "Write with Nelio AI"}</Button>
            </div>
            {script ? (
              <TextArea id="script" label="Script" rows={12} value={content.script} onChange={(v) => setContent((c) => ({ ...c, script: v }))} limit={LIMITS.script} error={err("script")} />
            ) : tab === "instagram" ? (
              <>
                <TextArea id="ig-caption" label="Caption" value={content.instagram.caption} onChange={(v) => setIg({ caption: v })} limit={LIMITS.instagram.caption} error={err("instagram.caption")} note={media?.license?.attribution ? "attribution added automatically" : undefined} />
                <Input id="ig-comment" label="First comment (optional)" value={content.instagram.firstComment} onChange={(v) => setIg({ firstComment: v })} error={err("instagram.firstComment")} />
              </>
            ) : (
              <>
                <Input id="yt-title" label="YouTube title" value={content.youtube.title} onChange={(v) => setYt({ title: v })} error={err("youtube.title")} hint={`${content.youtube.title.length} / ${LIMITS.youtube.title}`} />
                <TextArea id="yt-description" label="Description (optional)" value={content.youtube.description} onChange={(v) => setYt({ description: v })} limit={LIMITS.youtube.description} error={err("youtube.description")} rows={3} />
              </>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="flex flex-col gap-2.5 rounded-[30px] border border-border bg-surface-1 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-[30px] items-center justify-center rounded-full bg-yellow text-[11px] font-extrabold text-outline">{d.workspace.initial}</span>
              <span className="text-[12.5px] font-bold text-text">{d.workspace.name} · {script ? "Script" : tab === "instagram" ? "Reel" : "Short"}</span>
            </div>
            {!script ? (
              <div className="relative mx-auto aspect-[260/462] w-full max-w-[260px] overflow-hidden rounded-[22px] border-2 border-outline bg-violet">
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL */}
                {media?.posterUrl ? <img src={media.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" /> : null}
                {media?.hook ? (
                  <div className="absolute inset-x-3 bottom-[18%] flex justify-center"><span className="rounded-lg border-2 border-outline bg-yellow px-2.5 py-[3px] text-center font-display text-[15px] font-extrabold text-outline">{media.hook.toUpperCase()}</span></div>
                ) : null}
                {media ? <span aria-hidden="true" className="absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,11,20,0.75)] text-white"><Icon name="play" size={24} /></span> : null}
              </div>
            ) : null}
            <p className={cn("m-0 whitespace-pre-wrap break-words text-[13px] text-text", script && "max-h-[520px] overflow-y-auto")}>{previewText || <span className="text-muted">Your {script ? "script" : "caption"} shows here.</span>}</p>
          </div>
          {!script && media && media.license && !media.license.ok ? <Banner tone="err" title="License stopped" text={`${media.license.message} This post can’t be scheduled.`} /> : !script && media ? <Banner tone="ok" title="License OK" text={media.rights} /> : null}
          {!script && media?.license?.ok && platforms.some((p) => !media.license!.platforms.includes(p)) ? (
            <Banner tone="warn" title="Not covered by the license" text={`${media.license.creator}’s license doesn’t allow ${platforms.filter((p) => !media.license!.platforms.includes(p)).map((p) => PLATFORM_LABEL[p]).join(" or ")}. Untick it before you schedule.`} />
          ) : null}
          {!script && d.workspace.client ? <Banner tone="warn" title="Client approval required" text="Your client reviews each platform separately." /> : null}
        </div>
      </div>

      <ResponsiveDialog open={picking} onOpenChange={setPicking} title="Pick a clip" maxWidth={520}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {d.choices.map((c) => (
            <li key={c.renderId}>
              <button type="button" onClick={() => { setMedia(c); setPicking(false); }} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-row border-2 bg-surface-1 p-3 text-left", media?.renderId === c.renderId ? "border-accent" : "border-border")}>
                <Thumb m={c} className="h-[71px] w-10" />
                <span className="flex min-w-0 flex-col"><span className="truncate text-sm font-bold text-text">{c.title}</span><span className="text-[12.5px] text-muted">{c.sub}</span></span>
              </button>
            </li>
          ))}
        </ul>
        {media ? <Button variant="ghost" onClick={() => { setMedia(null); setPicking(false); }}>Post text only</Button> : null}
      </ResponsiveDialog>
    </Motion>
  );
}
