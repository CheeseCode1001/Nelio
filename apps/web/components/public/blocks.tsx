import { cn } from "@nelio/ui";
import type { CSSProperties, ReactNode } from "react";

/**
 * Display type with the generator's mobile scaling (handoff §6.2):
 *   big (hero, page titles): 20 + (size - 20) × 0.42 below 768 px
 *   heading (section titles): 20 + (size - 20) × 0.55
 */
const mobileSize = (size: number, f: number) => Math.round(20 + (size - 20) * f);
// Line height is set inline: a font-size utility with a variable would otherwise reset it to the page default.
const sizeVars = (size: number, f: number) => ({ "--fs-m": `${mobileSize(size, f)}px`, "--fs-d": `${size}px` }) as CSSProperties;

export function Big({ size, mobile, as: Tag = "h1", className, style, children }: { size: number; mobile?: number; as?: "h1" | "h2" | "p"; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Tag className={cn("m-0 font-display font-extrabold leading-[1.02] tracking-[-0.045em] text-text text-[length:var(--fs-m)] md:text-[length:var(--fs-d)]", className)} style={{ lineHeight: 1.02, ...sizeVars(size, 0.42), ...(mobile ? ({ "--fs-m": `${mobile}px` } as CSSProperties) : {}), ...style }}>
      {children}
    </Tag>
  );
}

export function SectionHeading({ size, as: Tag = "h2", className, children }: { size: number; as?: "h2" | "h3"; className?: string; children: ReactNode }) {
  return (
    <Tag className={cn("m-0 font-display font-extrabold leading-[1.08] tracking-[-0.03em] text-text text-[length:var(--fs-m)] md:text-[length:var(--fs-d)]", className)} style={{ lineHeight: 1.08, ...sizeVars(size, 0.55) }}>
      {children}
    </Tag>
  );
}

/** Lime highlight behind words in a title (generator `hl`). */
export function Highlight({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-[18px] bg-lime px-3.5 leading-[1.1] text-outline">{children}</span>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="inline-flex w-fit max-w-full items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-accent-text">{children}</span>;
}

/**
 * Marketing section: 72 × 48 px padding on desktop, 40 × 16 on mobile, 1200 px content (handoff §6.3).
 * The generator's `section` always uses these values, so pages pass no padding of their own.
 */
export function Section({ children, tone, center, className, inner, pad }: { children: ReactNode; tone?: "s2"; center?: boolean; className?: string; inner?: string; pad?: string }) {
  return (
    <section className={cn("relative overflow-hidden px-4 py-10 md:px-12 md:py-[72px]", tone === "s2" && "bg-surface-2", pad, className)}>
      <div className={cn("relative mx-auto flex max-w-[1200px] flex-col gap-7", center && "items-center text-center", inner)}>{children}</div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div data-reveal="" className={cn("flex flex-col gap-3", center && "items-center text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionHeading size={48}>{title}</SectionHeading>
      {sub ? <p className="m-0 text-[17px] leading-[1.55] text-muted">{sub}</p> : null}
    </div>
  );
}

/** Flat card with the hard ink shadow (generator "sticker card"). */
export function StickerCard({ fill, children, className, shadow = 6 }: { fill: string; children: ReactNode; className?: string; shadow?: 5 | 6 }) {
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-panel border-2 border-outline p-6 text-outline", shadow === 6 ? "shadow-sticker-card" : "shadow-[5px_5px_0_var(--n-ol)]", className)} style={{ background: fill }}>
      {children}
    </div>
  );
}
