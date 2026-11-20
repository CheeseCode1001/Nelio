import type { ReactNode } from "react";
import { PlatformBadge, type Platform } from "./data-display";
import { Icon, cn, type IconName } from "./primitives";

/**
 * The card family (Cards board, refresh of 20 Nov 2026): real objects, Nelio colours and type, flat fills.
 * Text never overflows: titles clamp at 2 lines, descriptions at 2 or 3, meta at 1 with an ellipsis.
 */

const CARD = "box-border flex w-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-transparent bg-surface-1 shadow-card";
const SOFT_BUTTON = "tap-target box-border inline-flex h-10 w-full flex-none cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap rounded-full border-0 px-[18px] font-body text-sm font-bold no-underline";

export type TileTint = "yellow" | "blue" | "lime" | "pink" | "orange" | "green";
const TINT: Record<TileTint, string> = {
  yellow: "bg-warn-tint text-warn-text",
  blue: "bg-accent-tint text-accent-text",
  lime: "bg-lime-tint text-lime-text",
  pink: "bg-ai-tint text-ai-text",
  orange: "bg-err-tint text-err-text",
  green: "bg-ok-tint text-ok-text",
};

/** Three short stats split by thin rules (draft, campaign and source cards). */
export function StatSplit({ items, className }: { items: { icon?: IconName; label?: string; value: ReactNode }[]; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 border-y border-border py-2.5", className)}>
      {items.map((s, i) => (
        <div key={i} className="contents">
          {i > 0 ? <span aria-hidden="true" className="w-px flex-none self-stretch bg-border" /> : null}
          <div className="flex min-w-0 flex-[1_1_0] items-center justify-center gap-1.5 whitespace-nowrap">
            {s.icon ? <Icon name={s.icon} size={15} className="flex-none text-muted" /> : null}
            <span className="truncate text-[13px] text-muted">{s.label ? `${s.label} ` : ""}<b className="font-extrabold text-text">{s.value}</b></span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tool tile (Cards board "B"): tinted icon, a corner slot, title, short description and a soft full-width button.
 * `action` is a link, a button, or a disabled "coming later" label.
 */
export function ToolTile({ icon, tint, title, text, action, corner }: {
  icon: IconName;
  tint: TileTint;
  title: string;
  text: string;
  action: { label: string; href?: string; onClick?: () => void; disabled?: boolean };
  corner?: ReactNode;
}) {
  const btn = cn(SOFT_BUTTON, "bg-surface-2 text-text hover:text-text", action.disabled && "cursor-not-allowed opacity-70");
  return (
    <article data-enter-item="" className={cn(CARD, "gap-3 p-[18px]")}>
      <div className="flex items-start justify-between gap-2.5">
        <span className={cn("inline-flex size-11 flex-none items-center justify-center rounded-[14px]", TINT[tint])}><Icon name={icon} size={20} strokeWidth={2.2} /></span>
        {corner}
      </div>
      <h3 className="m-0 line-clamp-2 break-words font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.01em] text-text">{title}</h3>
      <p className="m-0 line-clamp-3 break-words text-[13.5px] leading-normal text-muted">{text}</p>
      <div className="mt-auto pt-1">
        {action.href && !action.disabled ? (
          <a href={action.href} className={btn}>{action.label}</a>
        ) : (
          <button type="button" className={btn} onClick={action.onClick} disabled={action.disabled || !action.onClick} aria-disabled={action.disabled || undefined}>{action.label}</button>
        )}
      </div>
    </article>
  );
}

/** A small grey pill: "Coming later", tags, counts. */
export function SoftChip({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <span className={cn("inline-flex w-fit flex-none items-center whitespace-nowrap rounded-full bg-surface-2 px-[11px] py-1.5 text-[12.5px] text-text", strong ? "font-bold" : "font-semibold")}>{children}</span>;
}

/**
 * Draft card (Cards board "H"): inset picture with a badge and platforms, title and two-line description,
 * three stats, tags, one full-width button.
 */
export function DraftCard({ href, picture, badge, platforms, title, text, stats, tags, moreTags, action, fallbackTint = "bg-surface-3" }: {
  href: string;
  picture: string | null;
  badge: { label: string; icon?: IconName };
  platforms: Platform[];
  title: string;
  text: string;
  stats: { icon?: IconName; value: ReactNode }[];
  tags: string[];
  moreTags?: number;
  action: string;
  fallbackTint?: string;
}) {
  return (
    <article data-enter-item="" className={cn(CARD, "gap-3 px-2 pb-3.5 pt-2")}>
      <div className={cn("relative aspect-[16/10] flex-none overflow-hidden rounded-[20px]", fallbackTint)}>
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL or a design photo
          <img src={picture} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover [object-position:center_25%]" />
        ) : null}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-[5px] text-xs font-bold text-outline">
          {badge.icon ? <Icon name={badge.icon} size={13} strokeWidth={2.4} /> : null}
          {badge.label}
        </span>
        {platforms.length ? (
          <span className="absolute right-2.5 top-2.5 flex items-center">
            {platforms.map((p, i) => <span key={p} className={cn("inline-flex rounded-lg border-2 border-white", i > 0 && "-ml-2")}><PlatformBadge platform={p} size={26} /></span>)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-2">
        <a href={href} className="tap-target text-inherit no-underline hover:text-accent-text">
          <h3 className="m-0 line-clamp-2 break-words font-display text-lg font-extrabold leading-[1.2] tracking-[-0.01em] text-text">{title}</h3>
        </a>
        <p className="m-0 line-clamp-2 min-h-[2lh] break-words text-[13.5px] leading-normal text-muted">{text}</p>
      </div>
      {stats.length ? <StatSplit items={stats} className="mx-2" /> : null}
      {tags.length || moreTags ? (
        <div className="flex flex-wrap gap-1.5 px-2">
          {tags.map((t) => <SoftChip key={t}>{t}</SoftChip>)}
          {moreTags ? <SoftChip strong>+{moreTags}</SoftChip> : null}
        </div>
      ) : null}
      <div className="mt-auto px-2">
        <a href={href} className={cn(SOFT_BUTTON, "bg-ink text-on-ink hover:text-on-ink")}>{action}</a>
      </div>
    </article>
  );
}
