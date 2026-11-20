import type { CSSProperties, ReactNode } from "react";
import { Icon, cn, type IconName } from "./primitives";

/**
 * A short as it will look (refresh boards: Studio preview, Brand kit preview, Variants): the video fills a
 * 9:16 frame, glass chips sit at the top, the hook card floats above the middle, and a frosted bar at the
 * bottom names the clip. Flat fills only; the glass is a translucent solid with a backdrop blur.
 */
export function GlassChip({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-[5px] whitespace-nowrap rounded-full bg-[rgba(11,11,20,0.58)] px-2.5 py-[5px] text-xs font-bold text-white backdrop-blur-[10px]">
      {icon ? <Icon name={icon} size={13} strokeWidth={2.4} /> : null}
      {children}
    </span>
  );
}

export function ShortFrame({
  media, hook, hookStyle, chips, title, meta, right, center, selected, label, className, style, aspect = "9/16",
}: {
  /** The picture: an <img> or <video> that fills the frame. */
  media?: ReactNode;
  hook?: string | null;
  /** Brand colours for the hook card. */
  hookStyle?: CSSProperties;
  chips?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  /** Something centred over the picture, such as the play button. */
  center?: ReactNode;
  selected?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
  aspect?: string;
}) {
  return (
    <div aria-label={label} className={cn("relative block w-full overflow-hidden rounded-[26px] bg-surface-3 text-white", selected ? "border-[3px] border-accent" : "border-2 border-outline", className)} style={{ aspectRatio: aspect, ...style }}>
      <div className="absolute inset-0 bg-violet">{media}</div>
      {hook ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-[42%] z-[2] text-center">
          <span className="rounded-lg border-2 border-outline bg-yellow px-2.5 py-[3px] font-display text-[15px] font-extrabold leading-[1.6] text-outline [box-decoration-break:clone]" style={hookStyle}>{hook}</span>
        </div>
      ) : null}
      {chips ? <div className="absolute inset-x-3 top-3 z-[2] flex flex-wrap items-center gap-1.5">{chips}</div> : null}
      {center ? <div className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">{center}</div> : null}
      {title || meta || right ? (
        <div className="absolute inset-x-2.5 bottom-2.5 z-[2] flex flex-col gap-1.5 rounded-[18px] bg-[rgba(11,11,20,0.58)] px-3.5 py-3 text-white backdrop-blur-[14px]">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              {title ? <div className="truncate font-display text-[15px] font-extrabold leading-[1.2] text-white">{title}</div> : null}
              {meta ? <div className="truncate text-[12.5px] font-semibold text-white/80">{meta}</div> : null}
            </div>
            <span className="grow" />
            {right}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The round play button over a short. */
export function PlayDisc({ playing, onClick, disabled, label }: { playing?: boolean; onClick?: () => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label ?? (playing ? "Pause preview" : "Play preview")} className={cn("inline-flex size-[60px] cursor-pointer items-center justify-center rounded-full border-0 bg-[rgba(11,11,20,0.58)] text-white backdrop-blur-[10px]", playing && "opacity-0 hover:opacity-100 focus-visible:opacity-100")}>
      <Icon name={playing ? "pause" : "play"} size={24} />
    </button>
  );
}
