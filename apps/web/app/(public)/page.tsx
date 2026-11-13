import {
  AgentAvatar, AvatarPhoto, Blob, ButtonLink, Chip, Icon, IPhone, Illustration, PlatformBadge, ShortScreen, Small, Sticker,
  photoSrc, type IllustrationName, type PhotoKey, type Platform,
} from "@nelio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Big, Eyebrow, Highlight, Section, SectionHead, SectionHeading } from "@/components/public/blocks";

export const metadata: Metadata = {
  title: { absolute: "Nelio: your AI content team" },
  description: "Turn one long video into a week of shorts. Nelio’s agents find the best moments, cut, caption and schedule them, from content you own or have licensed.",
};

/** The hero "upload" pill. Uploading needs an account, so it leads to sign-up. */
function UploadPill({ compact }: { compact?: boolean }) {
  return (
    <Link href="/signup" className={`box-border flex w-full items-center gap-2 rounded-full border-2 border-outline bg-surface-1 py-2 pl-5 pr-2 text-left no-underline shadow-[4px_4px_0_var(--n-ol)] ${compact ? "max-w-[300px]" : "max-w-[520px]"}`}>
      <span className="text-muted"><Icon name="upload" size={20} /></span>
      <span className="grow text-[15px] text-muted">Drop a video you own, or choose a file</span>
      <span className="box-border inline-flex min-h-11 flex-none items-center gap-2 rounded-full border-2 border-accent bg-accent py-1.5 pl-[18px] pr-1.5 text-sm font-bold text-on-accent">
        Get clips
        <span aria-hidden="true" className="inline-flex size-[26px] items-center justify-center rounded-full bg-on-accent text-accent"><Icon name="arrowr" size={14} strokeWidth={2.6} /></span>
      </span>
    </Link>
  );
}

const FAN: { bg: string; cap: string; rot: number; platform?: Platform; score?: number; photo: PhotoKey }[] = [
  { bg: "#9B7BFF", cap: "5 MONEY MYTHS", rot: -14, platform: "ig", photo: "p6" },
  { bg: "#59D8FF", cap: "WAIT FOR IT", rot: -6, score: 98, photo: "p1" },
  { bg: "#FFD43B", cap: "I TRIED IT FOR A WEEK", rot: 0, platform: "yt", score: 99, photo: "p10" },
  { bg: "#FF7A2F", cap: "DON’T DO THIS", rot: 6, photo: "p8" },
  { bg: "#B6F24A", cap: "THE 50/30/20 RULE", rot: 14, platform: "tt", score: 100, photo: "p2" },
];

function PhoneFan() {
  const phones = (w: number, overlap: number) =>
    FAN.map((p, i) => (
      <div key={p.cap} style={{ marginLeft: i ? -overlap : 0, zIndex: 5 - Math.abs(i - 2), marginTop: Math.abs(i - 2) * (w / 200) * 28 }}>
        <IPhone width={w} rotate={p.rot}>
          <ShortScreen photo={p.photo} caption={p.cap} bg={p.bg} score={p.score} platform={p.platform} />
        </IPhone>
      </div>
    ));
  return (
    <div className="relative flex items-start justify-center py-[30px]" aria-hidden="true">
      <Blob size={560} className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      {/* Same 200 px phones at every width, as on both boards: on phones the fan runs off both edges. */}
      <div className="relative flex items-start">{phones(200, 36)}</div>
      <div className="absolute left-[8%] top-2.5"><Sticker fill="pink" rotate={-6} icon="spark" size={15}>Nelio AI picked this</Sticker></div>
      <div className="absolute bottom-[30px] right-[6%]"><Sticker fill="cyan" rotate={5} size={15}>Licensed ✓</Sticker></div>
    </div>
  );
}

function FeatureRow({ eyebrow, title, text, visual, fill, flip }: { eyebrow: string; title: string; text: string; visual: ReactNode; fill: string; flip?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-12 ${flip ? "md:flex-row-reverse" : ""}`}>
      <div data-reveal="" className="flex flex-[1_1_380px] flex-col gap-3.5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionHeading size={40}>{title}</SectionHeading>
        <p className="m-0 text-base leading-[1.55] text-muted">{text}</p>
        <ButtonLink href="/product" variant="secondary">See how</ButtonLink>
      </div>
      <div data-reveal="" className="relative flex min-h-[404px] flex-[1_1_480px] items-center justify-center overflow-hidden rounded-feature p-8" style={{ background: fill }}>{visual}</div>
    </div>
  );
}

const CONVERT: { fill: string; title: string; text: string; ill: IllustrationName }[] = [
  { fill: "#FFD43B", title: "Podcast → Shorts", text: "Hour-long episodes become a week of clips.", ill: "media" },
  { fill: "#59D8FF", title: "Stream → Reels", text: "Catch the hype moments from every stream.", ill: "exports" },
  { fill: "#FF4FB8", title: "Webinar → Clips", text: "Turn talks into bite-size lessons.", ill: "strategist" },
];

const AVATARS: { photo: PhotoKey; ring: string; platform: Platform }[] = [
  { photo: "p1", ring: "#FFD43B", platform: "yt" }, { photo: "p10", ring: "#59D8FF", platform: "ig" }, { photo: "p3", ring: "#FF4FB8", platform: "tt" },
  { photo: "p6", ring: "#B6F24A", platform: "ig" }, { photo: "p8", ring: "#FF7A2F", platform: "yt" }, { photo: "p2", ring: "#9B7BFF", platform: "ig" }, { photo: "p4", ring: "#FFD43B", platform: "yt" },
];

/** M-01 Home. */
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Section>
        <div data-enter="" className="flex flex-col items-center gap-[22px] text-center">
          <Sticker fill="yellow" rotate={-3} icon="spark">Your AI content team</Sticker>
          <Big size={76} mobile={26}>Turn one long video into <Highlight>a week of shorts.</Highlight></Big>
          <p className="m-0 text-[19px] leading-[1.55] text-muted">
            Nelio’s agents find the best moments, cut, caption and schedule them, only from content you own or have licensed, and only with the approvals and budgets you set.
          </p>
          <UploadPill />
          <Small>Free plan forever · 3-day trial, no card needed</Small>
        </div>
        <PhoneFan />
      </Section>

      {/* People */}
      <Section>
        <div data-reveal="" className="flex flex-col items-center gap-[18px] text-center">
          <h2 className="m-0 font-display text-xl font-bold text-text">Built for the people who post every day</h2>
          <p className="m-0 text-sm text-muted">Podcasters, streamers, small businesses and agencies across Nigeria and beyond.</p>
          <div className="flex flex-wrap justify-center gap-3.5" aria-hidden="true">
            {AVATARS.map((a) => (
              <div key={a.photo} className="relative">
                <AvatarPhoto photo={a.photo} size={82} ring={a.ring} />
                <span className="absolute -bottom-0.5 -right-1"><PlatformBadge platform={a.platform} size={24} /></span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section>
        <SectionHead eyebrow="All-in-one studio" title="Everything you need to post every day." sub="One studio for clipping, captions, planning, approvals and publishing, with no editing skills needed." />
        <FeatureRow
          eyebrow="Find the moments"
          title="The best 40 seconds, found for you."
          text="Upload a podcast or stream. Nelio AI reads the transcript and scenes, ranks the moments most likely to work as shorts, and reframes them to 9:16. Scores are estimates. You always pick."
          fill="#2F5BFF"
          visual={
            <div className="flex" aria-hidden="true">
              {([["#FFD43B", "THE TRUTH", 98, "tt", -6, "p7"], ["#59D8FF", "WAIT…", 99, "yt", 0, "p4"], ["#FF4FB8", "NO WAY", 100, "ig", 6, "p3"]] as const).map(([bg, cap, sc, pl, r, ph], i) => (
                <div key={cap} style={{ marginLeft: i ? -20 : 0 }}>
                  <IPhone width={170} rotate={r}><ShortScreen photo={ph} caption={cap} bg={bg} score={sc} platform={pl} /></IPhone>
                </div>
              ))}
            </div>
          }
        />
        <FeatureRow
          eyebrow="Edit with words"
          title="Tell it what to change. Done."
          text="No timeline wrestling. Type “make captions bigger” or “cut the intro” and watch it happen. Full timeline editing is there when you want it."
          fill="#B6F24A"
          flip
          visual={
            <div className="box-border flex w-full max-w-[360px] flex-col gap-3 rounded-[26px] border-2 border-outline bg-white p-4" aria-hidden="true">
              <div className="flex items-center gap-2"><AgentAvatar color="pink" shape="blob" size={34} /><span className="text-[12.5px] font-extrabold text-outline">Edit with words</span></div>
              <div className="rounded-2xl bg-[#F1F3F9] px-3.5 py-3 text-sm text-outline">Cut the first pause and make captions bigger</div>
              <div className="flex flex-wrap gap-1.5"><Chip tone="ok" icon="check">Done in 4 s</Chip><Chip tone="lime" icon="zap">≈2 credits</Chip></div>
            </div>
          }
        />
        <FeatureRow
          eyebrow="Captions that pop"
          title="Bold captions in your brand."
          text="Animated captions in your fonts and colours, saved as a brand kit so every agent uses them."
          fill="#FF4FB8"
          visual={
            <div className="flex justify-center gap-2.5" aria-hidden="true">
              {([["BOLD POP", "#FFD43B", 18], ["minimal", "#FFFFFF", 16], ["KARAOKE", "#B6F24A", 18]] as const).map(([t, b, fs]) => (
                <span key={t} data-pop="" className="rounded-[14px] border-2 border-outline px-3.5 py-2.5 font-display font-extrabold text-outline" style={{ background: b, fontSize: fs }}>{t}</span>
              ))}
            </div>
          }
        />
      </Section>

      {/* Turn anything into shorts */}
      <Section tone="s2">
        <SectionHead eyebrow="Turn anything into shorts" title="Long video in. Scroll-stoppers out." />
        <div className="flex flex-wrap gap-[22px]">
          {CONVERT.map((c) => (
            <Link key={c.title} href="/product" data-reveal="" className="flex flex-[1_1_300px] flex-col gap-2.5 rounded-panel border-2 border-outline p-6 text-outline no-underline shadow-sticker-card hover:text-outline" style={{ background: c.fill }}>
              <Illustration name={c.ill} width={220} />
              <span className="font-display text-[22px] font-extrabold">{c.title}</span>
              <span className="text-sm leading-normal">{c.text}</span>
              <span className="inline-flex w-fit items-center gap-2 text-sm font-extrabold">
                Explore
                <span aria-hidden="true" className="inline-flex size-7 items-center justify-center rounded-full bg-outline text-white"><Icon name="arrowr" size={15} strokeWidth={2.6} /></span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Three steps */}
      <Section>
        <SectionHead eyebrow="Seamless workflow" title="From upload to posted in 3 steps." />
        <div className="flex flex-wrap gap-7">
          {[
            { n: "1", title: "Upload or import", text: "Drop a video you own, or pick something from a creator who licensed it to you.", mock: <UploadPill compact /> },
            {
              n: "2", title: "Nelio AI does the work", text: "Transcribe, find the moments, reframe, caption. You see the cost before it starts.",
              mock: (
                <div className="flex items-center gap-3.5" aria-hidden="true">
                  <AgentAvatar color="pink" shape="blob" size={56} />
                  <div className="flex flex-col gap-1.5"><Chip tone="blue" icon="refresh">Transcribing…</Chip><Chip tone="ai" icon="spark">4 moments found</Chip><Chip tone="lime" icon="zap">≈22 credits</Chip></div>
                </div>
              ),
            },
            {
              n: "3", title: "Approve & publish", text: "Approve each platform, schedule, and Nelio posts it. Clients can approve from their phone.",
              mock: (
                <div className="flex items-center gap-3" aria-hidden="true">
                  <PlatformBadge platform="ig" size={40} />
                  <PlatformBadge platform="yt" size={40} />
                  <span className="-rotate-8 rounded-[14px] border-[3px] border-[#0E6F38] px-3.5 py-2 font-display font-extrabold text-[#0E6F38]">APPROVED</span>
                </div>
              ),
            },
          ].map((st) => (
            <div key={st.n} data-reveal="" className="flex flex-[1_1_320px] flex-col gap-3.5">
              <div className="flex h-[242px] items-center justify-center rounded-[28px] border border-border bg-surface-2 p-5">{st.mock}</div>
              <Eyebrow>Step {st.n}</Eyebrow>
              <h3 className="m-0 font-display text-[22px] font-bold leading-tight text-text">{st.title}</h3>
              <p className="m-0 text-sm leading-[1.55] text-muted">{st.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Trust strip */}
      <Section>
        <div data-reveal="" className="grid overflow-hidden rounded-feature bg-lime p-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {([["check", "Every post approved", "Nothing publishes without the OK you set."], ["shield", "Every source licensed", "Your uploads or verified licenses only."], ["wallet", "Every credit shown", "Estimate before, actual after, hard limits."]] as const).map(([ic, t, s], i) => (
            <div key={t} className={`flex flex-col gap-1.5 px-6 py-2.5 text-outline ${i ? "border-l-2 border-[rgba(11,11,20,0.2)]" : ""}`}>
              <Icon name={ic} size={30} strokeWidth={2.4} />
              <span className="font-display text-[28px] font-extrabold tracking-[-0.03em]">{t}</span>
              <span className="text-[15px]">{s}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Wall of love: placeholders until real, consented beta quotes exist (handoff §6.6). */}
      <Section>
        <SectionHead eyebrow="Wall of love" title="Creators say it best." sub="Real quotes from our private beta will live here." />
        <div className="flex flex-wrap justify-center gap-4">
          {(["p6", "p1", "p10", "p7", "p8"] as PhotoKey[]).map((ph, i) => (
            <div key={ph} data-reveal="" className="relative h-[304px] flex-[0_1_220px] overflow-hidden rounded-[28px] border-2 border-outline" style={{ background: ["#59D8FF", "#FFD43B", "#FF4FB8", "#B6F24A", "#FF7A2F"][i] }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
              <img src={photoSrc(ph)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 size-full object-cover object-[center_top]" />
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border-2 border-outline bg-white px-3 py-2.5 text-[13px] font-semibold text-outline">
                [Beta creator quote]
                <br />
                <span className="text-[#5B6175]">[Name] · [Niche]</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section tone="s2">
        <SectionHead eyebrow="Flexible plans" title="Scale your content, not your budget." />
        <div className="flex justify-center"><ButtonLink href="/pricing" variant="cta" arrow>See all plans</ButtonLink></div>
      </Section>

      {/* Final call to action */}
      <Section>
        <div data-reveal="" className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[40px] bg-accent px-12 py-16 text-center">
          <Blob size={300} fill="#3D63FF" className="-left-[60px] -top-20" />
          <Blob size={260} fill="#3D63FF" className="-bottom-[90px] -right-10" />
          <div className="relative flex flex-col items-center gap-[18px]">
            <Sticker fill="yellow" rotate={-4}>Free forever plan</Sticker>
            <Big size={60} as="h2" className="text-white">Ready to meet your agents?</Big>
            <p className="m-0 text-lg leading-[1.55] text-white">Start free. Upgrade when your agents are pulling their weight.</p>
            <ButtonLink href="/signup" variant="cta" size="lg" arrow>Start free</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

