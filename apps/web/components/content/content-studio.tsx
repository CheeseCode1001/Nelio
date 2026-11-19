import { ButtonLink, Chip, EmptyState, Illustration, Motion, PageHead, PlatformBadge, Sk, cn, type IllustrationName } from "@nelio/ui";
import type { DraftRow } from "@/lib/content";

export interface ContentHrefs { compose: string; script: string; caption: string; aiVideo: string; licensing: string; drafts: string }

interface Tile { title: string; text: string; illustration: IllustrationName; bg: string; href: string | null; later?: boolean }

/** CS-01 tiles. Image creation and templates have no engine yet, so they're shown as coming later (honest gate). */
function tiles(h: ContentHrefs): Tile[] {
  return [
    { title: "Write a script", text: "Hooks, outlines and full scripts.", illustration: "drafts", bg: "bg-yellow", href: h.script },
    { title: "Posts & captions", text: "Platform-ready captions in your voice.", illustration: "strategist", bg: "bg-cyan", href: h.caption },
    { title: "Create an image", text: "Thumbnails and quote cards.", illustration: "brand", bg: "bg-lime", href: null, later: true },
    { title: "Original AI video", text: "Generate video from a prompt.", illustration: "aivideo", bg: "bg-pink", href: h.aiVideo, later: true },
    { title: "Templates", text: "Reusable formats for your brand.", illustration: "exports", bg: "bg-orange", href: null, later: true },
    { title: "Remix licensed content", text: "Within each license’s rules.", illustration: "licenses", bg: "bg-violet", href: h.licensing },
  ];
}

const TILE = "flex min-w-0 flex-col gap-2 rounded-[30px] border-2 border-outline p-5 text-outline no-underline shadow-sticker-card";

function TileCard({ t }: { t: Tile }) {
  const body = (
    <>
      <span className="flex min-h-[120px] items-center justify-center md:min-h-[140px]"><Illustration name={t.illustration} width={153} /></span>
      <span className="font-display text-[19px] font-extrabold leading-tight">{t.title}</span>
      <span className="text-[13.5px] leading-snug">{t.text}</span>
      {t.later ? <span className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-outline bg-white px-3.5 py-1.5 text-xs font-extrabold text-outline">Coming later</span> : null}
    </>
  );
  return t.href ? (
    <a href={t.href} className={cn(TILE, t.bg, "hover:text-outline")}>{body}</a>
  ) : (
    <div className={cn(TILE, t.bg)} aria-disabled="true">{body}</div>
  );
}

const TH = "whitespace-nowrap bg-surface-2 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.04em] text-muted";
const TD = "border-b border-border px-4 py-3.5 align-middle text-sm text-text";
const BADGE = { instagram: "ig", youtube: "yt" } as const;

/** CS-01 Content Studio: Filled, Empty and Loading, desktop and mobile. */
export function ContentStudio({ drafts, hrefs }: { drafts: DraftRow[]; hrefs: ContentHrefs }) {
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <PageHead eyebrow="Create" title="Content Studio" sub="Write, design and remix with Nelio AI." actions={<ButtonLink href={hrefs.compose} icon="plus">New post</ButtonLink>} />
      </div>
      <div data-enter="" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
        {tiles(hrefs).map((t) => <TileCard key={t.title} t={t} />)}
      </div>
      <div data-enter="" className="flex min-w-0 flex-col gap-4">
        {drafts.length ? (
          <>
            <div className="flex items-center gap-2.5">
              <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.03em] text-text">Recent drafts</h2>
              <span className="grow" />
              <a href={hrefs.drafts} className="tap-target text-[13.5px] font-bold text-accent-text no-underline">All drafts →</a>
            </div>
            <div className="relative min-w-0 max-w-full overflow-x-auto rounded-row border border-border bg-surface-1 shadow-card">
              <table className="w-full min-w-[560px] border-collapse">
                <caption className="sr-only">Recent drafts</caption>
                <thead><tr><th scope="col" className={TH}>Draft</th><th scope="col" className={TH}>Type</th><th scope="col" className={TH}>For</th><th scope="col" className={TH}>Updated</th></tr></thead>
                <tbody className="[&>tr:last-child>td]:border-b-0">
                  {drafts.map((d) => (
                    <tr key={d.id}>
                      <td className={cn(TD, "font-semibold")}><a href={d.href} className="tap-target text-text no-underline hover:text-accent-text">{d.title}</a></td>
                      <td className={TD}><Chip tone={d.kind.tone}>{d.kind.label}</Chip></td>
                      <td className={TD}>
                        {d.platforms.length ? <span className="flex items-center gap-1">{d.platforms.map((p) => <PlatformBadge key={p} platform={BADGE[p]} size={24} />)}</span> : <span className="text-muted">—</span>}
                      </td>
                      <td className={cn(TD, "whitespace-nowrap")}>{d.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState illustration="drafts" title="No drafts yet" text="Start with a script, a caption or a clip. Drafts you and your agents make show up here." actions={<ButtonLink href={hrefs.compose} variant="cta" arrow>New post</ButtonLink>} />
        )}
      </div>
    </Motion>
  );
}

export function ContentStudioLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={60} h={12} /><Sk w={260} h={36} /><Sk w={280} h={16} /></div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[30px] border border-border bg-surface-1 p-5 shadow-card"><Sk h={140} r={20} /><Sk w="60%" h={16} /><Sk w="80%" h={12} /></div>
        ))}
      </div>
      <span className="sr-only" role="status">Loading Content Studio…</span>
    </div>
  );
}
