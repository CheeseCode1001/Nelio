# Milestone 3 report: jobs, agents, activity, notifications

Branch `feat/milestone-3-jobs` · 13 Nov 2026

## 1. What was built

| Area | Screens / parts | State |
|---|---|---|
| Database | Agents, autonomous authorizations, runs and steps, activity feed, agent spend, notifications, deliveries, preferences, push subscriptions, transactional outbox | Applied to `nelio-dev` (3 migrations) |
| Job framework | Node worker: outbox dispatcher, step runner, notification delivery, scheduler, timeout sweep, weekly budget reset | Built; see §3 for what is verified |
| APP-04 Agents | Filled, Empty, Limit, Loading; cards and table | Built from real data |
| APP-05 Agent detail | Overview, Policy & permissions, Budget, Destinations, Runs, Stopped, Loading | Built; saves are validated, permission-checked and audited |
| APP-06 Create agent | 5 steps, Limit; duplicate a stopped agent | Built; Authorize dialog waits for connected accounts (§4) |
| APP-03 Activity | Filled, Empty, Loading, Reconnecting, Synced, Filtered; run panel, Pause / Resume run, run log | Built, live over private realtime channels |
| NT-01 Notifications | Page, top-bar panel, push prompt, Empty, Loading | Built; email and push need keys in production (§4) |
| SY-09 Pause all | Pause confirmation and Resume re-check | Built |
| APP-02 Strategist | Honest "needs setup" state on the Empty board layout | Gated until the Nelio AI service is connected |
| APP-01 Command Center | Now shows real agents, live activity, budget alerts and agent stats | Updated |

## 2. Rules the job framework enforces

- **The web app never talks to Redis.** Changes and the work they cause are written in one database transaction (the outbox); the worker moves them onto the queue. Nothing is lost if Redis or the worker is down.
- **Work never overspends.** Each step reserves its estimate first; if it doesn't fit the agent's weekly budget or per-run limit, the step blocks with the board's wording ("Needs 20 credits, 10 left in this agent's budget"). Actual use is settled and the rest released. The spend log is append-only.
- **Steps run strictly in order**, with retries and backoff, a 30-minute step limit and a 6-hour run deadline.
- **Pause all** holds queued work immediately; running work finishes or stops safely; published posts are untouched. **Resume** re-checks every agent's budget; agents over budget stay paused until Monday 00:00 in the workspace's time zone.
- **Honest states.** Steps that need later milestones (video processing, Nelio AI ranking, rendering) stop as "blocked" with a plain reason. Nothing is faked as done.
- **Security.** Every new table has row-level security with no browser access; live updates use private channels that only members of the workspace (or the person, for notifications) can join. Activity, spend and authorizations are append-only; deletion is possible only through an explicit purge switch for data-deletion jobs.

## 3. Verified (13 Nov 2026)

| Check | Result |
|---|---|
| Type check, lint | Pass |
| Unit tests | 39 pass (13 new: budget weeks, schedules, budget arithmetic) |
| Vendor-name check | 134 files, none in user-facing text |
| Production build | Pass |
| Migration on `nelio-dev` | RLS on every table, 0 browser-role privileges, triggers and realtime policy present |
| Job-framework check (`pnpm --filter @nelio/worker-node check:framework`, real database) | 21 of 21 database checks pass: numbering, idempotency, outbox, retry, budget block and wording, settle/refund totals, notifications, append-only, pause/resume with re-checks, honest blocking, timeouts |
| Same check, Redis part (outbox → queue, no double dispatch) | **Not run this time**: the hosted Redis refuses the connection after the local IP address changed (§5). It passed its connection test earlier today. |
| UI against the live canvas | 136 boards for built screens pulled and diffed. The only change: pill tab bars now stay on one row and scroll sideways; applied everywhere and the 29 boards synced |
| Responsive | Every Milestone 3 screen at 375, 768, 1024 and 1440 px: no sideways scrolling, nothing past the edge, tap targets 44 px (small links get the invisible tap area). Left as drawn: 11 px navigation labels, 11.5 px chart day labels, footer links |

## 4. Real vs not yet connected

| Integration | Status |
|---|---|
| Supabase database and realtime | Real (dev project) |
| Redis (Render Key Value, Frankfurt, free) | Real; currently unreachable from this machine (IP allow list) |
| Email for notifications | Not configured: email copies are recorded as "skipped", never "sent", until `NELIO_EMAIL_API_KEY` and `NELIO_EMAIL_FROM` are set (B-03) |
| Web push | Local development keys generated; real browsers can subscribe. Production needs its own key pair |
| Nelio AI (Strategist, ranking) | Not connected: Strategist shows "needs setup"; ranking steps block honestly (B-03) |
| Social accounts (destinations, autonomous publishing) | Milestone 6: destinations say "In development" / "Coming later"; autonomous mode and its Authorize dialog are shown but disabled |
| Video processing (sources) | Milestone 4: agents with no videos block with "No videos to work with yet" |
| Credit wallet | Milestone 8: agent budgets and the spend log are real; credit amounts stay provisional |

## 5. Risks and follow-ups

- **Redis access from a changing home IP.** Render's free Key Value only accepts listed IPs. Re-add your current IP in the dashboard (Networking → Inbound IP Restrictions) to run the worker locally; the production worker will run inside Render, where this doesn't apply.
- **Slow link to the database region** (0.2–1 s per round trip from Lagos to Ireland). Local development raises the transaction limit (`NELIO_TX_TIMEOUT_MS`); production workers sit next to the database.
- **Real app pages were checked through design previews** (`/dev/ui/...`), which render the same components with the boards' data; signing in with the test account was not possible from the agent.
- Agent detail "Overview" has no board: it reuses the Goal & sources and Last runs cards.

## 6. How to try it

1. `pnpm dev` (web) and, with Redis reachable, `pnpm worker:dev` (worker).
2. Sign in, open **Agents → New agent**, create one, then **Run now**: the run appears live in **Activity**, blocks at "Upload & check file" with "No videos to work with yet", and the Command Center shows it.
3. Try **Pause all** in the top bar, then **Resume** from the strip.
4. On **Notifications**, turn on browser notifications to save this device.
5. Design previews of every state: `/dev/ui/agents`, `/dev/ui/agent-detail`, `/dev/ui/create-agent`, `/dev/ui/activity`, `/dev/ui/notifications`, `/dev/ui/strategist`.
