import {
  AgentAvatar, Banner, Bubble, Button, Card, CardHead, Chip, IconButton, Logo, Motion, PersonAvatar, PlatformBadge, Row, RowList, SkCard, SkRows, SkStat, Sticker,
} from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Big, Eyebrow, SectionHeading } from "@/components/public/blocks";
import { ChoiceDemo, FormsDemo } from "@/components/dev/foundations-demo";
import { devUiEnabled } from "@/lib/dev-ui";
import { DevNav } from "./dev-nav";

export const metadata: Metadata = { title: "Design foundations", robots: { index: false } };

const OL = "#0B0B14";
function Swatch({ name, hex, note }: { name: string; hex: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="box-border flex h-[88px] items-end rounded-row border-2 p-2.5" style={{ background: hex, borderColor: OL }}>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold" style={{ color: OL }}>{hex}</span>
      </div>
      <div className="text-[13px] font-extrabold text-text">{name}</div>
      <div className="text-xs text-muted">{note}</div>
    </div>
  );
}

const grid = (min: number) => ({ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))` });

/**
 * Development-only reproduction of the Foundations board (`Main`), built from the real components so fidelity can
 * be checked component by component (handoff §6.5). Not available in production builds.
 */
export default function FoundationsPage() {
  if (!devUiEnabled()) notFound();
  return (
    <Motion className="flex grow flex-col">
      <main id="main" className="mx-auto box-border flex w-full max-w-[1328px] flex-col gap-6 p-4 md:p-14" data-enter="">
        <DevNav current="/dev/ui" />
        <div className="flex flex-wrap items-center gap-4">
          <Logo size={64} />
          <span className="grow" />
          <Sticker fill="lime" rotate={-3}>Design system v2</Sticker>
          <Sticker fill="yellow" rotate={4}>Light default</Sticker>
        </div>
        <p className="m-0 text-lg leading-[1.55] text-text">
          Nelio feels like a bright creative studio: clean white canvas and electric blue (like a pro video tool), Retro-style sticker cards and illustrations for fun, lime organic shapes and black pill buttons for punch, all flat.
        </p>

        <Card>
          <CardHead title="Brand colours" />
          <div className="grid gap-3.5" style={grid(120)}>
            <Swatch name="Electric blue" hex="#2F5BFF" note="Primary action, links, active nav" />
            <Swatch name="Ink" hex="#0B0B14" note="CTA pills, outlines, text" />
            <Swatch name="Lime" hex="#B6F24A" note="Highlights, credits, success fills" />
            <Swatch name="Hot pink" hex="#FF4FB8" note="Nelio AI, agents, AI badges" />
            <Swatch name="Sunny yellow" hex="#FFD43B" note="Stickers, captions, fun" />
            <Swatch name="Sky cyan" hex="#59D8FF" note="Illustration fill" />
            <Swatch name="Tangerine" hex="#FF7A2F" note="Illustration fill" />
            <Swatch name="Paper" hex="#F4F6FB" note="Page background" />
          </div>
        </Card>

        <Card>
          <CardHead title="Status tints (light)" />
          <div className="grid gap-3.5" style={grid(140)}>
            <Swatch name="Info" hex="#E8EEFF" note="text #1E40D8 · 6.5:1" />
            <Swatch name="Success" hex="#DDF7E6" note="text #0E6F38 · 5.2:1" />
            <Swatch name="Warning" hex="#FFF1DC" note="text #9A4A06 · 5.4:1" />
            <Swatch name="Error" hex="#FDE3E3" note="text #C81E1E · 4.7:1" />
            <Swatch name="AI" hex="#FFE6F4" note="text #B5176F · 5.4:1" />
            <Swatch name="Lime tint" hex="#EEFCD6" note="text #3B6300 · 6.6:1" />
          </div>
        </Card>

        <Card>
          <CardHead title="Dark theme" />
          <div className="grid gap-3.5 rounded-sheet bg-[#0B0B14] p-5" style={grid(140)}>
            {[["Bg", "#0B0B14"], ["Surface", "#15151F"], ["Surface 2", "#1D1D29"], ["Blue", "#3D63FF"], ["Text", "#F5F6FA"], ["Muted", "#A7AABD"]].map(([n, c]) => (
              <div key={n} className="flex flex-col gap-1.5">
                <div className="h-16 rounded-2xl border border-[#2A2A38]" style={{ background: c }} />
                <span className="text-xs font-bold text-[#F5F6FA]">{n} {c}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHead title="Type: Plus Jakarta Sans + Inter" />
            <div className="flex flex-col gap-3.5">
              <Big size={64} as="p">Display 72 · Jakarta 800</Big>
              <SectionHeading size={36} as="h3">Page title 36 · 800</SectionHeading>
              <SectionHeading size={22} as="h3">Section 22 · 800</SectionHeading>
              <div className="text-base font-semibold text-text">Body strong 16 · Inter 600</div>
              <p className="m-0 text-sm leading-[1.55] text-muted">Body 14 · Inter 400 · line-height 1.55</p>
              <Eyebrow>Eyebrow 12 · caps · blue</Eyebrow>
            </div>
          </Card>
          <Card>
            <CardHead title="Agents, platforms, people" />
            <div className="flex flex-wrap items-center gap-3">
              <AgentAvatar color="lime" shape="circle" size={52} />
              <AgentAvatar color="pink" shape="blob" size={52} />
              <AgentAvatar color="blue" shape="square" size={52} />
              <AgentAvatar color="orange" shape="pill" size={52} />
              <AgentAvatar color="yellow" shape="blob" size={52} />
              <PlatformBadge platform="yt" size={40} />
              <PlatformBadge platform="ig" size={40} />
              <PlatformBadge platform="tt" size={40} />
              <PlatformBadge platform="fb" size={40} />
              <PersonAvatar initials="AO" color="#FF7A2F" size={44} />
            </div>
            <p className="m-0 text-[13px] leading-[1.55] text-muted">Agents are flat shapes with blinking eyes and a 2 px ink outline. Each agent keeps one colour and shape.</p>
          </Card>
        </div>

        <Card>
          <CardHead title="Buttons" />
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="cta" arrow>Start free</Button>
            <Button icon="spark">Generate clips</Button>
            <Button variant="ai" icon="spark">Ask Nelio AI</Button>
            <Button variant="lime">Lime action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Revoke</Button>
            <IconButton icon="more" label="More" />
          </div>
          <CardHead title="Chips & stickers" />
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="blue" icon="zap">active</Chip>
            <Chip tone="ai" icon="spark">Nelio AI</Chip>
            <Chip tone="ok" icon="check">published</Chip>
            <Chip tone="warn" icon="alert">needs approval</Chip>
            <Chip tone="err" icon="x">failed</Chip>
            <Chip>draft</Chip>
            <Chip tone="lime" icon="zap">credits</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-[18px] py-2.5">
            <Sticker fill="yellow" rotate={-6} icon="star">New!</Sticker>
            <Sticker fill="pink" rotate={3} icon="spark">Nelio AI picked this</Sticker>
            <Sticker fill="lime" rotate={-3}>97</Sticker>
            <Sticker fill="cyan" rotate={4}>Coming later</Sticker>
          </div>
        </Card>

        <Card>
          <CardHead title="Forms" />
          <FormsDemo />
        </Card>

        <Card>
          <CardHead title="Choice cards" />
          <ChoiceDemo />
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHead title="Banners" />
            <div className="flex flex-col gap-2.5">
              <Banner tone="warn" title="Recipe Reels is paused" text="It hit its weekly budget of 300 credits." action={<Button variant="secondary" size="sm">Raise limit</Button>} />
              <Banner tone="err" title="License revoked" text="2 drafts and 1 scheduled post are on hold." action={<Button variant="secondary" size="sm">Review</Button>} />
              <Banner tone="ai" title="Nelio AI suggestion" text="Post at 18:00 on Fridays." action={<Button variant="secondary" size="sm">Apply</Button>} />
              <Banner tone="ok" title="Published to Instagram" text="Confirmed by Instagram at 18:02." />
            </div>
          </Card>
          <Card>
            <CardHead title="Skeleton loaders" right={<Chip>pulse 1.6s</Chip>} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SkStat />
              <SkCard />
            </div>
            <SkRows n={3} />
          </Card>
        </div>

        <Card>
          <CardHead title="Rules" />
          <RowList>
            <Row title="Flat colour only" sub="No gradients, glows or glass. Fun comes from colour blocks, stickers, illustrations and bold type." left={<Bubble icon="palette" tone="lime" size={38} />} />
            <Row title="Light by default" sub="Dark is available with full parity. Users choose Light, Dark or System." left={<Bubble icon="sun" tone="blue" size={38} />} />
            <Row title="Blue means go" sub="One blue (or ink CTA) primary action per view. Focus ring is 3 px blue." left={<Bubble icon="cursor" tone="blue" size={38} />} />
            <Row title="Pink means Nelio AI" sub="Anything the AI did or suggests carries pink. No vendor names, ever." left={<Bubble icon="spark" tone="ai" size={38} />} />
            <Row title="Status = icon + word + colour" sub="Never colour alone." left={<Bubble icon="eye" tone="warn" size={38} />} />
            <Row title="Honest states" sub="“In development”, “Coming later”, “Confirming with Instagram”. No fake success." left={<Bubble icon="shield" tone="ok" size={38} />} />
          </RowList>
        </Card>
      </main>
    </Motion>
  );
}
