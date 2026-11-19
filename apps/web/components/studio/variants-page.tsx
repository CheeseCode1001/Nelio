"use client";

import { CAPTION_STYLES, renderEstimate, type Variant } from "@nelio/domain";
import { Banner, Button, ButtonLink, Motion, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { generateVariantsAction, renderVariantsAction } from "@/lib/actions/studio";
import type { VariantsData } from "@/lib/exports";

const SKELETON_LABELS = ["Hook A · bold pop", "Hook B · question", "Hook C · number", "No captions", "1:1 square", "Minimal captions"];
const BACKDROP = ["bg-violet", "bg-cyan", "bg-orange", "bg-lime", "bg-yellow", "bg-pink"];

function overlayText(v: Variant): string {
  const h = v.settings.hook;
  if (!h) return "";
  return "lower" in CAPTION_STYLES[v.settings.captionStyle] ? h.toLowerCase() : h.toUpperCase();
}

/** CL-04 Batch variants: Filled, Generating and the not-enough-room states, desktop and mobile. */
export function VariantsPage({ slug, d, hrefs, preview }: { slug?: string; d: VariantsData; hrefs: { studio: string; exports: string }; preview?: { generating?: boolean } }) {
  const router = useRouter();
  const [set, setSet] = useState(d.set);
  const [projectId, setProjectId] = useState(d.projectId);
  const [picked, setPicked] = useState<string[]>(() => (d.set?.items ?? []).filter((v) => v.selected).map((v) => v.key));
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState<number | null>(null);
  const [generating, startGen] = useTransition();
  const [rendering, startRender] = useTransition();
  const started = useRef(false);

  const generate = () => {
    if (!slug) return;
    setError(null);
    startGen(async () => {
      const r = await generateVariantsAction(slug, d.asset.id, projectId, d.base);
      if (!r.ok) return setError(r.error);
      setSet(r.set);
      setProjectId(r.projectId);
      setPicked(r.set.items.filter((v) => v.selected).map((v) => v.key));
    });
  };
  // The first visit makes the variants (Nelio AI writes two hooks; previews are free).
  useEffect(() => {
    if (started.current || set || d.blocked || !slug) return;
    started.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on first visit
  }, []);

  const isGenerating = Boolean(preview?.generating) || generating || (!set && !d.blocked && !error);
  const items = set?.items ?? [];
  const chosen = items.filter((v) => picked.includes(v.key));
  const cost = chosen.reduce((n, v) => n + renderEstimate((v.settings.endMs - v.settings.startMs) / 1000), 0);

  const render = () => {
    if (!slug || !projectId) return setQueued(chosen.length);
    setError(null);
    startRender(async () => {
      const r = await renderVariantsAction(slug, projectId, picked);
      if (!r.ok) return setError(r.error);
      setQueued(r.count);
      router.refresh();
    });
  };

  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
              <a href={hrefs.studio} className="tap-target text-muted no-underline hover:text-text">Studio</a> › Variants
            </nav>
            <h1 className="m-0 break-words font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">Variants · “{d.base.hook}”</h1>
            <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-muted">Test different hooks and formats. Pick the ones to render.</p>
          </div>
          <Button icon="film" onClick={render} loading={rendering} disabled={!chosen.length || isGenerating || Boolean(d.blocked)}>
            Render {chosen.length} selected · ≈{cost} cr
          </Button>
        </header>

        {d.blocked ? <Banner tone="err" title="Can’t make variants" text={d.blocked} action={<ButtonLink href={hrefs.studio} variant="secondary" size="sm">Back to Studio</ButtonLink>} /> : null}
        {isGenerating && !d.blocked ? <Banner tone="ai" title="Nelio AI is making 6 variants" text="About 1 minute. Previews are free; you only pay to render." /> : null}
        {!isGenerating && queued !== null ? <Banner tone="ok" title={`${queued} variant${queued === 1 ? " is" : "s are"} rendering`} text="You’ll be notified when they’re ready." action={<ButtonLink href={hrefs.exports} variant="secondary" size="sm">Open Exports</ButtonLink>} /> : null}
        {!isGenerating && queued === null && !error && set ? (
          // Balance ("You have N credits") arrives with the wallet (Milestone 8); until then the estimate alone is shown.
          <Banner tone="blue" title={`Rendering ${chosen.length} variant${chosen.length === 1 ? "" : "s"} uses about ${cost} credits`} text="Unselected variants aren’t charged." />
        ) : null}
        {error ? <Banner tone="err" title="That didn’t work" text={error} action={!set ? <Button variant="secondary" size="sm" onClick={generate}>Try again</Button> : undefined} /> : null}
      </div>

      <div data-enter="" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        {(isGenerating || !set
          ? SKELETON_LABELS.map((label, i) => ({ key: `sk${i}`, label, real: null as Variant | null }))
          : items.map((v) => ({ key: v.key, label: v.label, real: v as Variant | null }))
        ).map((v, i) => {
          const real = v.real;
          const on = real ? picked.includes(real.key) : i < 3;
          const id = `variant-${v.key}`;
          return (
            <section key={v.key} className="flex min-w-0 flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-5 shadow-card">
              <div className={cn("relative aspect-[170/303] overflow-hidden rounded-[22px] border-2", real ? `border-outline ${BACKDROP[i % BACKDROP.length]}` : "border-transparent bg-surface-3")}>
                {real && d.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                  <img src={d.posterUrl} alt="" aria-hidden="true" className={cn("absolute inset-0 size-full object-cover", real.settings.format === "1:1" && "inset-y-[21.9%] h-[56.2%]")} />
                ) : null}
                {real && overlayText(real) ? (
                  <div className="absolute inset-x-3 bottom-[18%] flex justify-center">
                    <span className={cn("rounded-lg border-2 border-outline bg-yellow px-2.5 py-[3px] text-center font-display text-[15px] font-extrabold leading-tight text-outline", real.settings.captionStyle === "minimal" && "font-bold")}>{overlayText(real)}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-start gap-2.5">
                <input id={id} type="checkbox" checked={on} disabled={!real} onChange={(e) => real && setPicked((p) => (e.target.checked ? [...p, real.key] : p.filter((k) => k !== real.key)))} className="mt-px size-5 flex-none accent-[var(--color-accent)]" />
                <label htmlFor={id} className="tap-target text-sm font-semibold text-text">{v.label}</label>
              </div>
            </section>
          );
        })}
      </div>
    </Motion>
  );
}
