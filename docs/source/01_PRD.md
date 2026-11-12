Version 1.0 \| Draft for stakeholder approval \| 9 November 2026

Product positioning: Fully autonomous AI social media management for
creators and agencies, with authorized video clipping as a flagship
capability.

# 1. Executive summary

- Build a workspace-first SaaS where AI agents research, plan, produce,
  edit, schedule, publish and optimize social content under explicit
  user controls. Serve individual creators and agencies from launch,
  including client login and direct content approval.

- Product promise: one controlled AI content workforce, not a
  stand-alone clipping utility. The AI Activity Center and agent
  dashboard are the main application experience.

# 2. Goals, outcomes and exclusions

- Goals: shorten time to first published short; make recurring content
  operations reliable; provide transparent AI costs and licensing;
  support agency client isolation and approvals.

- Success metrics: onboarding completion, time to first approved short,
  successful publish rate, job completion rate, approval turnaround,
  weekly active workspaces, retained paid workspaces, gross margin per
  generated minute.

- Initial exclusions: guaranteed virality, unlicensed
  scraping/downloading, bypassing platform restrictions, unsupported
  social publishing, self-hosted foundation models, white-label agency
  portals, and guaranteed monetization eligibility.

# 3. Personas and permissions

- Creator: owns a workspace, configures agents, uploads or licenses
  content, edits, approves and publishes.

- Agency owner/admin: creates client workspaces, invites staff and
  clients, assigns social accounts, configures approvals and billing.

- Agency editor/manager: creates drafts and schedules within assigned
  client workspaces; cannot bypass client approval policies.

- Client approver: signs in to assigned client workspace, previews
  drafts, comments, requests revisions, approves or rejects; cannot
  access other clients or billing unless explicitly granted.

- Creator partner: verifies channel ownership, grants scoped clipping
  permissions, monitors licensed usage and revokes permissions.

- Platform administrator: oversees moderation, support, job health,
  integrations and billing using audited elevated access.

# 4. MVP functional requirements

- FR-01 Identity: registration, verification, login, recovery, sessions,
  account deletion, MFA option, role checks and workspace membership.

- FR-02 Onboarding: creator or agency path; niche, goals, brand kit,
  social connection, autonomy level, first agent and first video wizard.

- FR-03 Workspaces: multiple agency clients, invitations, client-scoped
  roles, approval policy, audit log and strict tenant isolation.

- FR-04 Agent management: create/configure/start/pause/resume agents,
  define goals, schedules, sources, brand rules, budgets and destination
  accounts.

- FR-05 Strategist: conversational goal intake; propose calendar and
  workflow; require explicit approval before activation or permission
  expansion.

- FR-06 Clipping: authorized upload or licensed-source ingest,
  transcript, candidate highlights, crop/reframe, captions, preview,
  trim, render, export.

- FR-07 Studio: title/hook variants, captions, aspect ratios, brand
  overlays, audio settings, basic timeline edits and version history.

- FR-08 Licensing: evidence record, owner verification, allowed uses,
  attribution, term, territory if applicable, commercial-use flag,
  expiry and revocation checks.

- FR-09 Publishing: official OAuth, draft/approval/schedule/publish,
  destination-specific validation, status and failure recovery; only
  platforms approved and technically available.

- FR-10 Calendar and approvals: client preview, comments,
  approve/reject/request changes, immutable approval history, approval
  invalidation on material edits.

- FR-11 Activity Center: agent events, progress, pending approvals,
  error details, worker state, usage and history; realtime updates with
  durable replay.

- FR-12 Notifications: in-app, browser push and email,
  opt-in/preferences, retries, deduplication and deep links.

- FR-13 Analytics: only metrics provided by authorized platform APIs;
  source timestamps, unsupported-metric labels and basic trend
  summaries.

- FR-14 Billing: plan entitlements, credit ledger, estimated cost before
  costly tasks, per-agent/workspace caps, payment reconciliation and
  invoices.

- FR-15 Admin: job queue health, audit search, creator license review,
  support access, abuse reports, payment and integration diagnostics.

# 5. Agency and creator user journeys

- Creator first run: sign up → select creator → choose niche and goals →
  create workspace → upload owned/licensed video → generate short →
  review/edit → connect supported account → approve/schedule → publish
  confirmation → notification and analytics.

- Agency setup: agency owner signs up → creates agency and client
  workspace → invites editor and client approver → assigns account/brand
  kit → defines approval policy → editor/agent creates draft → client
  logs in and approves → schedule/publish → audit record.

- Client rejection: client requests changes → draft returns to
  editor/agent → revised version created → earlier approval is
  invalidated → client reapproves.

- Autonomous run: strategist proposes plan → user approves sources,
  budget, cadence and destination → scheduled agent researches → checks
  licenses → generates → quality gates → approval when policy requires →
  publishes → logs result and metrics.

- Revocation: rights owner revokes license → future use blocked
  immediately; pending jobs canceled/held; existing published uses
  flagged for review and appropriate takedown workflow.

# 6. Autonomy and policy engine

- Modes: manual (all actions initiated), semi-autonomous (AI prepares
  but approval required), full autonomous (only preauthorized
  operations).

- Agent permissions are explicit and scoped to workspace, social
  account, source pool, permitted content types, daily/weekly posting
  caps, spending limits and approval policy.

- Hard gates: no source without valid license evidence; no posting to
  unconnected accounts; no spend above limit; no publishing after
  revoked consent; no approval bypass.

- All workflows persist step state, checkpoints, idempotency keys, trace
  IDs and immutable action logs. Emergency pause blocks new dispatch;
  in-flight cancellation reports actual outcome.

# 7. Content rights and platform compliance

- Public availability is not reuse permission. Source material must be
  uploaded by an authorized party or covered by a verifiable creator
  license; verify embedded music and third-party elements separately.

- Creator portal must verify channel ownership through a supported
  method and record permissions for clipping, compilations,
  monetization, attribution, duration, transformation and distribution
  channels.

- License version and evidence are attached to each generated asset and
  checked again at publishing. Implement expiration/revocation alerts
  and takedown handling.

- Respect platform API terms, rate limits, app review and
  reused-content/monetization rules. Do not promise
  YouTube/TikTok/Instagram/Facebook publishing until credentials and
  permissions are verified.

# 8. Notifications and activity center

- Events: job completed/failed, draft ready, client approval
  requested/decided, publish confirmed/failed, license expired/revoked,
  spending warning, payment event and security alert.

- Persist notifications and activity events in PostgreSQL. Use Supabase
  Realtime for authorized live subscriptions, web push via service
  workers and VAPID where supported, and Resend for transactional email.

- Allow per-workspace and per-user notification preferences, quiet
  hours, read/unread state and delivery attempts. Reconnection reloads
  authoritative state.

# 9. Technical architecture decisions

- Web: Next.js App Router, TypeScript, Tailwind, shadcn/ui; lightweight
  Next.js Route Handlers for APIs; Supabase Auth.

- Data: Supabase PostgreSQL with Prisma, tenant-scoped access controls
  and indexes; Cloudflare R2 for uploads/outputs with signed URLs.

- Async: Redis + BullMQ and persistent Node workers; Python FastAPI for
  AI orchestration and analysis; FFmpeg and Remotion in separate
  rendering workers.

- Hosting: Vercel for web; Railway for persistent services/workers
  initially; managed BullMQ-compatible Redis; Resend; Sentry and
  structured logs.

- Use a modular monolith for web business logic with independently
  scaled processing services. Do not execute long-running work in
  serverless request handlers.

# 10. Data model (minimum)

- User, Organization, Workspace, WorkspaceMember, Invitation,
  RoleAssignment, ClientApprovalPolicy, BrandKit, SocialAccount,
  OAuthCredentialReference, ContentPlan, Agent, AgentRun, AgentStep,
  AgentActivity, SourceCreator, CreatorVerification, LicenseGrant,
  LicenseEvidence, SourceAsset, MediaAsset, VideoProject, Clip,
  EditVersion, ContentDraft, ApprovalRequest, ApprovalDecision,
  ScheduledPost, PublishAttempt, MetricSnapshot, Notification,
  PushSubscription, Subscription, CreditLedgerEntry, UsageRecord,
  AuditEvent, WebhookEvent.

- All tenant-owned records carry workspace ID. License evidence and
  approval decisions are versioned. Store tokens encrypted, never as
  plaintext in browser or logs.

# 11. Non-functional requirements

- Security: tenant isolation, least-privilege RBAC, CSRF/session
  safeguards, webhook signatures, upload scanning, signed media access,
  secrets management, audit logging and rate limits.

- Reliability: durable queues, bounded retries, dead-letter handling,
  idempotent publishing attempts, reconciliation after ambiguous
  external API responses and backups with restore drills.

- Performance: dashboard p95 latency targets to be measured;
  user-visible progress for long tasks; pagination and selective
  realtime subscriptions.

- Accessibility: keyboard operation, focus states, color contrast,
  screen-reader labels and reduced-motion support.

- Privacy: data retention, export/deletion flows, consent for
  notifications, secure logging and appropriate data processing
  agreements.

# 12. Monetization and costs

- Offer creator and agency tiers with plan-specific workspace, account,
  agent, storage and usage limits; final prices and allowances require
  business approval.

- Use a transactional credit ledger. Meter transcription, AI inference,
  rendering, storage and publishing-related billable operations;
  reserve/settle/refund credits safely.

- Integrate eligible payment providers (e.g. Paystack/Flutterwave and/or
  Stripe) only after merchant eligibility and API capabilities are
  confirmed.

# 13. Acceptance criteria and release gates

- AC-01 Creator can sign up, create a workspace and generate a usable
  captioned short from an authorized upload; video is stored and
  downloadable.

- AC-02 Agency owner creates two client workspaces; users assigned to
  client A cannot access client B data through UI, API, storage URLs or
  realtime events.

- AC-03 Agency editor submits a draft; client approver signs in,
  requests revision, later approves the revised version; every action is
  audited.

- AC-04 Publishing worker only publishes after required approvals and
  license checks; destination API confirmation is recorded accurately.

- AC-05 Browser closure does not stop agent or video jobs; restarted
  workers resume or safely retry without duplicate publishing.

- AC-06 Notification delivered in-app and through configured opt-in
  channels; retries do not create duplicate records.

- AC-07 Spending limits stop new expensive operations; ledger reconciles
  estimated and actual usage.

- AC-08 Agent pause stops future work; status and error history remain
  visible after reconnect.

- AC-09 Expired/revoked licenses block new generation/publishing and
  flag affected drafts.

- AC-10 Release evidence includes executed tests, security review,
  backup restore verification and list of externally blocked
  integrations.

# 14. Delivery phases and priorities

- Phase 0: approved designs, architecture, threat model, provider
  feasibility, cost assumptions and traceable feature inventory.

- Phase 1: identity, workspaces, client roles, approvals, audit,
  dashboard and storage.

- Phase 2: authorized upload → transcription → clip → edit → render →
  media library.

- Phase 3: social OAuth, schedule/publish, notifications, activity
  center and analytics baseline.

- Phase 4: persistent autonomous agents, strategist, controlled research
  and quality checks.

- Phase 5: subscriptions, creator licensing portal, admin ops,
  hardening, load testing and production launch.

- Later: ranking/compilation workflows, richer original AI video
  generation, agent marketplace, advanced agency reporting and deeper
  growth optimization.

# 15. Open decisions requiring approval

- Brand name and visual identity; initial supported publishing
  destinations and verified API permissions; exact pricing/credit
  allowances; approval policy defaults; initial AI/transcription/voice
  providers; content retention windows; target markets and compliance
  obligations; expected concurrent rendering workload and budget.

- These decisions should be resolved before their dependent features
  ship, but should not block unrelated local development.

# 16. Instructions to Claude

- Treat this PRD and the approved design as the source of truth. Create
  a requirement-to-screen/API/data/test traceability matrix. Never
  silently omit features or claim external integrations work without
  verification.

- First complete design and architecture review; then implement phase by
  phase in the approved repository. Maintain IMPLEMENTATION_STATUS.md
  and FEATURE_COMPLETENESS.md with evidence and blockers.

21\. Finalized decisions addendum — 9 November 2026

## Product and release

One comprehensive public launch after internal milestones and private
beta. Never present unapproved social integrations or unimplemented
original AI video generation as functional. Responsive web and
installable PWA first; future native iOS/Android apps with React Native
and Expo using shared API contracts.

## Appearance and onboarding

Dark, Light and System appearance settings; dark default; accessible
full parity. Four short onboarding steps: creator/business/agency
account type, goals and niche, optional social connections, automation
mode. Every step skippable; dashboard checklist. Autonomous publishing
requires explicit authorization.

## Launch social platforms

YouTube, Instagram, TikTok and Facebook are targeted; implement YouTube
and Instagram first, then TikTok and Facebook. Official OAuth/APIs and
actual app approvals gate availability.

## AI and media stack

Claude is the sole initial general-purpose reasoning model. Deepgram and
Whisper are interchangeable transcription providers behind a smart
router with Fast, Balanced and High Quality modes, per-job costs,
fallback and deduplication. FFmpeg performs cutting/transcoding,
Remotion creates composited animated captions, PySceneDetect detects
scene changes. These tools complement rather than replace one another.
Original generative video requires a separate specialist provider and
remains capability-gated.

## Commercial plans and trial

Provisional monthly USD pricing: Free \$0, Starter \$19, Creator Pro
\$49, Business \$99, Agency \$249, Enterprise custom. Plan credit
allocations require measured processing costs. Permanent free plan very
limited with no autonomous publishing. Three-day trial: maximum one
agent, one connected account and two short-video exports, hard compute
cap and no premium generative video. No automatic charge without
authorization. Top-ups only on paid plans; no automatic top-up by
default. Show estimated and actual cost; pause at limits.

## Payments and Nigeria operations

Nigeria-based operator. Paystack preferred initial candidate,
Flutterwave alternative, subject to verification of merchant
eligibility, supported currency and recurring billing. USD price list;
NGN checkout where supported with transparent conversion. Modular
provider adapters and immutable credit ledger.

## Licensing marketplace

Verified content owners can register and participate for free without
subscribing. Support free authorized licensing and private agreements
first; paid licensing and payouts after legal, tax, compliance and
payment readiness. Creator ownership verification, scoped commercial
rights, platforms, attribution, third-party rights, expiry, revocation
and pre-publish rights checks required.

## Agencies and safety

Agency workspaces, client login and direct approvals from launch. Client
permissions are tenant-scoped. Autonomous agents must honor license,
publishing, approval and spending controls; jobs run durably in the
background.

## Approval workflow

Design/prototype first using Master Prompt 1, stop for explicit user
approval, then Claude Code implements the approved design using Master
Prompt 2. Both prompts and this updated PRD and architecture must be
supplied together. If a conflict exists, finalized decisions in this
addendum override older proposals.
