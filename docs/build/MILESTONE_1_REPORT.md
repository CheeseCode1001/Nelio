# Milestone 1 report: scaffolding, schema, auth, roles, tenancy

Date: 12 Nov 2026 · Branch: `feat/milestone-1-foundation` · Status: **built and verified end to end on the dev project**, except the items listed in §4.

## 1. What was built

| Area | Delivered |
|---|---|
| Monorepo | pnpm workspace: `apps/web` (Next.js 16, React 19, Tailwind 4), `packages/ui`, `packages/domain`, `packages/db` (Prisma 7), `packages/config`, `infra/`, `scripts/`. TypeScript strict everywhere. |
| Design system base | `tokens.css` generated from `tokens.json`; icons, navigation icons and all 32 illustrations exported from the design generator; Button, Field, Select, Checkbox, Chip, Sticker, Banner, Card, avatars, Logo, photo carousel and strip, responsive dialog (bottom sheet under 768 px), nav item, list, empty state; GSAP motion wrapper that does nothing under reduced motion. |
| Database | 9 tables, 9 enums: users, organizations, memberships, workspaces, invitations, creator profiles, audit events, idempotency keys. Applied to the `nelio-dev` project. Row-level security on every table, no policies, browser roles hold no privileges. Audit trail is append-only by trigger. |
| Roles and permissions | The B §6 matrix transcribed cell for cell (35 capabilities × 10 roles) with `can`, `canInOrg`, `canSeeWorkspace`, surfaces and top-bar visibility. |
| Tenancy | Every workspace lookup is filtered by the person's memberships. Unknown and forbidden workspaces give the same answer (SY-04). Composite foreign keys stop a membership or invitation pairing a workspace with another organization. |
| Auth | Sign up, log in, email verification with resend, password reset, two-step verification (authenticator app: setup and challenge), invitation acceptance bound to the invited email and single-use, content-owner join, sign out. Sessions are verified server-side on every request; post-login redirects accept same-site paths only. |
| Screens | AU-01 to AU-07, APP-07 Workspace switcher, SY-08 Account menu, SY-03 Not found, SY-04 Access denied, SY-05 Server error. Desktop and mobile. |
| API | `GET /api/workspaces`, `POST /api/workspaces/invitations`, `GET /api/health`, `/auth/callback`, `/auth/continue`. |
| Security headers | Content Security Policy, frame denial, no-sniff, referrer policy, HSTS, permissions policy. |
| CI | `.github/workflows/ci.yml`: install, generate, token sync, typecheck, lint, tests, vendor-name check, build; a PostgreSQL job that applies every migration and runs the integrity checks; Compose file validation. **Written, not yet run** (nothing has been pushed). |
| Local stack | `infra/docker-compose.yml` (PostgreSQL, Redis, S3-compatible storage, mail catcher). **Not run on this machine** (no Docker, see B-04). |

## 2. Commands and real results (this machine, 12 Nov 2026)

| Command | Result |
|---|---|
| `pnpm install` | Passed on the second attempt (first timed out downloading on a slow connection). 604 packages. |
| `pnpm db:generate` | Passed. Client 7.10.1 generated. |
| `pnpm typecheck` | Passed: 5 packages, 0 errors. |
| `pnpm lint` | Passed: 0 errors, 0 warnings (after fixing 3 errors it found). |
| `pnpm test` | Passed: 1 file, **19 of 19 tests** (permission matrix, tenant isolation, role rules, surfaces, validation, open-redirect guard). |
| `pnpm check:vendors` | Passed: 40 files scanned, no vendor names in user-facing source. |
| `pnpm build` | Passed: compiled in 35 s, 19 routes. |
| `packages/db/tests/integrity.sql` on `nelio-dev` | **14 of 14 checks passed**, fixtures rolled back. |
| Supabase security advisor | 0 errors, 0 warnings. 9 notices "RLS enabled, no policy", which is the intended design ([explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). |

Seen in the browser on the dev server: sign-up (filled, validation errors with the board's copy), log in at 375 px, verify email, access denied. The preview pane pauses animation frames, so entrance animations were checked by code, not by eye.

## 3. Real vs mocked

| Integration | State |
|---|---|
| Supabase Auth | **Real** (dev project). Forms call it directly. No account was created during testing, to avoid sending email to a made-up address. |
| Supabase PostgreSQL | **Real** schema, verified by SQL. The app's own connection is **not yet exercised**: `NELIO_DATABASE_URL` is not set (§5). |
| Email | Supabase's built-in mailer (a few emails per hour, development only). Our own email service arrives in Milestone 3. |
| Invitation emails | **Not sent.** The API returns the invite link for the inviter to share until Milestone 3. |
| Google sign-in | **Not built.** The "Continue with Google" button and the "or" divider on the boards are left out until a Google OAuth client exists (B-14). |
| Recovery codes for two-step verification | **Not built** (B-13). The Setup board's recovery-codes card is left out rather than shown not working. |
| Redis, object storage, payments, social platforms | Not used in this milestone. |

## 4. End-to-end verification (12 Nov 2026, dev server against `nelio-dev`)

Two confirmed test accounts were created directly in the dev auth database with `packages/db/scripts/create-test-user.mjs` (so no email went to a made-up address), then everything below was done through the running app.

| # | Check | Result |
|---|---|---|
| 1 | Opening a workspace address while signed out | Sent to log in, with the destination kept |
| 2 | Wrong password | "That email and password don’t match" banner |
| 3 | Correct password, first sign-in | User, organization and workspace created; landed on `/w/ada-studio/home` |
| 4 | `GET /api/workspaces` | Lists only the person's own workspace |
| 5 | Unknown workspace address | Access denied page |
| 6 | Workspace switcher and account menu | Open as bottom sheets at phone width; show the right workspace, name and surfaces |
| 7 | Creator inviting staff | 403 (the matrix gives creators no team management) |
| 8 | Invalid invitation body | 422 with field messages |
| 9 | Agency owner inviting a client approver | 201, link returned, expires in 7 days, only the token's hash stored |
| 10 | Owner opening that invitation | "This invite is for …" mismatch state |
| 11 | Made-up invitation token | "This invite expired", nothing about any workspace revealed |
| 12 | Sign out | Back at log in; API answers 401 |
| 13 | Invited person logs in and accepts | Membership created as client approver; landed on the client portal stand-in |
| 14 | Same invitation opened again | "You’ve already joined" |
| 15 | Client approver opening the operator app | Sent to the client portal |
| 16 | Client approver inviting a manager | 403 |
| 17 | Owner opening another tenant's workspace and portal | Access denied for both; not in their workspace list |
| 18 | Audit trail | 2 users created, 2 organizations created, 1 invitation created, 1 accepted |

**Found and fixed during verification**

- The machine has its own user-level `DATABASE_URL` (from another project), which overrode this project's file, so the app tried another database and was refused. Nothing was written there. The variables are now `NELIO_DATABASE_URL` and `NELIO_DIRECT_URL`.
- After log-in the address bar kept `/auth/continue`. Sign-in now redirects straight to the person's home.
- The migration tool's history table had no row-level security. Locked in migration `20261112230000_lock_migration_history`.

**Still not verified**

- Sign-up through the form with a real inbox: confirmation email, the link back, and "resend". Needs a real address you control.
- Password reset by email, for the same reason.
- Two-step verification with a real authenticator app.
- The invitation path for a brand-new person (sign up from the invite page), which also depends on the confirmation email.
- Dark theme, 768 and 1280 px widths, keyboard pass and automated accessibility checks on the new screens.
- Visual snapshot comparison against the boards (Playwright arrives in Milestone 2).
- CI on GitHub: nothing has been pushed.

Screens therefore stay `in progress` in `DESIGN_TRACEABILITY.md`, not `done`.

**Left in the dev database:** the two test accounts (`e2e.owner@…` and `e2e.other@nelio-test.invalid`), their workspaces, and the test organization switched to an agency for check 9.

## 5. Setup (done on 12 Nov 2026)

1. **Database connection string.** In the Supabase dashboard open **Connect**, copy the *Transaction pooler* string into `NELIO_DATABASE_URL` and the *Session pooler* string into `NELIO_DIRECT_URL` in `apps/web/.env.local`. Never paste them in chat.
2. **Auth redirect address.** In **Authentication → URL Configuration** set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs.

Both migrations are marked as applied in the migration history.

## 6. Demo

```bash
pnpm install
pnpm db:generate
pnpm dev
```

Open `http://localhost:3000`. Sign up at `/signup` with a real address, confirm from your inbox, and you land in your workspace. Other pages: `/login`, `/reset-password`, `/creators/join`, `/mfa?setup=1` (signed in), `/denied`, and any unknown address for Not found.

## 7. Risks and notes

- **Small machine.** Install took about 15 minutes and the build about a minute with under 0.5 GB of free memory. Heavier milestones (media, end-to-end tests) should run in CI.
- **Next.js 16 uses `proxy.ts`** in place of `middleware.ts`; Prisma is pinned to 7.10.1 because the `latest` tag is a release candidate; TypeScript is pinned to 5.9.
- **Dev-only stand-ins.** `/w/[ws]/home`, `/portal/[ws]` and `/creator` show a plain "built in Milestone N" notice after real access checks. They are not part of the design and are replaced by the real screens.
- **Top bar** shows only the switcher and account menu. Search, credits, Pause all and notifications join in Milestones 2 and 3.
- **Support address** is unset, so "Contact support" buttons are hidden until `NEXT_PUBLIC_SUPPORT_EMAIL` is set.
- **Photos** are served from `apps/web/public/photos` for now; they move to the CDN with `next/image` in Milestone 2. Rights are still unconfirmed (B-05).
