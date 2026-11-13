# Milestone 2 report: design-faithful frontend and PWA

Branch: `feat/milestone-2-frontend` · Status: **all 6 slices built; open items in §7**. Updated 13 Nov 2026.

## 1. Slices

| # | Slice | Screens | State |
|---|---|---|---|
| 1 | App shell and Command Center | Shell (sidebar, top bar, mobile tabs, More sheet), APP-01 all six states, SY-07 Command palette | Built, checked in the browser |
| 2 | Onboarding | ON-FLOW welcome, ON-01 to ON-05 | Built, walked end to end |
| 3 | Appearance | ST-03 (Light, Dark, Match system, Reduce motion) | Built, checked in the browser |
| 4 | Public site | M-01 to M-08: header with mobile menu sheet, footer, Home, Product, Use cases (Agencies), Pricing, Licensing, FAQ, Legal, Status | Built, checked in the browser |
| 5 | PWA | SY-01 install prompt (install, iPhone instructions, installed), SY-02 offline strip and offline page, manifest, icons, service worker | Built, checked in dev and production builds |
| 6 | Foundations reference | `/dev/ui` (Foundations board from real components), `/dev/ui/illustrations` (all 32), `/dev/ui/command-center` (APP-01, SY-01, SY-02 states) | Built, compared with the boards; off in production builds |

## 2. How the unbuilt parts of the product are handled

- **Data that does not exist yet is not shown.** Credits (Milestone 8), approvals counts and notifications (Milestones 3 and 7), and Pause all (Milestone 3) are left out of the top bar and sidebar until their source exists. They are never filled with sample numbers.
- **Filled vs Empty comes from data.** A real workspace has no agents yet, so it shows the Empty (first-run) state. The other states (Filled, Loading, Paused, Trial, Payment failed) can be reviewed at `/dev/ui/command-center?state=…&role=…` using the design's sample data. That route is off in production builds.
- **Links to screens from later milestones** open a "built in Milestone N" notice after the real access check, instead of a 404. In production builds these screens are hidden from navigation (decision T-5, flag `NEXT_PUBLIC_NAV_SHOW_UNBUILT`).
- **Platform connections are honest** (D-06): onboarding shows Instagram and YouTube as "In development" and TikTok and Facebook as "Coming later". The board's "Connect" buttons, "Connected" state and plan-limit state become reachable in Milestone 6. Until then they are previewable with `?state=connected` or `?state=limit`.
- **Autonomous is locked on the Free plan** (D-11), as on the ON-04 Free board. On paid plans it is a preference only; no agent publishes without its own authorization (D-05).

## 3. Verified (13 Nov 2026)

| Check | Result |
|---|---|
| Type check, lint | Pass, 0 errors |
| Unit tests | 26 of 26 (screen registry, audiences, Command Center model, permissions, validation) |
| Vendor-name check | Pass, 75 files |
| Production build | Pass, 36 routes |
| APP-01 against boards | Filled, Paused and Empty compared side by side with the boards at 1440 px; Filled at 375 px. Dark Empty compared with the dark-parity board. |
| Onboarding | Walked as the test owner: welcome, four steps, All set. Every answer saved (account type, goals, niche, audience, automation mode, completion time, audit entry). |
| Appearance | Dark and Reduce motion apply immediately, carry over to the next page and are saved to the account. |
| PWA | Install card and offline strip compared with their boards; offline → reconnecting → back online sequence works; manifest, worker and offline page served. In a production build the worker activates and caches only the offline page and static files (no pages, no data); `/dev/ui` returns 404. |
| Foundations | Buttons, chips, stickers, forms, switches, choice cards, banners and skeletons compared with the Foundations board at 1440 px; 32 of 32 illustrations render with labels; no sideways scroll at 375 px. |
| Public site | Home compared with its board at 1440 px; Home and the menu sheet at 375 px (no sideways scroll); Pricing and Status at 1440 px. |

**Found and fixed while checking:** the top-bar pills were not hiding below 768 px; the mobile tab order did not match the board; two server/client boundary errors; the theme cookie was lost if you left the page before the save finished (the browser now writes it at once).

## 4. Database changes (all applied to `nelio-dev` and recorded in the migration history)

| Migration | Change |
|---|---|
| `20261113090000_setup_checklist` | `workspaces.setup_checklist_dismissed_at` |
| `20261113100000_onboarding_goals` | `workspaces.goals`, `niche`, `audience` |
| `20261113110000_reduce_motion` | `users.reduce_motion` |

## 5. Differences from the boards, and why

| Where | Board | Built | Reason |
|---|---|---|---|
| ON-03 rows | "Connect" buttons | "In development" / "Coming later" chips, subtitle "We’ll tell you when it’s ready." | D-06: no platform is approved yet |
| SY-07 empty result | "Try a post, agent or client name, or ask Nelio AI." | "Try a page or workspace name." | Posts, agents and clients aren't searchable until Milestones 3 to 7; board copy returns when they are |
| Top bar, sidebar | Credits, Pause all, bell, approvals badge | Hidden in real workspaces | No data source yet; shown in the `/dev/ui` preview |
| M-08 Status | "99.94% uptime", 90-day chart, "Rendering is slower than usual" banner, "Live" sticker | Today's true states only: web app Operational, processing In development, platforms per D-06; a banner only when an incident is posted | Nothing is in production or monitored yet; the chart and live health checks come with monitoring in Milestone 9 |
| M-02 Product | Six tour tabs | Clipping only, no tab bar | Only Clipping is drawn (B-16) |
| M-03 Use cases | Creators, Businesses, Agencies tabs; "Book a demo" | Agencies only; no demo button | Only Agencies is drawn; no booking link exists (B-16) |
| M-04 Pricing | Plan buttons | All lead to sign-up | Checkout arrives in Milestone 8 and live charging waits on B-02 |
| M-06 FAQ | Six topics; four answers blank | General, Licensing, Billing, Platforms; four answers drafted from decisions | B-16 |
| M-01 Home | Hero upload field | A link styled as the field, leading to sign-up | Uploading needs an account |
| ON-02 audience | Select showing "Nigeria" | "Global" (default) followed by every country | Product owner decision, 13 Nov 2026: the audience is global |

## 6. PWA behaviour

- **Cached:** built scripts and styles, fonts, icons, design photos and `/offline`. **Never cached:** signed-in pages, API responses, anything from auth. Safe on shared devices.
- **Offline:** an open page stays as it was ("Showing what was last loaded") and every form submission is blocked, so nothing is queued to post later. Opening a page with no connection shows `/offline`.
- **Install prompt:** from the second visit, dismissible (remembered in this browser only). Safari on iPhone gets the "Add to Home Screen" instructions. After installing, the "Nelio is installed" card shows once.
- **Development:** the worker registers only in production builds (or with `NEXT_PUBLIC_PWA_DEV=true`).

## 7. Not verified yet

- Tablet widths (768 to 1279 px, icon rail), keyboard pass and automated accessibility checks.
- Visual snapshot tests (Playwright) against the boards.
- GSAP timing against MOTION.md (audit G-12); the preview pane pauses animation frames.
- Installing on a real Android phone and iPhone, and real loss of connection (simulated with browser events here).
