import { renderEstimate } from "@nelio/domain";
import { Card, Icon, Illustration, KeyValues, Motion, Sk, cn, Ghost } from "@nelio/ui";
import type { StepState, StudioData } from "@/lib/studio";
import { StudioEditor, StudioHeader, type StudioHrefs } from "./studio-editor";
import { STUDIO_SAMPLE } from "./sample";

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
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <StudioHeader d={d} hrefs={hrefs} estimate={renderEstimate(first ? (first.endMs - first.startMs) / 1000 : 30)} renderDisabled />
          <Processing d={d} />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="">
        <StudioEditor slug={slug} d={d} hrefs={hrefs} preview={preview} />
      </div>
    </Motion>
  );
}

/** CL-03 Loading: the Studio itself, ghosted. */
export function StudioLoading() {
  return <Ghost><StudioPage d={STUDIO_SAMPLE} hrefs={{ library: "#", variants: "#" }} /></Ghost>;
}
