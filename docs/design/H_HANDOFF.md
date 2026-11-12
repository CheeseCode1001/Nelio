# Nelio: Design Deliverable H, Handoff package

**Phase:** Design (Master Prompt 1), checkpoint H
**Date:** 12 November 2026
**For:** the implementation phase (Master Prompt 2). Read with `docs/source/*`, A, B, C and G.

## 1. What's in the package

| Item | Where |
|---|---|
| High-fidelity design canvas (source of truth for visuals) | https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu |
| Canvas board sources (`.dc.html`) + layout (`canvas.json`) | `docs/design/E_hifi/canvas/` |
| Generator used to build the boards (tokens + components in Python) | `docs/design/E_hifi/generator/` |
| Screen inventory: ID → route → board → state sheet → roles | `docs/design/H_handoff/SCREEN_INVENTORY.md` |
| Design tokens (dark + light, type, radius, spacing, rules) | `docs/design/H_handoff/tokens.json` |
| Sample / seed data used in the designs | `docs/design/H_handoff/sample-data.json` |
| Requirements & traceability | `A_REQUIREMENTS_INVENTORY.md` |
| IA, routes, permissions, journeys, state machines | `B_INFORMATION_ARCHITECTURE.md` |
| Low-fidelity wireframes | `C_wireframes/index.html` |
| UX audit and open findings | `G_UX_AUDIT.md` |

**Canvas pages:** 0 Foundations · 1 Public site · 2 Sign-in & onboarding · 3 Command Center & AI · 4 Clipping & Content · 5 Calendar, approvals & publishing · 6 Analytics · 7 Licensing & Creator Portal · 8 Connections, agency & client portal · 9 Billing · 10 Settings · 11 Admin · 12 System · 13 States · 14 Mobile · 15 Light theme. **122 boards** in total: 94 screens + 28 supporting boards.

**Interactive:** the onboarding flow board (press Play). All other boards are static comps.

## 2. Visual language: "Nelio"

- **Feel:** fun, confident creative studio. Flat colour blocks, bold display type, characterful agents. **No gradients, glows or glass.**
- **Dark default**, Light with full token parity, System follows the OS. Theme is saved per user (ST-03).
- **Colour roles:** *Volt* `#D4FF3F` = primary action / active / focus. *Grape* = Nelio AI and agents. Blue = scheduled/info, Orange = needs attention/blocked, Red = failed/revoked, Teal = published/approved. Every status shows **icon + word + colour**.
- **Type:** Bricolage Grotesque (display, 500/700/800) + Inter (UI, 400–700), both from Google Fonts.
- **Shape:** radius 12 controls · 16 rows/banners · 20 cards · 24 panels/empty states · 28 dialogs · pill chips. 4 px spacing grid.
- **Agents** are flat shapes with two eyes; each agent keeps a fixed colour and shape (see `sample-data.json`).
- Full values: `H_handoff/tokens.json`. Build with CSS variables / Tailwind theme tokens, never raw hex in components.

## 3. Components → implementation

Mapped to shadcn/ui where one exists. Source of each look: `E_hifi/generator/lib.py`.

| Component | Variants / props | States | shadcn/ui base | Accessibility notes |
|---|---|---|---|---|
| Button | primary (Volt), grape (AI), secondary, ghost, danger · sm/md/lg · icon-only | default, hover, focus, disabled, loading | `Button` | min 44 px; icon-only needs `aria-label` |
| Chip / status badge | tones: lime, grape, blue, orange, red, teal, neutral · optional icon | static | `Badge` | always icon + text for status |
| Banner | tone · title · text · one action | info, warning, error, success, AI | `Alert` | `role="status"` (error: `alert`) |
| Card / Section | padding, background, border | — | `Card` | headings inside are real `h3` |
| Stat tile | label · value · sub · optional solid fill (Volt/Grape) | loading skeleton | custom | value is text, not image |
| Meter | label · % · right text · tone | normal, warning (≥80%), full | `Progress` | `role="progressbar"` + `aria-valuenow` |
| Table | columns · rows · horizontal scroll | empty, loading, filtered-empty | `Table` | `th scope="col"`; mobile → stacked rows |
| List row | leading visual · title · sub · trailing action | unread dot | custom | whole row not clickable unless it's a link |
| Field | input / select / textarea · hint · error | default, focus, error, disabled | `Input`, `Select`, `Textarea`, `Label` | real `<label for>` |
| Check / radio | label · sub | checked, unchecked, disabled | `Checkbox`, `RadioGroup` | label clickable |
| Toggle | label · sub | on/off/disabled | `Switch` | `role="switch"` + `aria-checked` |
| Choice card | title · sub · icon · badge · locked | selected, unselected, locked | custom (`RadioGroup` item) | `aria-pressed`/radio semantics |
| Tabs (pill) | items · active | — | `Tabs` | 44 px min on touch (G-05) |
| Stepper | n · current | — | custom | `role="progressbar"` "Step x of n" |
| Run steps | done / running / queued / blocked / failed | — | custom | text label per step, no fake % |
| Agent avatar | colour · shape · size | — | custom | decorative: `aria-hidden` |
| Platform badge | yt / ig / tt / fb | — | custom | `role="img"` + platform name |
| Video preview | caption · ratio · tag · play | — | custom | `role="img"` with caption text |
| Dialog | title · body · actions | — | `Dialog` | focus trap, Esc closes (not for destructive confirm without choice) |
| Top bar | workspace switcher · search ⌘K · credits · pause · bell · account | role-dependent (G-02) | custom | bell `aria-label` with unread count |
| Sidebar | groups AI / Create / Publish / Grow / Workspace / Agency | active, plan-locked | `NavigationMenu` | `aria-current="page"` |
| Bottom tab bar (mobile) | Home · Activity · Approvals (badge) · Calendar · More | active | custom | < 768 px only |
| Empty state | icon · title · text · primary + secondary action | — | custom | — |

## 4. Routes

Use B §5 exactly. The inventory (`SCREEN_INVENTORY.md`) repeats each route next to its board.

## 5. Copy rules

1. **The AI is "Nelio AI".** Never name model, transcription, rendering or other vendors anywhere a user can see: UI, emails, push, errors, logs shown to users, AI-generated text. AI responses must not self-identify as another product. (A D-18; legal decides sub-processor disclosure.)
2. **Credits:** "*N* left" = balance; "used *X* of *Y*" = consumption; "≈" before every estimate; show estimate → actual after.
3. **Honest states:** "In development", "Coming later", "Confirming with Instagram" (never "failed" before reconciliation), "estimate" on scores, no guarantees of views or monetization.
4. **Plain words** over jargon: "sign-in expired" not "token expired" in UI; "on hold" not "blocked by policy".
5. **One clear action** per banner; say what happens next and when (e.g. "resets Monday 00:00 WAT").
6. Times show the workspace timezone label (WAT by default).

## 6. Build rules from the audit

- **G-02 role visibility:** credits pill hidden for Editor/Viewer; Pause hidden for Viewer; Editors pause only assigned agents; client approvers never see operator chrome.
- **G-04 responsive nav:** under 768 px replace the sidebar with the bottom tab bar.
- **G-05:** tabs ≥ 44 px on touch.
- **G-10/G-11:** shared `sr-only` utility; global 3 px Volt focus ring with 2 px offset; honour `prefers-reduced-motion` (disables caption animation previews).
- Light theme: Volt is a **fill only**, never text; use `#3D4D00` for Volt-tint chip text.

## 7. Acceptance criteria (UI level)

| Area | The build passes when… |
|---|---|
| Onboarding | 4 steps, each skippable; Assisted pre-selected; choosing Autonomous never enables publishing without the authorization dialog; ends on the checklist; checklist persists on Command Center until done/dismissed. |
| Command Center | "Needs you" lists every pending gate (approvals, expiring sign-ins/licenses, budget pauses) with one action each; agent cards show state, budget meter, next run. |
| Activity | Runs show real steps; blocked runs show the reason and one fix; "confirming" is distinct from failed; after reconnect the feed reloads server state and shows "Back online". |
| Clipping | Processing can't start without a rights choice; cost estimate shown before processing and render; candidate scores labelled estimate; mobile offers trim/style/approve only. |
| Publishing | Post detail shows one row per platform with approval + publish state; scheduling sends only approved platforms; overdue items stay held; material edits re-request the right platforms (AS-B1). |
| Client portal | Client sees only their workspace; decides per platform; sees when a newer revision replaced what they approved. |
| Licensing | Expired/revoked licenses block new renders and hold scheduled posts with visible reasons; owner sees impact before revoking; paid licensing shows "coming later". |
| Billing | Estimates and actuals reconcile in the ledger; limits pause new work; no automatic top-up by default; checkout requires explicit authorization; trial never charges. |
| Themes | Every screen works in Dark and Light from tokens; switching persists; contrast ≥ 4.5:1 for text. |
| PWA | Install prompt per SY-01; offline shows cached data read-only and queues nothing. |
| Confidentiality | A text scan of the built UI, emails and notification templates finds no AI/media vendor names. |

## 8. Edge cases (annotated on boards)

| Edge case | Where it's designed |
|---|---|
| Upload finished but platform didn't confirm → "Confirming", no retry until reconciled | PB-03, APP-03, StatesPublishing |
| Instagram approved, YouTube sent back; only YouTube text changed → Instagram approval kept | PB-03, PB-05, CP-02 |
| Video re-cut after approval → all platforms need re-approval | StatesPublishing, StatesAgency |
| License revoked while a post is scheduled → held, with remove action; published post flagged | LI-04, PB-03, LI-09 |
| Agent hits weekly budget mid-run → run "blocked: budget", not failed | APP-03, APP-01, BI-05 |
| Sign-in expires with posts scheduled → posts held until reconnect | IN-01, StatesPublishing |
| Trial ends with autonomous agent → agent paused, nothing charged | BI-08, StatesBilling |
| Payment fails → 7-day grace, top-ups off, then Free | BI-07 |
| Client opens an approval link for another workspace → denied without revealing it exists | StatesAgency, SY-03 |
| Invite opened while signed in as a different email | StatesAgency |
| Third-party music inside a licensed creator's video → excluded automatically | LI-02, LI-07 |
| Offline while approving → disabled, nothing queued | SY-02 |

## 9. Design decisions log (this phase)

| # | Decision | By |
|---|---|---|
| D-18 | Never name AI/media vendors; the AI is "Nelio AI" | User, 12 Nov |
| E-1 | Visual direction: dark-first, flat Volt + Grape, Bricolage Grotesque + Inter, no gradients | Design, per user brief "fun and exciting, no gradients" |
| E-2 | Onboarding is one question per screen with big choice cards and an end-of-flow checklist | Design, per user brief "modern and simple" |
| E-3 | Deliverable D (design system) folded into the canvas Foundations page and `tokens.json` | User asked to go straight to hi-fi |
| E-4 | Credits wording: "left" vs "used" (G-06) | Audit fix |
| E-5 | Light grape `#5333D6` for contrast (G-07) | Audit fix |

## 10. Not yet done

- **Deliverable F (runnable prototype)** was skipped at the user's request (straight from wireframes to hi-fi, then audit and handoff). Only the onboarding flow is clickable. Master Prompt 1 lists F as a deliverable, so decide whether to build it before implementation or let the first build milestone stand in for it.
- **G-01 secondary surfaces** (E2 follow-up).
- **Human visual pass** of the canvas (G-03).
- Screenshots: export any board from the canvas when needed (they weren't generated here).

---

**DESIGN PHASE COMPLETE — AWAITING USER APPROVAL** *(with the open items in §10)*. No production code will start until you explicitly approve.
