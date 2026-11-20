"use client";

import { Banner, Button, ButtonLink, Chip, EmptyState, Ghost, Icon, Motion, PageHead, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { cancelRenderAction, retryRenderAction } from "@/lib/actions/studio";
import type { ExportRow, ExportsData } from "@/lib/exports";
import { EXPORTS_SAMPLE } from "./sample";


function Head() {
  return <PageHead title="Exports" sub="Rendered clips ready to download or post." />;
}

function TrialBanner({ trial, plansHref }: { trial: NonNullable<ExportsData["trial"]>; plansHref: string }) {
  if (trial.used >= trial.cap) {
    return <Banner tone="warn" title="You’ve used both trial exports" text="Choose a plan to export more. Your clips are saved." action={<ButtonLink href={plansHref} variant="secondary" size="sm">See plans</ButtonLink>} />;
  }
  return <Banner tone="ai" title={`Trial: ${trial.used} of ${trial.cap} exports used`} text="Choose a plan any time to export more." />;
}

const THUMB = ["bg-violet", "bg-cyan", "bg-orange", "bg-lime", "bg-yellow", "bg-pink"];
/** Buttons on the dark card body: translucent ink, white text. */
const ON_DARK = "border-transparent bg-[rgba(11,11,20,0.35)] text-white hover:text-white";
/** The body colour follows the state of the render, flat and dark (Cards board "G", clip card). */
const BODY: Record<ExportRow["status"], string> = { queued: "bg-[#2A3A4A]", rendering: "bg-[#2A3A4A]", ready: "bg-[#3B4A2A]", failed: "bg-[#4A2A3A]", canceled: "bg-[#3A3A44]" };

/** CL-05 export as a clip card: picture with status and length, then title, source and format, credits and one action. */
function ExportCard({ r, action }: { r: ExportRow; action: ReactNode }) {
  const refunded = r.status === "failed" || r.status === "canceled";
  const rendering = r.progress !== null && r.status === "rendering";
  return (
    <article role="listitem" data-enter-item="" className={cn("box-border flex w-full min-w-0 flex-col overflow-hidden rounded-[26px] shadow-card", BODY[r.status])}>
      <div className={cn("relative aspect-[16/10] flex-none", THUMB[r.id.charCodeAt(0) % THUMB.length])}>
        {r.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
          <img src={r.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover [object-position:center_25%]" />
        ) : null}
        <span className="absolute left-2.5 top-2.5"><Chip tone={r.chip.tone} icon={r.chip.icon}>{r.chip.label}{rendering ? ` · ${r.progress}%` : ""}</Chip></span>
        {r.duration ? <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-[rgba(11,11,20,0.6)] px-[9px] py-1 text-xs font-bold text-white">{r.duration}</span> : null}
        {rendering ? (
          <span role="progressbar" aria-label="Render progress" aria-valuenow={r.progress ?? 0} aria-valuemin={0} aria-valuemax={100} className="absolute inset-x-0 bottom-0 h-1 bg-[rgba(11,11,20,0.35)]">
            <span className="block h-full bg-accent" style={{ width: `${r.progress}%` }} />
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-[18px] pb-[18px] pt-4">
        <h3 className="m-0 line-clamp-2 break-words font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.01em] text-white">{r.title}</h3>
        <div className="flex min-w-0 items-center gap-1.5 text-[13.5px] text-white/70">
          <Icon name="film" size={15} className="flex-none" />
          <span className="min-w-0 truncate">{[r.source, r.format].filter(Boolean).join(" · ")}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-2">
          <span className="whitespace-nowrap text-[12.5px] leading-[1.3] text-white/80"><b className="text-white">{r.credits}</b><br />{refunded ? "credits refunded" : "credits est → actual"}</span>
          {action}
        </div>
      </div>
    </article>
  );
}

function Actions({ r, slug, onError }: { r: ExportRow; slug?: string; onError: (e: string | null) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: typeof cancelRenderAction) => {
    if (!slug) return;
    onError(null);
    start(async () => {
      const res = await fn(slug, r.id);
      if (!res.ok) onError(res.error);
      router.refresh();
    });
  };
  if (r.status === "queued" || r.status === "rendering") return <Button variant="ghost" size="sm" className={ON_DARK} onClick={() => run(cancelRenderAction)} loading={pending}>Cancel</Button>;
  if (r.status === "ready") {
    return r.downloadUrl
      ? <ButtonLink variant="ghost" size="sm" icon="download" className={ON_DARK} href={r.downloadUrl} download>Download</ButtonLink>
      : <Button variant="ghost" size="sm" icon="download" className={ON_DARK} disabled>Download</Button>;
  }
  return <Button variant="ghost" size="sm" icon="refresh" className={ON_DARK} onClick={() => run(retryRenderAction)} loading={pending}>Retry</Button>;
}

/** CL-05 Exports: Filled, Empty, Loading and the trial limit, desktop and mobile. */
export function ExportsPage({ slug, d, hrefs }: { slug?: string; d: ExportsData; hrefs: { studio: string; plans: string } }) {
  const [error, setError] = useState<string | null>(null);
  if (!d.rows.length) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <Head />
          <EmptyState illustration="exports" title="No exports yet" text="Render a clip from the Clipping Studio and it lands here, ready to download or schedule." actions={<ButtonLink href={hrefs.studio} variant="cta" arrow>Open Clipping Studio</ButtonLink>} />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <Head />
        {d.trial ? <TrialBanner trial={d.trial} plansHref={hrefs.plans} /> : null}
        {error ? <Banner tone="err" title="That didn’t work" text={error} /> : null}
      </div>
      <div role="list" aria-label="Exports" className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
        {d.rows.map((r) => <ExportCard key={r.id} r={r} action={<Actions r={r} slug={slug} onError={setError} />} />)}
      </div>
    </Motion>
  );
}

/** CL-05 Loading: the page itself, ghosted (refresh of 20 Nov 2026). */
export function ExportsLoading() {
  return <Ghost><ExportsPage d={EXPORTS_SAMPLE} hrefs={{ studio: "#", plans: "#" }} /></Ghost>;
}
