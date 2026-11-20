# Milestone 4 report: media pipeline, Clipping Studio, Content Studio

Branch `feat/milestone-4-media` · 19 Nov 2026

## 1. What was built

| Area | Screens / parts | State |
|---|---|---|
| Database | Media assets, transcripts, clip candidates, clip projects and versions, renders, brand kits, posts; runs gain kinds (agent, process, render); variants, render settings, caption size, post content, "Notify me" interest | Applied to `nelio-dev` (6 migrations), row-level security on every new table |
| Media pipeline (worker) | Check file, transcribe, detect scenes, rank moments (Nelio AI), build previews; final render with burned-in hook, captions and brand end card | Built and verified end to end (§3) |
| CL-01 Clipping Studio library | Filled, Empty, Loading, filters (Licensed shows its gated empty state) | Built from real data |
| CL-02 Upload | Filled, Uploading (direct multipart upload to storage), Wrong type, No rights; progress toast | Built |
| CL-03 Clipping Studio | Filled, Processing, Loading, Blocked, Unsaved, Estimate, Queued; transcript selection, timeline, versions, Edit with words | Built |
| CL-04 Batch variants | Filled, Generating, Blocked; Nelio AI writes a question hook and a number hook | Built |
| CL-05 Exports | Filled, Empty, Loading, Trial; progress, cancel (nothing charged), retry, signed download | Built |
| CS-01 Content Studio | Filled, Empty, Loading; recent drafts | Built |
| CS-02 Post composer | Filled, Invalid, No account connected, script mode; per-platform text and limits, Rewrite with Nelio AI | Built; publishing waits for Connections (§4) |
| CS-03 Original AI video | Gated, Notify me | Built (gated by design, B-09) |
| ST-06 Brand kits | Filled, Editing, Empty, Loading; palette, caption style, voice, default kit, live preview | Built |
| ST-07 AI & processing | Filled, View only, Loading | Built |

## 2. Design refresh from the live canvas (end-of-milestone check)

The live canvas (version 1795082671) had changed on almost every board since the offline copy. Two new boards, **Brand** and **Delight**, define a refresh that was built across every screen from Milestones 0 to 4:

| Change | Where |
|---|---|
| Mascot logo (cut-out face, eight curls, eyes that glance and blink, hair shake; still under reduced motion) and new app icons | Every logo, favicon, PWA icons |
| Arrow buttons: circle docked at the end, heights 40 / 48 / 58, contrasting circle fills | Every `arrow` button |
| Tables became row cards (labelled fields; two-up on phones) | Agents, agent runs, Exports, Content Studio drafts |
| Empty states use animated isometric stickers (still frame under reduced motion); agent empty states show three plush bots | All empty states that have a sticker |
| Agent avatars are plush bots (bot-avatars), one shape and colour per agent | Everywhere an agent appears |
| Short-video previews: picture fills the frame, glass chips, frosted bottom bar | Studio, Brand kits, Variants, Media library |
| Gooey toasts: top right on desktop, full width on phones, sounds | Upload progress, live notifications (e.g. "Clip rendered"), saves |
| Interface sounds (WebAudio, no files), with a Sound section in Appearance (this device only, 40 % default, off under Reduce motion and during video playback) | App-wide taps, toggles, toasts |
| Skeletons shaped like the row cards they become | Agents, Exports, Content Studio loading |
| Spacing: page padding 32 → 28 px, page gaps 24 → 20 px, card padding 20 → 18 px (16 → 14 on phones), empty-state radius 32 → 28 px | Everywhere |

Libraries, after a code review (no install scripts, no network calls except custom sound URLs we don't use): `goey-toast` 0.5.0 (pinned: 0.6.0 was 10 days old), `bot-avatars` 0.2.2, `framer-motion` 12. Skeletons are built in-house (the board's `skullet` is at 0.0.3). Stickers are the board's own exported images, not the external kit. The offline canvas copy is synced to the live version.

## 3. Verified (19 Nov 2026)

| Check | Result |
|---|---|
| Type check, lint | Pass |
| Unit tests | 59 pass across 7 files (clips, variants, posts, plans, media rules) |
| Pipeline check (`pnpm --filter @nelio/worker-node check:pipeline`, real storage, transcription and Nelio AI) | All pass: upload, probe, poster, transcript, Nelio AI moments, previews (360×640), credits within estimate, notification; final render 1080×1920 with sound, correct length, hook burned in; square variant 1080×1080; queued variant cancels with 0 credits |
| Nelio AI interactive calls (one real call each) | Edit with words ("Cut the first pause and make captions bigger" → start moved past the pause, captions 120 %); variant hooks; Shorts title rewrite (104 → 84 characters) |
| Caption font | libass loads the bundled Plus Jakarta Sans ExtraBold (OFL); frames checked by eye |
| UI against the live canvas | 473 boards pulled and diffed; refresh in §2 built; offline copy synced |
| Responsive | See §3.1 |

### 3.1 Responsive check (every screen and state, Milestones 0–4)

85 pages (every app screen through its design preview in Filled, Empty, Loading and edge states, plus all public, auth and onboarding pages) were loaded at each width. On each page an automated check looked for horizontal page scroll, content wider than its container, clipped text, overlapping controls and tap targets under 24 px. Pages that rendered blank or threw were rerun.

| Width | Result |
|---|---|
| 375 (mobile) | 85 / 85 pass. Only flag: public footer links are under 24 px tall (accepted in Milestone 3, matches the board) |
| 768 (tablet) | 85 / 85 pass. Only flag: the inline "Terms of Service" and "Privacy Policy" links in the sign-up sentence (inline-text exception) |
| 1024 (tablet) | 85 / 85 pass, same single inline-link flag |
| 1440 (desktop) | 85 / 85 pass, same single inline-link flag |

Found and fixed during the check: the exports table widened the page on tablets (now row cards), and the browser security policy blocked video and image previews from storage (now allowed). Exports, Studio and Agents were also compared by eye with the live boards at 1440.

## 4. Real vs not yet connected

| Integration | Status |
|---|---|
| Object storage (Cloudflare R2) | Real: direct multipart uploads, signed reads and downloads. The browser security policy now allows the storage origin for images, video and uploads |
| Transcription | Real ("speech-a" adapter); Fast and Balanced/High quality |
| Nelio AI | Real for ranking, Edit with words, variant hooks and rewrites |
| FFmpeg | Bundled; previews and final renders verified |
| Social accounts | Milestone 6: the composer shows "Connect an account to schedule"; Submit for approval stays off |
| Approvals | Milestone 7 |
| Credit wallet | Milestone 8: estimates and actual costs are recorded; balance lines are hidden until the wallet exists |
| Licensing | Milestone 5: Licensed filter and "Import licensed" lead to the gated states |
| Image creation, templates, original AI video | Shown as "Coming later"; AI video has Notify me (B-09) |

## 5. Decisions and differences from the boards

- "Speaker kept in frame" is not shown: renders use a centre crop, so claiming reframing would be false.
- Render estimates round up (a 42 s clip is ≈19 credits; the board shows 18).
- Speakers are "S1, S2" (transcription gives numbers, not names).
- Trial plan allows two exports in total (product brief); other plans have no fixed export cap yet.
- Brand kits follow the "edit content" permission and AI defaults follow "set budget"; the permission matrix has no separate settings row.
- "Create an image" and "Templates" tiles say "Coming later" (no engine yet).
- Studio and Variants routes are keyed by the video (`/studio/[assetId]`, with `?project=`), not by project as the traceability table first said.

## 6. Risks and follow-ups

- Real app pages were checked through design previews (`/dev/ui/...`) that render the same components; signing in with the test account was not possible from the agent.
- Development allows same-origin framing so the audit can load every page; production still sends `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- Nelio AI web calls (Edit with words, rewrites, hooks) are not yet charged in credits.

## 7. How to try it

1. `pnpm dev` and `pnpm worker:dev`.
2. Upload a video in **Clipping Studio → Upload video**, say who owns it, and watch it process; open it in the Studio, pick a moment, render it, and download it from **Exports**.
3. Try **Variants**, **Content Studio → Posts & captions**, **Brand kits** and **AI & processing**.
4. Design previews of every state: `/dev/ui/media`, `/upload`, `/studio`, `/variants`, `/exports`, `/content`, `/composer`, `/ai-video`, `/brand-kits`, `/ai-settings`.
