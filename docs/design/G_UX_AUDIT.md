# Nelio: Design Deliverable G, UX audit

**Phase:** Design (Master Prompt 1), checkpoint G
**Date:** 12 November 2026
**Audited:** the high-fidelity canvas (E): 94 screens, 7 state sheets, 10 mobile boards, 9 light-theme boards, foundations and the interactive onboarding flow.
**Canvas:** https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu

## How this audit was done (and its limits)

- Each board was reviewed against A (requirements), B (permissions, journeys) and the six areas Master Prompt 1 asks for: role isolation, approval controls, credit transparency, licensing restrictions, mobile responsiveness, PWA behaviour. Also covered: accessibility, the "no gradients / fun" brief, and AI-provider confidentiality (D-18).
- Colour contrast was **computed** for every token pair (WCAG 2.x formula). See §3.
- Text checks were run on every board file: no AI or media vendor names, and "gradient" appears only in the Foundations rule text.
- **Not done:** I did not render or screenshot the canvas boards (the canvas is reviewed in place). A human visual pass is still needed, especially for the fixed-height mobile boards (see G-03).

Severity: **High** = blocks build or risks a requirement · **Medium** = fix before beta · **Low** = polish.

## 1. Findings

| # | Sev | Area | Finding | Fix / owner |
|---|---|---|---|---|
| G-01 | High | Coverage | Some secondary surfaces aren't drawn yet: emergency-pause **confirmation** dialog (J-12), command palette open state, account menu with surface switcher (B §2), agent tabs *Budget / Destinations / Runs* (only *Policy* drawn), calendar **month** view, Strategist history, notification **dropdown** panel (full page exists), admin global-pause confirmation, client portal *Approved / Published* tab contents, internal-review step of an approval chain. | Design follow-up E2 before build of those modules. Each is a variant of an existing pattern. |
| G-02 | High | Role isolation | The top bar shows the credits pill and **Pause all** on every operator board. Per B §6, Editors and Viewers can't see billing and Viewers can't pause. | Build rule: hide credits pill for Editor/Viewer; hide Pause for Viewer; Editor's pause applies only to agents in assigned workspaces. Recorded in H §6. |
| G-03 | Medium | Mobile | Mobile boards are fixed at 390×844. Content heights were estimated, not measured, so a few may clip at the bottom (most likely: Mobile Home, Client approval, Upload). | Visual pass on the canvas; in build these are scrolling pages, so clipping can't occur. |
| G-04 | Medium | Responsive | Desktop boards are fluid pages. Below ~800 px their sidebar stacks above the content, which is not the intended mobile nav. | Build: under 768 px replace the sidebar with the bottom tab bar from the mobile boards (B §3.2). |
| G-05 | Medium | Touch targets | Tab pills (`tabs` component) are ~36 px tall: below the 44 px minimum on touch screens. All buttons, toggles and inputs meet 44 px. | Build: tabs get 44 px min-height on coarse pointers. |
| G-06 | Fixed | Credit transparency | Credits were shown as *balance* in the top bar but *used* in the sidebar/billing meter (both "1,240"). | **Fixed on canvas:** top bar says "1,240 left"; meters say "used 760 of 2,000". Copy rule in H §5. |
| G-07 | Fixed | Accessibility | Light-theme grape chip text was 4.2:1 (fails 4.5:1). | **Fixed:** light grape `#5333D6` → 6.2:1 on its tint, 7.5:1 white-on-grape. |
| G-08 | Low | Licensing | Composer shows attribution only as a license rule; for licensed sources the caption preview should show the auto-added attribution line (e.g. "via @chefkemi"). | Add to CS-02 licensed variant in E2. |
| G-09 | Low | Onboarding | Interactive onboarding shows Autonomous as "Needs authorization" but not the **Free-plan locked** variant. | Static lock state exists in StatesCore; add to the interactive flow when plan is Free. |
| G-10 | Low | Accessibility | Two inputs use an off-screen label technique inline. | Build: use a shared `sr-only` utility. |
| G-11 | Low | Accessibility | Focus ring is specified (3 px Volt, 2 px offset) but not drawn on boards. | Build implements globally; G re-checks in prototype. |

## 2. Area checks

### Role isolation ✅ (with G-02)
- Workspace switcher lists only workspaces the user belongs to and says so (APP-07).
- Client approvers get a separate portal with no sidebar, billing, agents or other clients (CP-01/02, AU-06 "You can't" list).
- Access-denied page never confirms a workspace exists (SY-03, StatesAgency).
- Agency hub (cross-client) appears only under the Agency nav group; managers must see only assigned clients (build rule).
- Platform admin is visually distinct (orange audited strip), support access is time-boxed, reasoned, owner-notified, and hides tokens/payment data (AD-05).

### Approval controls ✅
- Per-platform decisions everywhere they matter: post detail table, approval detail, client tabs, calendar, drafts (D-Q4).
- Invalidation rule AS-B1 is explained in-context ("Only YouTube needs a fresh look" / "Video changed, so both platforms need re-approval").
- Overdue approvals never auto-approve (PB-04, StatesPublishing).
- Pre-publish checks visible on PB-03 (revision, approval, license, connection).
- Every decision lands in the audit log (AG-06).

### Credit transparency ✅ (G-06 fixed)
- Estimate before every costly action: upload processing, render button, variants, trial meters.
- Estimated vs actual per agent (BI-01), ledger shows reserve → settle → refund (BI-03).
- Limits pause work and say when they reset (BI-05, APP-01 agent card, StatesBilling).
- Auto top-up is off by default and paid-only (BI-04). NGN shown at Paystack checkout, with an explicit authorization checkbox (BI-02).
- Trial: no card, never auto-charged, hard caps visible (BI-08, M-04).

### Licensing restrictions ✅ (G-08 low)
- Rights declaration is required before processing and explains that public ≠ licensed (CL-02).
- Third-party music/footage exclusions shown on both sides (LI-02, LI-07).
- Revocation previews impact before confirming (LI-09) and the licensee sees held/flagged items with actions (LI-04, PB-03).
- Paid licensing and payouts are gated "coming later" (LI-10, M-05).

### Mobile ✅ (G-03, G-04, G-05)
- Bottom tabs with Approvals as a first-class tab; client approval is mobile-first with full-width buttons.
- Clipping on mobile is review-and-trim only, with a clear "full timeline on bigger screens" note (AS-B7).

### PWA ✅
- Install prompt after second visit, dismissible, iOS instructions (SY-01, StatesSystem).
- Offline: read-only cached view; approve/publish disabled and **nothing queued** (SY-02).

### Honesty and AI confidentiality ✅
- Platform states are honest: YouTube/Instagram "in development", TikTok/Facebook "coming later"; nothing shows a fake live integration.
- Original AI video and paid payouts are gated with "Notify me", never as half-working forms.
- Scores are labelled "estimate"; insights "not guarantees"; no virality or monetization promises.
- **No AI or media vendor appears on any board** (checked by text search). The AI is "Nelio AI" with one spark mark. ⚠ Legal must decide how sub-processors are disclosed in the privacy policy (A D-18).

### Brief: fun, modern, no gradients ✅
- Flat colour blocks (Volt hero cards, coloured stat tiles), Bricolage Grotesque display type, characterful agent avatars, bold caption-style video previews.
- Zero gradients, glows or glass effects (checked by text search).
- Onboarding: one question per screen, big choice cards, skippable, a single Volt action, ends on a clear next-step checklist.

## 3. Contrast (computed)

| Pair | Dark | Light |
|---|---|---|
| Text on background | 17.8 | 17.2 |
| Muted text on card | 7.8 | 7.3 |
| Muted text on input well | 7.1 | 6.3 |
| Text on Volt (primary button) | 16.8 | 16.8 |
| Text on Grape | 9.0 | 7.5 (after fix) |
| Grape chip text on tint | 7.5 | 6.2 (after fix) |
| Blue / orange / red / teal chip text on tint | 7.1 / 8.0 / 6.3 / 8.0 | 4.8 / 4.7 / 4.5 / 4.7 |
| Volt-tint chip text | 12.4 (Volt) | 8.7 (`#3D4D00`) |

All text pairs meet WCAG AA (4.5:1). Light-theme status chips are close to the line (4.5–4.8); keep chip text ≥ 12 px bold and don't lighten those tokens.

## 4. Recommendation

The design is ready for review. Before implementation starts on the affected modules, do the E2 follow-up for G-01 (missing secondary surfaces) and a human visual pass for G-03. G-02, G-04, G-05, G-10 and G-11 are build rules and are recorded in the handoff (H).

---

# v2 audit addendum (12 Nov 2026, redesign in reference style)

**Scope:** 369 boards on the redesigned canvas (light default, flat, reference-inspired).

| # | Status | Finding |
|---|---|---|
| G-01 | **Closed** | All missing secondary surfaces are now drawn: emergency pause + resume confirm, command palette (3 states), account menu with surface switcher, agent Budget/Destinations/Runs tabs, calendar month view + drag, Strategist history, notification dropdown + push prompt, admin global-pause confirm, client portal Approved/Published tabs, approvals internal-review step. |
| G-02 | Closed in design | Top bar hides credits for Editor/Viewer and Pause for Viewer (`topbar(role=…)`); Roles board adds “See credits” and “Pause agents” rows. |
| G-03 | Open (lower risk) | Mobile boards are fixed 390×844; content heights estimated. Needs a human visual pass. |
| G-05 | Improved | Pill tabs are now 40 px min (+4 px padding = 44 px target). |
| G-07 | Re-checked | v2 palette contrast (computed): white on blue 5.2 · muted text 6.2 on white / 5.7 on page · blue tint 6.5 · lime tint 6.6 · AI pink tint 5.4 · success 5.2 · warning 5.4 · error 4.7 · ink on lime 14.7 · dark muted 7.9 · dark tints 7.2–9.1. All text ≥ 4.5:1. |
| G-08 | **Closed** | Composer “Licensed source” state shows auto-added attribution (“via @chefkemi”). |
| G-09 | **Closed** | Onboarding automation step has a Free-plan locked state. |
| G-12 | New, Medium | Canvas motion is CSS that mirrors GSAP; real GSAP timing must be checked in the build against MOTION.md. |
| G-13 | New, Low | People are illustrations, not photos. Fine for the product; marketing may want real creator photography (with consent) later. |
| G-14 | New, Low | Dark parity is drawn for 16 key boards; the rest rely on tokens. Build must use tokens only. |

**Checks run:** coverage (94/94 original screen IDs present + 7 new overlay/system IDs); every internal board link resolves; no AI/media vendor names on any board; “gradient” appears only in the Foundations rule text.

### v2.1 addendum
- G-03 (mobile heights): open → **addressed**. Every screen has a mobile board; modals become bottom sheets on mobile.
- G-15 (new, open): the landing page and auth right-hand panels still use illustrations, not real photos. Stock-image hosts are blocked from the build workspace. Fix by allowing `images.unsplash.com` or uploading photos.
