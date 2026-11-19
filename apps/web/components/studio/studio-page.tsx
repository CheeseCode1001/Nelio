import { renderEstimate } from "@nelio/domain";
import { Card, Icon, Illustration, KeyValues, Motion, Sk, cn } from "@nelio/ui";
import type { StepState, StudioData } from "@/lib/studio";
import { StudioEditor, StudioHeader, type StudioHrefs } from "./studio-editor";

const STEP_LOOK: Record<StepState, { bg: string; icon: "check" | "refresh" | "clock" | "alert"; fg: string }> = {
  done: { bg: "bg-ok-tint", icon: "check", fg: "text-ok-text" },
  running: { bg: "bg-accent-tint", icon: "refresh", fg: "text-accent-text" },
  queued: { bg: "bg-surface-2", icon: "clock", fg: "text-muted" },
  failed: { bg: "bg-err-tint", icon: "alert", fg: "text-err-text" },
};

/** CL-03 Processing: what's happening to the video, step by step, with the estimate and credits used. */
function Processing({ d }: { d: StudioData }) {
  const p = d.processing!;
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      <Card>
        <div className="flex justify-center"><Illustration name="media" width={197} /></div>
        <h2 className="m-0 break-words font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">Working on {d.asset.title}…</h2>
        <p className="m-0 text-[15px] leading-[1.55] text-muted">{p.eta}</p>
      </Card>
      <Card>
        <ol className="m-0 list-none p-0" aria-label="Processing steps">
          {p.steps.map((s, i) => {
            const look = STEP_LOOK[s.state];
            return (
              <li key={s.title} className="relative flex items-start gap-3 pb-3.5 last:pb-0">
                {i < p.steps.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-4 top-[36px] w-0.5 bg-border" /> : null}
                <span className={cn("inline-flex size-[34px] flex-none items-center justify-center rounded-full", look.bg, look.fg)}>
                  <Icon name={look.icon} size={16} strokeWidth={2.4} />
                </span>
                <div className="min-w-0 pt-1.5">
                  <div className="text-sm font-bold text-text">{s.title}<span className="sr-only">: {s.state}</span></div>
                  {s.detail ? <div className="text-[12.5px] text-muted">{s.detail}</div> : null}
                </div>
              </li>
            );
          })}
        </ol>
        <KeyValues pairs={[["Estimated", `≈ ${p.estimate} credits`], ["Used so far", `${p.used} credits`]]} />
      </Card>
    </div>
  );
}

export function StudioPage({ slug, d, hrefs, preview }: { slug?: string; d: StudioData; hrefs: StudioHrefs; preview?: { unsaved?: boolean; estimate?: boolean; queued?: boolean } }) {
  if (d.mode === "processing" && d.processing) {
    const first = d.moments[0];
    return (
      <Motion className="flex flex-col gap-6">
        <div data-enter="" className="flex flex-col gap-6">
          <StudioHeader d={d} hrefs={hrefs} estimate={renderEstimate(first ? (first.endMs - first.startMs) / 1000 : 30)} renderDisabled />
          <Processing d={d} />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="">
        <StudioEditor slug={slug} d={d} hrefs={hrefs} preview={preview} />
      </div>
    </Motion>
  );
}

export function StudioLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={180} h={13} /><Sk w={320} h={36} /><Sk w={200} h={16} /></div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:[grid-template-columns:minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-5 shadow-card">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="flex items-center gap-3"><Sk w={36} h={36} r={12} /><div className="flex grow flex-col gap-2"><Sk w="70%" h={12} /><Sk w="45%" h={10} /></div><Sk w={70} h={24} r={12} /></div>)}
          </div>
          <div className="flex flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-5 shadow-card"><Sk w="90%" h={12} /><Sk w="80%" h={12} /><Sk w="85%" h={12} /><Sk w="60%" h={12} /></div>
        </div>
        <div className="flex flex-col items-center gap-3.5 rounded-card border border-border bg-surface-1 p-5 shadow-card"><div className="aspect-[9/16] w-full max-w-[300px] rounded-[22px] bg-surface-3" /></div>
        <div className="flex flex-col gap-3.5 md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex">
          <div className="flex flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-5 shadow-card"><Sk w="70%" h={12} /><Sk w="90%" h={12} /><Sk w="55%" h={12} /></div>
          <div className="flex flex-col gap-2.5 rounded-card border border-border bg-surface-1 p-5 shadow-card"><Sk w="80%" h={12} /><Sk w="60%" h={12} /></div>
        </div>
      </div>
      <span className="sr-only" role="status">Loading the Studio…</span>
    </div>
  );
}
