import type { ReactNode } from "react";
import { Icon, cn, type IconName, type Tone } from "./primitives";

const TONE_PAIR: Record<Tone, string> = {
  blue: "bg-accent-tint text-accent-text",
  lime: "bg-lime-tint text-lime-text",
  ai: "bg-ai-tint text-ai-text",
  ok: "bg-ok-tint text-ok-text",
  warn: "bg-warn-tint text-warn-text",
  err: "bg-err-tint text-err-text",
  neutral: "bg-surface-2 text-muted",
  ink: "bg-ink text-on-ink",
};

/** Rounded-square icon tile used at the start of list rows (generator `bubble`). */
export function Bubble({ icon, tone = "blue", size = 40 }: { icon: IconName; tone?: Tone; size?: number }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex flex-none items-center justify-center rounded-[14px]", TONE_PAIR[tone])} style={{ width: size, height: size }}>
      <Icon name={icon} size={Math.floor(size * 0.5)} />
    </span>
  );
}

const PLATFORMS = {
  yt: { name: "YouTube", bg: "#FF0033" },
  ig: { name: "Instagram", bg: "#E1306C" },
  tt: { name: "TikTok", bg: "#0B0B14" },
  fb: { name: "Facebook", bg: "#1877F2" },
} as const;
export type Platform = keyof typeof PLATFORMS;

export function PlatformBadge({ platform, size = 32 }: { platform: Platform; size?: number }) {
  const p = PLATFORMS[platform];
  return (
    <span role="img" aria-label={p.name} className="inline-flex flex-none items-center justify-center text-white" style={{ width: size, height: size, borderRadius: Math.floor(size * 0.3), background: p.bg }}>
      <Icon name={platform} size={Math.floor(size * 0.56)} />
    </span>
  );
}

/** Stat tile (generator `stat`). `filled` uses a flat fun fill with ink text. */
export function StatTile({ label, value, sub, icon, filled }: { label: string; value: string; sub?: string; icon?: IconName; filled?: "lime" }) {
  const onFill = Boolean(filled);
  return (
    <section className={cn("flex min-w-0 flex-col gap-1 rounded-card px-5 py-[18px]", onFill ? "bg-lime text-outline" : "border border-border bg-surface-1 shadow-card")}>
      <div className={cn("flex items-center gap-2 text-[13px] font-bold", onFill ? "text-outline" : "text-muted")}>
        {icon ? <Icon name={icon} size={16} /> : null}
        {label}
      </div>
      <div data-count="" className={cn("font-display text-[28px] font-extrabold tracking-[-0.03em] md:text-[36px]", onFill ? "text-outline" : "text-text")}>{value}</div>
      {sub ? <div className={cn("text-[13px] font-semibold", onFill ? "text-outline" : "text-muted")}>{sub}</div> : null}
    </section>
  );
}

const METER_FILL = { acc: "bg-accent", lime: "bg-lime", warn: "bg-warn", err: "bg-err", ok: "bg-ok", ai: "bg-ai" } as const;

/** Progress meter (generator `meter`). Always labelled for assistive tech. */
export function Meter({ label, right, pct, tone = "acc", ariaLabel }: { label?: string; right?: string; pct: number; tone?: keyof typeof METER_FILL; ariaLabel?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label || right ? (
        <div className="flex justify-between gap-2 text-[13px]">
          <span className="font-semibold text-text">{label}</span>
          <span className="font-semibold text-muted">{right}</span>
        </div>
      ) : null}
      <div role="progressbar" aria-label={ariaLabel || label || right || "Progress"} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-surface-3">
        <div data-meter="" className={cn("h-full origin-left rounded-full", METER_FILL[tone])} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** Row of counted stages (generator `pipeline`). */
export function Pipeline({ items }: { items: { label: string; value: number; tone: Tone }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((it) => (
        <div key={it.label} className={cn("flex flex-[1_1_120px] flex-col gap-0.5 rounded-row p-4", TONE_PAIR[it.tone].split(" ")[0])}>
          <span className={cn("text-xs font-extrabold uppercase tracking-[0.05em]", TONE_PAIR[it.tone].split(" ")[1])}>{it.label}</span>
          <span className="font-display text-[30px] font-extrabold text-text">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Coloured strip directly under the top bar (generator `topstrip`). One action at most. */
export function TopStrip({ tone, icon, text, action }: { tone: Tone; icon: IconName; text: string; action?: ReactNode }) {
  const [bg, fg] = TONE_PAIR[tone].split(" ");
  return (
    <div role={tone === "err" ? "alert" : "status"} className={cn("flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-text md:px-5", bg)}>
      <span className={cn("inline-flex", fg)}><Icon name={icon} size={18} /></span>
      <span className="min-w-0">{text}</span>
      {action ? <span className={cn("ml-auto flex-none font-extrabold [&_a]:font-extrabold [&_a]:text-[inherit] [&_a]:underline", fg)}>{action}</span> : null}
    </div>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <h2 className="m-0 font-display text-[21px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[22px]">{title}</h2>
      <span className="grow" />
      {right}
    </div>
  );
}

export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="m-0 font-display text-[17px] font-bold leading-tight text-text">{title}</h3>
        {sub ? <p className="m-0 text-[13px] leading-[1.55] text-muted">{sub}</p> : null}
      </div>
      <span className="grow" />
      {right}
    </div>
  );
}

// ------------------------------------------------------------------ Skeletons (opacity pulse, no shimmer)
export function Sk({ w = "100%", h = 14, r = 8, className }: { w?: string | number; h?: number; r?: number; className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-n-pulse bg-surface-3", className)} style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkLines({ n = 3 }: { n?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {["72%", "94%", "58%", "86%", "40%"].slice(0, n).map((w) => <Sk key={w} w={w} h={12} r={6} />)}
    </div>
  );
}

export function SkCard({ lines = 2 }: { lines?: number }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-4 shadow-card md:p-5">
      <div className="flex items-center gap-3">
        <Sk w={44} h={44} r={14} />
        <div className="flex flex-1 flex-col gap-2">
          <Sk w="60%" />
          <Sk w="35%" h={10} />
        </div>
      </div>
      <SkLines n={lines} />
    </section>
  );
}

export function SkStat() {
  return (
    <section className="flex flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-4 shadow-card md:p-5">
      <Sk w="40%" h={12} />
      <Sk w="55%" h={30} r={10} />
      <Sk w="30%" h={10} />
    </section>
  );
}

export function SkRows({ n = 5 }: { n?: number }) {
  return (
    <div className="overflow-hidden rounded-row border border-border bg-surface-1">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
          <Sk w={36} h={36} r={12} />
          <div className="flex flex-1 flex-col gap-2">
            <Sk w="50%" h={12} r={6} />
            <Sk w="30%" h={10} r={6} />
          </div>
          <Sk w={80} h={24} r={999} />
        </div>
      ))}
    </div>
  );
}

export function LoadingNote({ text = "Loading…" }: { text?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-[12.5px] font-bold text-accent-text">
      <span data-spin="" className="inline-flex"><Icon name="refresh" size={16} /></span>
      {text}
    </div>
  );
}
