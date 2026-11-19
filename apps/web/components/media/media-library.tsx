import { ButtonLink, Chip, EmptyState, Illustration, Motion, PageHead, Sk, cn } from "@nelio/ui";
import Link from "next/link";
import { MEDIA_FILTERS, MEDIA_FILTER_LABEL, type MediaData, type MediaFilter } from "@/lib/media";

export interface MediaHrefs { filter: (f: MediaFilter) => string; upload: string; licensing: string }

function Header({ hrefs }: { hrefs: MediaHrefs }) {
  return (
    <PageHead
      eyebrow="Create"
      title="Clipping Studio"
      sub="Your videos, licensed sources and clips."
      actions={
        <>
          <ButtonLink href={hrefs.licensing} variant="secondary" icon="shield">Import licensed</ButtonLink>
          <ButtonLink href={hrefs.upload} icon="upload">Upload video</ButtonLink>
        </>
      }
    />
  );
}

/** CL-01 Clipping Studio library: Filled, Empty, filtered views and Loading. */
export function MediaLibrary({ d, filter, hrefs }: { d: MediaData; filter: MediaFilter; hrefs: MediaHrefs }) {
  if (!d.anyUploads && d.items.length === 0) {
    return (
      <Motion className="flex flex-col gap-6">
        <div data-enter="" className="flex flex-col gap-6">
          <Header hrefs={hrefs} />
          <EmptyState
            illustration="media"
            title="Add your first video"
            text="Upload something you own, or import from a creator who licensed it to you. We’ll find the best moments."
            actions={<><ButtonLink href={hrefs.upload} variant="cta" arrow>Upload video</ButtonLink><ButtonLink href={hrefs.licensing} variant="secondary">Browse licenses</ButtonLink></>}
          />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <Header hrefs={hrefs} />
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Filter library" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
            {MEDIA_FILTERS.map((f) => (
              <Link key={f} href={hrefs.filter(f)} scroll={false} aria-current={f === filter ? "page" : undefined} className={cn("tap-target inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", f === filter ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}>
                {MEDIA_FILTER_LABEL[f]}
              </Link>
            ))}
          </nav>
          <span className="grow" />
          <span className="text-[12.5px] font-medium text-muted">Storage: {d.storageUsed} used</span>
        </div>
      </div>
      <div data-enter="" className="flex flex-col gap-4">
        {d.items.length ? (
          <div className="grid grid-cols-2 gap-2.5 md:gap-4 md:[grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
            {d.items.map((i) => (
              <Link key={`${i.kind}-${i.id}`} href={i.href} className="text-text no-underline hover:text-text">
                <section className="flex h-full min-w-0 flex-col gap-2 rounded-[20px] border border-border bg-surface-1 p-2.5 shadow-card md:gap-2.5 md:rounded-card md:p-5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border-2 border-outline bg-surface-3">
                    {i.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                      <img src={i.poster} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" loading="lazy" />
                    ) : null}
                    {i.overlay ? (
                      <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-outline bg-yellow px-1.5 py-0.5 font-display text-[11px] font-extrabold text-outline">{i.overlay}</span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="truncate text-sm font-bold">{i.title}</div>
                    <span className="text-[12.5px] font-medium text-muted">{i.sub}</span>
                  </div>
                  <Chip tone={i.chip.tone} icon={i.chip.icon}>{i.chip.label}</Chip>
                </section>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface-1 px-6 py-12 text-center shadow-card">
            <h2 className="m-0 font-display text-[20px] font-extrabold text-text">{filter === "licensed" ? "No licensed sources yet" : `No ${MEDIA_FILTER_LABEL[filter].toLowerCase()} yet`}</h2>
            <p className="m-0 text-sm text-muted">{filter === "licensed" ? "Licensed videos from creators appear here once licensing opens." : filter === "clips" ? "Open a video in the Studio and save a moment as a clip." : filter === "exports" ? "Rendered clips appear here." : "Upload a video to get started."}</p>
          </div>
        )}
        <Link href={hrefs.upload} className="flex flex-wrap items-center gap-[18px] rounded-[28px] border-2 border-dashed border-accent bg-accent-tint px-6 py-5 text-text no-underline hover:text-text">
          <Illustration name="upload" width={90} />
          <div className="min-w-0 flex-[1_1_280px]">
            <h3 className="m-0 font-display text-[19px] font-bold leading-[1.25]">Drop a long video here</h3>
            <p className="m-0 text-sm text-muted">We’ll transcribe it, find scenes and suggest the best moments.</p>
          </div>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-accent bg-accent px-[18px] py-2.5 text-sm font-bold text-on-accent">Choose file</span>
        </Link>
      </div>
    </Motion>
  );
}

export function MediaLibraryLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={70} h={12} /><Sk w={260} h={36} /><Sk w={240} h={16} /></div>
      <Sk w={420} h={48} r={24} className="max-w-full" />
      <div className="grid grid-cols-2 gap-2.5 md:gap-4 md:[grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-[20px] border border-border bg-surface-1 p-2.5 shadow-card md:gap-2.5 md:rounded-card md:p-5">
            <Sk h={160} r={18} /><Sk w="80%" h={14} /><Sk w="60%" h={12} /><Sk w={80} h={24} r={12} />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">Loading library…</span>
    </div>
  );
}
