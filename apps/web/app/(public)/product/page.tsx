import { Bubble, Card, Chip, Icon, Illustration, Row, RowList, Sticker, photoSrc } from "@nelio/ui";
import type { Metadata } from "next";
import { Big, Eyebrow, Section, SectionHeading } from "@/components/public/blocks";

export const metadata: Metadata = { title: "How Nelio works" };

/**
 * M-02 Product. The board draws the Clipping tab of a six-tab tour (Agents, Clipping, Content Studio, Approvals,
 * Licensing, Analytics). Only Clipping has approved copy, so only it is shown; the other tabs need copy (B-16).
 */
export default function ProductPage() {
  return (
    <>
      <Section center>
        <div data-enter="" className="flex flex-col items-center gap-[18px]">
          <Sticker fill="lime" rotate={-3}>Product tour</Sticker>
          <Big size={72}>How Nelio works</Big>
        </div>
      </Section>
      <Section>
        <div className="flex flex-wrap items-center gap-10">
          <div data-reveal="" className="flex-[1_1_520px] rounded-feature bg-accent p-4 md:p-7">
            <Card>
              <div role="img" aria-label="Source video podcast_ep12.mp4" className="relative box-border aspect-video w-full overflow-hidden rounded-[22px] border-2 border-outline bg-cyan">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative still */}
                <img src={photoSrc("p9")} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
                <div className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,11,20,0.75)] text-white"><Icon name="play" size={26} /></div>
                <div className="absolute left-3 top-3"><Chip tone="ink">podcast_ep12.mp4</Chip></div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Chip tone="lime">“Stop budgeting like this”</Chip>
                <Chip tone="neutral">score 82 · estimate</Chip>
                <Chip tone="neutral">0:12–0:54</Chip>
              </div>
            </Card>
          </div>
          <div data-reveal="" className="flex flex-[1_1_400px] flex-col gap-4">
            <Eyebrow>Clipping</Eyebrow>
            <SectionHeading size={44}>Find the 40 seconds that matter</SectionHeading>
            <p className="m-0 text-[17px] leading-[1.55] text-muted">Nelio AI reads the transcript and scenes, ranks the moments, and you pick. Scores are estimates, never promises.</p>
            <RowList>
              <Row title="Transcribe" sub="Fast, Balanced or High Quality" left={<Bubble icon="type" tone="blue" />} />
              <Row title="Detect scenes" sub="Clean cuts at natural breaks" left={<Bubble icon="film" tone="ai" />} />
              <Row title="Reframe to 9:16" sub="Keeps the speaker in frame" left={<Bubble icon="phone" tone="lime" />} />
              <Row title="Caption with your brand" sub="Your fonts and colours" left={<Bubble icon="palette" tone="warn" />} />
            </RowList>
          </div>
        </div>
      </Section>
      <Section tone="s2">
        <div className="flex flex-wrap gap-[22px]">
          {[
            { fill: "#FFD43B", ill: "strategist" as const, title: "Nelio AI plans and writes", text: "Strategy, hooks, captions and research." },
            { fill: "#B6F24A", ill: "brand" as const, title: "Brand kits", text: "Every agent uses your look." },
            { fill: "#59D8FF", ill: "aivideo" as const, title: "Original AI video", text: "Needs a specialist video partner.", later: true },
          ].map((c) => (
            <div key={c.title} data-reveal="" className="flex flex-[1_1_300px] flex-col gap-2.5 rounded-panel border-2 border-outline p-6 text-outline shadow-sticker-card" style={{ background: c.fill }}>
              <Illustration name={c.ill} width={200} />
              <span className="font-display text-[22px] font-extrabold">{c.title}</span>
              <span className="text-sm">{c.text}</span>
              {c.later ? <Sticker fill="white" rotate={-3} size={13}>Coming later</Sticker> : null}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
