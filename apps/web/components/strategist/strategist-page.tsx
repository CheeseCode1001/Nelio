import { Banner, Button, Chip, Icon, Illustration, Motion, PageHead, Sticker, cn } from "@nelio/ui";

const STARTERS = [
  { icon: "search", tone: "bg-accent-tint text-accent-text", title: "Research my niche", sub: "Trends and gaps in your niche" },
  { icon: "pen", tone: "bg-ai-tint text-ai-text", title: "Write 5 hooks", sub: "For your next video" },
  { icon: "calendar", tone: "bg-lime-tint text-lime-text", title: "Plan next month", sub: "A posting calendar with budget" },
  { icon: "chart", tone: "bg-warn-tint text-warn-text", title: "What’s working?", sub: "From your published posts" },
] as const;

/**
 * APP-02 Strategist. The layout is the Empty board. Until Nelio AI is set up for this deployment the page
 * says so plainly and every control is disabled: nothing is sent, nothing is charged. The conversation,
 * proposals and History arrive with the Nelio AI service.
 */
export function StrategistPage({ available }: { available: boolean }) {
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">Strategist</h1>
              <Sticker fill="pink" rotate={-3} icon="spark" size={12}>Nelio AI</Sticker>
            </div>
            <p className="m-0 mt-1.5 text-[15px] text-muted">Plan with Nelio AI. It proposes, you decide.</p>
          </div>
          <Button variant="secondary" icon="clock" disabled>History</Button>
        </div>
        {available ? null : (
          <Banner tone="blue" title="Nelio AI isn’t set up yet" text="Planning opens once Nelio AI is connected for your workspace. Until then nothing is sent and no credits are used." />
        )}
      </div>
      <div data-enter="" className="mx-auto flex w-full max-w-[880px] flex-col items-center gap-3 text-center">
        <Illustration name="strategist" width={160} />
        <h2 className="m-0 font-display text-[29px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text md:text-[44px]">What should we make this week?</h2>
        <p className="m-0 max-w-[640px] text-[15px] text-muted">Tell Nelio AI your goal. It researches, proposes a plan and a budget, and waits for your OK.</p>
      </div>
      <div data-enter="" className="flex w-full flex-col gap-4">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))]">
          {STARTERS.map((s) => (
            <button key={s.title} type="button" disabled={!available} className="flex cursor-pointer flex-col items-start gap-2 rounded-[22px] border border-border bg-surface-1 p-4 text-left shadow-card disabled:cursor-not-allowed disabled:opacity-60">
              <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", s.tone)}><Icon name={s.icon} size={18} /></span>
              <span className="text-sm font-bold text-text">{s.title}</span>
              <span className="text-[12.5px] text-muted">{s.sub}</span>
            </button>
          ))}
        </div>
        <form className="flex items-center gap-2 rounded-full border-2 border-border bg-surface-1 py-1.5 pl-5 pr-1.5 shadow-card">
          <label htmlFor="strategist-message" className="sr-only">Message Nelio AI</label>
          <input id="strategist-message" disabled={!available} placeholder="Ask Nelio AI to plan, research or write…" className="min-h-11 min-w-0 grow border-0 bg-transparent text-sm text-text outline-none placeholder:text-muted disabled:cursor-not-allowed" />
          <button type="submit" disabled={!available} aria-label="Send" className="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-white disabled:cursor-not-allowed disabled:opacity-50"><Icon name="arrowr" size={18} /></button>
        </form>
        {available ? null : <div className="flex justify-center"><Chip tone="neutral" icon="lock">Needs setup</Chip></div>}
      </div>
    </Motion>
  );
}
