"use client";

import { Banner, Button, ButtonLink, Chip, EmptyState, Motion, PageHead, RowCard, RowCardList, RowCardSkeleton, Sk, cn } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelRenderAction, retryRenderAction } from "@/lib/actions/studio";
import type { ExportRow, ExportsData } from "@/lib/exports";

const THUMB = ["bg-violet", "bg-cyan", "bg-orange", "bg-lime", "bg-yellow", "bg-pink"];

function Head() {
  return <PageHead title="Exports" sub="Rendered clips ready to download or post." />;
}

function TrialBanner({ trial, plansHref }: { trial: NonNullable<ExportsData["trial"]>; plansHref: string }) {
  if (trial.used >= trial.cap) {
    return <Banner tone="warn" title="You’ve used both trial exports" text="Choose a plan to export more. Your clips are saved." action={<ButtonLink href={plansHref} variant="secondary" size="sm">See plans</ButtonLink>} />;
  }
  return <Banner tone="ai" title={`Trial: ${trial.used} of ${trial.cap} exports used`} text="Choose a plan any time to export more." />;
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
  if (r.status === "queued" || r.status === "rendering") return <Button variant="ghost" size="sm" onClick={() => run(cancelRenderAction)} loading={pending}>Cancel</Button>;
  if (r.status === "ready") {
    return r.downloadUrl
      ? <ButtonLink variant="secondary" size="sm" icon="download" href={r.downloadUrl} download>Download</ButtonLink>
      : <Button variant="secondary" size="sm" icon="download" disabled>Download</Button>;
  }
  return <Button variant="secondary" size="sm" icon="refresh" onClick={() => run(retryRenderAction)} loading={pending}>Retry</Button>;
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
      <RowCardList label="Exports">
        {d.rows.map((r, i) => {
          const dim = r.status === "failed" || r.status === "canceled";
          return (
            <RowCard
              key={r.id}
              dim={dim}
              primary={
                <div className="flex items-center gap-2.5">
                  <span className={cn("relative aspect-[9/16] w-10 flex-none overflow-hidden rounded-[10px] border-2 border-outline", THUMB[i % THUMB.length], dim && "opacity-60")}>
                    {r.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                      <img src={r.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0">{r.title}</span>
                </div>
              }
              fields={[
                { label: "Format", value: r.format },
                {
                  label: "Status",
                  wide: r.progress !== null,
                  value: (
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip tone={r.chip.tone} icon={r.chip.icon}>{r.chip.label}</Chip>
                      {r.progress !== null ? (
                        <span role="progressbar" aria-label="Render progress" aria-valuenow={r.progress} aria-valuemin={0} aria-valuemax={100} className="h-2.5 w-16 overflow-hidden rounded-full bg-surface-3">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${r.progress}%` }} />
                        </span>
                      ) : null}
                    </span>
                  ),
                },
                { label: "Credits (est → actual)", value: r.credits },
              ]}
              action={<Actions r={r} slug={slug} onError={setError} />}
            />
          );
        })}
      </RowCardList>
    </Motion>
  );
}

export function ExportsLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={160} h={36} /><Sk w={280} h={16} /></div>
      <RowCardSkeleton rows={4} fields={4} />
      <span className="sr-only" role="status">Loading exports…</span>
    </div>
  );
}
