import { ILLUSTRATION_NAMES, Illustration, Logo, Motion, Sticker, illustrationLabel } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Big } from "@/components/public/blocks";
import { devUiEnabled } from "@/lib/dev-ui";
import { DevNav } from "../dev-nav";

export const metadata: Metadata = { title: "Illustration kit", robots: { index: false } };

/** Development-only reproduction of the Illustrations board: all 32 illustrations exported from the generator. */
export default function IllustrationsPage() {
  if (!devUiEnabled()) notFound();
  return (
    <Motion className="flex grow flex-col">
      <main id="main" className="mx-auto box-border flex w-full max-w-[1440px] flex-col gap-6 p-4 md:p-14">
        <DevNav current="/dev/ui/illustrations" />
        <div className="flex flex-wrap items-center gap-4">
          <Logo size={32} />
          <Sticker fill="pink" rotate={-4}>Illustration kit</Sticker>
        </div>
        <Big size={56}>{ILLUSTRATION_NAMES.length} illustrations, one style.</Big>
        <p className="m-0 text-[17px] leading-[1.55] text-muted">
          Flat fills, 3 px ink outline, a soft organic blob behind each scene, sparkles and tilted stickers. Used for every empty state, error page, onboarding moment and marketing feature. They pop in on load (0.8 s, overshoot ease).
        </p>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
          {ILLUSTRATION_NAMES.map((name) => (
            <figure key={name} className="m-0 flex flex-col items-center gap-2.5 rounded-[28px] border border-border bg-white p-5">
              <Illustration name={name} width={240} />
              <figcaption className="text-[13px] font-extrabold text-[#0B0B14]">{name}</figcaption>
              <span className="text-center text-xs text-[#5B6175]">{illustrationLabel(name)}</span>
            </figure>
          ))}
        </div>
      </main>
    </Motion>
  );
}
