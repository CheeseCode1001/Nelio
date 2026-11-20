# Nelio: Blockers and open items (Milestone 0)

Recorded 12 Nov 2026. Updated at the end of every milestone.

Milestone 1 can start. The Supabase dev project exists: `nelio-dev` (ref `dsngphhodavilphwwfzr`, region eu-west-1, free plan, created 12 Nov 2026 in the organization "Projects Org"). Staging and production projects are still to be created (B-03), as are the other services listed there. Keys go in `.env.local` and the hosts' secret stores, never in the repository.

**Status values:** `open` · `waiting on owner` · `waiting on third party` · `gated by design` · `closed`.

## 1. Blockers

| ID | Blocker | Owner | First needed | Status | What the product shows until it clears |
|---|---|---|---|---|---|
| B-01 | **Platform app approvals.** YouTube (Google OAuth verification and API audit), Instagram and Facebook (Meta app review and business verification), TikTok (content posting audit). Each needs a developer app, a privacy-policy URL, a demo of the working flow and review time that we don't control. | Engineering + product owner | MS 5 (LI-06 channel verification uses YouTube sign-in: built for a Google OAuth client in testing mode, which needs `NELIO_GOOGLE_CLIENT_ID` and `NELIO_GOOGLE_CLIENT_SECRET` through env setup; checks by hand cover Instagram), MS 6 (publishing), MS 7 (analytics) | waiting on third party (not yet submitted) | YouTube and Instagram: "In development". TikTok and Facebook: "Coming later". Publishing runs only against a labelled mock provider and is reported as mocked. |
| B-02 | **Payment provider eligibility.** Paystack first, Flutterwave as the alternative: merchant account, recurring billing, USD list price charged in NGN, webhook signing secret. | Product owner | MS 8 | waiting on owner | Billing screens are built and tested against the provider's test mode. No live charge until verified. |
| B-03 | **Credentials through secure environment setup.** Never in chat or the repository. Needed, in order: Supabase projects (dev, staging, production); Redis; Cloudflare R2 bucket and keys; Resend; Sentry; web-push VAPID keys (generated locally); production AI key, kept separate from developer credentials; transcription provider keys; Vercel and Railway (or Render) projects. | Product owner supplies, engineering wires | Supabase at MS 1; Redis and email at MS 3; R2, AI and transcription at MS 4; hosting at MS 9 | waiting on owner | Local development uses stand-ins where they exist (PostgreSQL, Redis, S3-compatible storage, a mail catcher). Anything running on a stand-in is listed as mocked in the milestone report. |
| B-04 | **Docker cannot run on the development machine.** Measured 12 Nov 2026: 3.9 GB memory (0.4 GB free), 2-core i5-4210U, 7 GB free disk, WSL not installed. Docker Desktop needs at least 4 GB memory and the local stack needs well over 7 GB of disk, so it was not installed. | Product owner (hardware) | MS 1 | closed by decision: hosted dev services | Not user-facing. Local development runs the web app on the host against a hosted Supabase dev project and hosted Redis. `infra/docker-compose.yml` is still written and is exercised in CI, where Docker is available, so the Master Prompt 2 requirement is met there. Revisit if the machine gets 8 GB or more of memory and 20 GB of free disk. |
| B-05 | **Photo rights and model releases** for the 10 creator photos in `docs/design/E_hifi/photos/`. Some show third-party brands. | Product owner | Before public launch (MS 10) | waiting on owner | Photos are used in development and private beta only. Tracked in the release checklist. |
| B-06 | **Legal review.** Terms, privacy, acceptable use, licensing policy and takedown copy; the license agreement text; how sub-processors are disclosed given that the product never names vendors (D-18). | Legal | Placeholder at MS 2; final before public launch | waiting on owner | M-07 shows clearly labelled placeholder copy. |
| B-07 | **Content the product owner must supply:** beta creator quotes (with consent), NGN price display, and final credit allowances after the cost benchmark. | Product owner; engineering runs the benchmark at MS 9 | MS 2 (placeholders), MS 8 (prices), MS 10 (final) | waiting on owner | Bracketed placeholders stay (`[Beta creator quote]`, `≈ ₦[AMOUNT]`). Credits are labelled provisional. No invented quotes, metrics or prices. |
| B-08 | **Paid licensing and payouts.** Needs legal, tax, identity checks, a payout provider and a dispute process. | Product owner + legal | After launch | gated by design | LI-10 and the paid option on LI-02, LI-07 and M-05 show "coming later". |
| B-09 | **Original AI video generation.** No specialist provider chosen (A Q-2). Superseded on 20 Nov 2026 by B-20: generation is now in scope as Studio Generate (MS 9). | Product owner | MS 9 | moved to B-20 | CS-03 shows the gated state with "Notify me" until Generate ships, then points to Generate as drawn. |
| B-10 | **Policy decisions not yet made:** media retention windows (A Q-3), backup recovery targets, target markets beyond Nigeria (A Q-5). | Product owner | Retention at MS 4; recovery targets and markets at MS 9 | waiting on owner | Retention is a workspace setting with a conservative default, to be confirmed. |
| B-11 | **GitHub CLI sign-in.** Signed in as the repository owner on 12 Nov 2026. Pushing has not been tried yet. | Product owner | First push | closed | Not user-facing. Work stays on local branches until this is done. |
| B-12 | **App database connection and auth redirect.** Configured on 12 Nov 2026. A user-level `DATABASE_URL` on the machine clashed with the project file, so the project now uses `NELIO_DATABASE_URL` and `NELIO_DIRECT_URL`. | Product owner | MS 1 | closed | — |
| B-13 | **Recovery codes for two-step verification.** Drawn on the AU-05 Setup board. The auth service has none, so they need our own storage and a server-side secret key. | Engineering | MS 9 (with ST-02 Security) | open | The recovery-codes card and the "Use a recovery code" link are left out. |
| B-14 | **Google sign-in.** Needs a Google OAuth client (ID and secret) added to the auth provider settings. | Product owner | Before private beta | waiting on owner | "Continue with Google" and the "or" divider are left out of AU-01 and AU-02. |
| B-15 | **Support email address** for "Contact support" on the error pages. | Product owner | Before private beta | waiting on owner | The button is hidden until `NEXT_PUBLIC_SUPPORT_EMAIL` is set. |
| B-16 | **Marketing copy the boards don't contain.** M-02 Product: five of the six tour tabs (Agents, Content Studio, Approvals, Licensing, Analytics). M-03 Use cases: Creators and Businesses. M-06 FAQ: questions for the Agencies and Privacy topics, and review of four drafted answers (credits, revocation, guarantees, naira). M-03 "Book a demo" and M-04 "Talk to us" need a contact or booking link. | Product owner | Before private beta | waiting on owner | Only drawn content is shown: the extra tabs, segments, topics and buttons are left out. The four FAQ answers are drafted from recorded decisions only. |

### 1.1 Nelio Studio provider decisions (added 20 Nov 2026)

Studio (Master Prompt 2, Required module 12) needs outside processing that Nelio doesn't run today. None is chosen yet. Every choice needs the owner's approval and the same evidence:
- **Cost:** a per-unit price measured on our fixtures; this feeds the credit units.
- **Data terms:** no training on customer media, deletion on request, retention, processing region, and a sub-processor listing that can be disclosed without naming the vendor in the product (D-18, B-06).
- **Consent terms:** where likeness or voice is involved, the provider must allow consent-gated use and support deletion of a voice or face model.

Keys come only through secure environment setup (B-03), never in chat, code or commits. The product names none of them: the AI is "Nelio AI". Until a provider is chosen and its pipeline verified end to end, the screens it powers show their honest gated state.

| ID | Decision needed | What to check | First needed | Status | Gated until it clears |
|---|---|---|---|---|---|
| B-17 | **Transcription and translation.** Transcription reuses the Milestone 4 provider (B-03). Translation of subtitle text: Nelio AI (the existing reasoning model, no new vendor) or a specialist translation service. Languages to ship first are an open question (suggested: English, French, Spanish, Portuguese, Arabic, Nigerian Pidgin, Yoruba, Hausa, Igbo). | Quality on each first language, especially Pidgin, Yoruba, Hausa and Igbo; per-minute cost; speaker detection | MS 4S | waiting on owner | TR-01 to TR-04 show "Coming soon" for a language that isn't verified; Translate stays gated until at least one language pair passes. |
| B-18 | **Voice: clone, change and text to voice.** One provider or several. | Per-minute cost; model deletion on revoke; consent-gated cloning; no training on uploaded voices; the live-reading check (B-22) can run before cloning | MS 5S | open | Voice Lab (VL-01 to VL-04), "Use my voice", Translate dub levels: gated state. |
| B-19 | **Lip sync** for "Dub with lip sync". | Per-minute cost; quality on faces of every skin tone; needs the speaker's likeness consent | MS 5S | open | The lip-sync level on TR-02 shows its gated state; dubs fall back to audio only. |
| B-20 | **Video generation** (prompt plus references, characters, camera moves, upscale, extend). Replaces B-09. | Per-second cost per variation; reference-image and character consistency; built-in safety filters; output rights and indemnity; no real-person generation without consent | MS 9 | open | GE-01 to GE-05 gated; CS-03 keeps "Notify me". |
| B-21 | **Face and body tracking, real-time transform, prop and scene swap.** On an uploaded video first, then live. | GPU cost per minute; real-time latency on target devices (live may be desktop and installed app only, an open question); on-device or server processing; data retention of camera frames | MS 10 | open | TF-01 to TF-05 gated; TF-01 offers "record now, transform after" when the device is too slow. |
| B-22 | **Liveness and identity checks for consent.** A live selfie video check for likeness; a live-reading check (not a playback) and consent-line match for voice. | Anti-spoofing and replay resistance; biometric data handling; deletion; false-reject rate across skin tones and accents | MS 5S | open | ST-10 Likeness and voice can list and revoke but can't verify. Every likeness and voice feature stays gated (launch gate). |
| B-23 | **Content credentials and invisible watermarking** on every output that changes a face or voice or shows a generated person. | A content-credentials signing certificate and key held in the secret store; a watermark that survives platform re-encoding; a public verify and report link | MS 5S | open | AI-changed outputs can't be downloaded, exported or published until credentials and the watermark are applied (the AI-changed chip still shows). |
| B-24 | **Studio render and compute hosting.** Multi-track timeline renders, 4K export and AI edit operations beyond what the Node worker's FFmpeg covers; GPU workers for B-18 to B-21 if any run self-hosted. The development machine can't run them (B-04). | Hosting cost, queue isolation from the clipping pipeline, storage growth (projects list shows a storage quota) | MS 4S (Editor export), MS 9–10 (GPU) | open | Editor export is limited to what the current render queue supports (1080p); 4K shows its plan gate. |
| B-25 | **Legal review of likeness and voice consent.** Consent wording, the spoken consent line, biometric data under Nigeria's data protection law and any other launch market (B-10), paid likeness licensing (open question), minors. Extends B-06. | Legal sign-off on ST-10, VL-02, VL-05 copy and the consent record | MS 5S (draft), before private beta (final) | waiting on owner | Consent screens use clearly labelled placeholder legal copy; nothing ships publicly before it's final. |
| B-26 | **Real-person, public-figure and minor detection** and the prompt safety check (sexual, violent or deceptive content, impersonation). | Detection accuracy and bias; whether public-figure matching is allowed in each market; an appeal route; the Admin abuse queue (AD-06) | MS 9 (Generate), MS 10 (Transform); the prompt check at MS 9 | open | GE-02 and TF-02 blocked states are built, but generation and transform stay gated until detection is verified. |

**Milestone numbering:** the old hardening milestone (9) is now 11, and the old release milestone (10) is now 12. Entries above that say "MS 9" or "MS 10" for hardening or release mean 11 and 12.

## 2. Closed or accepted

| Item | Outcome |
|---|---|
| PRD sections 17–20 are missing | Closed by the product owner (A Q-1). Not reconstructed. |
| Native mobile app (MB-01 to MB-13) | Out of scope for launch. Boards kept as reference for the later Expo app. |
| Design approval | Approved by the product owner on 12 Nov 2026 (handoff header, README). |

## 3. Decisions made on 12 Nov 2026

The product owner asked for the best option on each open question. These are now fixed:

| Question | Decision |
|---|---|
| Repository layout (T-2) | The layout in `DESIGN_TRACEABILITY.md` §1. |
| Largest type size (T-3) | `tokens.json` is the scale (hero 76, display 56). Each screen uses the size in its own board file. |
| Routes missing from B §5 (T-1) | The routes marked ⚠ in `DESIGN_TRACEABILITY.md` §2. |
| Local development (B-04) | Hosted dev services, because the machine cannot run Docker. Compose file kept for CI. |
| Media pipeline stack (19 Nov 2026, product owner) | **Approved change to Master Prompt 2's stack:** video work runs in the existing Node worker with a bundled FFmpeg (probe, audio extraction, scene detection, 9:16 rendering with brand captions); transcription and Nelio AI are called over their APIs. Replaces the Python FastAPI + PySceneDetect service and Remotion rendering for now, because the development machine (3.9 GB memory, no Docker) cannot run them. A Python service can be added later for a step that needs it. |

## 4. Risks carried into the build

| Risk | Mitigation |
|---|---|
| Platform reviews can take weeks and can be refused. | Start the YouTube and Instagram applications during MS 1–2, not at MS 6. Each needs a hosted privacy policy and a working demo, so M-07 and a staging site come early. |
| A vendor name leaks into user-facing text (D-18). | CI check from MS 1 over UI strings, email templates, notification copy and error messages. AI-generated text is filtered on the server before it is stored or shown. |
| Design drift across 102 screens, each with several states. | Visual snapshots against the offline boards at 1440 and 390 px from MS 2; a story or seed for every state (D-22). |
| The development machine has 3.9 GB of memory and 7 GB of free disk. | Short fixture videos; media and render tests run in CI and on the worker host, not locally. Dependency installs are kept lean (one pnpm store, no local container images). Free disk space is the first thing to fix. |
| Credits are provisional, so plan limits may be wrong. | All entitlements live in one catalogue (`packages/config`); cost per job is recorded from MS 4 to feed the MS 9 benchmark. |
