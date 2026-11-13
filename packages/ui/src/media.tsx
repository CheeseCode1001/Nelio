import type { ReactNode } from "react";
import { cn } from "./primitives";
import { photoSrc, type PhotoKey } from "./photos";

/**
 * Flat iPhone 16 Pro style frame drawn in code: titanium band, bezel, Dynamic Island, side buttons,
 * home indicator. No images and no gradients (generator `iphone`).
 */
export function IPhone({ width = 210, rotate = 0, children, float = true }: { width?: number; rotate?: number; children: ReactNode; float?: boolean }) {
  const r = Math.round(width * 0.2);
  const bz = Math.max(5, Math.round(width * 0.035));
  const button = (side: "left" | "right", top: number, h: number) => (
    <span aria-hidden="true" className="absolute w-1 rounded-[3px] bg-[#8B8781]" style={{ [side]: -4, top: `${top}%`, height: `${h}%` }} />
  );
  return (
    <div className="relative flex-none" style={{ width, aspectRatio: "71.5/149.6", transform: `rotate(${rotate}deg)` }} {...(float ? { "data-float": "" } : {})}>
      {button("left", 17, 5)}
      {button("left", 26, 9)}
      {button("left", 37, 9)}
      {button("right", 29, 14)}
      <div className="absolute inset-0 box-border bg-[#C9C4BC] p-0.5 shadow-[0_0_0_1px_#6F6B66]" style={{ borderRadius: r }}>
        <div className="box-border size-full bg-[#050507]" style={{ borderRadius: r - 2, padding: bz }}>
          <div className="relative size-full overflow-hidden bg-[#111]" style={{ borderRadius: r - 2 - bz }}>
            {children}
            <span aria-hidden="true" className="absolute left-1/2 z-[3] -translate-x-1/2 rounded-full bg-black" style={{ top: Math.round(width * 0.035), width: Math.round(width * 0.3), height: Math.max(10, Math.round(width * 0.085)) }} />
            <span aria-hidden="true" className="absolute bottom-[7px] left-1/2 z-[3] h-1 w-[36%] -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.85)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Content of a 9:16 short: photo, optional score and caption sticker (generator `vid_svg`). */
export function ShortScreen({ photo, caption, bg, score }: { photo: PhotoKey; caption: string; bg: string; score?: number }) {
  return (
    <div role="img" aria-label={`Short video: ${caption}`} className="absolute inset-0" style={{ background: bg }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative crop inside a drawn device frame */}
      <img src={photoSrc(photo)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-[center_top]" />
      {score !== undefined ? (
        <div className="absolute right-3 top-12 z-[2] rounded-full border-2 border-outline bg-lime px-2.5 py-1 font-display text-sm font-extrabold text-outline">{score}</div>
      ) : null}
      <div className="absolute inset-x-3 bottom-16 z-[2] text-center">
        <span className={cn("rounded-lg border-2 border-outline bg-yellow px-2.5 py-[3px] font-display text-[15px] font-extrabold leading-[1.6] text-outline [box-decoration-break:clone]")}>{caption}</span>
      </div>
    </div>
  );
}

/** Portrait order the design uses to pick a photo for a caption (generator `pick`). */
const PORTRAIT: PhotoKey[] = ["p1", "p6", "p10", "p8", "p2", "p7", "p4", "p3", "p5"];
export function photoForCaption(caption: string): PhotoKey {
  const s = [...caption].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PORTRAIT[s % PORTRAIT.length]!;
}
