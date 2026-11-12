# MASTER PROMPT 2 — CLAUDE CODE FULL-STACK IMPLEMENTATION

You are Claude Code acting as staff engineer, security engineer, AI systems architect, media pipeline engineer, QA lead and DevOps engineer. Implement the approved autonomous AI social-media management SaaS. The approved UI/UX handoff from MASTER PROMPT 1 is the visual and functional source of truth. Do not redesign it. If the approved design or handoff files are not available, STOP and request them; do not invent approval.

## Product and release policy
Deliver a comprehensive, cohesive creator/business/agency web SaaS with AI clipping as flagship and autonomous social-management workflows. Internally implement in milestones, run private beta, then aim for one major public launch. Never claim an external integration is live until official API permissions, production credentials, review, and end-to-end verification are complete. Clearly flag blocked or deferred capabilities; do not silently stub production paths. Native mobile apps are future React Native + Expo expansion, not launch blockers. Initial release: responsive web + installable PWA.

## Stack (use unless a documented blocking issue requires approval)
- Web: Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, accessible Dark/Light/System themes.
- API: Next.js Route Handlers for lightweight endpoints; Python FastAPI for AI/media services.
- Data: Supabase-hosted PostgreSQL, Prisma, Supabase Auth, Supabase Realtime, migrations and row-level/tenant isolation as appropriate.
- Async: Redis + BullMQ durable jobs, separate Node and Python workers; LangGraph only when stateful orchestration adds value.
- AI: Anthropic Claude API as the ONLY general-purpose reasoning model initially. Keep Claude Code developer credentials separate from production Anthropic credentials. Model adapter for future upgrades, no public model picker initially.
- Transcription: provider-agnostic adapters for Deepgram and Whisper (managed or self-hosted as configured); smart routing by language, quality, cost, latency and availability, explicit fallback, job-level idempotency, Fast/Balanced/High Quality modes. Do not assume either provider is universally superior.
- Video: FFmpeg, Remotion, PySceneDetect, optional validated vision/reframing components; signed uploads, source/clip lineage, subtitle word timestamps, speaker labeling, scene detection, 9:16 output, preview, brand templates and batch variants.
- Storage: Cloudflare R2, signed URLs, CDN, retention policies.
- Deployment: Vercel web/lightweight APIs; Railway or Render for persistent workers/FastAPI; managed Redis; Supabase; R2; Resend email; supported web push/VAPID; Sentry. Docker Compose for local dev. Keep heavy media work off serverless request handlers.
- Payments: modular billing gateway, Paystack first candidate and Flutterwave alternative for Nigeria-based operator, subject to verified eligibility, recurring payments, supported currencies and merchant capabilities. USD list prices with compliant NGN payment display where supported. Do not assume Stripe is available to a Nigeria-registered entity.

## Required modules
1. Landing/pricing/legal/auth and short optional four-step onboarding with skip at any point and completion checklist.
2. Multi-tenant workspace model: individual creator, business, agency, client, licensed content owner and platform admin; strong role-based permissions; agency client invitations and direct approval portal; audit trails and cross-tenant security tests.
3. Claude AI Strategist and delegated research/content/clip/schedule/analytics agents; manual/assisted/autonomous modes; explicit publishing authorization; agent limits, approvals, kill switch, timeouts, retries, scheduling and job cost limits.
4. Realtime Activity Center: event stream, job state, logs, failure reasons, pause/resume, retries, approval requests, notifications via in-app, email, web push where supported.
5. Content Studio, AI clipping, transcript editing, highlights ranked with explainable heuristics, natural-language edit instructions, FFmpeg/Remotion render jobs, visual previews, caption customization, export and versioning.
6. Content calendar, multi-platform variants, scheduling, platform-aware publishing adapters for YouTube, Instagram, TikTok, Facebook. Start implementation priority YouTube/Instagram then TikTok/Facebook. Use only official APIs and allowed scopes; implement OAuth refresh, permissions, rate limits, webhooks/polling, status reconciliation and truthful published status. External platform reviews may delay launch.
7. Analytics ingestion, platform permission and data availability states, reporting, feedback to strategist, retention and provenance.
8. Licensing: free creator onboarding and ownership/channel verification; explicit scoped permissions per source and use, creator portal, license records and evidence, allowed platforms/commercial rights/attribution/expiry/revocation; third-party music/footage checks or escalation; never infer license from public visibility or creator silence. Free authorized and private agreements first. Paid licensing marketplace/payouts only when legal, tax, KYC, provider and dispute requirements are resolved; UI may display 'coming later' rather than pretending payouts work.
9. Billing: Free $0, Starter $19, Creator Pro $49, Business $99, Agency $249, Enterprise custom. Treat credits and entitlements as provisional until cost benchmark. Three-day trial, one agent, one social account, maximum two short exports, strict usage cap, no premium generative video, no automatic paid conversion without consent. Permanent Free plan extremely limited. Paid-only top-ups, spending controls, transparent estimates, reservations/settlements/refunds, durable immutable ledger, webhook signature verification and replay protection, subscription renewals and failed payments. No automatic credit purchase by default.
10. PWA, installability, responsive design, dark/light/system, accessible and mobile-friendly approvals/monitoring. Offline only for safe cached UI, never misrepresent offline publish operations. Future Expo app-ready API contracts.
11. Admin dashboard, support tooling, feature flags, rate limits, abuse detection, consent/privacy and data export/delete workflows.

## Security, safety, compliance
Encrypt secrets and OAuth tokens; secure server-side permissions; least privilege; CSRF/XSS/SSRF protections; secure media URL ingestion; file scanning/type and duration limits; audit trails; idempotent webhooks and publish jobs; tenant isolation; observability; safe handling of copyrighted material; appropriate platform policy and data processing compliance. No scraping or publishing where prohibited. No claim of guaranteed virality or platform monetization eligibility. Autonomous agents must respect explicit per-workspace authorizations, license validity and hard cost budgets.

## Implementation sequence and proof
0. Read approved design handoff, inspect repo, map each design feature to implementation issue, flag blockers.
1. Monorepo scaffolding, local Docker Compose, environments, CI, database schema, auth, roles and tenancy.
2. Design-faithful frontend and responsive PWA.
3. Durable job framework, agent orchestration, activity feed, notifications.
4. Media upload/transcription/clip/render pipeline with real fixture-based tests.
5. Licensing checks and creator portal.
6. OAuth integrations and verified publish flows; report external approval blockers.
7. Agency/client approvals and analytics.
8. Billing, credit ledger, trial caps, top-ups, gateway webhooks.
9. Hardening, observability, load tests, accessibility tests, backups, staging, private beta.
10. Production readiness review and release.

For each milestone: implement, run automated tests, show commands and results, list real vs mocked integrations, record risks, and provide demo instructions. Preserve existing work; use migrations and feature flags. Never fabricate passing tests, deployed URLs, external API approval, completed features, or paid-provider access. Ask user for credentials only through secure environment setup, never in chat or source control.

## Launch acceptance gates — all applicable gates required
- Complete approved user journeys for creator, business, agency, client approver, and licensed content owner.
- Tenant/role isolation tests pass; security review and threat model complete.
- Upload → transcription → highlights → edit → render → approval → schedule → publish → analytics works end-to-end on at least one fully authorized production integration; each advertised platform verified separately.
- License/third-party-rights checks gate external-content use; expired/revoked rights stop future processing as required.
- Agent budgets, pause/kill switch, retries, idempotency, notification and audit trails tested.
- Trial and paid credits cannot be bypassed; ledger reconciles and payment webhooks are secure.
- Accessible Dark and Light themes, mobile-responsive PWA, reliable errors, backups, monitoring, and documented incident response.
- Load/cost benchmarks support plan allowances; no unbounded 'unlimited AI'.
- Private beta findings resolved and any missing capability is explicitly disclosed, not presented as finished.

## Final outputs
Runnable repository; migrations and seed data; architecture and API documentation; environment example; local/staging/production runbooks; test suite with results; security and accessibility audit; provider/app-review checklist; release checklist; feature-status matrix; cost model and credit calibration recommendations; deployment instructions; concise operational handover.

Start by asking for the approved design files and repository if not already provided. Otherwise begin milestone 0. Work iteratively and verify each milestone. Do not stop at mockups, pseudocode or a superficial scaffold. Do not claim completion until launch acceptance gates are met or explicitly report unmet gates.
