import { ButtonLink, DraftCard, EmptyState, Ghost, Motion, PageHead, SoftChip, ToolTile } from "@nelio/ui";
import type { DraftRow } from "@/lib/content";
import { SAMPLE_DRAFTS } from "./sample";

export interface ContentHrefs { compose: string; script: string; caption: string; aiVideo: string; licensing: string; drafts: string }

const BADGE = { instagram: "ig", youtube: "yt" } as const;
const KIND_ICON = { "Clip + caption": "film", Caption: "msg", Script: "pen" } as const;
const PICTURE_TINT = ["bg-lime", "bg-cyan", "bg-yellow", "bg-pink"];

/**
 * CS-01 tiles as tool tiles (Cards board "B"). Image creation and templates have no engine yet, and original AI
 * video waits for a partner (B-09), so those say so instead of opening anything (honest gate).
 */
function Tiles({ h }: { h: ContentHrefs }) {
  const later = <SoftChip>Coming later</SoftChip>;
  return (
    <div data-enter="" className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))]">
      <ToolTile icon="pen" tint="yellow" title="Write a script" text="Hooks, outlines and full scripts in your voice. Pick a hook, then expand it." action={{ label: "Start writing", href: h.script }} />
      <ToolTile icon="msg" tint="blue" title="Posts & captions" text="Platform-ready captions with hashtags, sized for each network." action={{ label: "Write a caption", href: h.caption }} />
      <ToolTile icon="image" tint="lime" title="Create an image" text="Thumbnails and quote cards that use your brand kit colours and fonts." corner={later} action={{ label: "Coming later", disabled: true }} />
      <ToolTile icon="film" tint="pink" title="Original AI video" text="Generate a short video from a prompt. Arrives after launch." corner={later} action={{ label: "Join the waitlist", href: h.aiVideo }} />
      <ToolTile icon="list" tint="orange" title="Templates" text="Reusable formats for series: weekly recap, myth vs fact, top 3." corner={later} action={{ label: "Coming later", disabled: true }} />
      <ToolTile icon="shield" tint="green" title="Remix licensed content" text="Clip and caption content you licensed, inside each license’s rules." action={{ label: "Pick a source", href: h.licensing }} />
    </div>
  );
}

/** CS-01 Content Studio: Filled, Empty and Loading, desktop and mobile. */
export function ContentStudio({ drafts, hrefs }: { drafts: DraftRow[]; hrefs: ContentHrefs }) {
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead eyebrow="Create" title="Content Studio" sub="Write, design and remix with Nelio AI." actions={<ButtonLink href={hrefs.compose} icon="plus">New post</ButtonLink>} />
      </div>
      <Tiles h={hrefs} />
      <div data-enter="" className="flex min-w-0 flex-col gap-4">
        {drafts.length ? (
          <>
            <div className="flex items-center gap-2.5">
              <h2 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.03em] text-text">Recent drafts</h2>
              <span className="grow" />
              <a href={hrefs.drafts} className="tap-target text-[13.5px] font-bold text-accent-text no-underline">All drafts →</a>
            </div>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
              {drafts.map((d, i) => (
                <DraftCard
                  key={d.id}
                  href={d.href}
                  picture={d.picture ?? null}
                  fallbackTint={PICTURE_TINT[i % PICTURE_TINT.length]}
                  badge={{ label: d.kind.label, icon: KIND_ICON[d.kind.label as keyof typeof KIND_ICON] }}
                  platforms={d.platforms.map((p) => BADGE[p])}
                  title={d.title}
                  text={d.text ?? ""}
                  stats={(d.stats ?? []).map((v) => ({ value: v }))}
                  tags={d.tags ?? []}
                  moreTags={d.moreTags}
                  action="Continue"
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState illustration="drafts" title="No drafts yet" text="Start with a script, a caption or a clip. Drafts you and your agents make show up here." actions={<ButtonLink href={hrefs.compose} variant="cta" arrow>New post</ButtonLink>} />
        )}
      </div>
    </Motion>
  );
}

/** CS-01 Loading: the studio itself, ghosted. */
export function ContentStudioLoading() {
  return <Ghost><ContentStudio drafts={SAMPLE_DRAFTS} hrefs={{ compose: "#", script: "#", caption: "#", aiVideo: "#", licensing: "#", drafts: "#" }} /></Ghost>;
}
