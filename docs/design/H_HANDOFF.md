# Nelio: Design Deliverable H, Handoff package (v2)

**Phase:** Design (Master Prompt 1), checkpoint H · **Version 2** (redesign in the user's reference style)
**Date:** 12 November 2026
**For:** the implementation phase (Master Prompt 2). Read with `docs/source/*`, A, B, C and G.

## 1. What's in the package

| Item | Where |
|---|---|
| High-fidelity design canvas (visual source of truth) | https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu |
| Canvas board sources (`.dc.html`) + layout (`canvas.json`) | `docs/design/E_hifi/canvas/` |
| Generator (tokens, components, illustrations, every screen as code) | `docs/design/E_hifi/generator/` |
| Screen & state inventory: every ID → every state board | `docs/design/H_handoff/SCREEN_INVENTORY.md` |
| Design tokens v2 (light default + dark, type, radius, stickers, rules) | `docs/design/H_handoff/tokens.json` |
| Motion spec (GSAP) with code | `docs/design/H_handoff/MOTION.md` |
| Sample / seed data | `docs/design/H_handoff/sample-data.json` |
| Requirements, IA, wireframes, audit | `A_…`, `B_…`, `C_…`, `G_UX_AUDIT.md` |

**Canvas pages (18):** 0 Foundations & illustrations · 0b Motion · 0c Flows · 1 Public site · 2 Sign in & onboarding · 3 Command Center & AI · 4 Clipping & Content · 5 Calendar, approvals & publishing · 6 Analytics · 7 Licensing · 8 Creator Portal · 9 Connections, agency & client portal · 10 Billing · 11 Settings · 12 Admin · 13 System & overlays · 14 Mobile · 15 Dark theme.

**369 boards:** every screen in **Filled**, **Empty** (with an illustration) and **Loading** (skeleton) where it shows data, plus every specific state (errors, limits, held, confirming, paused, trial, past-due, etc.), 31 mobile boards, 16 dark-parity boards, 15 clickable flows and an interactive onboarding flow. On the canvas each screen is one row with its states side by side.

**Clickable:** sidebar, top bar, tab bar and key buttons link to the right boards, so Play mode walks the product. The flow maps (page 0c) link every step to its exact state board.

## 2. Visual language v2

Built from the user's references, kept **flat** (D-20) and **light by default** (D-21):

| From | What Nelio takes |
|---|---|
| ClipGen | Clean white canvas + electric blue `#2F5BFF`; fanned phone mock-ups with score badges; alternating feature rows on solid blue panels; 3-step workflow; FAQ accordion; big blue CTA band; giant faded wordmark footer |
| Pop Site | Centered heroes with an input + button pill; floating cards around phones; generous white space |
| Retro | Bright sticker cards (yellow / cyan / pink) with chunky ink outlines and hard shadows; tilted sticker labels; bold display type |
| Lime savings site | Lime `#B6F24A` organic blobs; black pill CTA with a lime circular arrow; big stat strips; white cards over colour blocks |

- **Type:** Plus Jakarta Sans 800 for display/titles, Inter for UI.
- **Shape:** pill buttons and chips; cards 24 px; panels 32–36 px; stickers have a 2 px ink border and 3 px hard shadow.
- **Colour roles:** Blue = primary action and active nav · Ink pill + lime arrow = hero CTA · Lime = credits, highlights, success fills · **Pink = Nelio AI** · status tints for info/success/warning/error (all ≥ 4.5:1, see G).
- **Illustrations:** 32-piece kit, flat fills, 3 px ink outline, organic blob behind each scene (canvas page 0, `SCREEN_INVENTORY.md`). People and creators are illustrated; **no stock photos** were used (the workspace couldn't download them). Real photography can be swapped into the phone/video components later.
- **Agents:** flat shapes with a 2 px ink outline and blinking eyes; fixed colour/shape per agent.
- **Skeletons:** flat grey blocks that pulse opacity (no shimmer gradient).

## 3. Components → implementation

| Component | Variants | shadcn/ui base | Notes |
|---|---|---|---|
| Button | primary (blue), cta (ink + lime arrow), lime, ai (pink tint), secondary, ghost, danger · sm/md/lg · icon-only | `Button` | pill; ≥ 44 px |
| Chip | blue, lime, ai, ok, warn, err, neutral, ink | `Badge` | icon + word |
| Sticker | any fill, tilt −6…6°, optional icon | custom | decorative emphasis; pop animation |
| Card / Stat tile | plain, solid fill (lime/pink/yellow) | `Card` | count-up on stat value |
| Feature panel | solid blue/lime/pink, radius 36 | custom | marketing + Command Center hero |
| Sticker card | yellow/cyan/pink/lime/orange, ink border + 6 px hard shadow | custom | Retro-style tool cards |
| Banner / top strip | info, ok, warn, err, ai | `Alert` | one action |
| Empty state | illustration + title + text + CTA (+ secondary) | custom | dashed border panel |
| Skeletons | line, stat, card, rows, table, media grid, page head | `Skeleton` | opacity pulse |
| Meter, bars, stepper, run steps | — | `Progress` / custom | animated per MOTION.md |
| Table | header tint, row stagger | `Table` | mobile → stacked rows |
| Field, check, radio, toggle, choice card, tabs (pill) | — | `Input`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs` | real labels |
| Phone mock-up, video card, thumb | caption sticker, platform badge, score pill | custom | illustration inside |
| Dialog / overlay | — | `Dialog` | pop-in |
| Top bar, sidebar, bottom tab bar, command palette, account menu, notification panel | role-aware (G-02) | custom / `Command` / `DropdownMenu` / `Popover` | |

## 4. Routes

Unchanged: B §5. New overlays: command palette (⌘K), account menu, notification panel, pause/resume confirm, admin global-pause confirm.

## 5. Copy rules (unchanged)

The AI is **Nelio AI**: never name vendors. Credits: “N left” = balance, “used X of Y” = consumption, “≈” for estimates. Honest states only. One action per banner. Workspace timezone label on times.

## 6. Build rules

- Role visibility (G-02): credits pill hidden for Editor/Viewer; Pause hidden for Viewer.
- Under 768 px swap the sidebar for the bottom tab bar (mobile boards).
- Tabs ≥ 44 px on touch; global 3 px blue focus ring.
- Build every screen's Empty and Loading states exactly as drawn; never show a blank screen while loading.
- Motion via GSAP per `MOTION.md`, disabled under reduced motion.

## 7. Acceptance criteria (UI)

As in v1, plus:
| Area | Passes when… |
|---|---|
| States | Each screen in the inventory renders its Filled, Empty and Loading versions as drawn, with the right illustration. |
| Flows | Each of the 15 flows (page 0c) can be completed in the built product in the same order. |
| Motion | Each pattern in MOTION.md runs once (loops only where stated) and nothing animates under reduced motion. |
| Theme | Light is the default for new users; Dark and System switch with no unthemed colours. |

## 8. Decisions this round

| # | Decision | By |
|---|---|---|
| D-19 | GSAP for animation | User |
| D-20 | Flat colour, no gradients (reference styles adapted flat) | User |
| D-21 | Light default, dark available (supersedes “dark default”) | User |
| D-22 | All states, all screens, every flow, illustrations | User |
| E-6 | Illustrated people instead of photos (photos can be swapped in later) | Design (tooling limit) |
| E-7 | Canvas motion uses CSS keyframes mirroring GSAP; GSAP itself ships in the app | Design (publishing rules) |

## 9. Still open

- **Deliverable F (runnable code prototype)**: still skipped by choice; the canvas is clickable in Play mode.
- **Human visual pass** of the canvas (I don't render-check canvas boards; see G v2).
- **Photography** if you want real creators in marketing/phone mock-ups.
- **Legal:** sub-processor disclosure vs D-18; legal page copy.

---

**DESIGN PHASE COMPLETE: AWAITING USER APPROVAL.** No production code will start until you explicitly approve.
