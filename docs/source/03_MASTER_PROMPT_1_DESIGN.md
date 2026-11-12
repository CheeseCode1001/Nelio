# MASTER PROMPT 1 — PRODUCT DESIGN & INTERACTIVE PROTOTYPE

You are Claude acting as a principal product designer, UX architect, design-system engineer, and frontend prototyper. Design a production-caliber autonomous AI social-media management SaaS, with AI video clipping as its flagship feature. This is a design/prototype phase ONLY. Do not build the production backend, integrate paid APIs, deploy, or begin implementation of production services. STOP and request explicit approval before production coding.

## Product vision
An AI social-media operating system for individual creators, businesses, and agencies. Users select goals, niches, target audiences and brand guidelines; connect social accounts; deploy Claude-powered agents to research, strategize, create, clip, edit, schedule, publish, analyze, and improve content. Manual, assisted, and autonomous modes; publishing, licensing, approval and spending safeguards apply in all modes. This is not merely a clipping app.

## Personas and multi-tenancy
Creator, business owner, agency owner/admin, agency staff, agency client approver, licensed content owner, platform administrator. Agencies manage isolated client workspaces, teams, roles, client logins and direct approvals, and audit logs. Content owners can join the Creator Licensing Marketplace free without subscribing.

## Key product surfaces — design ALL, with realistic interactions and states
1. Marketing site: homepage, use cases, pricing, product, licensing/creator partners, FAQ, legal, login/signup.
2. Authentication and optional 4-step guided onboarding: account type; goals/niche; optional social connections; automation mode. 'Skip for now' on every step; persistent checklist. Autonomous publishing off until explicit authorization.
3. Command Center / AI Agent Dashboard: agents, campaign status, goals, pending approvals, content pipeline, spending, alerts.
4. AI Strategist: conversational strategy, campaigns, brand voice, research, niche, audience, competitive insights, editorial plan, agent delegation.
5. AI Activity Center: realtime agent event feed, queued/running/blocked/completed/failed, job progress, logs, costs, pause/resume, retry, approvals, notifications.
6. Video Clipping Studio: upload/authorized imports; transcript and speaker timeline; viral-moment suggestions and ranking; source-to-clip traceability; clip selection; vertical reframing; caption styling; brand kits; natural-language editing; batch variants; preview and exports.
7. Content Studio: AI scripts, posts, images, templates, optional original AI video generation clearly marked as dependent on specialized provider integration, remixing within license.
8. Calendar, drafts, scheduling, platform-specific previews, approval workflows, publishing status and failure handling.
9. Analytics: per-platform metrics where authorized APIs permit; content/agent performance, campaign goals, experiments, attribution caveats.
10. Creator Licensing Marketplace: discovery, source verification, license details, free/paid/private terms, attribution, restrictions, expiration, third-party-rights flags, creator portal, revocation and usage audit. Public videos are NOT assumed licensed. Paid marketplace/payout functionality can be designed but must be marked pending implementation/compliance.
11. Social integrations: YouTube, Instagram, TikTok, Facebook; clear states for not connected, permissions needed, pending app approval, unsupported capability, expired token.
12. Agency hub: client workspaces, invitations, roles, client approval portal, activity logs, cross-client overview.
13. Billing and credits: Free, Starter $19, Creator Pro $49, Business $99, Agency $249, Enterprise custom. Illustrative plan entitlements must be clearly labeled pending unit-cost validation. Paid-plan top-ups, ledger, estimated/actual usage, spend limits, invoices, payment failures. 3-day trial: one agent, one social account, at most two short-video exports, tight hard compute/credit limits; no premium video generation. Permanent free plan extremely limited, no autonomous publishing.
14. Notifications, account/security, appearance, team settings, provider settings, API status, platform admin and support.
15. PWA install prompt, offline-safe states, responsive mobile/tablet/desktop. Future React Native + Expo mobile apps are expansion, NOT first-launch deliverables.

## Design language
Premium minimalist AI-native command center. One unified accessible design system with Dark (default), Light, and System settings; persistence across sessions. Full theme parity. Strong typography, thoughtful information hierarchy, accessible contrast, keyboard navigation, focus states, reduced motion, empty/error/loading/success states. Distinctive but restrained visual identity; propose brand/name placeholders if no name is supplied; do not assume a final brand. Design desktop and mobile navigation intentionally, especially video editing on small screens.

## Architecture constraints relevant to prototype
Next.js App Router, React, TypeScript, Tailwind, shadcn/ui. Use realistic mock data and local state; clearly label mocked integrations and demo AI responses. No production API keys. Prototype should be runnable and navigable, with functional theme switching, example approvals, sample agent runs, sample clipping editor interactions, credit usage display and agency-client flows. Do not falsely imply real publishing, transcription or AI generation.

## AI/media concepts to represent accurately
Claude is the sole general-purpose reasoning model initially. Transcription uses a provider-agnostic router with Deepgram and Whisper; Fast/Balanced/High Quality settings, cost/quality/failover. FFmpeg handles processing, Remotion compositions/captions, PySceneDetect scene boundaries. These are production architecture concepts; in this phase simulate them with realistic UI.

## Required design deliverables and order
A. Requirements inventory with traceability to each screen and workflow; identify unresolved assumptions.
B. Information architecture, sitemap, role/permission matrix and user journey maps.
C. Low-fidelity wireframes for all key screens and mobile variants.
D. Design tokens, typography, components, interaction patterns, accessibility specifications, Dark and Light themes.
E. High-fidelity screens for all key surfaces, including empty, loading, error, approval, credit-exhaustion and permission-denied states.
F. Runnable interactive frontend prototype using mock data; clear instructions to run locally.
G. UX audit: role isolation, approval controls, credit transparency, licensing restrictions, mobile responsiveness, PWA behavior.
H. Handoff package: screen inventory, component specs, routes, design tokens, sample data, acceptance criteria, annotated edge cases, screenshots and design decisions.

Work in checkpoints. Ask questions only for truly blocking choices, otherwise document reasonable assumptions. Do not omit screens to save tokens: continue across messages or files as needed. At the end, explicitly state: 'DESIGN PHASE COMPLETE — AWAITING USER APPROVAL'. Do not start production coding without explicit approval.
