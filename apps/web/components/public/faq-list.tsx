"use client";

import { cn } from "@nelio/ui";
import { useState } from "react";

export interface Faq {
  q: string;
  a: string;
  category: "Licensing" | "Billing" | "Platforms" | "General";
}

const TABS = ["General", "Licensing", "Billing", "Platforms"] as const;

/**
 * FAQ tabs and answers. "General" shows every question, as on the board; the other tabs filter.
 * Tabs without questions yet (Agencies, Privacy) are left out until their copy exists (B-16).
 */
export function FaqList({ items }: { items: Faq[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const shown = tab === "General" ? items : items.filter((i) => i.category === tab);
  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Topics" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} aria-controls="faq-panel" onClick={() => setTab(t)} className={cn("tap-target min-h-10 cursor-pointer whitespace-nowrap rounded-full border-0 px-4 py-[9px] text-sm font-bold", t === tab ? "bg-ink text-on-ink" : "bg-transparent text-muted")}>
            {t}
          </button>
        ))}
      </div>
      <div id="faq-panel" role="tabpanel" className="flex flex-col gap-3">
        {shown.map((f, i) => (
          <details key={f.q} open={i === 0} className="group rounded-card border border-border bg-surface-1 shadow-card">
            {/* The padding sits on the question so the whole card header is the tap target; same look as the board. */}
            <summary className="flex cursor-pointer list-none justify-between gap-3 px-6 py-5 group-open:pb-2.5 font-display text-lg font-extrabold text-text [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden="true" className="text-accent-text group-open:hidden">+</span>
              <span aria-hidden="true" className="hidden text-accent-text group-open:inline">−</span>
            </summary>
            <p className="m-0 px-6 pb-5 text-[15px] leading-[1.55] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
