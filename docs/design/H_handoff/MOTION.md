# Nelio: Motion spec (GSAP)

**Library:** GSAP 3 + `@gsap/react` (`useGSAP`) + ScrollTrigger. Install in the web app: `npm i gsap @gsap/react`.
**Design source:** canvas page *0b · Motion*. The canvas boards play these timelines with CSS keyframes that mirror them (same durations, easing and staggers); the product uses GSAP.
**Rule zero:** if `prefers-reduced-motion: reduce`, skip every animation below. Content must never depend on an animation finishing to be visible or usable.

## Tokens

| Token | Value | Use |
|---|---|---|
| `dur.fast` | 0.2 s | hover, press, fade-outs |
| `dur.base` | 0.5 s | list rows, cards, banners, dialogs |
| `dur.slow` | 0.8 s | hero, illustrations, page enter |
| `ease.out` | `expo.out` | things arriving |
| `ease.pop` | `back.out(1.6)`–`back.out(2.5)` | stickers, stamps, badges, illustrations |
| `ease.loop` | `sine.inOut` | floats, idle agents |
| `stagger` | 0.05–0.08 s | rows, cards, chips |
| `skeleton` | opacity 1 → 0.45, 1.6 s, yoyo | loading placeholders (no shimmer gradient) |

## Patterns

| # | Pattern | Where | GSAP |
|---|---|---|---|
| 1 | Page enter | every page `<main>` | `gsap.from("[data-enter] > *", {y: 18, opacity: 0, duration: .7, ease: "expo.out", stagger: .06})` |
| 2 | Hero phones fan + float | M-01, APP-01 hero | `gsap.from(".phone", {rotate: 0, x: 0, y: 40, opacity: 0, duration: 1, ease: "back.out(1.4)", stagger: .08})` then `gsap.to(".phone", {y: -10, yoyo: true, repeat: -1, duration: 2.5, ease: "sine.inOut", stagger: .3})` |
| 3 | Sticker pop | stickers, “Nelio AI picked this” | `gsap.from(el, {scale: .6, rotate: -8, opacity: 0, duration: .7, ease: "back.out(2)"})` |
| 4 | Illustration pop | every empty state, error page | `gsap.from(svg, {scale: .85, opacity: 0, duration: .8, ease: "back.out(1.6)"})` |
| 5 | Skeleton → content | every Loading state | fade skeleton out 0.2 s, then pattern 1 on the real content |
| 6 | Meter fill | credits, budgets, trial | `gsap.from(".meter-fill", {scaleX: 0, transformOrigin: "left", duration: .9, ease: "expo.out"})` |
| 7 | Bar chart grow | analytics, agent budget | `gsap.from(".bar", {scaleY: 0, transformOrigin: "bottom", duration: .8, ease: "expo.out", stagger: .05})` |
| 8 | Number count-up | stat tiles | `gsap.from(el, {textContent: 0, duration: 1.2, ease: "power2.out", snap: {textContent: 1}})` |
| 9 | Approval stamp | approved states (PB-05, CP-02, MB-08) | `gsap.fromTo(".stamp", {scale: 2.2, rotate: -14, opacity: 0}, {scale: 1, rotate: -8, opacity: 1, duration: .6, ease: "back.out(2.5)"})` |
| 10 | Agent idle | agent avatars | eyes blink `scaleY .1` every ~4 s; working agents bob `y: -6` yoyo 0.8 s |
| 11 | Running spinner | run steps, “Submitting”, Paystack wait | `gsap.to(icon, {rotate: 360, repeat: -1, duration: 1.2, ease: "none"})` |
| 12 | Dialog | every overlay | backdrop fade 0.3 s; panel pattern 3 with `back.out(1.4)` |
| 13 | Scroll reveals | public site sections | `ScrollTrigger.batch("[data-reveal]", {onEnter: b => gsap.from(b, {y: 24, opacity: 0, stagger: .08, duration: .7, ease: "expo.out"}), start: "top 85%", once: true})` |
| 14 | Published celebration | PB-03 published, Plans success | illustration pop + 12 flat confetti shapes `y: -40 → 0, rotate: random(-90,90)`, once, ≤ 1 s |

Never loop: anything except floats, idle agents and spinners. Never animate layout properties (width/height/top/left); use transforms and opacity only.

## React usage

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

export function PageEnter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(ref.current!.children, { y: 18, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 });
    });
  }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}
```

Use `gsap.matchMedia()` for reduced motion and for mobile vs desktop variants (e.g. fewer phones in the hero on phones). Clean-up is automatic with `useGSAP`.
