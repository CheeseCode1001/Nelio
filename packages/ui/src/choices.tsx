import type { ComponentProps, ReactNode } from "react";
import { Bubble } from "./data-display";
import { Chip, Icon, cn, type IconName, type Tone } from "./primitives";

/**
 * Big selectable card (generator `choice`). A real radio or checkbox inside a label, so it works with the
 * keyboard and without script; the card's look follows `:checked` through `has-checked`.
 */
export function ChoiceCard({ title, sub, icon, tone = "blue", badge, locked, type = "radio", className, ...input }: { title: string; sub: string; icon?: IconName; tone?: Tone; badge?: string; locked?: boolean; type?: "radio" | "checkbox" } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label
      className={cn(
        "box-border flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] border-2 border-border bg-surface-1 px-[18px] py-4 text-left",
        "has-checked:border-accent has-checked:bg-accent-tint has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
        locked && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input type={type} disabled={locked} className="peer sr-only" {...input} />
      {icon ? <Bubble icon={icon} tone={tone} size={48} /> : null}
      <span className="flex grow flex-col gap-[3px]">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-extrabold text-text">{title}</span>
          {badge ? <Chip tone={locked ? "neutral" : "ai"} icon={locked ? "lock" : undefined}>{badge}</Chip> : null}
        </span>
        <span className="text-[13.5px] leading-[1.4] text-muted">{sub}</span>
      </span>
      <span aria-hidden="true" className="box-border inline-flex size-[26px] flex-none items-center justify-center rounded-full border-2 border-border text-white peer-checked:border-accent peer-checked:bg-accent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <Icon name="check" size={15} strokeWidth={3} />
      </span>
    </label>
  );
}

/** Toggleable pill (onboarding goals). A checkbox styled as a pill; pressed = accent tint. */
export function PillCheckbox({ label, ...input }: { label: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className="box-border inline-flex min-h-[46px] w-fit cursor-pointer items-center rounded-full border-2 border-border bg-surface-1 px-[18px] py-3 text-[15px] font-bold text-text has-checked:border-accent has-checked:bg-accent-tint has-checked:text-accent-text has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
      <input type="checkbox" className="sr-only" {...input} />
      {label}
    </label>
  );
}

/** Segmented progress for multi-step flows (generator `steps`). `current` is 1-based. */
export function StepProgress({ total, current }: { total: number; current: number }) {
  return (
    <div role="progressbar" aria-label={`Step ${current} of ${total}`} aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} className="flex gap-1.5">
      {Array.from({ length: total }, (_, k) => (
        <span key={k} className={cn("h-1.5 flex-1 rounded-full", k < current ? "bg-accent" : "bg-surface-3")} />
      ))}
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">{children}</div>;
}

/** On/off switch (generator `toggle`): label and optional note on the left, the switch on the right. */
export function Switch({ label, sub, checked, onChange, disabled, id }: { label: string; sub?: string; checked: boolean; onChange?: (next: boolean) => void; disabled?: boolean; id: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div id={`${id}-label`} className="text-sm font-bold text-text">{label}</div>
        {sub ? <div className="text-[13px] text-muted">{sub}</div> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn("flex h-[30px] w-[52px] flex-none cursor-pointer rounded-full border-0 p-1 disabled:cursor-not-allowed", checked ? "justify-end bg-accent" : "justify-start bg-surface-3")}
      >
        <span className="block size-[22px] rounded-full bg-white" />
      </button>
    </div>
  );
}
