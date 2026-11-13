"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Motion tokens from docs/design/H_handoff/MOTION.md. */
export const MOTION = {
  dur: { fast: 0.2, base: 0.5, slow: 0.8 },
  ease: { out: "expo.out", pop: "back.out(1.6)", loop: "sine.inOut" },
  stagger: 0.06,
} as const;

const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

/** False when the OS asks for reduced motion or the person turned on "Reduce motion" (ST-03). */
export function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(NO_PREFERENCE).matches && document.documentElement.dataset.motion !== "reduce";
}

/**
 * Wraps a page region and plays the entrance patterns from MOTION.md on its descendants:
 *   [data-enter] > *     pattern 1, page enter (children rise in, staggered)
 *   [data-enter-item]    same, for single late-arriving items such as banners
 *   [data-pop]           patterns 3 and 4, sticker and illustration pop
 *   [data-spin]          pattern 11, running spinner
 *   [data-blink]         pattern 10, agent eyes
 *   [data-float]         pattern 2, floating phones
 *   [data-meter]         pattern 6, meter fill
 *   [data-count]         pattern 8, number count-up
 * Rule zero: nothing runs under prefers-reduced-motion, and content never depends on an animation finishing.
 */
export function Motion({ children, className, deps = [] }: { children: ReactNode; className?: string; deps?: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        if (document.documentElement.dataset.motion === "reduce") return;
        const q = gsap.utils.selector(ref);
        const enter = q("[data-enter] > *");
        if (enter.length) gsap.from(enter, { y: 18, opacity: 0, duration: 0.7, ease: MOTION.ease.out, stagger: MOTION.stagger, clearProps: "transform,opacity" });
        const items = q("[data-enter-item]");
        if (items.length) gsap.from(items, { y: 18, opacity: 0, duration: 0.7, ease: MOTION.ease.out, clearProps: "transform,opacity" });
        // `scale` and `rotation` animate from an offset to the element's own resting transform.
        q("[data-pop]").forEach((el, i) => gsap.from(el, { scale: 0.6, rotation: "-=8", opacity: 0, duration: 0.7, delay: 0.1 + i * 0.1, ease: "back.out(2)", clearProps: "opacity" }));
        const spin = q("[data-spin]");
        if (spin.length) gsap.to(spin, { rotation: 360, repeat: -1, duration: 1.2, ease: "none" });
        // Pattern 2: floating phones. Pattern 6: meter fill. Pattern 8: number count-up (integers, formatted).
        const floats = q("[data-float]");
        if (floats.length) gsap.to(floats, { y: -10, yoyo: true, repeat: -1, duration: 2.5, ease: MOTION.ease.loop, stagger: 0.3 });
        const meters = q("[data-meter]");
        if (meters.length) gsap.from(meters, { scaleX: 0, transformOrigin: "left", duration: 0.9, ease: MOTION.ease.out, delay: 0.2 });
        q("[data-count]").forEach((el) => {
          const text = el.textContent ?? "";
          const target = Number(text.replace(/,/g, ""));
          if (!/^[0-9,]+$/.test(text) || !Number.isFinite(target)) return;
          const counter = { v: 0 };
          gsap.to(counter, { v: target, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(counter.v).toLocaleString("en-US"); }, onComplete: () => { el.textContent = text; } });
        });
        const eyes = q("[data-blink]");
        if (eyes.length) gsap.to(eyes, { scaleY: 0.1, duration: 0.08, repeat: -1, yoyo: true, repeatDelay: 4, ease: "power1.inOut" });
      });
    },
    { scope: ref, dependencies: deps, revertOnUpdate: true },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export { gsap, useGSAP, ScrollTrigger, NO_PREFERENCE };
