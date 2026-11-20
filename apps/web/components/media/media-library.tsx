import { ButtonLink, Chip, EmptyState, Illustration, Motion, PageHead, ShortFrame, Sk, cn, Ghost } from "@nelio/ui";
import Link from "next/link";
import { MEDIA_FILTERS, MEDIA_FILTER_LABEL, type MediaData, type MediaFilter } from "@/lib/media";
import { MEDIA_SAMPLE } from "./sample";

export interface MediaHrefs { filter: (f: MediaFilter) => string; upload: string; licensing: string; mine?: string }

function Header({ hrefs, licensed }: { hrefs: MediaHrefs; licensed: number }) {
  return (
    <PageHead
      eyebrow="Create"
      title="Clipping Studio"
      sub="Your videos, licensed sources and clips."
      actions={
        <>
          <ButtonLink href={licensed > 0 && hrefs.mine ? hrefs.mine : hrefs.licensing} variant="secondary" icon="shield">Import licensed</ButtonLink>
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
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <Header hrefs={hrefs} licensed={d.licensed ?? 0} />
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
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <Header hrefs={hrefs} licensed={d.licensed ?? 0} />
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
          <div className="grid grid-cols-2 gap-2.5 md:gap-3.5 md:[grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
            {d.items.map((i) => (
              <Link key={`${i.kind}-${i.id}`} href={i.href} aria-label={i.title} className="block min-w-0 text-white no-underline hover:text-white">
                <ShortFrame
                  aspect="4/5"
                  media={
                    i.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                      <img src={i.poster} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" loading="lazy" />
                    ) : null
                  }
                  hook={i.overlay}
                  chips={<Chip tone={i.chip.tone} icon={i.chip.icon}>{i.chip.label}</Chip>}
                  title={i.title}
                  meta={i.sub}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface-1 px-6 py-12 text-center shadow-card">
            <h2 className="m-0 font-display text-[20px] font-extrabold text-text">{filter === "licensed" ? "No licensed sources yet" : `No ${MEDIA_FILTER_LABEL[filter].toLowerCase()} yet`}</h2>
            <p className="m-0 text-sm text-muted">{filter === "licensed" ? ((d.licensed ?? 0) > 0 ? "Open a creator you’ve licensed from My licenses and pick a video to clip." : "License a creator in the marketplace, then pick their videos to clip here.") : filter === "clips" ? "Open a video in the Studio and save a moment as a clip." : filter === "exports" ? "Rendered clips appear here." : "Upload a video to get started."}</p>
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

/** CL-01 Loading: the library itself, ghosted. */
export function MediaLibraryLoading() {
  return <Ghost><MediaLibrary d={MEDIA_SAMPLE} filter="all" hrefs={{ filter: () => "#", upload: "#", licensing: "#" }} /></Ghost>;
}
