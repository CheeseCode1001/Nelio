import { Banner, ButtonLink, Card, CardTitle, Icon, Illustration, Row, RowList, Sticker, type IconName } from "@nelio/ui";
import type { Metadata } from "next";
import { Big, Highlight, Section } from "@/components/public/blocks";

export const metadata: Metadata = { title: "Licensing & creator partners" };

const STEPS: { fill: string; icon: IconName; title: string; text: string }[] = [
  { fill: "#B6F24A", icon: "shield", title: "Verify ownership", text: "Sign in with your platform to prove the channel is yours." },
  { fill: "#FFD43B", icon: "file", title: "Set allowed uses", text: "Clips, compilations, platforms, attribution, expiry." },
  { fill: "#59D8FF", icon: "eye", title: "See every use", text: "Every clip made from your videos, and where it went." },
  { fill: "#FF4FB8", icon: "x", title: "Revoke instantly", text: "New use stops at once; published posts get flagged." },
];

/** M-05 Licensing & Creator Partners. Paid licensing and payouts stay "coming later" (D-15). */
export default function LicensingPage() {
  return (
    <>
      <Section>
        <div className="relative flex flex-wrap items-center gap-10">
          <div data-enter="" className="flex flex-[1_1_560px] flex-col gap-5">
            <Sticker fill="cyan" rotate={-3} icon="shield">For content owners</Sticker>
            <Big size={68}>Get clipped, <Highlight>on your terms</Highlight></Big>
            <p className="m-0 text-[17px] leading-[1.55] text-muted md:text-[19px]">Verify your channel, choose what people may do with your videos, see every use and revoke any time. Free, no subscription.</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/creators/join" variant="cta" size="lg" arrow>Join free as a content owner</ButtonLink>
              <ButtonLink href="#how" variant="secondary" size="lg">How licensing works</ButtonLink>
            </div>
          </div>
          <div className="flex flex-[1_1_380px] justify-center"><Illustration name="licenses" width={420} /></div>
        </div>
      </Section>
      <Section tone="s2" className="scroll-mt-20">
        <h2 id="how" className="sr-only">How licensing works</h2>
        <div className="flex flex-wrap gap-5">
          {STEPS.map((s) => (
            <div key={s.title} data-reveal="" className="flex flex-[1_1_240px] flex-col gap-2 rounded-[30px] border-2 border-outline p-[22px] text-outline shadow-[5px_5px_0_var(--n-ol)]" style={{ background: s.fill }}>
              <Icon name={s.icon} size={30} strokeWidth={2.4} />
              <span className="font-display text-xl font-extrabold">{s.title}</span>
              <span className="text-sm">{s.text}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] md:gap-4">
          <Banner tone="blue" title="Paid licensing and payouts are coming later" text="We’ll open them once legal, tax and payment requirements are met." />
          <Card>
            <CardTitle>What we never do</CardTitle>
            <RowList>
              {["Treat public videos as licensed", "Assume silence means yes", "Ignore third-party music or footage"].map((t) => (
                <Row key={t} title={t} left={<span className="text-err-text"><Icon name="x" size={18} /></span>} />
              ))}
            </RowList>
          </Card>
        </div>
      </Section>
    </>
  );
}
