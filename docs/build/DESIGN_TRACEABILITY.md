# Nelio: Design traceability (Milestone 0)

Maps every screen ID in `docs/design/H_handoff/SCREEN_INVENTORY.md` to its route, files, API and jobs, milestone and status.
Generated 12 Nov 2026 from the inventory (v2.3) and checked against the 471 board files in `docs/design/E_hifi/canvas/`: every inventory board exists on disk and every board on disk is in the inventory.

**Status values:** `not started` · `in progress` · `done` · `gated` · `blocked`. Milestone 1 screens and the Milestone 2 screens built so far are `in progress`: built and type-checked, not yet walked end to end (see `MILESTONE_1_REPORT.md` §4). Everything else is `not started`. The **Gate** column names the entry in `BLOCKERS.md` that will hold a screen in its honest gated state, or block it, when its milestone arrives.

Update this file at the end of every milestone.

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
| APP-02 | AI Strategist | `Strategist` · 5: Filled, Empty, Thinking, Error, History + `Strategist-Mobile` | /w/[ws]/strategist | w/[ws]/strategist/page.tsx | `/api/strategies/*` (chat, proposals, activation) · AI service · `research` queue | 3 | not started | B-03 |
| APP-03 | AI Activity Center | `Activity` · 6: Filled, Empty, Loading, Reconnecting, Synced, Filtered + `Activity-Mobile` | /w/[ws]/activity · /activity/[runId] | w/[ws]/activity/page.tsx · activity/[runId]/page.tsx | `GET /api/agents/runs` · `GET /api/activity/events` (replay) · Supabase Realtime · outbox dispatcher | 3 | not started | — |
| APP-04 | Agents | `Agents` · 4: Filled, Empty, Loading, Limit + `Agents-Mobile` | /w/[ws]/agents | w/[ws]/agents/page.tsx | `GET /api/agents` | 3 | not started | — |
| APP-05 | Agent detail | `AgentDetail` · 7: Filled, Budget, Destinations, Runs, Loading, Reauth, Stopped + `AgentDetail-Mobile` | /w/[ws]/agents/[id] (tabs) | w/[ws]/agents/[id]/page.tsx | `/api/agents/[id]` + `/policy` `/budget` `/destinations` `/runs` `/pause` `/resume` `/authorize` | 3 | not started | — |
| APP-06 | Create agent | `CreateAgent` · 7: CreateAgent-Goal, CreateAgent-Sources, CreateAgent-Destinations, CreateAgent-Budget, CreateAgent, CreateAgent-Authorize, CreateAgent-Limit + `CreateAgent-Goal-Mobile` | /w/[ws]/agents/new | w/[ws]/agents/new/page.tsx | `POST /api/agents` · `POST /api/agents/[id]/authorize` (D-05) | 3 | not started | — |
| APP-07 | Workspace switcher | `WorkspaceSwitcher` · 2: Filled, Search + `WorkspaceSwitcher-Mobile` | overlay in top bar (no route) | `WorkspaceSwitcher` in shell | `GET /api/workspaces` (memberships only) | 1 | in progress | — |
| NT-01 | Notifications | `Notifications` · 5: Filled, Empty, Loading, Panel, Push + `Notifications-Mobile` | /w/[ws]/notifications + top-bar panel | w/[ws]/notifications/page.tsx · `NotificationsPanel` | `/api/notifications/*` · `/api/notifications/push-subscriptions` · `notify` queue (in-app, email, web push) | 3 | not started | B-03 |

### 4 · Clipping & Content

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| CL-01 | Media library | `MediaLibrary` · 4: Filled, Empty, Loading, Storage + `MediaLibrary-Mobile` | /w/[ws]/media | w/[ws]/media/page.tsx | `GET /api/media` · storage usage | 4 | not started | — |
| CL-02 | Upload | `Upload` · 5: Filled, Uploading, Wrongtype, Norights, Lowcredits + `Upload-Mobile` | /w/[ws]/media/upload | w/[ws]/media/upload/page.tsx | `POST /api/media/uploads` (signed multipart) · `POST /api/media/[id]/complete` · `POST /api/billing/estimates` · jobs: probe, `transcribe`, `analyze` | 4 | not started | B-03 |
| CL-03 | Clipping Studio | `ClippingStudio` · 7: Filled, Processing, Loading, Blocked, Unsaved, Estimate, Queued + `ClippingStudio-Mobile` | /w/[ws]/studio/[projectId] | w/[ws]/studio/[projectId]/page.tsx | `/api/projects/[id]` + `/candidates` `/revisions` `/preview` `/render` · `analyze`, `render` queues | 4 | not started | B-03 |
| CL-04 | Batch variants | `Variants` · 3: Filled, Generating, Lowcredits + `Variants-Mobile` | /w/[ws]/studio/[projectId]/variants | w/[ws]/studio/[projectId]/variants/page.tsx | `POST /api/projects/[id]/variants` · `render` queue | 4 | not started | — |
| CL-05 | Exports | `Exports` · 4: Filled, Empty, Loading, Trial + `Exports-Mobile` | /w/[ws]/exports | w/[ws]/exports/page.tsx | `GET /api/exports` · signed download URL · trial export cap | 4 | not started | — |
| CS-01 | Content Studio | `ContentStudio` · 3: Filled, Empty, Loading + `ContentStudio-Mobile` | /w/[ws]/content | w/[ws]/content/page.tsx | `GET /api/posts?state=draft` · templates | 4 | not started | — |
| CS-02 | Post composer | `Composer` · 4: Filled, Invalid, Nodest, Licensed + `Composer-Mobile` | /w/[ws]/content/compose · /compose/[draftId] | w/[ws]/content/compose/[[...draftId]]/page.tsx | `/api/posts` · `/api/posts/[id]/destinations` · per-platform validation | 4 | not started | — |
| CS-03 | Original AI video | `AIVideo` · 1: Filled + `AIVideo-Mobile` | /w/[ws]/content/video-generation | w/[ws]/content/video-generation/page.tsx | none: gated screen · `POST /api/interest` (Notify me) | 4 | not started | B-09 |

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
| LI-01 | Marketplace | `Marketplace` · 3: Filled, Empty, Loading + `Marketplace-Mobile` | /w/[ws]/licensing | w/[ws]/licensing/page.tsx | `GET /api/licensing/sources` | 5 | not started | — |
| LI-02 | Source detail & terms | `SourceDetail` · 6: Filled, Loading, Private, Paid, Suspended, Licensed + `SourceDetail-Mobile` | /w/[ws]/licensing/sources/[id] | w/[ws]/licensing/sources/[id]/page.tsx | `GET /api/licensing/sources/[id]` | 5 | not started | — |
| LI-03 | Request / accept license | `RequestLicense` · 5: Filled, Private, Sent, Approved, Declined + `RequestLicense-Mobile` | /w/[ws]/licensing/sources/[id]/request | w/[ws]/licensing/sources/[id]/request/page.tsx | `POST /api/licensing/agreements` (accept / request) | 5 | not started | — |
| LI-04 | My licenses | `MyLicenses` · 4: Filled, Empty, Loading, Expired + `MyLicenses-Mobile` | /w/[ws]/licensing/mine | w/[ws]/licensing/mine/page.tsx | `GET /api/licensing/agreements` · `rights-recheck` queue | 5 | not started | — |

### 8 · Creator Portal

| ID | Screen | Boards (desktop states + mobile) | Route | Web files | API and jobs | MS | Status | Gate |
|---|---|---|---|---|---|---|---|---|
| LI-05 | Creator portal overview | `CreatorOverview` · 4: Filled, Empty, Loading, Unverified + `CreatorOverview-Mobile` | /creator | creator/page.tsx | `GET /api/creator/overview` | 5 | not started | — |
| LI-06 | Verification | `Verification` · 4: Filled, Pending, Failed, Empty + `Verification-Mobile` | /creator/verify | creator/verify/page.tsx | `/api/creator/channels` · ownership verification (channel OAuth) | 5 | not started | B-01 |
| LI-07 | Licensing terms | `LicenseTerms` · 3: Filled, Unverified, Saved + `LicenseTerms-Mobile` | /creator/terms | creator/terms/page.tsx | `GET/PUT /api/creator/terms` | 5 | not started | — |
| LI-08 | Usage audit | `Usage` · 3: Filled, Empty, Loading + `Usage-Mobile` | /creator/usage | creator/usage/page.tsx | `GET /api/creator/usage` | 5 | not started | — |
| LI-09 | Revoke a license | `Revoke` · 3: Filled, Done, Empty + `Revoke-Mobile` | /creator/revocations | creator/revocations/page.tsx | `POST /api/creator/agreements/[id]/revoke` · `rights-recheck` queue (hold posts, flag published) | 5 | not started | — |
| LI-10 | Payouts | `Payouts` · 1: Filled + `Payouts-Mobile` | /creator/payouts | creator/payouts/page.tsx | none: gated "coming later" | 5 | not started | B-08 |

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
| ST-06 | Brand kits | `BrandKits` · 3: Filled, Empty, Editing + `BrandKits-Mobile` | /w/[ws]/settings/brand-kits | w/[ws]/settings/brand-kits/page.tsx | `/api/brand-kits` | 4 | not started | — |
| ST-07 | AI & processing | `AISettings` · 1: Filled + `AISettings-Mobile` | /w/[ws]/settings/ai | w/[ws]/settings/ai/page.tsx | `PATCH /api/workspaces/[ws]/settings` (Fast / Balanced / High Quality) | 4 | not started | — |
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
| SY-09 | Pause all confirm | `PauseConfirm` · 2: Filled, Resume + `PauseConfirm-Mobile` | overlay from top bar | `PauseConfirm` dialog | `POST /api/workspaces/[ws]/pause` · `/resume` | 3 | not started | — |

**102 screen IDs** mapped (public 8, auth and onboarding 13, product and system 81).

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
| 6 | OAuth + publishing | 6: PB-01, PB-02, PB-03, IN-01, IN-02, ST-08 |
| 7 | Agency, client approvals, analytics | 15: PB-04, PB-05, AN-01, AN-02, AN-03, AN-04, AG-01, AG-02, AG-03, AG-04, AG-05, AG-06, CP-01, CP-02, ST-05 |
| 8 | Billing | 8: BI-01, BI-02, BI-03, BI-04, BI-05, BI-06, BI-07, BI-08 |
| 9 | Hardening | 15: ST-01, ST-02, ST-04, ST-09, ST-10, AD-01, AD-02, AD-03, AD-04, AD-05, AD-06, AD-07, AD-08, AD-09, SY-06 |
| 10 | Release | M-08 live status, J-01 to J-15 on staging, accessibility pass, dark parity |

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

