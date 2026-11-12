import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { ICON_PATHS, type IconName } from "./generated/icons";
import { ILLUSTRATIONS, type IllustrationName } from "./generated/illustrations";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------------------------------------------------ Icon
export type { IconName, IllustrationName };

export function Icon({ name, size = 18, strokeWidth = 2, className }: { name: IconName; size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("flex-none", className)}>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ------------------------------------------------------------------ Illustration
/** One of the 32 flat illustrations exported from the design generator. Markup is static and trusted. */
export function Illustration({ name, width = 240, className }: { name: IllustrationName; width?: number; className?: string }) {
  const ill = ILLUSTRATIONS[name];
  return (
    <svg
      role="img"
      aria-label={ill.label}
      viewBox="0 0 240 180"
      width={width}
      height={Math.round(width * 0.75)}
      data-pop=""
      className={cn("h-auto max-w-full flex-none overflow-visible", className)}
      dangerouslySetInnerHTML={{ __html: ill.inner }}
    />
  );
}

// ------------------------------------------------------------------ Logo
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  const box = Math.floor(size * 1.15);
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-extrabold tracking-[-0.04em] text-text", className)} style={{ fontSize: size }}>
      <span aria-hidden="true" className="inline-flex items-center justify-center rounded-[32%] bg-accent text-white" style={{ width: box, height: box }}>
        <Icon name="spark" size={Math.floor(size * 0.72)} strokeWidth={2.6} />
      </span>
      nelio
    </span>
  );
}

// ------------------------------------------------------------------ Typography
export function Heading({ size = 32, as: Tag = "h2", className, children }: { size?: 26 | 32 | 34 | 40; as?: "h1" | "h2"; className?: string; children: ReactNode }) {
  // Mobile sizes follow the generator's scale: 20 + (size - 20) * 0.55.
  const cls = { 26: "text-[23px] md:text-[26px]", 32: "text-[27px] md:text-[32px]", 34: "text-[28px] md:text-[34px]", 40: "text-[31px] md:text-[40px]" }[size];
  return <Tag className={cn("m-0 font-display font-extrabold leading-[1.08] tracking-[-0.03em] text-text", cls, className)}>{children}</Tag>;
}

export function BigTitle({ size, as: Tag = "h1", className, children }: { size: 38 | 52; as?: "h1" | "h2" | "p"; className?: string; children: ReactNode }) {
  // Mobile: 20 + (size - 20) * 0.42.
  const cls = { 38: "text-[28px] md:text-[38px]", 52: "text-[33px] md:text-[52px]" }[size];
  return <Tag className={cn("m-0 font-display font-extrabold leading-[1.02] tracking-[-0.045em] text-text", cls, className)}>{children}</Tag>;
}

export function CardTitle({ size = 17, className, children }: { size?: 16 | 17 | 20; className?: string; children: ReactNode }) {
  return <h3 className={cn("m-0 font-display font-bold leading-tight text-text", className)} style={{ fontSize: size }}>{children}</h3>;
}

export function Text({ size = 14, className, children }: { size?: 13 | 14 | 15 | 16 | 17; className?: string; children: ReactNode }) {
  return <p className={cn("m-0 leading-[1.55] text-muted", className)} style={{ fontSize: size }}>{children}</p>;
}

export function Small({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn("text-[12.5px] font-medium text-muted", className)}>{children}</span>;
}

// ------------------------------------------------------------------ Button
const buttonVariants = cva(
  "box-border inline-flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-2 font-body font-bold no-underline disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "border-accent bg-accent text-on-accent hover:text-on-accent",
        cta: "border-ink bg-ink text-on-ink hover:text-on-ink",
        lime: "border-lime bg-lime text-outline hover:text-outline",
        ai: "border-ai-tint bg-ai-tint text-ai-text hover:text-ai-text",
        secondary: "border-border bg-surface-1 text-text hover:text-text",
        danger: "border-err-tint bg-err-tint text-err-text hover:text-err-text",
        ghost: "border-transparent bg-transparent text-text hover:text-text",
      },
      size: { sm: "px-3.5 py-[7px] text-[13px]", md: "px-[18px] py-2.5 text-sm", lg: "px-6 py-3.5 text-base" },
      // Handoff §6.4 rule 1: buttons hug their content unless marked full.
      full: { true: "w-full justify-center", false: "w-fit max-w-full" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
);

type ButtonOwn = VariantProps<typeof buttonVariants> & { icon?: IconName; arrow?: boolean; loading?: boolean; children?: ReactNode };

function ButtonInner({ icon, arrow, loading, variant, size, children }: ButtonOwn) {
  const s = size === "lg" ? 32 : 26;
  return (
    <>
      {loading ? (
        <span data-spin="" className="inline-flex">
          <Icon name="refresh" size={18} />
        </span>
      ) : icon ? (
        <Icon name={icon} size={16} strokeWidth={2.2} />
      ) : null}
      {children}
      {arrow ? (
        <span aria-hidden="true" className={cn("inline-flex flex-none items-center justify-center rounded-full", variant === "cta" ? "bg-lime text-outline" : "bg-on-accent text-accent")} style={{ width: s, height: s }}>
          <Icon name="arrowr" size={Math.floor(s * 0.55)} strokeWidth={2.6} />
        </span>
      ) : null}
    </>
  );
}

const arrowPad = (_size: ButtonOwn["size"], arrow?: boolean) => (arrow ? "pr-1.5" : "");

export function Button({ variant, size, full, icon, arrow, loading, className, children, disabled, ...props }: ButtonOwn & Omit<ComponentProps<"button">, "children">) {
  return (
    <button type="button" {...props} disabled={disabled || loading} className={cn(buttonVariants({ variant, size, full }), arrowPad(size, arrow), (disabled || loading) && "opacity-80", className)}>
      <ButtonInner {...{ icon, arrow, loading, variant, size }}>{children}</ButtonInner>
    </button>
  );
}

/** Anchor styled as a button. Pass `render` to use the framework's Link. */
export function ButtonLink({ variant, size, full, icon, arrow, className, children, ...props }: ButtonOwn & Omit<ComponentProps<"a">, "children">) {
  return (
    <a {...props} className={cn(buttonVariants({ variant, size, full }), arrowPad(size, arrow), className)}>
      <ButtonInner {...{ icon, arrow, variant, size }}>{children}</ButtonInner>
    </a>
  );
}
export { buttonVariants };

export function IconButton({ icon, label, className, ...props }: { icon: IconName; label: string } & ComponentProps<"button">) {
  return (
    <button type="button" aria-label={label} {...props} className={cn("box-border inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface-1 text-text", className)}>
      <Icon name={icon} size={18} />
    </button>
  );
}

// ------------------------------------------------------------------ Chip, Sticker
const TONES = {
  blue: "bg-accent-tint text-accent-text",
  lime: "bg-lime-tint text-lime-text",
  ai: "bg-ai-tint text-ai-text",
  ok: "bg-ok-tint text-ok-text",
  warn: "bg-warn-tint text-warn-text",
  err: "bg-err-tint text-err-text",
  neutral: "bg-surface-2 text-muted",
  ink: "bg-ink text-on-ink",
} as const;
export type Tone = keyof typeof TONES;

/** Status = icon + word + colour, never colour alone (handoff §6.1). */
export function Chip({ tone = "neutral", icon, className, children }: { tone?: Tone; icon?: IconName; className?: string; children: ReactNode }) {
  return (
    <span className={cn("box-border inline-flex w-fit max-w-full items-center gap-[5px] whitespace-nowrap rounded-full px-2.5 py-1 font-body text-[12.5px] font-bold", TONES[tone], className)}>
      {icon ? <Icon name={icon} size={13} strokeWidth={2.4} /> : null}
      {children}
    </span>
  );
}

const STICKER_FILLS = { yellow: "bg-yellow", cyan: "bg-cyan", pink: "bg-pink", lime: "bg-lime", orange: "bg-orange", white: "bg-white" } as const;

export function Sticker({ fill = "yellow", rotate = -4, icon, size = 14, className, children }: { fill?: keyof typeof STICKER_FILLS; rotate?: number; icon?: IconName; size?: 13 | 14; className?: string; children: ReactNode }) {
  return (
    <span
      data-pop=""
      className={cn("box-border inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-outline px-3.5 py-1.5 font-display font-extrabold text-outline shadow-sticker", STICKER_FILLS[fill], className)}
      style={{ fontSize: size, transform: `rotate(${rotate}deg)` }}
    >
      {icon ? <Icon name={icon} size={15} strokeWidth={2.4} /> : null}
      {children}
    </span>
  );
}

// ------------------------------------------------------------------ Banner
const BANNER_ICON: Record<Tone, IconName> = { blue: "info", lime: "check", ai: "spark", ok: "check", warn: "alert", err: "alert", neutral: "info", ink: "info" };
const BANNER_FG: Record<Tone, string> = { blue: "text-accent-text", lime: "text-lime-text", ai: "text-ai-text", ok: "text-ok-text", warn: "text-warn-text", err: "text-err-text", neutral: "text-muted", ink: "text-on-ink" };

/** One banner, at most one action (handoff §8). Errors use role="alert" so they are announced. */
export function Banner({ tone, title, text, action, className }: { tone: Tone; title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div role={tone === "err" ? "alert" : "status"} data-enter-item="" className={cn("flex items-center gap-3 rounded-row px-4 py-3.5", TONES[tone].split(" ")[0], className)}>
      <span className={cn("inline-flex size-9 flex-none items-center justify-center rounded-xl bg-surface-1", BANNER_FG[tone])}>
        <Icon name={BANNER_ICON[tone]} size={18} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 grow">
        <div className="text-sm font-bold text-text">{title}</div>
        {text ? <div className="mt-px text-[13.5px] text-text">{text}</div> : null}
      </div>
      {action}
    </div>
  );
}

// ------------------------------------------------------------------ Card, key-value list
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("box-border flex min-w-0 flex-col gap-3 rounded-card border border-border bg-surface-1 p-4 shadow-card md:gap-3.5 md:p-5", className)}>{children}</section>;
}

export function KeyValues({ pairs }: { pairs: [string, ReactNode][] }) {
  return (
    <dl className="m-0 flex flex-col">
      {pairs.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 border-b border-border py-[11px]">
          <dt className="text-[13px] text-muted">{k}</dt>
          <dd className="m-0 text-right text-sm font-bold text-text">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// ------------------------------------------------------------------ Avatars
export function PersonAvatar({ initials, color = "#59D8FF", size = 32, className }: { initials: string; color?: string; size?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex flex-none items-center justify-center rounded-full font-display font-extrabold text-outline", className)} style={{ width: size, height: size, background: color, fontSize: Math.floor(size * 0.38) }}>
      {initials}
    </span>
  );
}

const AGENT_RADIUS = { circle: "50%", square: "30%", blob: "42% 58% 55% 45%", pill: "999px" } as const;
const AGENT_COLORS = { lime: "#B6F24A", pink: "#FF4FB8", cyan: "#59D8FF", orange: "#FF7A2F", yellow: "#FFD43B" } as const;

/** Nelio AI agent: a flat shape with two eyes. Eyes blink when `animated` (motion pattern 10). */
export function AgentAvatar({ color = "lime", shape = "circle", size = 40, animated = true }: { color?: keyof typeof AGENT_COLORS; shape?: keyof typeof AGENT_RADIUS; size?: number; animated?: boolean }) {
  const eye = Math.max(3, Math.floor(size / 9));
  const eyeStyle = { width: eye, height: eye + 3 };
  return (
    <span aria-hidden="true" className="box-border inline-flex flex-none items-center justify-center border-2 border-outline" style={{ width: size, height: size, borderRadius: AGENT_RADIUS[shape], background: AGENT_COLORS[color], gap: eye + 2 }}>
      <span className="rounded bg-outline" style={eyeStyle} {...(animated ? { "data-blink": "" } : {})} />
      <span className="rounded bg-outline" style={eyeStyle} {...(animated ? { "data-blink": "" } : {})} />
    </span>
  );
}

// ------------------------------------------------------------------ Forms
const CONTROL = "box-border min-h-12 w-full rounded-input border-2 bg-surface-1 px-4 py-3 font-body text-sm text-text placeholder:text-muted";

export function Field({ label, hint, error, id, className, ...props }: { label: string; hint?: string; error?: string } & ComponentProps<"input">) {
  const fid = id ?? props.name;
  const describedBy = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={fid} className="text-[13px] font-bold text-text">{label}</label>
      <input id={fid} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} className={cn(CONTROL, error ? "border-err-text" : "border-border", className)} />
      {error ? (
        <div id={`${fid}-err`} className="text-[12.5px] font-semibold text-err-text">{error}</div>
      ) : hint ? (
        <div id={`${fid}-hint`} className="text-[12.5px] text-muted">{hint}</div>
      ) : null}
    </div>
  );
}

export function SelectField({ label, hint, error, id, options, className, ...props }: { label: string; hint?: string; error?: string; options: { value: string; label: string }[] } & ComponentProps<"select">) {
  const fid = id ?? props.name;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={fid} className="text-[13px] font-bold text-text">{label}</label>
      <select id={fid} aria-invalid={error ? true : undefined} {...props} className={cn(CONTROL, error ? "border-err-text" : "border-border", className)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error ? <div className="text-[12.5px] font-semibold text-err-text">{error}</div> : hint ? <div className="text-[12.5px] text-muted">{hint}</div> : null}
    </div>
  );
}

export function Checkbox({ label, error, id, ...props }: { label: ReactNode; error?: string } & Omit<ComponentProps<"input">, "type">) {
  const fid = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <input id={fid} type="checkbox" aria-invalid={error ? true : undefined} {...props} className="mt-px size-5 flex-none accent-accent" />
        <label htmlFor={fid} className="text-sm font-semibold leading-[1.4] text-text">{label}</label>
      </div>
      {error ? <div className="text-[12.5px] font-semibold text-err-text">{error}</div> : null}
    </div>
  );
}

/** "or" divider between sign-in methods. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-[13px] text-muted">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** The organic blob used behind hero art and on error pages. Flat fill only. */
export function Blob({ size = 520, className, fill = "var(--n-lime)" }: { size?: number; className?: string; fill?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={cn("absolute", className)} style={{ width: size, height: size }}>
      <path d="M44,-58 C58,-46 70,-28 72,-9 C74,10 66,30 52,44 C38,58 18,66 -3,69 C-24,72 -46,70 -60,57 C-74,44 -80,20 -77,-1 C-74,-22 -62,-40 -46,-52 C-30,-64 -15,-70 3,-73 C21,-76 30,-70 44,-58 Z" transform="translate(100 100)" fill={fill} />
    </svg>
  );
}
