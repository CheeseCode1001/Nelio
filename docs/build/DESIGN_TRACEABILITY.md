# Nelio: Design traceability (Milestone 0)

Maps every screen ID in `docs/design/H_handoff/SCREEN_INVENTORY.md` to its route, files, API and jobs, milestone and status.
Generated 12 Nov 2026 from the inventory (v2.3) and checked against the 471 board files in `docs/design/E_hifi/canvas/`: every inventory board exists on disk and every board on disk is in the inventory.

**Status values:** `not started` · `in progress` · `done` · `gated` · `blocked`. Milestone 1 screens and the Milestone 2 screens built so far are `in progress`: built and type-checked, not yet walked end to end (see `MILESTONE_1_REPORT.md` §4). Everything else is `not started`. The **Gate** column names the entry in `BLOCKERS.md` that will hold a screen in its honest gated state, or block it, when its milestone arrives.

Update this file at the end of every milestone.

**Two canvases, one design (from 20 Nov 2026).** The main canvas (`docs/design/E_hifi/canvas/`, 476 boards) and the Nelio Studio canvas (`docs/design/E_hifi/canvas-studio/`, 109 boards) are split only because a canvas holds at most 512 files. The end-of-milestone canvas diff and the UI and responsiveness check cover both.

## 1. Repository layout (approved 12 Nov 2026)

File paths below assume this layout. It follows the handoff §12 example and keeps the two shared packages from the architecture document §3.

```
apps/web            Next.js App Router: pages, route handlers, PWA
apps/api-media      FastAPI: AI and media services
workers/node        BullMQ consumers, scheduler, outbox dispatcher, publish, notify
workers/py          Python workers: transcribe, analyze, render orchestration
packages/ui         tokens, components, NavIcon, illustrations, motion helpers
packages/db         Prisma schema, migrations, seed (from sample-data.json)
packages/domain     types, Zod schemas, permission matrix (B §6), state machines, events
packages/integrations  adapters: social, payments, email, push, storage, AI, transcription
packages/config     eslint, tsconfig, tailwind preset, plan catalogue, feature flags
infra               docker-compose.yml, deployment
e2e                 Playwright: journeys J-01..J-15, visual snapshots, axe
```

"Web files" are relative to `apps/web/app/`. Components in backticks live in `packages/ui` or `apps/web/components`. API paths follow the architecture document §6; where it names only a family (`/api/agents/*`), the specific paths here are proposals that get fixed in `docs/API.md` during the owning milestone.

## 2. Screens


### 1 · Public site

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| M-01 | Home | `Home` · 1: Filled + `Home-Mobile` | / | (public)/page.tsx | none (static) | 2 | in progress | — |
| M-02 | Product | `Product` · 1: Filled + `Product-Mobile` | /product | (public)/product/page.tsx | none (static) | 2 | in progress | — |
| M-03 | Use cases | `UseCases` · 1: Filled + `UseCases-Mobile` | /use-cases/creators · /businesses · /agencies | (public)/use-cases/[segment]/page.tsx | none (static) | 2 | in progress | — |
| M-04 | Pricing | `Pricing` · 1: Filled + `Pricing-Mobile` | /pricing | (public)/pricing/page.tsx | plan catalogue from `packages/config/plans.ts` | 2 | in progress | B-07 |
| M-05 | Licensing & Creator Partners | `Licensing` · 1: Filled + `Licensing-Mobile` | /licensing | (public)/licensing/page.tsx | none (static) | 2 | in progress | B-08 |
| M-06 | FAQ | `FAQ` · 1: Filled + `FAQ-Mobile` | /faq | (public)/faq/page.tsx | none (static) | 2 | in progress | — |
| M-07 | Legal | `Legal` · 1: Filled + `Legal-Mobile` | /legal/[doc] | (public)/legal/[doc]/page.tsx | none (static placeholder copy) | 2 | in progress | B-06 |
| M-08 | Status | `Status` · 1: Filled + `Status-Mobile` | /status | (public)/status/page.tsx | `GET /api/status` (provider capability flags) | 2 static · 10 live | in progress | B-01 |

### 2 · Sign in & onboarding

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| AU-01 | Sign up | `SignUp` · 4: Filled, Error, Taken, Submitting + `SignUp-Mobile` | /signup | (auth)/signup/page.tsx | Supabase Auth sign-up · records created on first signed-in request by `bootstrapUser` (User, Organization, Workspace, membership) | 1 | in progress | B-03 |
| AU-02 | Log in | `LogIn` · 3: Filled, Error, Locked + `LogIn-Mobile` | /login | (auth)/login/page.tsx | Supabase Auth sign-in · lockout via rate limit | 1 | in progress | B-03 |
| AU-03 | Verify email | `VerifyEmail` · 3: Filled, Resent, Expired + `VerifyEmail-Mobile` | /verify-email | (auth)/verify-email/page.tsx | Supabase Auth verify / resend · email job (`notify`) | 1 | in progress | B-03 |
| AU-04 | Reset password | `ResetPassword` · 4: Filled, Sent, Newpass, Expired + `ResetPassword-Mobile` | /reset-password | (auth)/reset-password/page.tsx | Supabase Auth recovery | 1 | in progress | B-03 |
| AU-05 | Two-step verification | `MFA` · 3: Filled, Setup, Wrong + `MFA-Mobile` | /mfa | (auth)/mfa/page.tsx | Supabase Auth MFA (TOTP) enroll / challenge | 1 | in progress | B-03 |
| AU-06 | Accept invitation | `AcceptInvite` · 4: Filled, Expired, Accepted, Mismatch + `AcceptInvite-Mobile` | /invite/[token] | (auth)/invite/[token]/page.tsx | `POST /api/workspaces/invitations` · server actions on `/invite/[token]` | 1 | in progress | — |
| AU-07 | Join as content owner | `ContentOwnerJoin` · 1: Filled + `ContentOwnerJoin-Mobile` | /creators/join | (auth)/creators/join/page.tsx | Supabase Auth sign-up · `POST /api/creator/profile` | 1 | in progress | — |
| ON-01 | Account type | `OnbAccountType` · 2: Filled, Selected + `OnbAccountType-Mobile` | /onboarding/account-type | onboarding/account-type/page.tsx | `PATCH /api/onboarding` | 2 | in progress | — |
| ON-02 | Goals & niche | `OnbGoals` · 1: Filled + `OnbGoals-Mobile` | /onboarding/goals | onboarding/goals/page.tsx | `PATCH /api/onboarding` | 2 | in progress | — |
| ON-03 | Connect accounts | `OnbConnect` · 3: Filled, Connected, Limit + `OnbConnect-Mobile` | /onboarding/connect | onboarding/connect/page.tsx | `GET /api/social-connections` (capability states only until M6) | 2 | in progress | B-01 |
| ON-04 | Automation mode | `OnbAutomation` · 3: Filled, Autonomous, Free + `OnbAutomation-Mobile` | /onboarding/automation | onboarding/automation/page.tsx | `PATCH /api/onboarding` · plan entitlement check | 2 | in progress | — |
| ON-05 | All set | `OnbDone` · 1: Filled + `OnbDone-Mobile` | /onboarding/done ⚠ proposed (not in B §5) + checklist widget on `/w/[ws]/home` | onboarding/done/page.tsx · `SetupChecklist` | `GET /api/workspaces/[ws]/checklist` | 2 | in progress | — |
| ON-FLOW | Onboarding (interactive) | `Onboarding` · 1: Filled + `Onboarding-Mobile` | /onboarding (welcome) ⚠ proposed, then the four `/onboarding/*` steps | onboarding/layout.tsx | as ON-01–ON-04 | 2 | in progress | — |

### 3 · Command Center & AI

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| APP-01 | Command Center | `CommandCenter` · 6: Filled, Empty, Loading, Paused, Trial, Pastdue + `CommandCenter-Mobile` | /w/[ws]/home | w/[ws]/home/page.tsx | `GET /api/workspaces/[ws]/summary` · realtime workspace feed (live data arrives with M3–M8) | 2 | in progress | — |
| APP-02 | AI Strategist | `Strategist` · 5: Filled, Empty, Thinking, Error, History + `Strategist-Mobile` | /w/[ws]/strategist | w/[ws]/strategist/page.tsx | `/api/strategies/*` (chat, proposals, activation) · AI service · `research` queue | 3 | gated: needs Nelio AI | B-03 |
| APP-03 | AI Activity Center | `Activity` · 6: Filled, Empty, Loading, Reconnecting, Synced, Filtered + `Activity-Mobile` | /w/[ws]/activity · /activity/[runId] | w/[ws]/activity/page.tsx · activity/[runId]/page.tsx | `GET /api/agents/runs` · `GET /api/activity/events` (replay) · Supabase Realtime · outbox dispatcher | 3 | built | — |
| APP-04 | Agents | `Agents` · 4: Filled, Empty, Loading, Limit + `Agents-Mobile` | /w/[ws]/agents | w/[ws]/agents/page.tsx | `GET /api/agents` | 3 | built | — |
| APP-05 | Agent detail | `AgentDetail` · 7: Filled, Budget, Destinations, Runs, Loading, Reauth, Stopped + `AgentDetail-Mobile` | /w/[ws]/agents/[id] (tabs) | w/[ws]/agents/[id]/page.tsx | `/api/agents/[id]` + `/policy` `/budget` `/destinations` `/runs` `/pause` `/resume` `/authorize` | 3 | built | — |
| APP-06 | Create agent | `CreateAgent` · 7: CreateAgent-Goal, CreateAgent-Sources, CreateAgent-Destinations, CreateAgent-Budget, CreateAgent, CreateAgent-Authorize, CreateAgent-Limit + `CreateAgent-Goal-Mobile` | /w/[ws]/agents/new | w/[ws]/agents/new/page.tsx | `POST /api/agents` · `POST /api/agents/[id]/authorize` (D-05) | 3 | built | — |
| APP-07 | Workspace switcher | `WorkspaceSwitcher` · 2: Filled, Search + `WorkspaceSwitcher-Mobile` | overlay in top bar (no route) | `WorkspaceSwitcher` in shell | `GET /api/workspaces` (memberships only) | 1 | in progress | — |
| NT-01 | Notifications | `Notifications` · 5: Filled, Empty, Loading, Panel, Push + `Notifications-Mobile` | /w/[ws]/notifications + top-bar panel | w/[ws]/notifications/page.tsx · `NotificationsPanel` | `/api/notifications/*` · `/api/notifications/push-subscriptions` · `notify` queue (in-app, email, web push) | 3 | built | B-03 |

### 4 · Clipping & Content

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| CL-01 | Media library | `MediaLibrary` · 4: Filled, Empty, Loading, Storage + `MediaLibrary-Mobile` | /w/[ws]/media | w/[ws]/media/page.tsx | `GET /api/media` · storage usage | 4 | built | — |
| CL-02 | Upload | `Upload` · 5: Filled, Uploading, Wrongtype, Norights, Lowcredits + `Upload-Mobile` | /w/[ws]/media/upload | w/[ws]/media/upload/page.tsx | `POST /api/media/uploads` (signed multipart) · `POST /api/media/[id]/complete` · `POST /api/billing/estimates` · jobs: probe, `transcribe`, `analyze` | 4 | built | B-03 |
| CL-03 | Clipping Studio | `ClippingStudio` · 7: Filled, Processing, Loading, Blocked, Unsaved, Estimate, Queued + `ClippingStudio-Mobile` | /w/[ws]/studio/[assetId] (?project=) | w/[ws]/studio/[assetId]/page.tsx | `/api/projects/[id]` + `/candidates` `/revisions` `/preview` `/render` · `analyze`, `render` queues | 4 | built | B-03 |
| CL-04 | Batch variants | `Variants` · 3: Filled, Generating, Lowcredits + `Variants-Mobile` | /w/[ws]/studio/[assetId]/variants (?project=) | w/[ws]/studio/[assetId]/variants/page.tsx | `POST /api/projects/[id]/variants` · `render` queue | 4 | built | — |
| CL-05 | Exports | `Exports` · 4: Filled, Empty, Loading, Trial + `Exports-Mobile` | /w/[ws]/exports | w/[ws]/exports/page.tsx | `GET /api/exports` · signed download URL · trial export cap | 4 | built | — |
| CS-01 | Content Studio | `ContentStudio` · 3: Filled, Empty, Loading + `ContentStudio-Mobile` | /w/[ws]/content | w/[ws]/content/page.tsx | `GET /api/posts?state=draft` · templates | 4 | built | — |
| CS-02 | Post composer | `Composer` · 4: Filled, Invalid, Nodest, Licensed + `Composer-Mobile` | /w/[ws]/content/compose · /compose/[draftId] | w/[ws]/content/compose/[[...draftId]]/page.tsx | `/api/posts` · `/api/posts/[id]/destinations` · per-platform validation | 4 | built | — |
| CS-03 | Original AI video | `AIVideo` · 1: Filled + `AIVideo-Mobile` | /w/[ws]/content/video-generation | w/[ws]/content/video-generation/page.tsx | none: gated screen · `POST /api/interest` (Notify me) | 4 | built | B-09 |

### 5 · Calendar, approvals & publishing

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| PB-01 | Content calendar | `Calendar` · 5: Filled, Empty, Loading, Month, Drag + `Calendar-Mobile` | /w/[ws]/calendar | w/[ws]/calendar/page.tsx | `GET /api/posts?from&to` · `PATCH /api/posts/[id]/schedule` | 6 | not started | — |
| PB-02 | Drafts | `Drafts` · 3: Filled, Empty, Loading + `Drafts-Mobile` | /w/[ws]/drafts | w/[ws]/drafts/page.tsx | `GET /api/posts?state=draft` | 6 | not started | — |
| PB-03 | Post detail | `PostDetail` · 7: Filled, Loading, Published, Failed, Uploading, Held, Expired + `PostDetail-Mobile` | /w/[ws]/posts/[id] | w/[ws]/posts/[id]/page.tsx | `/api/posts/[id]` + `/attempts` `/retry` `/reconcile` · `publish` queue · reconciliation job | 6 | not started | B-01 |
| PB-04 | Approvals | `Approvals` · 4: Filled, Empty, Loading, Internal + `Approvals-Mobile` | /w/[ws]/approvals | w/[ws]/approvals/page.tsx | `GET /api/approvals` | 7 | not started | — |
| PB-05 | Approval detail | `ApprovalDetail` · 4: Filled, Loading, Allapproved, Invalidated + `ApprovalDetail-Mobile` | /w/[ws]/approvals/[id] | w/[ws]/approvals/[id]/page.tsx | `/api/approvals/[id]` + `/decisions` (per destination) `/comments` · invalidation rule AS-B1 | 7 | not started | — |

### 6 · Analytics

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| AN-01 | Analytics overview | `Analytics` · 4: Filled, Empty, Loading, Delayed + `Analytics-Mobile` | /w/[ws]/analytics | w/[ws]/analytics/page.tsx | `GET /api/analytics/overview` · `analytics` queue (ingestion) | 7 | not started | B-01 |
| AN-02 | Content performance | `ContentPerformance` · 3: Filled, Empty, Loading + `ContentPerformance-Mobile` | /w/[ws]/analytics/content | w/[ws]/analytics/content/page.tsx | `GET /api/analytics/content` | 7 | not started | B-01 |
| AN-03 | Agent performance | `AgentPerformance` · 3: Filled, Empty, Loading + `AgentPerformance-Mobile` | /w/[ws]/analytics/agents | w/[ws]/analytics/agents/page.tsx | `GET /api/analytics/agents` | 7 | not started | — |
| AN-04 | Campaigns & experiments | `Campaigns` · 3: Filled, Empty, Loading + `Campaigns-Mobile` | /w/[ws]/analytics/campaigns | w/[ws]/analytics/campaigns/page.tsx | `/api/analytics/campaigns` · experiments | 7 | not started | B-01 |

### 7 · Licensing

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| LI-01 | Marketplace | `Marketplace` · 3: Filled, Empty, Loading + `Marketplace-Mobile` | /w/[ws]/licensing | w/[ws]/licensing/page.tsx | `GET /api/licensing/sources` | 5 | built | D-M5-3 |
| LI-02 | Source detail & terms | `SourceDetail` · 6: Filled, Loading, Private, Paid, Suspended, Licensed + `SourceDetail-Mobile` | /w/[ws]/licensing/sources/[id] | w/[ws]/licensing/sources/[id]/page.tsx | `GET /api/licensing/sources/[id]` | 5 | built | D-M5-3 |
| LI-03 | Request / accept license | `RequestLicense` · 5: Filled, Private, Sent, Approved, Declined + `RequestLicense-Mobile` | /w/[ws]/licensing/sources/[id]/request | w/[ws]/licensing/sources/[id]/request/page.tsx | `POST /api/licensing/agreements` (accept / request) | 5 | built | — |
| LI-04 | My licenses | `MyLicenses` · 4: Filled, Empty, Loading, Expired + `MyLicenses-Mobile` | /w/[ws]/licensing/mine | w/[ws]/licensing/mine/page.tsx | `GET /api/licensing/agreements` · `rights-recheck` queue | 5 | built | — |

### 8 · Creator Portal

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| LI-05 | Creator portal overview | `CreatorOverview` · 4: Filled, Empty, Loading, Unverified + `CreatorOverview-Mobile` | /creator | creator/page.tsx | `GET /api/creator/overview` | 5 | built | — |
| LI-06 | Verification | `Verification` · 4: Filled, Pending, Failed, Empty + `Verification-Mobile` | /creator/verify | creator/verify/page.tsx | `/api/creator/channels` · ownership verification (channel OAuth) | 5 | built | B-01, D-M5-2 |
| LI-07 | Licensing terms | `LicenseTerms` · 3: Filled, Unverified, Saved + `LicenseTerms-Mobile` | /creator/terms | creator/terms/page.tsx | `GET/PUT /api/creator/terms` | 5 | built | D-M5-1 |
| LI-08 | Usage audit | `Usage` · 3: Filled, Empty, Loading + `Usage-Mobile` | /creator/usage | creator/usage/page.tsx | `GET /api/creator/usage` | 5 | built | — |
| LI-09 | Revoke a license | `Revoke` · 3: Filled, Done, Empty + `Revoke-Mobile` | /creator/revocations | creator/revocations/page.tsx | `POST /api/creator/agreements/[id]/revoke` · `rights-recheck` queue (hold posts, flag published) | 5 | built | D-M5-5 |
| LI-10 | Payouts | `Payouts` · 1: Filled + `Payouts-Mobile` | /creator/payouts | creator/payouts/page.tsx | none: gated "coming later" | 5 | built | B-08 |

### 9 · Connections, agency & client portal

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| IN-01 | Connections | `Connections` · 4: Filled, Empty, Loading, Limit + `Connections-Mobile` | /w/[ws]/connections | w/[ws]/connections/page.tsx | `GET /api/social-connections` | 6 | not started | B-01 |
| IN-02 | Connection detail | `ConnectionDetail` · 3: Filled, Expiring, Disconnect + `ConnectionDetail-Mobile` | /w/[ws]/connections/[platform] | w/[ws]/connections/[platform]/page.tsx | `/api/social-connections/[platform]/start` `/callback` `/disconnect` · token refresh (`maintenance` queue) | 6 | not started | B-01 |
| AG-01 | Agency hub | `AgencyHub` · 4: Filled, Empty, Loading, Overlimit + `AgencyHub-Mobile` | /org/[org] | org/[org]/page.tsx | `GET /api/orgs/[org]/overview` | 7 | not started | — |
| AG-02 | Client workspaces | `Clients` · 4: Filled, Empty, Create, Limit + `Clients-Mobile` | /org/[org]/clients · /clients/new | org/[org]/clients/page.tsx · clients/new/page.tsx | `GET/POST /api/workspaces` | 7 | not started | — |
| AG-03 | Client workspace settings | `ClientSettings` · 3: Filled, Saved, Policy + `ClientSettings-Mobile` | /org/[org]/clients/[ws] | org/[org]/clients/[ws]/page.tsx | `PATCH /api/workspaces/[ws]` (approval policy, accounts, brand kit) | 7 | not started | — |
| AG-04 | Team & invitations | `Team` · 4: Filled, Invite, Seats, Loading + `Team-Mobile` | /org/[org]/team | org/[org]/team/page.tsx | `/api/workspaces/invitations` · `/api/orgs/[org]/members` | 7 | not started | — |
| AG-05 | Roles & permissions | `Roles` · 1: Filled + `Roles-Mobile` | /org/[org]/roles | org/[org]/roles/page.tsx | permission matrix from `packages/domain/permissions.ts` (read-only) | 7 | not started | — |
| AG-06 | Audit log | `AuditLog` · 3: Filled, Empty, Loading + `AuditLog-Mobile` | /org/[org]/audit | org/[org]/audit/page.tsx | `GET /api/orgs/[org]/audit` | 7 | not started | — |
| CP-01 | Client portal home | `ClientPortal` · 5: Filled, Empty, Loading, Approved, Published + `ClientPortal-Mobile` | /portal/[ws] | portal/[ws]/page.tsx | `GET /api/approvals?assignee=me` | 7 | not started | — |
| CP-02 | Client approval detail | `ClientApproval` · 4: Filled, Decided, Newer, Loading + `ClientApproval-Mobile` | /portal/[ws]/approvals/[id] | portal/[ws]/approvals/[id]/page.tsx | `POST /api/approvals/[id]/decisions` (per destination) · newer-revision check | 7 | not started | — |

### 10 · Billing & credits

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| BI-01 | Plan & usage | `Billing` · 3: Filled, Loading, Free + `Billing-Mobile` | /org/[org]/billing | org/[org]/billing/page.tsx | `GET /api/billing/summary` | 8 | not started | — |
| BI-02 | Plans & checkout | `Plans` · 5: Filled, Checkout, Processing, Success, Declined + `Plans-Mobile` | /org/[org]/plans | org/[org]/plans/page.tsx | `POST /api/billing/checkout` · `POST /api/billing/webhooks/[provider]` (signature + replay protection) | 8 | not started | B-02 |
| BI-03 | Credit ledger | `Ledger` · 2: Filled, Loading + `Ledger-Mobile` | /org/[org]/ledger | org/[org]/ledger/page.tsx | `GET /api/billing/ledger` (reserve / settle / refund) | 8 | not started | — |
| BI-04 | Top-ups | `TopUp` · 2: Filled, Locked + `TopUp-Mobile` | /org/[org]/top-up | org/[org]/top-up/page.tsx | `POST /api/billing/top-ups` | 8 | not started | B-02 |
| BI-05 | Spend limits | `SpendLimits` · 3: Filled, Reached, Request + `SpendLimits-Mobile` | /org/[org]/limits | org/[org]/limits/page.tsx | `GET/PUT /api/billing/limits` · `POST /api/billing/limit-requests` | 8 | not started | — |
| BI-06 | Invoices | `Invoices` · 3: Filled, Empty, Loading + `Invoices-Mobile` | /org/[org]/invoices | org/[org]/invoices/page.tsx | `GET /api/billing/invoices` | 8 | not started | B-02 |
| BI-07 | Payment failure | `PaymentFailed` · 3: Filled, Recovered, Downgraded + `PaymentFailed-Mobile` | state of `/org/[org]/billing` + banner on `/home` ⚠ boards are drawn as a page; B §5 lists a banner only | org/[org]/billing/page.tsx · `PaymentFailedBanner` | subscription state `past_due` → grace (7 d) → downgraded · renewal job (`maintenance`) | 8 | not started | B-02 |
| BI-08 | Trial status | `Trial` · 4: Filled, Limit, Ending, Ended + `Trial-Mobile` | state of `/org/[org]/billing` + banner on `/home` ⚠ as BI-07 | org/[org]/billing/page.tsx · `TrialBanner` | `GET /api/billing/trial` · trial caps enforced server-side | 8 | not started | — |

### 11 · Settings

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| ST-01 | Profile | `Profile` · 4: Filled, Saved, Emailchange, Loading + `Profile-Mobile` | /account/profile | account/profile/page.tsx | `GET/PATCH /api/account/profile` | 9 | not started | — |
| ST-02 | Security | `Security` · 3: Filled, Deleteblocked, Sessions + `Security-Mobile` | /account/security | account/security/page.tsx | Supabase Auth MFA + sessions · `DELETE /api/account` | 9 | not started | — |
| ST-03 | Appearance | `Appearance` · 2: Filled, Dark + `Appearance-Mobile` | /account/appearance | account/appearance/page.tsx | theme persisted (cookie + `PATCH /api/account/preferences`) | 2 | in progress | — |
| ST-04 | Notification preferences | `NotificationPrefs` · 3: Filled, Pushdenied, Unsupported + `NotificationPrefs-Mobile` | /account/notifications | account/notifications/page.tsx | `GET/PUT /api/notifications/preferences` · push subscription | 9 | not started | — |
| ST-05 | Workspace members | `Members` · 2: Filled, Empty + `Members-Mobile` | /w/[ws]/settings/members | w/[ws]/settings/members/page.tsx | `/api/workspaces/[ws]/members` | 7 | not started | — |
| ST-06 | Brand kits | `BrandKits` · 3: Filled, Empty, Editing + `BrandKits-Mobile` | /w/[ws]/settings/brand-kits | w/[ws]/settings/brand-kits/page.tsx | `/api/brand-kits` | 4 | built | — |
| ST-07 | AI & processing | `AISettings` · 1: Filled + `AISettings-Mobile` | /w/[ws]/settings/ai | w/[ws]/settings/ai/page.tsx | `PATCH /api/workspaces/[ws]/settings` (Fast / Balanced / High Quality) | 4 | built | — |
| ST-08 | Integration status | `IntegrationStatus` · 1: Filled + `IntegrationStatus-Mobile` | /w/[ws]/settings/integrations | w/[ws]/settings/integrations/page.tsx | `GET /api/status` | 6 | not started | B-01 |
| ST-09 | Privacy & data | `Privacy` · 3: Filled, Exportready, Deleting + `Privacy-Mobile` | /account/privacy | account/privacy/page.tsx | `POST /api/account/export` · `POST /api/account/delete` · `maintenance` queue | 9 | not started | B-10 |
| ST-10 | Workspace settings | `WorkspaceSettings` · 3: Filled, Paused, Resumed + `WorkspaceSettings-Mobile` | /w/[ws]/settings | w/[ws]/settings/page.tsx | `PATCH /api/workspaces/[ws]` · `/pause` `/resume` | 9 | not started | — |

### 12 · Platform admin

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| AD-01 | Ops overview | `AdminOps` · 4: Filled, Loading, Healthy, Paused + `AdminOps-Mobile` | /admin | admin/page.tsx | `GET /api/admin/ops` (queue health) | 9 | not started | — |
| AD-02 | Jobs & dead-letter | `AdminJobs` · 3: Filled, Empty, Loading + `AdminJobs-Mobile` | /admin/jobs | admin/jobs/page.tsx | `/api/admin/jobs` (dead-letter retry / discard) | 9 | not started | — |
| AD-03 | Audit search | `AdminAudit` · 2: Filled, Empty + `AdminAudit-Mobile` | /admin/audit | admin/audit/page.tsx | `GET /api/admin/audit` | 9 | not started | — |
| AD-04 | License review | `AdminLicenses` · 2: Filled, Empty + `AdminLicenses-Mobile` | /admin/licenses | admin/licenses/page.tsx | `/api/admin/licenses` | 9 | not started | — |
| AD-05 | Support access | `AdminSupport` · 3: Filled, Request, Active + `AdminSupport-Mobile` | /admin/support | admin/support/page.tsx | `/api/admin/support-sessions` (time-boxed, owner notified) | 9 | not started | — |
| AD-06 | Abuse & moderation | `AdminAbuse` · 2: Filled, Empty + `AdminAbuse-Mobile` | /admin/abuse | admin/abuse/page.tsx | `/api/admin/abuse-reports` | 9 | not started | — |
| AD-07 | Diagnostics | `AdminDiagnostics` · 1: Filled + `AdminDiagnostics-Mobile` | /admin/diagnostics | admin/diagnostics/page.tsx | `GET /api/admin/diagnostics` | 9 | not started | — |
| AD-08 | Feature flags | `AdminFlags` · 1: Filled + `AdminFlags-Mobile` | /admin/flags | admin/flags/page.tsx | `/api/admin/flags` | 9 | not started | — |
| AD-09 | Global pause confirm | `AdminPauseConfirm` · 1: Filled + `AdminPauseConfirm-Mobile` | overlay on `/admin` (no route) | `AdminPauseConfirm` dialog | `POST /api/admin/pause` · `/resume` (global kill switch) | 9 | not started | — |

### 13 · System & overlays

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| SY-01 | Install prompt (PWA) | `PWAInstall` · 3: Filled, Ios, Installed + `PWAInstall-Mobile` | component (no route) | `PwaInstallPrompt` · manifest.ts · service worker | none | 2 | in progress | — |
| SY-02 | Offline | `Offline` · 3: Filled, Reconnecting, Synced + `Offline-Mobile` | /offline | offline/page.tsx | service-worker fallback; nothing queued offline | 2 | in progress | — |
| SY-03 | Not found | `NotFound` · 1: Filled + `NotFound-Mobile` | not-found | not-found.tsx | none | 1 | in progress | — |
| SY-04 | Access denied | `Denied` · 1: Filled + `Denied-Mobile` | /denied | denied/page.tsx | none (never confirms the workspace exists) | 1 | in progress | — |
| SY-05 | Server error | `ServerError` · 1: Filled + `ServerError-Mobile` | error boundary | error.tsx · global-error.tsx | Sentry capture | 1 | in progress | — |
| SY-06 | Maintenance | `Maintenance` · 1: Filled + `Maintenance-Mobile` | /maintenance | maintenance/page.tsx | maintenance flag (edge config) | 9 | not started | — |
| SY-07 | Command palette | `CommandPalette` · 3: Filled, Results, Empty + `CommandPalette-Mobile` | overlay (Ctrl/⌘ K) | `CommandPalette` in shell | `GET /api/search` | 2 | in progress | — |
| SY-08 | Account menu | `AccountMenu` · 1: Filled + `AccountMenu-Mobile` | overlay in top bar | `AccountMenu` in shell | `GET /api/account/surfaces` | 1 | in progress | — |
| SY-09 | Pause all confirm | `PauseConfirm` · 2: Filled, Resume + `PauseConfirm-Mobile` | overlay from top bar | `PauseConfirm` dialog | `POST /api/workspaces/[ws]/pause` · `/resume` | 3 | built | — |

**102 screen IDs** mapped (public 8, auth and onboarding 13, product and system 81).

### 14 · Nelio Studio (Required module 12)

Boards live on the linked Studio canvas (https://claude.ai/artifact/SvKwDjia8PLUWyY7b16Stn, pages 4a–4e, 109 boards; offline copy `docs/design/E_hifi/canvas-studio/`). The main canvas indexes them on the `StudioIndex` board. Both canvases are one design. Spec, rules and credit units: the Studio feature plan (https://claude.ai/artifact/65M4cHQBPnNAhd3D8ZDC7Y).

Routes and APIs are proposals, fixed in `docs/API.md` during the owning milestone. Every Studio page sits behind a per-tool feature flag (`studio.editor`, `studio.translate`, `studio.voice`, `studio.consent`, `studio.generate`, `studio.transform`). A shell may land before its pipeline, but until the pipeline is verified end to end it shows the honest gated state (Milestone 2 report conventions), never a working-looking screen. Milestones 4S and 5S are defined in Master Prompt 2's implementation sequence.

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| ED-01 | Editor projects | `Editor` · 4: Filled, Empty, Loading, Storage + `Editor-Mobile` | /w/[ws]/editor | w/[ws]/editor/page.tsx | `GET /api/editor/projects` · storage usage | 4S | not started | — |
| ED-02 | Editor workspace | `Editor-Workspace` · 8: Filled, Loading, Empty (timeline), Captions, Ai (edit running), Preview (accept or undo), Unsaved, Offline + `Editor-Workspace-Mobile` | /w/[ws]/editor/[projectId] | w/[ws]/editor/[projectId]/page.tsx | `/api/editor/projects/[id]` (timeline model, versions) · `/ai-edits` (captions, silences, filler, reframe, enhance voice, beat sync, Ask Nelio AI) · `analyze` queue | 4S | not started | B-24 (heavy AI edits), B-17 |
| ED-03 | Export | `Editor-Export` · 4: Filled, Rendering, Done, Failed (refunded) + `Editor-Export-Mobile` | dialog in ED-02 (no route) | `EditorExportDialog` | `POST /api/editor/projects/[id]/export` → existing `render` queue · estimate, reservation, refund | 4S | not started | B-24 (4K) |
| ED-04 | Templates | `Editor-Templates` · 3: Filled, Loading, Applying + `Editor-Templates-Mobile` | /w/[ws]/editor/templates | w/[ws]/editor/templates/page.tsx | `GET /api/editor/templates` · apply to project | 4S | not started | — |
| TR-01 | Translate home | `Translate` · 3: Filled, Empty, Loading + `Translate-Mobile` | /w/[ws]/translate | w/[ws]/translate/page.tsx | `GET /api/translate/jobs` | 4S | not started | B-17 |
| TR-02 | New translation | `Translate-New` · 3: Filled, Noconsent (speaker without voice consent, falls back to a preset voice), Estimate + `Translate-New-Mobile` | /w/[ws]/translate/new | w/[ws]/translate/new/page.tsx | `POST /api/translate/jobs` (video, languages, level per language) · licence gate (`translation` use) · consent check | 4S subtitles · 5S dub levels | not started | B-17, B-18, B-19 |
| TR-03 | Script review | `Translate-Script` · 3: Filled, Editing (a line), Toolong (line too long for timing) + `Translate-Script-Mobile` | /w/[ws]/translate/[jobId]/script | w/[ws]/translate/[jobId]/script/page.tsx | `/api/translate/jobs/[id]/lines` · glossary | 4S | not started | B-17 |
| TR-04 | Language versions | `Translate-Versions` · 3: Filled, Rendering, Failed (one language, refunded) + `Translate-Versions-Mobile` | /w/[ws]/translate/[jobId] | w/[ws]/translate/[jobId]/page.tsx | `render` / `dub` queues · versions linked to the original post | 4S (subtitle versions) · 5S (dubs) · 6 (publish per platform and language) | not started | B-01, B-18, B-19 |
| VL-01 | Voice Lab | `VoiceLab` · 3: Filled, Empty (no clone yet), Loading + `VoiceLab-Mobile` | /w/[ws]/voice | w/[ws]/voice/page.tsx | `GET /api/voices` (my voice, presets, granted) | 5S | not started | B-18 |
| VL-02 | Clone my voice | `VoiceLab-Clone` · 6: Filled (reading the script), Mic (permission), Noisy, Noconsent (consent line missing), Processing, Ready + `VoiceLab-Clone-Mobile` | /w/[ws]/voice/clone | w/[ws]/voice/clone/page.tsx | `POST /api/consent/voice` (recording, consent line match, live-reading check) · `voice` queue | 5S | not started | B-18, B-22, B-25 |
| VL-03 | Change a voice | `VoiceLab-Change` · 3: Filled, Rendering, Done + `VoiceLab-Change-Mobile` | /w/[ws]/voice/change | w/[ws]/voice/change/page.tsx | `POST /api/voice/change` · estimate · `voice` queue | 5S | not started | B-18 |
| VL-04 | Text to voice | `VoiceLab-Tts` · 2: Filled, Generating (line-level retry) + `VoiceLab-Tts-Mobile` | /w/[ws]/voice/text | w/[ws]/voice/text/page.tsx | `POST /api/voice/tts` · `voice` queue | 5S | not started | B-18 |
| VL-05 | Request a voice | `VoiceLab-Request` · 3: Filled, Sent (invite sent), Declined + `VoiceLab-Request-Mobile` | /w/[ws]/voice/request | w/[ws]/voice/request/page.tsx | `POST /api/consent/requests` (invite, accept, decline, expire) · email | 5S | not started | — |
| ST-10 ⚠ | Likeness and voice (consent registry) | `Likeness` · 6: Filled, Empty, Loading, Verify (likeness), Revoke (access), Incoming (request) + `Likeness-Mobile` | /account/likeness | account/likeness/page.tsx | `/api/consent/likeness` (live selfie check) · `/api/consent/grants` (person or workspace, scope, expiry, revoke) · usage log in the audit trail · revoke holds scheduled posts | 5S | not started | B-22, B-25 |
| GE-01 | Generate | `Generate` · 3: Filled (presets, recent), Empty, Loading + `Generate-Mobile` | /w/[ws]/generate | w/[ws]/generate/page.tsx | `GET /api/generate/runs` · presets | 9 | not started | B-20 |
| GE-02 | Prompt composer | `Generate-Compose` · 3: Filled (with references), Estimate, Blocked (prompt) + `Generate-Compose-Mobile` | /w/[ws]/generate/new | w/[ws]/generate/new/page.tsx | `POST /api/generate/runs` · prompt safety check · consent check for characters | 9 | not started | B-20, B-26 |
| GE-03 | Results | `Generate-Results` · 3: Filled (variations), Generating, Failed (one, refunded) + `Generate-Results-Mobile` | /w/[ws]/generate/[runId] | w/[ws]/generate/[runId]/page.tsx | `generate` queue · extend, remix, upscale, send to Editor | 9 | not started | B-20, B-23 |
| GE-04 | Characters | `Generate-Characters` · 3: Filled, Empty, Create (a character) + `Generate-Characters-Mobile` | /w/[ws]/generate/characters | w/[ws]/generate/characters/page.tsx | `/api/generate/characters` (synthetic, or my verified likeness) | 9 | not started | B-20, B-22 |
| GE-05 | Storyboard | `Generate-Storyboard` · 2: Filled (shot list), Generating (all) + `Generate-Storyboard-Mobile` | /w/[ws]/generate/storyboards/[id] | w/[ws]/generate/storyboards/[id]/page.tsx | `/api/generate/storyboards` · assembled in the Editor | 9 | not started | B-20 |
| TF-01 | Transform camera | `Transform` · 7: Filled (live preview), Permission (camera), Denied, Nocam, Recording, Layer (sheet open), Slow (record now, transform after) + `Transform-Mobile` | /w/[ws]/transform | w/[ws]/transform/page.tsx | live preview session · `transform` queue for the full-quality render | 10 | not started | B-21, B-26 |
| TF-02 | Look picker | `Transform-Looks` · 3: Filled, Blocked (real person), Request (a likeness) + `Transform-Looks-Mobile` | sheet in TF-01 / TF-04 (no route) | `LookPicker` | `GET /api/looks` (library, my likeness, granted likenesses) · consent check | 10 | not started | B-21, B-22, B-26 |
| TF-03 | Prop and scene swap | `Transform-Props` · 3: Filled (tap to select), Generating (swapping), Swapped + `Transform-Props-Mobile` | panel in TF-01 / TF-04 (no route) | `PropSwapPanel` | `/api/transform/props` (select, prompt, swap, remove) | 10 | not started | B-21 |
| TF-04 | Transform a video | `Transform-Video` · 3: Filled, Estimate, Rendering + `Transform-Video-Mobile` | /w/[ws]/transform/video | w/[ws]/transform/video/page.tsx | `POST /api/transform/jobs` · `transform` queue | 10 | not started | B-21, B-23 |
| TF-05 | Result review | `Transform-Review` · 1: Filled (before/after, AI-changed label) + `Transform-Review-Mobile` | /w/[ws]/transform/[takeId] | w/[ws]/transform/[takeId]/page.tsx | send to Editor · publish (label, credentials, platform AI flag) | 10 | not started | B-23 |

**24 Studio screen IDs** mapped (Editor 4, Translate 4, Voice Lab 5, consent registry 1, Generate 5, Transform 5) across 109 boards. Running total: 126 screen IDs.

⚠ **ST-10 is used twice.** The main canvas and `packages/config/src/screens.ts` use ST-10 for Workspace settings (§11); the Studio canvas uses ST-10 for Likeness and voice. The code registers the Studio page as `LV-01` until the owner picks a new ID (proposed: ST-11).

Changes the Studio plan asks for on screens that already exist (built in the milestone named):

| Where | Change | MS |
|---|---|---|
| Sidebar | Create: Clipping Studio, Editor, Generate, Content Studio, Exports. New group Voice and video: Transform, Voice Lab, Translate. Account settings: Likeness and voice. Already registered and hidden; each entry appears when its flag turns on. | 4S, 5S, 9, 10 |
| CL-03, CS-01, CL-05 | "Open in Editor" on every clip, draft and export | 4S |
| PB-01 / CL-05 | "Translate" on every post and export; language variants in the composer | 4S (entry), 6 (composer) |
| CL-01 | Media Library tags each item with the tool that made it and an "AI-changed" chip | 5S |
| LI-07, LI-02, LI-03 | A "Translations" allowed use on licence terms (today only clips and compilations). No board draws it yet. | 5S |
| CS-02 | Locked AI-content toggle with a short reason; AI-changed chip in the post preview | 6 |
| APP-04 / approvals | Approval card marked "Uses a cloned voice" or "Uses a changed face" | 7 |
| AD-06 | Reports of a Nelio output used without consent, linked from the content credentials | 11 |
| CL-02, mobile home | "Record with Transform" entry point | 10 |
| CS-03 | The "Notify me" gate becomes "Original AI video now lives in Generate" (as drawn) | 9 |

## 3. Reference boards (no route of their own)

| Boards | Use in the build | MS |
|---|---|---|
| Foundations `Main`, `Illustrations` | Source for `packages/ui`. Reproduced at the dev-only routes `/dev/ui` and `/dev/ui/illustrations` (built in Milestone 2). | 2 |
| Motion `Motion` | `packages/ui/motion` implements the 14 patterns in `MOTION.md` with GSAP; all off under reduced motion. | 2 |
| MB-01 to MB-13 (26 boards) | Reference for the later Expo app. Not built now. The PWA uses the mobile board beside each desktop screen. | later |
| Dark (16 boards) | Dark-parity baselines for visual snapshots. All other screens get dark from tokens only. | 2, checked at 10 |

## 4. Journeys → end-to-end tests

Each flow board becomes one Playwright spec. A journey is first automated in the milestone that completes its last step, and all 15 are walked on staging at Milestone 10.

| Journey | Flow board | Spec | First automated at MS |
|---|---|---|---|
| J-01 Creator first run | `Flow-J-01` | `e2e/journeys/j-01.spec.ts` | 6 |
| J-02 Agency setup | `Flow-J-02` | `e2e/journeys/j-02.spec.ts` | 7 |
| J-03 Per-platform client approval | `Flow-J-03` | `e2e/journeys/j-03.spec.ts` | 7 |
| J-04 Autonomous run | `Flow-J-04` | `e2e/journeys/j-04.spec.ts` | 6 |
| J-05 License revocation | `Flow-J-05` | `e2e/journeys/j-05.spec.ts` | 6 |
| J-06 Content-owner onboarding | `Flow-J-06` | `e2e/journeys/j-06.spec.ts` | 5 |
| J-07 License acquisition | `Flow-J-07` | `e2e/journeys/j-07.spec.ts` | 5 |
| J-08 Spend limit hit | `Flow-J-08` | `e2e/journeys/j-08.spec.ts` | 8 |
| J-09 Trial | `Flow-J-09` | `e2e/journeys/j-09.spec.ts` | 8 |
| J-10 Publish confirmation | `Flow-J-10` | `e2e/journeys/j-10.spec.ts` | 6 |
| J-11 Connection lifecycle | `Flow-J-11` | `e2e/journeys/j-11.spec.ts` | 6 |
| J-12 Emergency pause | `Flow-J-12` | `e2e/journeys/j-12.spec.ts` | 3 |
| J-13 Platform admin incident | `Flow-J-13` | `e2e/journeys/j-13.spec.ts` | 9 |
| J-14 Payment failure | `Flow-J-14` | `e2e/journeys/j-14.spec.ts` | 8 |
| J-15 Mobile approvals | `Flow-J-15` | `e2e/journeys/j-15.spec.ts` | 7 |

J-01, J-04, J-10 and J-11 need a publishing adapter. Until a platform is approved (B-01) they run against the labelled mock provider and are reported as mocked.

## 5. Milestone summary

| MS | Scope | Screen IDs |
|---|---|---|
| 1 | Scaffolding, auth, roles, tenancy | 12: AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, AU-07, APP-07, SY-03, SY-04, SY-05, SY-08 |
| 2 | Design-faithful frontend + PWA | 19: M-01, M-02, M-03, M-04, M-05, M-06, M-07, M-08, ON-01, ON-02, ON-03, ON-04, ON-05, ON-FLOW, APP-01, ST-03, SY-01, SY-02, SY-07 |
| 3 | Jobs, agents, activity, notifications | 7: APP-02, APP-03, APP-04, APP-05, APP-06, NT-01, SY-09 |
| 4 | Media pipeline | 10: CL-01, CL-02, CL-03, CL-04, CL-05, CS-01, CS-02, CS-03, ST-06, ST-07 |
| 5 | Licensing + creator portal | 10: LI-01, LI-02, LI-03, LI-04, LI-05, LI-06, LI-07, LI-08, LI-09, LI-10 |
| 4S | Studio: Editor + Translate subtitles | 8: ED-01, ED-02, ED-03, ED-04, TR-01, TR-02 (subtitles), TR-03, TR-04 (subtitle versions); "Open in Editor" and "Translate" entry points |
| 5S | Studio: consent registry, Voice Lab, dubbing | 7: ST-10 Likeness and voice (code `LV-01`), VL-01, VL-02, VL-03, VL-04, VL-05; TR-02 and TR-04 dub levels; AI-changed chip, content credentials and watermark on outputs; "Translations" licence use |
| 6 | OAuth + publishing | 6: PB-01, PB-02, PB-03, IN-01, IN-02, ST-08; AI-content disclosure at publish (platform flag locked on); publishing language versions (TR-04) |
| 7 | Agency, client approvals, analytics | 15: PB-04, PB-05, AN-01, AN-02, AN-03, AN-04, AG-01, AG-02, AG-03, AG-04, AG-05, AG-06, CP-01, CP-02, ST-05; agent use of Studio tools; per-language analytics |
| 8 | Billing | 8: BI-01, BI-02, BI-03, BI-04, BI-05, BI-06, BI-07, BI-08; Studio credit units and plan gates |
| 9 | Studio: Generate | 5: GE-01, GE-02, GE-03, GE-04, GE-05 |
| 10 | Studio: Transform | 5: TF-01, TF-02, TF-03, TF-04, TF-05 (on a video first, then live camera) |
| 11 | Hardening (was 9) | 15: ST-01, ST-02, ST-04, ST-09, ST-10, AD-01, AD-02, AD-03, AD-04, AD-05, AD-06, AD-07, AD-08, AD-09, SY-06; Studio covered by the load, cost, security and abuse tests |
| 12 | Release (was 10) | M-08 live status, J-01 to J-15 on staging, accessibility pass, dark parity, Studio launch gates |

Milestones 9 and 10 became 11 and 12 on 20 Nov 2026. Where this file, `BLOCKERS.md` or an older report says "MS 9" (hardening) or "MS 10" (release), read 11 and 12. The MS column in §2 sections 1–13 still shows the old numbers for those two milestones; `packages/config/src/screens.ts` is renumbered when the next milestone starts.

## 6. Differences found between the documents

The product owner accepted the defaults below on 12 Nov 2026.

| # | Finding | Decision |
|---|---|---|
| T-1 | Several drawn screens have no route in B §5: ON-05 "All set", BI-07 and BI-08 (drawn as pages, listed in B as banners on BI-01), SY-04 Access denied and SY-05 Server error (B has one SY-03 for all errors), AD-09, and the overlays APP-07, SY-07, SY-08, SY-09. | Routes marked ⚠ in §2. Overlays get no route. BI-07 and BI-08 are states of `/org/[org]/billing` plus their banners. |
| T-2 | Repository layout differs between the architecture document §3 (`apps/worker`, `services/ai`, `services/renderer`) and the handoff §12 (`apps/api-media`, `workers/node`, `workers/py`). | Handoff wins (higher in the source-of-truth order); layout in §1. |
| T-3 | The Foundations board labels the largest type "Display 72". `tokens.json` and the handoff say hero 76 and display 56. | `tokens.json` is the scale; each screen uses the size in its own board file. |
| T-4 | Role names: the handoff §9 lists Owner, Admin, Manager, Editor, Viewer, Client approver, Content owner, Platform admin. A §1 and B §6 use ten role IDs. | Stored roles are the handoff's eight. Creator, Business owner and Agency owner (R-CR, R-BO, R-AO) are all "Owner", told apart by the organization's account type. |
| T-5 | The handoff milestone table builds some screens late that earlier screens link to (for example ST-10 Workspace settings at MS 9, linked from the sidebar from MS 2). | Until its milestone, an unbuilt route is hidden behind a feature flag in the navigation. Nothing ships publicly before MS 10. |
| T-6 | The main text of `G_UX_AUDIT.md` describes the v1 look (Volt, Grape, Bricolage Grotesque). | Its v2 addendum and the handoff supersede it. Open audit items carried into the build: G-12 (check GSAP timing) and G-14 (dark from tokens only). |
| T-7 | Offline boards load photos from `/_blob/…` canvas URLs, so photos don't show when a board file is opened locally. Everything else renders correctly without the canvas runtime (checked on `CommandCenter`, `CommandCenter-Mobile` and `Main`). | Visual-snapshot baselines rewrite those URLs to `docs/design/E_hifi/photos/` using `generator/photos.json`. |
| T-8 | The inventory lists all eight public mobile boards on the M-08 row. | Read as one mobile board per public page (`Home-Mobile` and so on), as on disk. |

**D-M5-1 (Milestone 5).** Creators upload the videos they license (decided 20 Nov 2026: importing from a channel waits for platform approval, B-01). The upload list is a "Your videos" card on LI-07 under "Excluded videos"; no board draws it, so it reuses the row, button and upload-progress parts of LI-07 and CL-02.

**D-M5-2 (Milestone 5).** LI-06 verifies YouTube channels by Google sign-in (read-only, token revoked straight away, nothing stored), on a Google Cloud OAuth client in testing mode until Google verification (B-01). Instagram sign-in needs Meta approval, so Instagram (and YouTube while sign-in is off) uses a check by hand: the creator adds a one-time code to their bio or channel description and a platform admin confirms it (`pnpm --filter @nelio/worker-node admin:channel`, until AD-04). The board’s pending line "Waiting for Instagram to confirm · usually minutes" would not be true, so pending rows say what to do and how long the check takes.

**D-M5-3 (Milestone 5).** Marketplace cards and the LI-02 strip use poster frames the worker takes from each creator video. "Popular with licensees" ranks the creator's own videos by how many licensees clipped them (a count across workspaces; no licensee content is shown). The niche filter lists the niches creators have; no board lets a creator set a niche or short description yet, so cards show the video count until that exists. LI-02's Paid board can't occur (paid terms can't be published, B-08); the button exists for when it can. Editors (licensing request: R) can request private licences; free licences are accepted by a manager. A licence the owner revoked can't be re-accepted on free terms.

**D-M5-4 (Milestone 5).** No board draws how a licensee picks a creator's video, so LI-02 in the Licensed state turns its strip into "Pick a video to clip", with a "Clip this" button on each short. That copies the video into the workspace (a server-side storage copy) and starts processing. CL-01's "Import licensed" opens My licenses once the workspace holds a licence (the marketplace otherwise), and CL-02's "It’s from a Nelio license" option points there. Every licensed use goes through one gate (`licenseForAsset`): processing and rendering in the worker, rendering and retries in the app, and the composer, which adds the attribution automatically (CS-02 Licensed) and warns about platforms the licence doesn't cover.

**D-M5-5 (Milestone 5).** LI-09 draws the revoke dialog but not how a creator picks the licence: a "Revoke a license" button in the page header opens the board's dialog, with a "Which license?" picker when there is more than one. Revoking (and expiry, run by the worker every minute) cancels queued renders without charge, holds scheduled posts, flags published ones and notifies the workspace. LI-04's "Open takedown checklist" lists the steps and records the confirmation; Nelio can't remove posts from platforms itself until Milestone 6. Verified end to end with `pnpm --filter @nelio/worker-node check:licensing` (26 checks against the dev database and storage).

**D-M5-6 (Milestone 5 end check, 20 Nov 2026): second canvas refresh.** The live canvas (version 1795153016) added the Cards board ("Eight cards, one family") and restyled shared parts. Built for every screen from Milestones 0–5: the solid-blue active navigation item; row cards on one shared grid (subgrid columns, bolder values, 64 px rows; the status chip sits beside the title on phones); loading states that draw the real page with text-shaped grey blocks (`Ghost`); toasts with "just now"; the agent card (Agents, Command Center), tool tiles and draft cards (Content Studio), clip cards (Exports) and source cards (Marketplace); copy changes in the command palette, pause dialog, workspace switcher and revoke dialog. Differences kept on purpose: "Create an image" and "Templates" stay "Coming later" (no engine); CS-03 keeps its gated "Notify me" instead of "Original AI video now lives in Generate", because Generate isn't built; agent cards show no platform badges until agents have destinations (Milestone 6); the agent card header uses the poster of the agent's last video, or the agent's colour when there is none. Remaining cards (campaign, client, post ticket) arrive with their screens (Milestones 6–7).

### Nelio Studio (approved scope, 20 Nov 2026)

The product owner made Nelio Studio part of the approved scope on 20 Nov 2026, replacing the earlier "roadmap after the current milestones" decision. It is Required module 12 in Master Prompt 2, with the same standards, milestone process and launch gates as the rest. Screens are in §2 section 14 and the order in §5. Its navigation entries are registered (`packages/config/src/screens.ts`, currently milestone 11) and stay hidden until each tool's flag turns on.

**D-M5-7 (20 Nov 2026): third canvas refresh, built the same day in the final check.** After the Milestone 5 end check the live main canvas moved to version 1795156541. 314 boards changed style only, no text changed, and one board is new: **Form controls · shadcn/ui** (Foundations). What changed:
- Every text input, textarea, select and multi-select uses the shadcn/ui component themed with Nelio tokens: 10 px radius, 1 px border, a light shadow, 44 px height, and labels at 14 px semibold with an 8 px gap. Multi-select is Popover + Command with checkbox items and badges in the trigger. Search bars, the Nelio AI prompt box and code inputs keep their own designs.
- The top bar is sticky (z-index 25). The sidebar is a fixed 250 px column that stays in place at the full viewport height below the top bar.

The offline copy is synced. Built in `packages/ui` (`INPUT_CLASS`, `TEXTAREA_CLASS`, `LABEL_CLASS`, `Field`, `TextareaField`, `SelectControl`, `SelectField`) and used by every form on screens built so far. The operator and Creator Portal top bars are sticky at all widths, 69 px tall, and the sidebars stick below them with their own scroll. Kept as drawn: the workspace search, the Clipping Studio "Edit with words" prompt and the code digits keep their own designs. The multi-select (Popover + Command) arrives with its first screen (Translate languages, 4S).

**D-M5-8 (20 Nov 2026): Studio scope notes.**
- Studio's ST-10 clashes with Workspace settings ST-10 (§2 section 14). The code uses `LV-01`.
- The Studio canvas boards already use the refreshed sidebar, the Ghost loading style and the shadcn form controls.
- Translating someone else's video needs a licence that allows it. Licence terms today offer only clips and compilations (`LICENSE_USES`), so a "Translations" use is added to LI-07, LI-02 and LI-03 in 5S. No board draws it, so it reuses the existing use checkboxes.
- The Studio plan puts content credentials and the watermark with publishing. They are moved into 5S because a cloned voice can leave Nelio as a download or export before publishing exists (Milestone 6). The platform's AI flag stays in Milestone 6.

