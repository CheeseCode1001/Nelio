"use client";

import { useEffect, useRef, useState } from "react";
import { BigTitle, Blob, AgentAvatar, Sticker, cn } from "./primitives";
import { gsap, useGSAP, NO_PREFERENCE } from "./motion";
import { photoSrc, type PhotoKey } from "./photos";

export type { PhotoKey };

export interface CarouselSticker {
  label: string;
  fill: "white" | "yellow";
  rotate: number;
  /** Tailwind position classes, e.g. "top-[60px] left-[60px]". */
  position: string;
}

const PANEL_BG = { lime: "bg-lime", cyan: "bg-cyan", orange: "bg-orange", pink: "bg-pink", yellow: "bg-yellow" } as const;
export type PanelColor = keyof typeof PANEL_BG;

function Photo({ k, className }: { k: PhotoKey; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- decorative, fixed-size crops; moves to next/image with the CDN in Milestone 2
  return <img src={photoSrc(k)} alt="" aria-hidden="true" loading="lazy" decoding="async" className={cn("absolute inset-0 size-full object-cover object-[center_top]", className)} />;
}

/**
 * Desktop right-hand panel of the sign-in and onboarding screens (handoff §6.5):
 * stacked photo cards that cross-fade every 3 s, progress dots, the "Clipped by Nelio AI" tag.
 * Pauses on hover and does not run under reduced motion.
 */
export function PhotoCarouselPanel({ color, title, photos, stickers = [], caption = "Clipped by Nelio AI" }: { color: PanelColor; title: string; photos: PhotoKey[]; stickers?: CarouselSticker[]; caption?: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stack = useRef<HTMLDivElement>(null);
  const n = photos.length;

  useEffect(() => {
    if (paused || n < 2 || !window.matchMedia(NO_PREFERENCE).matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % n), 3000);
    return () => window.clearInterval(t);
  }, [paused, n]);

  useGSAP(
    () => {
      const imgs = gsap.utils.toArray<HTMLElement>("[data-slide]", stack.current);
      const reduce = !window.matchMedia(NO_PREFERENCE).matches;
      imgs.forEach((el, i) => gsap.to(el, { opacity: i === active ? 1 : 0, duration: reduce ? 0 : 0.6, ease: "power1.out" }));
    },
    { dependencies: [active], scope: stack },
  );

  return (
    <aside className={cn("relative hidden flex-[1_1_480px] flex-col items-center justify-center gap-6 overflow-hidden p-12 md:flex", PANEL_BG[color])} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Blob size={520} fill="rgba(255,255,255,0.25)" className="-right-[120px] -top-[120px]" />
      <div className="relative flex w-full max-w-[460px] flex-col items-center gap-[22px] text-center">
        <div className="relative w-full">
          {([["left", -8, photos[1 % n]], ["right", 7, photos[2 % n]]] as const).map(([side, rot, k]) => (
            <div key={side} aria-hidden="true" className={cn("absolute top-[18px] aspect-[3/4] w-[74%] overflow-hidden rounded-[30px] border-[3px] border-outline bg-white", side === "left" ? "-left-[34px]" : "-right-[34px]")} style={{ transform: `rotate(${rot}deg)` }}>
              {k ? <Photo k={k} /> : null}
            </div>
          ))}
          <div ref={stack} role="img" aria-label="Creators recording with their phones and mics" className="relative mx-auto aspect-[3/4] w-[74%] overflow-hidden rounded-[30px] border-[3px] border-outline bg-white shadow-photo">
            {photos.map((k, i) => (
              <span key={k} data-slide="" className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <Photo k={k} />
              </span>
            ))}
            <div className="absolute inset-x-3.5 bottom-3.5 z-[2] flex items-center gap-2 rounded-[18px] border-2 border-outline bg-white py-2 pl-2 pr-2.5">
              <AgentAvatar color="pink" shape="blob" size={30} animated={false} />
              <span className="grow text-left text-[13px] font-extrabold text-outline">{caption}</span>
              <span className="rounded-full border-2 border-outline bg-lime px-[9px] py-[3px] font-display text-[13px] font-extrabold text-outline">98</span>
            </div>
          </div>
          {stickers.map((s) => (
            <div key={s.label} className={cn("absolute z-[3]", s.position)}>
              <Sticker fill={s.fill} rotate={s.rotate}>{s.label}</Sticker>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2" aria-hidden="true">
          {photos.map((k, i) => (
            <span key={k} className={cn("inline-block h-2.5 rounded-full", i === active ? "w-7 bg-outline" : "w-2.5 bg-[rgba(11,11,20,0.25)]")} />
          ))}
        </div>
        <BigTitle size={38} as="p" className="text-outline">{title}</BigTitle>
      </div>
    </aside>
  );
}

/** Mobile replacement for the carousel: a strip of three tilted photos under the header. */
export function PhotoStrip({ photos }: { photos: PhotoKey[] }) {
  return (
    <div className="flex gap-3 overflow-hidden px-4 pb-2 md:hidden" aria-hidden="true">
      {photos.slice(0, 3).map((k, i) => (
        <div key={k} className="relative aspect-[3/4] flex-[1_1_0] overflow-hidden rounded-[20px] border-2 border-outline" style={{ transform: `rotate(${[-3, 0, 3][i]}deg)` }}>
          <Photo k={k} />
        </div>
      ))}
    </div>
  );
}
