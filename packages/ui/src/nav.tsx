import type { ReactNode } from "react";
import { NAV_ICONS } from "./generated/navicons";
import { Heading, Illustration, cn, type IllustrationName } from "./primitives";

export type NavIconName = keyof typeof NAV_ICONS.NAVIC | "arrowr" | "sun";

/**
 * Navigation icon with outline (idle) and filled (active) states (handoff §6.4 rule 4).
 * Active: the shape is filled in accent and its details are cut out in the accent tint.
 */
export function NavIcon({ name, active = false, size = 20 }: { name: NavIconName; active?: boolean; size?: number }) {
  // Names without a dedicated drawing fall back to the grid shape, exactly as the design generator does.
  const [shape, detail] = (NAV_ICONS.NAVIC as Record<string, readonly [string, string]>)[name] ?? NAV_ICONS.NAVIC.grid;
  if (active) {
    const cut = "var(--n-acc-t)";
    const det = detail.replaceAll("<path", `<path stroke="${cut}" fill="none"`).replaceAll("<circle", `<circle stroke="${cut}" fill="${cut}"`);
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none" fill="var(--n-acc)" stroke="var(--n-acc)" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round" dangerouslySetInnerHTML={{ __html: `${shape}<g stroke-width="2">${det}</g>` }} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" dangerouslySetInnerHTML={{ __html: shape + detail }} />
  );
}

/** Class names for a navigation row, so the framework's Link or a button can use the same look. */
export function navItemClass(active: boolean) {
  return cn(
    "relative box-border flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] border-0 px-3.5 py-2.5 text-left text-sm no-underline",
    active ? "bg-accent-tint font-extrabold text-accent-text" : "bg-transparent font-semibold text-muted",
  );
}

export function NavItemContent({ icon, label, active }: { icon: NavIconName; label: string; active: boolean }) {
  return (
    <>
      {active ? <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-accent" /> : null}
      <NavIcon name={icon} active={active} />
      <span className={active ? "text-accent-text" : "text-text"}>{label}</span>
    </>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">{title}</h1>
        {sub ? <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-muted">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </header>
  );
}

/** Bordered list of rows (generator `lst` / `lrow`). */
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card [&>li:last-child]:border-b-0", className)}>{children}</ul>;
}

export function Row({ title, sub, left, right, children }: { title: string; sub?: string; left?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  const body = (
    <>
      {left}
      <span className="min-w-0 grow">
        <span className="block text-sm font-semibold text-text">{title}</span>
        {sub ? <span className="mt-0.5 block text-[13px] text-muted">{sub}</span> : null}
      </span>
      {right}
    </>
  );
  return <li className="border-b border-border">{children ?? <div className="flex items-center gap-3 px-4 py-3">{body}</div>}</li>;
}

/** Empty state: illustration, title, text and up to two actions on a dashed panel (decision D-22). */
export function EmptyState({ illustration, title, text, width = 260, actions }: { illustration: IllustrationName; title: string; text: string; width?: number; actions?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-panel border-2 border-dashed border-border bg-surface-1 px-6 pb-11 pt-10 text-center">
      <Illustration name={illustration} width={width} />
      <Heading size={26} as="h2">{title}</Heading>
      <p className="m-0 max-w-[460px] text-[15px] leading-[1.55] text-muted">{text}</p>
      {actions ? <div className="flex flex-wrap justify-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
