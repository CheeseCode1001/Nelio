# Nelio — Design Deliverable A: Requirements Inventory & Traceability

**Phase:** Design (Master Prompt 1) — checkpoint A of A–H
**Date:** 12 November 2026
**Status:** Draft for review. Not approved. No production code is written in this phase.

---

## 0. Sources and precedence

| Code | Document | Location |
|---|---|---|
| PRD | Product Requirements Document v1.0 + Finalized decisions addendum (9 Nov 2026) | `docs/source/01_PRD.md` |
| ARCH | Technical Architecture v1.0 + Finalized architecture addendum | `docs/source/02_TECHNICAL_ARCHITECTURE.md` |
| MP1 | Master Prompt 1 — Design & Prototype | `docs/source/03_MASTER_PROMPT_1_DESIGN.md` |
| MP2 | Master Prompt 2 — Implementation (used only after design approval) | `docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md` |
| ADD | The "Finalized decisions addendum" in PRD §21 / ARCH (identical text) | — |

**Precedence rule (from ADD):** where documents conflict, the finalized addendum wins; then PRD; then ARCH; then MP1/MP2 for design/implementation specifics. The `archive/` files are identical to the current ones minus the addendum and are reference only.

**Brand:** the product name is **Nelio** (supplied by the user 12 Nov 2026). This resolves PRD §15 "brand name". Visual identity is still open and is proposed in deliverable D.

---

## 1. Unified roles

The documents use slightly different persona and role names. The design uses this unified set:

| Role ID | Role | Derived from | Scope |
|---|---|---|---|
| R-CR | Creator (workspace owner) | PRD §3 Creator, MP1 | Own organization + default workspace |
| R-BO | Business owner | ADD account type "business" | Same as Creator, with a business onboarding path and team seats |
| R-AO | Agency Owner | PRD §3, ARCH §4 Org Owner | Agency organization, all client workspaces, billing |
| R-AA | Agency Admin | ARCH §4 Org Admin | As Owner, except ownership transfer / org deletion |
| R-WM | Workspace Manager | ARCH §4 | One or more assigned workspaces: accounts, agents, schedules |
| R-ED | Editor (agency staff) | PRD §3 Editor/Manager | Drafts and schedules in assigned workspaces; cannot bypass approval |
| R-AV | Analyst / Viewer | ARCH §4 | Read-only in assigned workspaces |
| R-CA | Client Approver | PRD §3, ARCH §4 | Only assigned client workspace content and approval requests; no billing or credentials |
| R-CO | Licensed Content Owner | PRD §3 "Creator partner", ADD licensing marketplace | Creator portal only; free, no subscription |
| R-PA | Platform Administrator | PRD §3, ARCH §4 | Global, audited elevated access; separate from tenant roles |

---

## 2. Screen inventory (IDs used in the traceability matrix)

### Marketing (public)
- **M-01** Home · **M-02** Product / features · **M-03** Use cases (Creators, Businesses, Agencies) · **M-04** Pricing · **M-05** Licensing & Creator Partners · **M-06** FAQ · **M-07** Legal (Terms, Privacy, Acceptable Use, Licensing Policy, Takedown) · **M-08** Public system / integration status

### Authentication & onboarding
- **AU-01** Sign up · **AU-02** Log in · **AU-03** Email verification · **AU-04** Forgot / reset password · **AU-05** MFA setup & challenge · **AU-06** Accept invitation (staff or client) · **AU-07** Content-owner sign-up (free, no plan)
- **ON-01** Account type (Creator / Business / Agency) · **ON-02** Goals & niche · **ON-03** Connect socials (optional) · **ON-04** Automation mode · **ON-05** Setup checklist (persistent dashboard widget)

### Core app
- **APP-01** Command Center (agent dashboard) · **APP-02** AI Strategist (chat, plan proposal, activation approval) · **APP-03** AI Activity Center (live feed, job drawer, logs, costs) · **APP-04** Agents list · **APP-05** Agent detail & configuration · **APP-06** Create-agent wizard · **APP-07** Workspace switcher / org context · **NT-01** Notifications inbox / panel

### Video clipping
- **CL-01** Media library · **CL-02** Upload / authorized import (with rights declaration) · **CL-03** Clipping Studio (transcript, speaker timeline, candidates, preview, reframe, captions, NL edits, versions) · **CL-04** Batch variants · **CL-05** Render & export queue

### Content Studio
- **CS-01** Studio home (scripts, posts, images, templates) · **CS-02** Post composer with per-platform variants · **CS-03** Original AI video generation (capability-gated, "requires specialist provider")

### Calendar, approvals & publishing
- **PB-01** Content calendar · **PB-02** Drafts list · **PB-03** Post detail (platform previews, destinations, publish status, attempts, failure recovery) · **PB-04** Approvals queue · **PB-05** Approval detail (revision, comments, approve / reject / request changes, history)

### Analytics
- **AN-01** Analytics overview · **AN-02** Content performance · **AN-03** Agent performance · **AN-04** Campaign goals & experiments

### Licensing marketplace (user side and owner side)
- **LI-01** Marketplace discovery · **LI-02** Source / creator detail & license terms · **LI-03** Request license / agreement flow · **LI-04** My licenses (expiry & revocation alerts, affected drafts)
- **LI-05** Creator portal dashboard · **LI-06** Ownership / channel verification · **LI-07** Permission & terms management · **LI-08** Usage audit · **LI-09** Revocation flow · **LI-10** Paid licensing & payouts ("coming later — pending compliance")

### Integrations
- **IN-01** Social connections hub (per-platform states) · **IN-02** Connection detail (scopes, capabilities, token health, disconnect)

### Agency
- **AG-01** Agency hub / cross-client overview · **AG-02** Client workspaces (list, create) · **AG-03** Client workspace settings (approval policy, accounts, brand kit) · **AG-04** Team & invitations · **AG-05** Roles & permissions matrix · **AG-06** Audit log
- **CP-01** Client portal home (approvals-only view) · **CP-02** Client approval detail (mobile-first)

### Billing & credits
- **BI-01** Plan & usage overview · **BI-02** Plans / upgrade / checkout (USD list, NGN display) · **BI-03** Credit ledger · **BI-04** Top-ups (paid plans only) · **BI-05** Spend limits (workspace / agent) · **BI-06** Invoices · **BI-07** Payment failure & recovery · **BI-08** Trial status & limits

### Settings
- **ST-01** Profile · **ST-02** Security (MFA, sessions, account deletion) · **ST-03** Appearance (Dark / Light / System) · **ST-04** Notification preferences (channels, quiet hours, web push) · **ST-05** Workspace members · **ST-06** Brand kits · **ST-07** AI & processing settings (transcription mode Fast / Balanced / High Quality) · **ST-08** Integration & API status · **ST-09** Privacy (data export / delete) · **ST-10** Workspace settings (timezone, defaults, emergency pause)

### Platform admin
- **AD-01** Ops overview (queue health) · **AD-02** Jobs & dead-letter · **AD-03** Audit search · **AD-04** License review · **AD-05** Support access (audited) · **AD-06** Abuse reports & moderation · **AD-07** Payment & integration diagnostics · **AD-08** Feature flags

### System
- **SY-01** PWA install prompt · **SY-02** Offline state · **SY-03** Error pages (404, 500, permission-denied, maintenance)

**Total: 86 screens / surfaces.** Each will also be designed in the cross-cutting states listed in §5.

---

## 3. User journeys (IDs)

| ID | Journey | Source |
|---|---|---|
| J-01 | Creator first run: sign up → onboarding (skippable) → upload owned video → generate short → edit → connect account → approve/schedule → publish confirmation → notification → analytics | PRD §5, AC-01 |
| J-02 | Agency setup: owner signs up → agency onboarding → create client workspace → invite editor + client approver → assign accounts/brand kit → set approval policy | PRD §5, AC-02 |
| J-03 | Agency approval: editor/agent creates draft → client notified → client logs in → requests changes → revised version (old approval invalidated) → client approves → schedule/publish → audit | PRD §5, AC-03, ARCH §11 |
| J-04 | Autonomous run: Strategist proposes plan → user approves sources, budget, cadence, destinations → agent researches → license check → generate → QA → approval gate (if policy) → publish → log results | PRD §5, ARCH §7 |
| J-05 | License revocation: owner revokes → future use blocked → pending jobs held → affected drafts flagged → published uses flagged for review/takedown | PRD §5, AC-09 |
| J-06 | Content-owner onboarding: free sign-up → verify channel ownership → define permitted uses/terms → monitor usage | ADD licensing, MP1 §10 |
| J-07 | License acquisition: user discovers source → reviews terms and third-party flags → requests/accepts license → source available in Clipping Studio with rights snapshot | PRD FR-08, MP1 §10 |
| J-08 | Spend limit hit: expensive task estimated → insufficient budget → task paused → user tops up (paid) / raises limit / upgrades → task resumes | PRD FR-14, AC-07 |
| J-09 | Trial: start 3-day trial → limits visible (1 agent, 1 account, 2 exports) → cap reached → upgrade prompt → no automatic charge | ADD commercial |
| J-10 | Publish failure / unknown: upload timeout → status "unknown" → reconciliation → resolved to published or failed → user retry with no duplicates | ARCH §10, AC-04/05 |
| J-11 | Social connection lifecycle: connect → permissions needed → pending app approval / unsupported capability → expired token → reconnect | MP1 §11 |
| J-12 | Emergency pause: user pauses agent or workspace → new dispatch stops → in-flight outcomes reported | PRD §6, AC-08 |
| J-13 | Platform admin incident: queue backlog alert → inspect dead-letter → audited support access → resolution | PRD FR-15, ARCH §15 |
| J-14 | Payment failure: renewal fails → grace state → user updates payment → restored, or downgraded | MP2 §9 |

---

## 4. Requirements traceability matrix

Columns: **Req** = requirement ID · **Source** · **Requirement (summary)** · **Screens** · **Journeys** · **Roles** · **Prototype treatment** (how MP1 simulates it) · **Test hook** (acceptance criterion the build phase must prove).

Prototype treatment key: **UI** = fully interactive with local state · **SIM** = simulated with labelled mock/demo data · **GATED** = shown in an honest disabled/pending state · **DOC** = documented in specs, no UI needed in prototype.

### 4.1 Functional requirements (PRD §4)

| Req | Source | Requirement | Screens | Journeys | Roles | Prototype | Test hook |
|---|---|---|---|---|---|---|---|
| FR-01 | PRD | Identity: registration, verification, login, recovery, sessions, deletion, MFA, role checks, membership | AU-01–07, ST-02, SY-03 | J-01, J-02, J-06 | All | UI (mock auth, demo personas switcher) | AC-02 |
| FR-02 | PRD+ADD | Onboarding: 4 skippable steps (account type, goals/niche, optional socials, automation mode) + checklist | ON-01–05, APP-01 | J-01, J-02 | CR, BO, AO | UI | ARCH AT-1 |
| FR-03 | PRD | Workspaces: multiple agency clients, invitations, client-scoped roles, approval policy, audit, strict isolation | AG-01–06, APP-07, ST-05, SY-03 | J-02, J-03 | AO, AA, WM, CA | UI (seeded 2+ clients, isolation demo) | AC-02, AT-2/3 |
| FR-04 | PRD | Agent management: create/configure/start/pause/resume; goals, schedules, sources, brand rules, budgets, destinations | APP-04–06, APP-01 | J-04, J-12 | CR, BO, AO, AA, WM | UI | AC-08 |
| FR-05 | PRD | Strategist: conversational intake; proposes calendar and workflow; explicit approval before activation or permission expansion | APP-02 | J-04 | CR, BO, AO, AA, WM | SIM (scripted demo responses, labelled) | — |
| FR-06 | PRD | Clipping: authorized upload/licensed ingest, transcript, candidate highlights, crop/reframe, captions, preview, trim, render, export | CL-01–05 | J-01, J-07 | CR, BO, WM, ED | SIM (fixture video, mock transcript and candidates) | AC-01 |
| FR-07 | PRD | Studio: hook/title variants, captions, aspect ratios, brand overlays, audio, basic timeline edits, version history | CL-03, CL-04, CS-01, CS-02, ST-06 | J-01, J-03 | CR, BO, WM, ED | SIM | AC-03 (revision invalidation) |
| FR-08 | PRD | Licensing: evidence, owner verification, allowed uses, attribution, term, territory, commercial flag, expiry, revocation checks | LI-01–10, CL-02, PB-03 | J-05, J-06, J-07 | CR, BO, WM, ED, CO, PA | UI (owner + user sides), payouts GATED | AC-09, AT-4/5 |
| FR-09 | PRD+ADD | Publishing: official OAuth, draft/approve/schedule/publish, destination validation, status, failure recovery; only approved platforms | PB-01–03, IN-01–02 | J-01, J-10, J-11 | CR, BO, WM, ED | SIM (labelled mock publisher); platform states GATED | AC-04, AC-05, AT-9 |
| FR-10 | PRD | Calendar & approvals: client preview, comments, approve/reject/request changes, immutable history, invalidation on material edits | PB-01, PB-04, PB-05, CP-01, CP-02 | J-03 | ED, WM, CA | UI | AC-03, AT-6 |
| FR-11 | PRD | Activity Center: agent events, progress, approvals, errors, worker state, usage, history, realtime with durable replay | APP-03, APP-01 | J-04, J-10, J-12 | All tenant roles (filtered) | SIM (timed event stream; reconnect demo) | AT-12 |
| FR-12 | PRD | Notifications: in-app, browser push, email, opt-in, retries, dedupe, deep links | NT-01, ST-04 | J-03, J-05, J-08 | All | UI (inbox); push/email SIM | AC-06, AT-11 |
| FR-13 | PRD | Analytics: only authorized-API metrics, source timestamps, unsupported-metric labels, trends | AN-01–04 | J-01, J-04 | CR, BO, AO, AA, WM, AV | SIM (with "last updated" and "not provided by platform" labels) | — |
| FR-14 | PRD+ADD | Billing: entitlements, credit ledger, estimate before costly tasks, per-agent/workspace caps, reconciliation, invoices | BI-01–08, APP-03, APP-05 | J-08, J-09, J-14 | CR, BO, AO, AA | UI (mock ledger; checkout SIM) | AC-07, AT-13 |
| FR-15 | PRD | Admin: queue health, audit search, license review, support access, abuse reports, payment/integration diagnostics | AD-01–08 | J-13 | PA | SIM | AT-15 |

### 4.2 Master Prompt 1 surfaces not fully covered by FR IDs

| Req | Source | Requirement | Screens | Prototype |
|---|---|---|---|---|
| MP1-01 | MP1 §1 | Marketing site: home, use cases, pricing, product, licensing, FAQ, legal, login/signup | M-01–08 | UI (placeholder legal copy, labelled) |
| MP1-06a | MP1 §6 | Speaker timeline, viral-moment ranking, source-to-clip traceability, NL editing, batch variants | CL-03, CL-04 | SIM; scores labelled "estimate" (ARCH §8) |
| MP1-07 | MP1 §7 | Content Studio: AI scripts, posts, images, templates; remix within license | CS-01, CS-02 | SIM |
| MP1-07a | MP1 §7, ADD | Original AI video generation marked as dependent on a specialist provider | CS-03 | GATED |
| MP1-09 | MP1 §9 | Analytics: experiments, attribution caveats | AN-04 | SIM |
| MP1-11 | MP1 §11 | Integration states: not connected, permissions needed, pending app approval, unsupported capability, expired token | IN-01, IN-02, ON-03 | UI (all 5 states seeded) |
| MP1-12 | MP1 §12 | Agency hub: cross-client overview, client approval portal | AG-01, CP-01, CP-02 | UI |
| MP1-14 | MP1 §14 | Settings: account/security, appearance, team, provider settings, API status, admin & support | ST-01–10, AD-* | UI |
| MP1-15 | MP1 §15 | PWA install prompt, offline-safe states, responsive mobile/tablet/desktop | SY-01, SY-02, all | UI (manifest + install prompt demo) |

### 4.3 Finalized decisions (addendum)

| Req | Decision | Screens affected | Prototype |
|---|---|---|---|
| D-01 | One major public launch after private beta. Unapproved integrations and generative video are never shown as working. | IN-*, CS-03, M-04, M-08 | GATED states |
| D-02 | Responsive web + installable PWA first; React Native/Expo later (not a deliverable) | SY-01, all | UI |
| D-03 | Dark / Light / System themes; dark default; full parity; persisted | ST-03, all | UI (functional toggle, persisted locally) |
| D-04 | 4 onboarding steps, all skippable, dashboard checklist | ON-01–05 | UI |
| D-05 | Autonomous publishing requires explicit authorization | ON-04, APP-05, APP-02 | UI (authorization dialog) |
| D-06 | YouTube + Instagram first, then TikTok + Facebook; availability gated by real app approval | IN-01, ON-03, PB-03, M-04 | UI: YouTube/Instagram "in development"; TikTok/Facebook "coming later"; all labelled mock |
| D-07 | Claude is the only general reasoning model; no public model picker | ST-07, APP-02 | DOC + UI copy |
| D-08 | Transcription router (Deepgram/Whisper), Fast / Balanced / High Quality, per-job cost, fallback | ST-07, CL-02, APP-03 | UI (mode selector + cost estimate, SIM) |
| D-09 | FFmpeg / Remotion / PySceneDetect complement each other | CL-03, CL-05, APP-03 | SIM (job steps named honestly) |
| D-10 | Pricing: Free $0, Starter $19, Creator Pro $49, Business $99, Agency $249, Enterprise custom; credits provisional | M-04, BI-01, BI-02 | UI, entitlements labelled "provisional" |
| D-11 | Free plan very limited, no autonomous publishing | M-04, BI-01, ON-04, APP-05 | UI (locked states) |
| D-12 | 3-day trial: 1 agent, 1 account, 2 short exports, hard compute cap, no premium video, no auto-charge | BI-08, APP-06, IN-01, CL-05 | UI (limit meters + cap-reached states) |
| D-13 | Top-ups paid plans only; no automatic top-up by default; show estimated + actual cost; pause at limits | BI-03–05, APP-03 | UI |
| D-14 | Nigeria operator; Paystack first, Flutterwave alternative; USD list prices, NGN checkout with transparent conversion | BI-02, BI-06 | SIM checkout, labelled; rate shown as "illustrative" |
| D-15 | Content owners join free; free and private licensing first; paid licensing and payouts later | AU-07, LI-05–10, M-05 | UI; LI-10 GATED |
| D-16 | Agency workspaces, client login and direct approvals from launch | AG-*, CP-* | UI |
| D-17 | Design first → explicit approval → then implementation | — | Process: ends with "DESIGN PHASE COMPLETE — AWAITING USER APPROVAL" |

### 4.4 Autonomy & policy engine (PRD §6, ARCH §7)

| Req | Requirement | Screens | Prototype |
|---|---|---|---|
| PE-01 | Modes: Manual / Assisted (semi-autonomous) / Autonomous | ON-04, APP-05, APP-01 | UI |
| PE-02 | Agent permissions scoped to workspace, account, source pool, content types, posting caps, spend limits, approval policy | APP-05, APP-06 | UI (permission editor) |
| PE-03 | Hard gates: no unlicensed source, no unconnected account, no spend over limit, no publish after revocation, no approval bypass | APP-03, PB-03, CL-02, BI-05 | UI (blocked states with reason) |
| PE-04 | Agent states `draft → awaiting_activation → active → paused → stopped`; run states `queued → running → awaiting_approval / completed / failed / cancelled` | APP-03, APP-04, APP-05 | UI (state chips) |
| PE-05 | Emergency pause (agent, workspace, global for admin); in-flight outcome reported; can't undo published posts | APP-01, ST-10, AD-01 | UI |
| PE-06 | Publish states `draft → needs_approval → approved → scheduled → queued → uploading → published / failed / unknown` | PB-01–03 | UI (all states seeded) |

### 4.5 Non-functional requirements relevant to design (PRD §11)

| Req | Requirement | Design response |
|---|---|---|
| NFR-A11Y | Keyboard operation, focus states, contrast, screen-reader labels, reduced motion | WCAG 2.2 AA target in both themes; spec in D; audit in G |
| NFR-PERF | Visible progress for long tasks; pagination; selective realtime | Progress shown only when measurable (ARCH §12, "do not fabricate %"); otherwise step-based status |
| NFR-SEC | Tenant isolation, signed media, audit | Permission-denied states (SY-03); audit log UI (AG-06, AD-03); no secrets in UI |
| NFR-PRIV | Retention, export/deletion, notification consent | ST-09, ST-04 consent prompts |
| NFR-HONEST | No unverified success states (ARCH principles) | Global "Mock" / "Demo AI" badge system; "unknown" publish state |

### 4.6 Acceptance criteria → screens (to be proven in build phase)

| AC | Screens that must support it |
|---|---|
| AC-01 Creator generates captioned short from upload; downloadable | AU-01, ON-*, CL-02, CL-03, CL-05 |
| AC-02 Client A cannot access client B (UI/API/storage/realtime) | APP-07, AG-02, SY-03 |
| AC-03 Draft → revision requested → revised → approved; audited | PB-04, PB-05, CP-02, AG-06 |
| AC-04 Publish only after approvals + license checks; result recorded | PB-03 |
| AC-05 Jobs survive browser closure; no duplicate publish on restart | APP-03 (reconnect state) |
| AC-06 Notifications in-app + opt-in channels; no duplicates | NT-01, ST-04 |
| AC-07 Spend limits stop expensive ops; ledger reconciles | BI-03, BI-05, APP-03 |
| AC-08 Pause stops future work; history visible after reconnect | APP-04, APP-05, APP-03 |
| AC-09 Expired/revoked licenses block generation/publish; flag drafts | LI-04, LI-09, PB-03 |
| AC-10 Release evidence | DOC (build phase) |

---

## 5. Cross-cutting states (designed for every relevant screen)

Empty · Loading (skeleton) · Error (recoverable / fatal) · Success · Permission denied · Approval required / pending · Credit exhausted / spend limit reached · Trial limit reached · Plan-locked feature · Integration not connected / permissions needed / pending app approval / unsupported / token expired · License expired / revoked · Offline · **Mock / Demo AI label** (prototype honesty marker).

---

## 6. Conflicts found and how they're resolved

| # | Conflict | Resolution |
|---|---|---|
| C-1 | PRD body describes "creator or agency" paths; addendum adds "business" | Addendum wins: three account types (ON-01). Business = Creator capabilities + team seats; no client portal. |
| C-2 | ARCH §14 says pricing "not yet decided"; addendum sets provisional USD prices | Addendum wins: show prices, label credit allowances "provisional". |
| C-3 | ARCH §4 role list omits the licensed content owner / creator partner | Added as R-CO (§1). Content owners have their own portal and no subscription. |
| C-4 | PRD calls the middle mode "semi-autonomous"; MP1 says "assisted" | UI label **Assisted**, with a "semi-autonomous" explanation in help text. |
| C-5 | PRD lists "Agency editor/manager" as one persona; ARCH splits Workspace Manager and Editor | ARCH split used; the PRD persona maps to both. |
| C-6 | PRD numbering jumps from §16 to §21 | Flagged to user (Q-1). Treated as non-blocking: §21 is the addendum. |
| C-7 | PRD FR-02 lists "brand kit" and "first agent and first video wizard" as onboarding steps; addendum limits onboarding to 4 steps | Addendum wins. Brand kit, first agent and first video become **checklist items** (ON-05), not onboarding steps. |
| C-8 | PRD data model (§10) and ARCH data model (§5) use different entity names | Build-phase concern; ARCH names are used in handoff (H). No design impact. |

---

## 7. Assumptions (documented so they don't block design)

| # | Assumption | Revisit when |
|---|---|---|
| AS-1 | Plan entitlements (agents, accounts, workspaces, credits) are **illustrative** placeholders, as below, until cost benchmarking | Build phase, cost benchmark |
| AS-2 | 1 credit ≈ an abstract unit; UI shows credits plus an estimated USD equivalent | Credit formula approved |
| AS-3 | Business plan includes team seats but not client workspaces; Agency plan includes client workspaces + client portal | Pricing approval |
| AS-4 | Client approvers approve per post across all its destinations (not per platform) by default; per-platform approval is a policy toggle shown as "optional" | Q-4 answered |
| AS-5 | Default approval policy: mandatory when a client approver is assigned; otherwise owner/manager approval in Assisted mode | Policy defaults approved |
| AS-6 | NGN conversion shown with an illustrative rate and a "final amount confirmed at checkout" note | Paystack verification |
| AS-7 | Legal pages use clearly labelled placeholder copy | Legal review |
| AS-8 | Prototype uses a demo-persona switcher (Creator / Agency Owner / Editor / Client / Content Owner / Admin) so reviewers can see role isolation without real auth | Build phase replaces with Supabase Auth |
| AS-9 | Media retention is shown as a workspace setting with placeholder durations | Retention decision |
| AS-10 | Supported UI language is English at launch | Target markets |

**Illustrative entitlements (provisional, for prototype display only):**

| Plan | Price/mo | Agents | Social accounts | Workspaces | Autonomous publishing | Top-ups |
|---|---|---|---|---|---|---|
| Free | $0 | 1 (manual only) | 1 | 1 | No | No |
| Trial (3 days) | $0 | 1 | 1 | 1 | With explicit authorization | No; 2 exports max |
| Starter | $19 | 2 | 3 | 1 | Yes | Yes |
| Creator Pro | $49 | 5 | 6 | 1 | Yes | Yes |
| Business | $99 | 10 | 12 | 1 + team seats | Yes | Yes |
| Agency | $249 | 25 | 40 | 10 client workspaces | Yes | Yes |
| Enterprise | Custom | Custom | Custom | Custom | Yes | Yes |

---

## 8. Open questions

**Non-blocking (design proceeds on the assumption shown):**
- **Q-1** PRD sections 17–20 are missing. Were they removed on purpose? (Assumed: yes.)
- **Q-2** Which specialist provider will handle original AI video generation? (CS-03 stays gated.)
- **Q-3** Media retention windows (AS-9).
- **Q-4** Can clients approve per platform? (AS-4.)
- **Q-5** Target markets beyond Nigeria and compliance obligations (affects legal pages and privacy UI copy).
- **Q-6** Brand visual identity: colours, logo, tone. Deliverable D will propose a direction for approval.

**Blocking:** none for the design phase.

---

## 9. What comes next

| Checkpoint | Deliverable |
|---|---|
| **A** | ✅ This document |
| B | Information architecture, sitemap, role/permission matrix, journey maps |
| C | Low-fidelity wireframes (desktop + mobile) |
| D | Design tokens, typography, components, accessibility spec, Dark/Light themes, brand direction |
| E | High-fidelity screens with all states |
| F | Runnable Next.js prototype with mock data |
| G | UX audit |
| H | Handoff package |
