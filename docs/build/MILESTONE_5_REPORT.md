# Milestone 5 report: licensing checks and the Creator Portal

Branch `feat/milestone-5-licensing` (built on `feat/milestone-4-media`, PR #4) · 20 Nov 2026

## 1. What was built

| Area | Screens / parts | State |
|---|---|---|
| Database | Creator channels, licensing terms, creator videos, licence agreements; posts gain "on hold" and a rights flag; licensed media records its licence | 3 migrations applied to `nelio-dev`, row-level security on every new table. One open licence per creator and workspace; paid licences can't be stored; a licensed video must say so |
| Licence rules (domain) | Terms validation, expiry dates, effective status (ends in N days, expired, suspended), one `checkUse` gate, revocation impact, attribution, channel-link parsing | Unit-tested |
| LI-05 Creator portal overview | Filled, Empty, Loading, Unverified; approve / decline requests (dialog / bottom sheet) | Built |
| LI-06 Verification | Filled, Pending, Failed, Empty, Loading; Verify a channel dialog | Built. YouTube sign-in works once the Google client is set (§4); Instagram by a check by hand |
| LI-07 Licensing terms | Filled, Unverified, Saved, Loading; the creator's video uploads (D-M5-1) | Built |
| LI-08 Usage audit | Filled, Empty, Loading; status tabs; CSV export | Built |
| LI-09 Revoke a license | Filled (dialog), Done, Empty, Loading | Built |
| LI-10 Payouts | Gated "coming later", Notify me | Built (gated by design, B-08) |
| LI-01 Marketplace | Filled, Empty, No matches, Loading; filters in the address | Built |
| LI-02 Source detail | Filled, Private, Suspended, Licensed (pick a video to clip), Requested, Revoked, Loading | Built (Paid can't occur, B-08) |
| LI-03 Request / accept | Accept free, Request private, Sent, Approved, Declined | Built |
| LI-04 My licenses | Filled (revocation banner, affected posts with Remove from schedule and the takedown checklist), Empty, Expired, Loading | Built |
| Licensed clipping | "Clip this" copies the creator's video into the workspace under the licence and starts processing; CL-01 Licensed filter; CS-02 Licensed state with automatic attribution | Built |
| Rights recheck | Revoke and expiry hold scheduled posts, flag published ones, cancel queued renders (nothing charged), notify the workspace; worker sweep every minute with a two-week warning | Built and verified (§3) |
| Worker | Creator videos: length and poster frame; licence gate before processing and each render; licence sweep | Built |

## 2. Design refresh from the live canvas (end-of-milestone check)

The live canvas (version 1795153016) had changed on 418 boards since the offline copy, plus two new boards: **Cards** ("Eight cards, one family") and **StudioIndex** (a linked Nelio Studio canvas). Built across every screen from Milestones 0 to 5:

| Change | Where |
|---|---|
| Active navigation item is solid blue with white text (no side bar) | Operator sidebar, Creator Portal, account menu |
| Row cards share one grid: fields line up in columns across rows; bolder values; 64 px rows; the status chip sits beside the title on phones | Usage, My licenses, Revocations, agent runs, Creator overview |
| Loading states draw the real page with text-shaped grey blocks (no coloured panels, no shadows); still under reduced motion | All 19 loading states |
| Agent card: picture header with the mode, corner menu (open, pause / resume), run status, drafts this week, budget, team | Agents (the "All agents" list is gone, as on the board), Command Center |
| Tool tiles and draft cards | Content Studio |
| Clip cards (dark body by state, length, source, credits, one action) | Exports |
| Source cards (picture, blurred panel, price, videos and licensees) | Marketplace |
| Toasts show "just now" | Every toast |
| Copy: command palette action descriptions, pause dialog line, workspace switcher subtitle, revoke dialog wording | As drawn |

Kept different on purpose (recorded as D-M5-6): "Create an image" and "Templates" stay "Coming later"; CS-03 keeps its "Notify me" gate rather than "now lives in Generate" (Generate isn't built); agent cards show no platforms until agents have destinations (Milestone 6); the agent card picture is the poster of the agent's last video, or its colour. The campaign, client and post-ticket cards arrive with their screens (Milestones 6–7). The offline canvas copy is synced (475 boards).

**Nelio Studio** (Editor, Translate, Voice Lab with voice consent, Generate, Transform; about 109 boards on a linked canvas) is new scope. As agreed, it is on the roadmap after the current milestones; its navigation entries are registered and stay hidden until built.

## 3. Verified (20 Nov 2026)

| Check | Result |
|---|---|
| Type check, lint | Pass |
| Unit tests | 81 pass across 8 files |
| Licensing check (`pnpm --filter @nelio/worker-node check:licensing`, real database and storage) | 26 / 26 pass: poster and length from the worker; licence dates; one open licence per pair; paid refused; server-side copy into the workspace; licensed media must be marked; gate allows, reports attribution, refuses other platforms; revocation holds the scheduled post, flags the published one, leaves drafts, cancels the queued render with 0 credits, notifies the owner with the reason, writes the audit; gate and worker block later renders; expiry refused before the sweep, sweep expires and notifies; two-week warning sent once; excluded video and suspended listing refused |
| Pipeline check (Milestone 4) | Not rerun this milestone (it spends Nelio AI and transcription credits); the licence gate returns early for own uploads |
| YouTube sign-in | Start, state check and callback rejection tested without a Google client; the sign-in itself needs the client (§4) |
| UI against the live canvas | 477 files pulled and diffed; refresh in §2 built; offline copy synced |
| Responsive | See §3.1 |

### 3.1 Responsive check (every screen and state, Milestones 0–5)

133 screen-and-state pages (85 from Milestones 0–4, 48 from Milestone 5, including every loading state) were opened at each width and checked for horizontal page scroll, content wider than the viewport, clipped text, and touch targets under 44 px on phones.

| Width | Result |
|---|---|
| 375 (phone) | 133 / 133 pass |
| 768 (tablet) | 133 / 133 pass |
| 1024 (tablet / small laptop) | 133 / 133 pass |
| 1440 (desktop) | 133 / 133 pass |

Fixed during the check: the agent card name link and the tool-tile and draft-card buttons now meet the 44 px touch target. Accepted as before: inline text links in the marketing footer and in the sign-up "Terms of Service" / "Privacy Policy" sentence are smaller than 44 px tall, which is normal for links inside running text.

### 3.2 Final check of Milestones 0–5 (20 Nov 2026, after Studio planning)

| Check | Result |
|---|---|
| Live canvases | Main (1795156541) and Studio (1795156632) unchanged since the sync. The third refresh (D-M5-7: shadcn form controls, sticky 69 px top bar and sidebars) is now built. |
| Type check, lint, unit tests | Pass; 81 tests in 8 files |
| Vendor names in user-facing source | None (235 files scanned) |
| Gradients | None in product code |
| Licensing check | 26 / 26 pass. The first run failed once reading a stored video while the type check was loading the machine; the rerun passed. The database driver logs a deprecation warning about overlapping queries on one connection, which comes from inside the driver, not from Nelio code. |
| Job framework check (Milestone 3) | Not run: the hosted dev Redis only accepts one allow-listed address, and this machine's public address has changed. The Redis instance itself is up. |
| Pipeline check (Milestone 4) | Not run (spends Nelio AI and transcription credits) |
| Signed-out access | Every workspace, creator, account, org, admin and onboarding page redirects to log in; the workspaces API answers 401; the YouTube sign-in start and callback refuse without a session; design previews are disabled in production builds |
| Responsive (133 pages, every state) | 133 / 133 at 375, 768, 1024 and 1440, including a new check that the sticky header stays 69 px. Same accepted exceptions as §3.1 (inline links in running text). |
| Form behaviour | Sign-up submitted empty shows the drawn error state (red border and ring, messages under each field); nothing is sent |

## 4. Real vs not yet connected

| Integration | Status |
|---|---|
| Object storage | Real: creator uploads, server-side copies for licensed clips, posters |
| YouTube sign-in for channel ownership | Built for a Google Cloud OAuth client in Testing mode. Needs `NELIO_GOOGLE_CLIENT_ID` and `NELIO_GOOGLE_CLIENT_SECRET` through env setup; until then it shows "in development" and offers the check by hand |
| Instagram ownership | Check by hand (code in bio, confirmed by a platform admin with `admin:channel`) until Meta approval (B-01) |
| Paid licensing and payouts | Gated, Notify me (B-08) |
| Takedowns on platforms | Checklist and confirmation; Nelio can't remove posts until publishing exists (Milestone 6) |
| Admin licence review (AD-04) | Milestone 9; channel checks use the admin script meanwhile |

## 5. Decisions and differences from the boards

- D-M5-1: creators upload the videos they license (YouTube import waits for B-01); a "Your videos" card on LI-07.
- D-M5-2: verification by YouTube sign-in or a check by hand; pending rows say what to do instead of "usually minutes".
- D-M5-3: marketplace pictures are posters from creator videos; "Popular with licensees" counts clips only; no board lets creators set a niche or description yet.
- D-M5-4: "Clip this" on LI-02 in the Licensed state is how a licensee picks a video (no board draws it).
- D-M5-5: "Revoke a license" in the LI-09 header opens the board's dialog with a licence picker.
- D-M5-6: the second canvas refresh (§2).
- Editors can request private licences but only managers accept free ones; a revoked licence can't be re-accepted on free terms.

## 6. Risks and follow-ups

- Real pages were checked through design previews (`/dev/ui/...`); the test account sign-in isn't available to the agent.
- No board for creator niche / description; marketplace niche filter only lists niches that exist.
- Nelio Studio scope needs planning (consent registry first).
- The worker must be restarted to pick up the creator-video and licence loops.

## 7. How to try it

1. `pnpm dev` and `pnpm worker:dev`.
2. Sign up as a content owner, verify a channel (YouTube sign-in once the Google client is set, or a check by hand confirmed with `pnpm --filter @nelio/worker-node admin:channel`), upload videos and publish terms in the Creator Portal.
3. In a workspace, open **Licensing**, accept or request a licence, then **Clip this** on the creator's page.
4. Revoke the licence from **Creator Portal → Revocations** and see **My licenses** hold and flag posts.
5. Design previews: `/dev/ui/creator`, `/verification`, `/creator-terms`, `/usage`, `/revocations`, `/payouts`, `/marketplace`, `/source`, `/my-licenses`.
