# Nelio — Design-to-Code Handoff for Claude Code

Read this file together with **`docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md`** (the implementation brief). Master Prompt 2 says *what* to build and how to prove it. This file says *what it must look like and behave like*, where the approved design lives, and how to turn it into code.

| | |
|---|---|
| **Product** | Nelio: an AI social media operating system for creators, businesses and agencies. Authorized AI video clipping is the flagship. |
| **Approved design (canvas)** | **https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu** ("Nelio — High-fidelity UI", 471 boards) |
| **Offline copy of the design** | `docs/design/E_hifi/canvas/`: every board as an HTML file. Use this if you can't open the link. |
| **Repository** | https://github.com/CheeseCode1001/Nelio |
| **Design status** | Approved for implementation by the product owner (Miracle Eze), 12 Nov 2026 |
| **Owner contact** | Ask the product owner in chat. Never put credentials in chat or in the repo. |

> **The design is approved. Do not redesign it.** Where something is missing, unclear or impossible, ask or record the issue and propose the smallest change that stays in the visual language. Do not invent a new look.

---

## 1. Source-of-truth order

When documents disagree, the higher item wins:

1. Explicit product-owner decisions in chat, recorded as **D-01 to D-22** in `docs/design/A_REQUIREMENTS_INVENTORY.md` §4.3 and summarised in §5 below.
2. **The design canvas**, and this handoff for visuals and UI behaviour.
3. `docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md` for the stack, milestones, security and launch gates.
4. `docs/source/01_PRD.md` and `docs/source/02_TECHNICAL_ARCHITECTURE.md`. Their finalized-decisions addenda override their older text. PRD sections 17–20 don't exist; don't reconstruct them.
5. Design deliverables A, B, G and H in `docs/design/`.

## 2. Repository map (what already exists)

```
docs/
  source/                      PRD, architecture, master prompts (inputs)
  design/
    A_REQUIREMENTS_INVENTORY.md   roles, 94+ screen IDs, journeys, traceability, decisions D-01..D-22
    B_INFORMATION_ARCHITECTURE.md surfaces, navigation, sitemap, ROUTES (§5), permission matrix (§6),
                                  approval model (§7), state models (§8), journeys (§9), notifications (§10)
    C_WIREFRAMES.md + C_wireframes/  low-fi (superseded by E, kept for history)
    E_hifi/
      canvas/                  471 board files (*.dc.html) + canvas.json  ← offline design
      photos/                  10 creator photos used in the design (see §6.6 on rights)
      generator/               Python that generated every board (exact values live here)
    G_UX_AUDIT.md              UX audit + open/closed findings
    H_HANDOFF.md               earlier handoff notes (this file supersedes it where they differ)
    H_handoff/
      tokens.json              design tokens (light + dark)  ← import into Tailwind
      MOTION.md                GSAP motion tokens + 14 patterns + useGSAP code
      SCREEN_INVENTORY.md      every screen → desktop boards (states) → mobile board
      sample-data.json         realistic seed data used in the design
  CLAUDE_CODE_HANDOFF.md       this file
```

There's no application code yet. Milestone 1 creates the monorepo (Master Prompt 2 §"Implementation sequence").

## 3. How to read the design canvas

- **Pages** (left panel) group the product by area:

  | Page | Contents |
  |---|---|
  | 0 · Foundations & illustrations | Tokens, type, components, stickers, skeletons, 32 illustrations |
  | 0b · Motion | GSAP motion spec |
  | 0c · Flows | Journeys J-01 to J-15 as clickable flows |
  | 1 · Public site | Marketing pages M-01 to M-08 |
  | 2 · Sign in & onboarding | AU-*, ON-* |
  | 3 · Command Center & AI | APP-* |
  | 4 · Clipping & Content | CL-*, CS-* |
  | 5 · Calendar, approvals & publishing | PB-* |
  | 6 · Analytics | AN-* |
  | 7 · Licensing | LI-* (user side) |
  | 8 · Creator Portal | LI-* (content-owner side) |
  | 9 · Connections, agency & client portal | IN-*, AG-*, CP-* |
  | 10 · Billing & credits | BI-* |
  | 11 · Settings | ST-* |
  | 12 · Platform admin | AD-* |
  | 13 · System & overlays | SY-*, command palette, menus, errors, PWA, offline |
  | 14 · Mobile | Native-style mobile app screens MB-* (future Expo app and PWA quick actions) |
  | 15 · Dark theme | Dark parity reference |

- **Every row is one screen.** Its title note gives the screen ID and name, for example "APP-01 Command Center".
  - On the left are its **desktop boards (1440 px)**, in this order: Filled, Empty (with illustration), Loading (skeleton), then that screen's edge states (Paused, Trial, Payment failed, Error, Limit, and so on).
  - On the right is **one mobile board** that shows the same states at **390 px**, side by side.
- **File naming:** `Base.dc.html` is the filled state, `Base-<State>.dc.html` is another state, and `Base-Mobile.dc.html` is the mobile board. `SCREEN_INVENTORY.md` lists every screen and board.
- **Prototype links:** buttons and nav items link to the board they open, so the canvas can be clicked through in Play mode. Treat these links as the navigation spec, together with B §5 routes.
- **Exact values:** board files are plain HTML with inline styles. Open the file in `docs/design/E_hifi/canvas/` to read spacing, sizes, colours and copy. `E_hifi/generator/lib2.py` (components and shells) and `frame.py` (page shells, media, iPhone frame, photo carousel) are the readable source of every component. Port their logic, not their HTML.
- **Copy is final** unless it's in `[brackets]`. Bracketed text (for example `[Beta creator quote]`, `[AMOUNT]`) is a placeholder the product owner must supply. Never ship invented testimonials, metrics or prices.
- **Sample data** in the boards comes from `H_handoff/sample-data.json`. Use it for seeds, Storybook and tests.

## 4. Mapping design to the build (Milestone 0 deliverable)

At milestone 0, create `docs/build/DESIGN_TRACEABILITY.md`. It maps every screen ID in `SCREEN_INVENTORY.md` to:
- the route (B §5);
- the page or component files;
- the API endpoints and jobs behind it;
- the milestone (below);
- its status: `not started`, `in progress`, `done`, `gated`, `blocked`.

Keep it updated every milestone.

| Master Prompt 2 milestone | Screens (IDs) that must look exactly like the design |
|---|---|
| 1. Scaffolding, auth, roles, tenancy | AU-01–AU-07 (sign up, log in, verify email, reset, two-step, accept invitation, join as content owner), APP-07 Workspace switcher, SY-08 Account menu, SY-03/04/05 Not found / Access denied / Server error |
| 2. Design-faithful frontend + PWA | Foundations (components, icons, illustrations); all shells (top bar, sidebar, mobile top bar + bottom tabs); M-01–M-08 public site; ON-01–ON-05 + ON-FLOW onboarding; APP-01 Command Center (all states); SY-01 PWA install, SY-02 Offline; SY-07 Command palette; ST-03 Appearance (Light/Dark/System) |
| 3. Jobs, agents, activity, notifications | APP-02 AI Strategist, APP-03 AI Activity Center, APP-04 Agents, APP-05 Agent detail, APP-06 Create agent, NT-01 Notifications (page, panel, push prompt), SY-09 Pause all confirm |
| 4. Media pipeline | CL-01 Media library, CL-02 Upload, CL-03 Clipping Studio (incl. estimate/queued/blocked), CL-04 Batch variants, CL-05 Exports, CS-01 Content Studio, CS-02 Post composer, CS-03 Original AI video (gated), ST-06 Brand kits, ST-07 AI & processing |
| 5. Licensing + creator portal | LI-01 Marketplace, LI-02 Source detail & terms, LI-03 Request / accept license, LI-04 My licenses, LI-05 Creator portal overview, LI-06 Verification, LI-07 Licensing terms, LI-08 Usage audit, LI-09 Revoke a license, LI-10 Payouts ("coming later") |
| 6. OAuth + publishing | IN-01 Connections, IN-02 Connection detail, ST-08 Integration status, PB-01 Content calendar, PB-02 Drafts, PB-03 Post detail (published / failed / uploading / held / expired) |
| 7. Agency, client approvals, analytics | AG-01 Agency hub, AG-02 Client workspaces, AG-03 Client workspace settings, AG-04 Team & invitations, AG-05 Roles & permissions, AG-06 Audit log, CP-01/CP-02 Client portal, PB-04/PB-05 Approvals, AN-01–AN-04 Analytics, ST-05 Workspace members |
| 8. Billing | BI-01 Plan & usage, BI-02 Plans & checkout (checkout / processing / success / declined), BI-03 Credit ledger, BI-04 Top-ups, BI-05 Spend limits, BI-06 Invoices, BI-07 Payment failure, BI-08 Trial status |
| 9. Hardening | ST-01 Profile, ST-02 Security, ST-04 Notification preferences, ST-09 Privacy & data (export/delete), ST-10 Workspace settings, AD-01–AD-09 Platform admin (ops, jobs & dead-letter, audit search, license review, support access, abuse, diagnostics, feature flags, global pause), SY-06 Maintenance |
| 10. Release | M-08 Status, journeys J-01–J-15 walked end to end on staging, full accessibility pass, Dark parity (page 15) |

MB-01–MB-13 (page 14) are a reference for the later Expo app. The PWA uses the responsive mobile boards that sit beside each desktop screen.

## 5. Product decisions that affect code (do not change)

| ID | Decision |
|---|---|
| D-01 | One public launch after private beta. Unapproved integrations and generative video are never shown as working. |
| D-02 | Responsive web + installable PWA first; React Native/Expo later. |
| D-04 | Onboarding: 4 optional steps, skip anywhere, completion checklist on the dashboard. |
| D-05 | Autonomous publishing needs an explicit authorization dialog per agent. |
| D-06 | YouTube + Instagram first, then TikTok + Facebook. Until approved, the UI says "In development" or "Coming later". |
| D-07 / **D-18** | The only general reasoning model is Claude (internal), but **the product never names any AI, transcription or media vendor**: no Claude, Anthropic, Deepgram, Whisper, FFmpeg, Remotion, PySceneDetect and so on. This applies to UI, marketing, emails, notifications, errors and AI-generated text. The AI is always **"Nelio AI"**. Vendor names live only in code and internal docs. Add a CI check that fails if a vendor name appears in user-facing strings. Legal decides the privacy-policy sub-processor wording. |
| D-08 | Transcription router: Fast / Balanced / High Quality, cost shown before the job, fallback. |
| D-10 | Prices: Free $0, Starter $19, Creator Pro $49, Business $99, Agency $249, Enterprise custom. Credits are **provisional** and labelled so in the UI. |
| D-11 / D-12 | The Free plan is very limited with no autonomous publishing. The 3-day trial has 1 agent, 1 account, 2 short exports, a hard compute cap, no premium video and no auto-charge. |
| D-13 | Top-ups are paid plans only, never automatic by default. Show the estimate before and the actual cost after. Pause at limits. |
| D-14 | Paystack first, Flutterwave as the alternative. USD list prices with NGN checkout and a transparent conversion. |
| D-15 | Content owners join free. Free and private licensing first; paid licensing and payouts show "coming later". |
| D-16 | Agency workspaces, client login and direct client approvals from launch. |
| D-19 | Animation uses **GSAP** (`gsap`, `@gsap/react`, ScrollTrigger) as specified in `MOTION.md`, with reduced motion respected. |
| D-20 | **Flat colour only. No gradients, glows or glassmorphism.** |
| D-21 | **Light theme is the default.** Dark has full parity. System follows the OS. The choice is persisted. |
| D-22 | Every data screen has Filled, Empty (illustration) and Loading (skeleton) states plus its own states, and they must be built, not just the happy path. |
| AS-B1 | Approval invalidation: an edit to shared media (cut, burned captions, audio) invalidates every platform's approval. An edit to one platform's text invalidates only that platform. |
| AS-B2 | The trial starts without a payment card. |
| AS-B3 | 7-day grace period after a failed renewal, then downgrade to Free (agents paused, data kept). |
| Q-4 | Clients approve **per platform destination**. |

## 6. Design system to implement

### 6.1 Tokens

`docs/design/H_handoff/tokens.json` is the single source. Generate CSS variables (`:root` = light, `[data-theme="dark"]` = dark) and map them into `tailwind.config` (`colors.bg`, `colors.surface-1..3`, `colors.border`, `colors.text`, `colors.muted`, `colors.accent`, `colors.accent-tint`, `colors.lime`, `colors.ai` and so on).

| Role | Light | Dark |
|---|---|---|
| Background | `#F4F6FB` | `#0B0B14` |
| Surface 1 / 2 / 3 | `#FFFFFF` / `#F1F3F9` / `#E4E8F1` | `#15151F` / `#1D1D29` / `#272735` |
| Border | `#E3E6EF` | `#2A2A38` |
| Text / muted | `#0B0B14` / `#5B6175` | `#F5F6FA` / `#A7AABD` |
| Accent (primary blue) / tint / text-on-tint | `#2F5BFF` / `#E8EEFF` / `#1E40D8` | `#3D63FF` / `#172447` / `#9DB4FF` |
| Lime (CTA arrow, highlights) | `#B6F24A` | `#B6F24A` |
| Nelio AI (pink) | `#FF4FB8` | `#FF4FB8` |
| ok / warn / err | `#22C55E` / `#FF9F1C` / `#EF4444` (+ tint and text pairs in tokens) | see tokens |
| Fun fills (stickers, illustrations) | yellow `#FFD43B`, cyan `#59D8FF`, orange `#FF7A2F`, pink, lime, violet `#9B7BFF` | same |
| Ink outline (illustrations, stickers) | `#0B0B14` | `#0B0B14` |

The meaning of colour is fixed: **blue** = primary action and active nav, **pink** = Nelio AI, **lime** = CTA arrow and positive highlights. Status is always shown as icon + word + colour, never colour alone.

### 6.2 Typography

- **Display:** Plus Jakarta Sans 600/700/800, tracking −0.045em (hero) / −0.03em (titles).
- **Body:** Inter 400–700.
- **Scale (px):** hero 76, display 56, page title 36, section 22, card title 17, body large 16, body 14, small 12.5, eyebrow 12 (uppercase, +0.08em).
- On mobile, display sizes scale down: 48 → 35, 68 → 40, 76 → 42. The mobile boards show the exact sizes.
- Load fonts with `next/font`.

### 6.3 Spacing, radius, shadow (uniform; the product owner asked for this explicitly)

| Token | Desktop | Mobile (< 768 px) |
|---|---|---|
| Page padding | 32 | 16 |
| Space between page sections | 24 | 16 |
| Card padding | 20 | 16 |
| Grid / list gap | 16 | 12 |
| Top bar padding | 12 × 20 | 12 × 16 |
| Marketing section padding | 72 × 48 | 40 × 16 |

Radius: chips and buttons 999 (pill), inputs 14, list rows 20, cards 24, panels and dialogs 32, feature panels 36. Bottom sheets use 28 top corners.

Shadows: cards use the soft light shadow (none in dark). Stickers use a hard `3px 3px 0 #0B0B14`. Sticker cards use `6px 6px 0`.

Touch targets are at least 44 px. Focus ring: `3px solid #2F5BFF`, offset 2.

### 6.4 Global UI rules (requested by the product owner; apply everywhere)

1. **Pills hug their content.** Chips, stickers, eyebrows, badges and non-full-width buttons are `width: fit-content` and never stretch to fill a column. Only buttons marked `full`, banners and form fields span the width.
2. **No visible scrollbars.** Hide them globally (`scrollbar-width: none` and `::-webkit-scrollbar { display: none }`) while keeping scrolling. Every horizontally scrollable area must signal that it scrolls:
   - arrow buttons (previous/next);
   - an edge arrow;
   - a partly visible last item.

   See LI-02 "Popular with licensees" (`shorts_scroller` in `frame.py`). Use scroll-snap. **Pill tab bars never wrap:** they stay on one line and scroll sideways (`tabs()` in `lib2.py`). Multi-select tag groups, like the onboarding goals, may wrap.
3. **Modals become bottom sheets under 768 px.** Full width, 28 px top radius, grab handle, slide up, max 88% height, scroll inside. On desktop they're centred dialogs (radius 32). Use the shadcn `Dialog` on desktop and `Drawer` (vaul) on mobile behind one `ResponsiveDialog` component.
4. **Navigation icons have outline and filled states.**
   - Sidebar: the inactive item shows a muted outline icon. The active item shows a filled icon in accent blue on an accent-tint pill, bold blue label, and a 4 px accent bar on the left.
   - Mobile bottom tabs: inactive tabs show an outline icon in muted grey. The active tab shows a filled accent icon, a blue bold label and a 3 px top indicator. The Approvals tab has a count badge.

   The exact SVG pairs are in `E_hifi/generator/navicons.py` (sidebar) and `lib2.py` → `TABIC` (tabs). Make them one `<NavIcon name active />` component. Don't swap in a different icon set.
5. **Flat colour only.** No gradients anywhere, including image overlays. Skeletons pulse opacity; there's no shimmer.
6. **One primary action per view:** either a blue primary button or the CTA style (ink pill with a lime arrow circle).

### 6.5 Components → implementation (shadcn/ui base + custom)

| Component | Notes | Base |
|---|---|---|
| Button | primary, cta (ink + lime arrow), lime, ai, secondary, ghost, danger; sm/md/lg; icon-only | `Button` (cva variants) |
| Chip / status | blue, lime, ai, ok, warn, err, neutral, ink; icon + word | `Badge` |
| Sticker | tilted −6 to 6°, 2 px ink border, 3 px hard shadow, pop-in | custom |
| Card, stat tile, feature panel, sticker card | see Foundations board | `Card` |
| Banner / top strip | info / ok / warn / err / ai, one action | `Alert` |
| Empty state | illustration + title + text + CTA (+ secondary), dashed panel | custom |
| Skeletons | line, stat, card, rows, table, media grid, page head | `Skeleton` |
| Table | tinted header; becomes stacked rows on mobile or scrolls in its box | `Table` |
| Forms | field, select, textarea, checkbox, radio, toggle, choice card, pill tabs, stepper | `Input`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs` |
| Dialog → bottom sheet | §6.4 rule 3 | `Dialog` + `Drawer` |
| Shells | top bar (workspace switcher, search ⌘K, credits pill, Pause all, notifications, account); sidebar (grouped nav + credits card); mobile top bar + bottom tab bar; portal / creator / admin variants | custom |
| Command palette, account menu, notifications panel | | `Command`, `DropdownMenu`, `Popover` |
| Media | 9:16 video card (photo, caption sticker, score pill, platform badge), thumb, 16:9 source player, shorts scroller | custom |
| iPhone frame | flat iPhone 16 Pro–style frame (titanium band, bezel, Dynamic Island, side buttons, home indicator), drawn in code with no images and no gradients | `iphone()` in `frame.py` |
| Photo carousel (auth/onboarding desktop right panel) | stacked photo cards, cross-fade every 3 s, progress dots, "Clipped by Nelio AI" tag; becomes a 3-photo strip on mobile; pause on hover and under reduced motion | `photo_carousel()` in `frame.py` |
| Illustrations (32) | flat, 3 px ink outline; used in empty states and pages | Export SVGs from `illus.py` to `packages/ui/illustrations/*.svg` (React components) |
| Nelio AI agent avatar | blob or circle with blinking eyes | custom |

Build a Storybook (or a `/dev/ui` route) that reproduces the Foundations page so fidelity can be checked component by component.

### 6.6 Photos

The 10 creator photos are in `docs/design/E_hifi/photos/`. They're used on the landing page (hero phones, creator avatars, beta wall), the auth and onboarding carousels, media and marketplace thumbnails, and clip previews.
- Ship them through R2/CDN with `next/image`.
- **Before public launch, the product owner must confirm the rights and model releases for each photo.** Some show third-party brands. Track this in the release checklist.
- Never put fabricated quotes next to real faces. The beta wall keeps `[Beta creator quote]` placeholders until real, consented quotes exist.

### 6.7 Motion

Follow `H_handoff/MOTION.md`: tokens, 14 patterns, `useGSAP` examples.

- Entrances: up, fade, pop, stamp.
- Stagger rows.
- Count-up stats.
- Bar and meter grow.
- Floating phones and stickers.
- Blinking agent eyes.
- Carousel cross-fade.

Everything is disabled under `prefers-reduced-motion`. The canvas uses CSS keyframes only as a stand-in for the GSAP timelines.

## 7. Layout and responsive behaviour

- **Breakpoints:**
  - **< 768 px:** mobile layout. Bottom tab bar (Home, Activity, Approvals, Calendar, More) and mobile top bar. Sidebars become the More menu (operator app) or a sideways pill row (creator portal, admin). Grids collapse to 1 column (2 for small tiles). Multi-column layouts stack. Wide tables scroll inside their card.
  - **768–1279 px:** tablet. Collapsible sidebar (B §3.3).
  - **≥ 1280 px:** desktop as drawn at 1440.
- **Surfaces** (B §2):
  - Public site;
  - Auth/onboarding: split screen with photo carousel on desktop; single column with photo strip on mobile;
  - Operator app `/w/[workspace]/…`;
  - Client Portal `/portal/[ws]`;
  - Creator Portal;
  - Admin;
  - System pages.
- Public mobile nav: logo, "Start free", menu button. The menu opens as a bottom sheet (Home mobile board, second column).
- Sticky top bar and sticky bottom tab bar on mobile. Safe-area insets for an installed PWA.

## 8. Copy and honesty rules

- The AI is **Nelio AI**. Never name vendors (D-18).
- Credits: "N left" = balance, "used X of Y" = consumption, "≈" = estimate. Show the estimate before and the actual cost after every paid job.
- **Never lie about state.** Integrations not yet approved show "In development" or "Coming later". Paid licensing and payouts show "coming later". Generative video stays gated. "Unknown" is a real publish status (PB-03): don't mark a post published until the platform confirms it.
- Times show the workspace timezone label. Prices are USD with NGN at checkout ("≈ ₦[AMOUNT]: exact amount shown by Paystack").
- Each banner has one action. Errors say what happened, what wasn't lost, and what to do next.

## 9. Data and behaviour implied by the design (backend must support)

- **Approvals:** per-platform decisions, revision numbers, the invalidation rule AS-B1, client portal tokens, and a "newer version exists" state (CP-02).
- **Agents:**
  - modes manual / assisted / autonomous;
  - per-agent budget (credits per week) and posts per week;
  - destinations;
  - run history;
  - re-authorize when limits rise (APP-05 Reauth);
  - stopped state;
  - global and workspace pause / kill switch (PauseConfirm, AdminPauseConfirm).
- **Activity:** a realtime event stream with reconnecting and synced states. Every job step is named honestly (transcribing, finding moments, reframing, captioning, rendering).
- **Clipping:**
  - upload checks (type, duration, rights attestation, low credits);
  - processing → moments ranked with explainable reasons and a score;
  - estimate → queued → render;
  - variants;
  - exports, with a 2-export trial cap.
- **Licensing:**
  - source verification;
  - scoped terms: platforms, commercial use, attribution, expiry;
  - request / approve / decline;
  - usage evidence;
  - revocation that holds future posts and flags existing ones (Revoke-Done);
  - excluded videos (third-party music or footage).
- **Billing:**
  - an immutable credit ledger with reservations, settlements and refunds;
  - plans and checkout states;
  - spend limits plus "request more" for members;
  - invoices;
  - trial states (limit, ending, ended);
  - payment failed → grace → downgraded.
- **Roles:** Owner, Admin, Manager, Editor, Viewer, Client approver, Content owner, Platform admin (A §1, B §6).
  - Role visibility rule: the credits pill is hidden for Editor/Viewer; Pause is hidden for Viewer.
  - Admin actions are audited, and support access is time-boxed and owner-notified.
- **Notifications:** follow the B §10 map. Deep links open the exact object.

## 10. UI acceptance checklist (per screen, before marking it done)

- [ ] Matches its desktop boards and its mobile board at 1440, 1280, 768 and 390 px. Screenshot compare against `docs/design/E_hifi/canvas/` (for example with Playwright visual snapshots).
- [ ] Filled, Empty (with its illustration), Loading (skeleton, no blank screen) and every listed edge state are reachable, with seed data or a story for each.
- [ ] Light and Dark both pass WCAG 2.2 AA (text 4.5:1, UI 3:1). Keyboard reachable, visible focus ring, real `<button>`/`<a>`/`<label>`, `aria-*` on icon-only controls, axe clean.
- [ ] Modals are bottom sheets on mobile. Nav icons show their filled active state. Pills hug their content. No visible scrollbars. Sideways scrollers show arrows.
- [ ] No vendor names in any user-facing string (CI check).
- [ ] Motion follows `MOTION.md` and is off under reduced motion.
- [ ] Gated features show their honest gated state.
- [ ] Permission-aware: the same screen as each relevant role matches B §6.

## 11. Known gaps and open items

| Item | Owner | Note |
|---|---|---|
| Photo rights and model releases | Product owner | Required before public launch (§6.6) |
| Legal page copy, sub-processor disclosure vs D-18 | Legal | Placeholder legal page M-07 |
| Beta testimonials, final prices in NGN | Product owner | Placeholders in brackets |
| Platform app reviews (YouTube, Instagram, TikTok, Facebook) | Engineering + product owner | UI stays "In development" until verified (D-06) |
| Paystack/Flutterwave merchant eligibility | Product owner | Billing UI is built; live charging waits on verification |
| Native mobile app (MB-* boards) | Future | Reference for the later Expo app; the PWA uses the responsive mobile boards |
| Canvas prototype links | — | The board-to-board links are the navigation intent; routes in B §5 are authoritative |

## 12. First steps for Claude Code (Milestone 0)

1. Read this file, `docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md`, then A, B and `SCREEN_INVENTORY.md`. Skim G (audit) and `MOTION.md`.
2. Open the canvas link, or the offline boards in `docs/design/E_hifi/canvas/`, starting with the Foundations page and APP-01 Command Center.
3. Produce `docs/build/DESIGN_TRACEABILITY.md` (§4) and `docs/build/BLOCKERS.md`. Blockers include: external platform approvals, payment-provider eligibility, credentials needed via secure env setup, and photo rights.
4. Propose the monorepo layout, for example:
   - `apps/web` (Next.js);
   - `apps/api-media` (FastAPI);
   - `workers/node`, `workers/py`;
   - `packages/ui` (tokens, components, illustrations, icons);
   - `packages/db` (Prisma);
   - `packages/config`.

   Then start Milestone 1. Build `packages/ui` from `tokens.json` and the Foundations page early, because every screen depends on it.
5. Report per milestone exactly as Master Prompt 2 requires: commands, real test results, real vs mocked integrations, risks and demo steps.
