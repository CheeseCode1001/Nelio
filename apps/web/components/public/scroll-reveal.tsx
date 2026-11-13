"use client";

import { Motion, ScrollTrigger, gsap, motionAllowed, useGSAP } from "@nelio/ui";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

/**
 * Public-site motion: the shared entrance patterns plus MOTION.md pattern 13 (scroll reveals on
 * [data-reveal], once each). Nothing runs when motion is reduced.
 */
export function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useGSAP(
    () => {
      if (!motionAllowed()) return;
      // Hidden only once script runs, so content is always visible without it.
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
      gsap.set(items, { y: 24, opacity: 0 });
      ScrollTrigger.batch(items, {
        start: "top 85%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "expo.out", clearProps: "transform,opacity" }),
      });
    },
    { scope: ref, dependencies: [path], revertOnUpdate: true },
  );
  return (
    <div ref={ref}>
      <Motion deps={[path]}>{children}</Motion>
    </div>
  );
}
