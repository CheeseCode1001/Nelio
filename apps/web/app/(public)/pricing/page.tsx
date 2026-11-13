import { Banner, ButtonLink, Icon, Illustration, Sticker } from "@nelio/ui";
import type { Metadata } from "next";
import { Big, Eyebrow, Section, SectionHeading } from "@/components/public/blocks";

export const metadata: Metadata = { title: "Pricing" };

const OL = "#0B0B14";
function Shapes({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <circle cx="160" cy="30" r="44" fill={c1} stroke={OL} strokeWidth="3" />
      <rect x="40" y="70" width="90" height="90" rx="30" fill={c2} stroke={OL} strokeWidth="3" transform="rotate(-18 85 115)" />
    </svg>
  );
}

/** Prices and entitlements: decision D-10 and the provisional table in A §7. Credits stay labelled provisional. */
const PLANS = [
  { name: "Free", price: "$0", blurb: "Try Nelio by hand.", feats: ["1 agent, manual only", "1 social account", "Very limited credits", "No autonomous publishing"], bg: "#F1F3F9", c: ["#FFFFFF", "#E4E8F1"], cta: "Start free" },
  { name: "Starter", price: "$19", blurb: "For getting consistent.", feats: ["2 agents", "3 social accounts", "Autonomous publishing", "Top-ups"], bg: "#59D8FF", c: ["#FFD43B", "#FFFFFF"] },
  { name: "Creator Pro", price: "$49", blurb: "For full-time creators.", feats: ["5 agents", "6 social accounts", "Batch variants", "Priority rendering"], bg: "#2F5BFF", c: ["#B6F24A", "#FF4FB8"], hot: true },
  { name: "Business", price: "$99", blurb: "For small teams.", feats: ["10 agents", "12 social accounts", "Team seats", "Approval workflows"], bg: "#B6F24A", c: ["#FFFFFF", "#59D8FF"] },
  { name: "Agency", price: "$249", blurb: "For client work.", feats: ["25 agents", "40 social accounts", "10 client workspaces", "Client portal & audit log"], bg: "#FF4FB8", c: ["#FFD43B", "#FFFFFF"] },
  { name: "Enterprise", price: "Custom", blurb: "For big operations.", feats: ["Custom limits", "SSO (planned)", "Dedicated support"], bg: "#FFD43B", c: ["#FF7A2F", "#FFFFFF"], cta: "Talk to us" },
] as const;

/**
 * M-04 Pricing. Every plan button leads to sign-up for now: checkout arrives with billing in Milestone 8 and live
 * charging waits on payment-provider eligibility (B-02). "Talk to us" needs a sales contact (B-15).
 */
export default function PricingPage() {
  return (
    <>
      <Section center pad="md:pt-16 md:pb-6">
        <div data-enter="" className="flex flex-col items-center gap-4">
          <Eyebrow>Flexible plans</Eyebrow>
          <Big size={68}>Simple plans. Hard limits.</Big>
          <p className="m-0 text-[17px] leading-[1.55] text-muted md:text-lg">Prices in USD. Pay in naira at checkout where supported. You’ll see the exact amount before you confirm.</p>
          <div role="group" aria-label="Billing period" className="flex flex-wrap gap-0.5 rounded-full border border-border bg-surface-1 p-1">
            <span aria-current="true" className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 py-[9px] text-sm font-bold text-on-ink">Monthly</span>
            <span aria-disabled="true" className="inline-flex min-h-10 items-center rounded-full px-4 py-[9px] text-sm font-bold text-muted">Yearly · coming later</span>
          </div>
        </div>
      </Section>
      <Section pad="md:pt-6 md:pb-20">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] md:gap-[18px]">
          {PLANS.map((p) => {
            const hot = "hot" in p && p.hot;
            return (
              <section key={p.name} data-reveal="" className={`relative flex flex-col gap-3.5 rounded-[30px] bg-surface-1 p-3.5 shadow-card ${hot ? "border-[3px] border-accent" : "border border-border"}`}>
                {hot ? <div className="absolute -top-3.5 right-3.5 z-[1]"><Sticker fill="yellow" rotate={4} icon="star" size={13}>Most popular</Sticker></div> : null}
                <div className="relative h-[120px] overflow-hidden rounded-[22px] border-2 border-outline" style={{ background: p.bg }}>
                  <Shapes c1={p.c[0]} c2={p.c[1]} />
                  <h2 className="absolute left-3.5 top-3.5 m-0 inline-flex items-center gap-1.5 rounded-full border-2 border-outline bg-white px-3 py-1 text-[13px] font-extrabold text-outline">{p.name}</h2>
                </div>
                <div className="flex grow flex-col gap-3 px-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[42px] font-extrabold tracking-[-0.03em] text-text">{p.price}</span>
                    {p.price.startsWith("$") ? <span className="text-sm text-muted">/mo</span> : null}
                  </div>
                  <p className="m-0 text-sm leading-[1.55] text-muted">{p.blurb}</p>
                  <ul className="m-0 flex grow list-none flex-col gap-2 p-0">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text">
                        <span className="inline-flex size-5 flex-none items-center justify-center rounded-full bg-accent text-white"><Icon name="check" size={12} strokeWidth={3} /></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href="/signup" variant={hot ? "primary" : "secondary"} full>{"cta" in p ? p.cta : "Choose plan"}</ButtonLink>
                </div>
              </section>
            );
          })}
        </div>
        <Banner tone="blue" title="Plan limits and credit amounts are provisional" text="We are measuring real processing costs before launch. Final numbers will be shown here before you pay anything." />
        <div data-reveal="" className="flex flex-wrap items-center gap-6 rounded-panel bg-surface-2 px-5 py-6 md:px-7">
          <Illustration name="gift" width={180} />
          <div className="flex flex-[1_1_360px] flex-col gap-1.5">
            <SectionHeading size={28}>3-day trial of paid features</SectionHeading>
            <p className="m-0 text-[15px] leading-[1.55] text-muted">1 agent · 1 account · 2 short exports · a hard compute cap. No card needed, and you’re never charged automatically.</p>
          </div>
          <ButtonLink href="/signup" variant="cta" arrow>Start trial</ButtonLink>
        </div>
      </Section>
    </>
  );
}
