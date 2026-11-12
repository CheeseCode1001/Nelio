# Nelio: Screen inventory (handoff)

Every product screen, its route, its high-fidelity board on the design canvas, its state sheet, roles and requirement trace. Board files live on the canvas and in `docs/design/E_hifi/canvas/`.

## Screens (94)

| ID | Screen | Route | Board | Canvas page | State sheet | Roles | Traces to |
|---|---|---|---|---|---|---|---|
| M-01 | Home | `/` | `Home.dc.html` | Public site | — | Everyone | MP1-01 |
| M-02 | Product | `/product` | `Product.dc.html` | Public site | — | Everyone | MP1-01, D-07–D-09 |
| M-03 | Use cases | `/use-cases/[creators|businesses|agencies]` | `UseCases.dc.html` | Public site | — | Everyone | MP1-01, J-02 |
| M-04 | Pricing | `/pricing` | `Pricing.dc.html` | Public site | — | Everyone | D-10–D-13, AS-1 |
| M-05 | Licensing & Creator Partners | `/licensing` | `Licensing.dc.html` | Public site | — | Everyone | D-15, MP1-10 |
| M-06 | FAQ | `/faq` | `FAQ.dc.html` | Public site | — | Everyone | MP1-01 |
| M-07 | Legal | `/legal/[slug]` | `Legal.dc.html` | Public site | — | Everyone | AS-7 |
| M-08 | Status | `/status` | `Status.dc.html` | Public site | — | Everyone | D-01, D-06 |
| AU-01 | Sign up | `/signup` | `SignUp.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | New users | FR-01 |
| AU-02 | Log in | `/login` | `LogIn.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | All | FR-01 |
| AU-03 | Verify email | `/verify-email` | `VerifyEmail.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | New users | FR-01 |
| AU-04 | Reset password | `/reset-password` | `ResetPassword.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | All | FR-01 |
| AU-05 | Two-step verification | `/mfa` | `MFA.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | All (required for org owners & admins: proposal) | FR-01, ARCH §15 |
| AU-06 | Accept invitation | `/invite/[token]` | `AcceptInvite.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | Invited staff & clients | FR-03, J-02 |
| AU-07 | Join as content owner | `/creators/join` | `ContentOwnerJoin.dc.html` | Sign in & onboarding | `StatesSystem.dc.html` | Licensed content owners | D-15, J-06 |
| ON-01 | Account type | `/onboarding/account-type` | `OnbAccountType.dc.html` | Sign in & onboarding | `StatesCore.dc.html` | New operators | FR-02, D-04, C-1 |
| ON-02 | Goals & niche | `/onboarding/goals` | `OnbGoals.dc.html` | Sign in & onboarding | `StatesCore.dc.html` | New operators | FR-02 |
| ON-03 | Connect accounts | `/onboarding/connect` | `OnbConnect.dc.html` | Sign in & onboarding | `StatesCore.dc.html` | New operators | FR-02, MP1-11, D-06 |
| ON-04 | Automation mode | `/onboarding/automation` | `OnbAutomation.dc.html` | Sign in & onboarding | `StatesCore.dc.html` | New operators | FR-02, D-05, D-11, PE-01 |
| ON-05 | Setup checklist | `/w/[ws]/home (widget)` | `SetupChecklist.dc.html` | Command Center & AI | `StatesCore.dc.html` | Owners | D-04, C-7 |
| APP-01 | Command Center | `/w/[ws]/home` | `CommandCenter.dc.html` | Command Center & AI | `StatesCore.dc.html` | All operator roles | FR-04, FR-11, ON-05, PE-05 |
| APP-02 | AI Strategist | `/w/[ws]/strategist` | `Strategist.dc.html` | Command Center & AI | `StatesCore.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-05, J-04, D-07 |
| APP-03 | AI Activity Center | `/w/[ws]/activity` | `Activity.dc.html` | Command Center & AI | `StatesCore.dc.html` | All operator roles (filtered) | FR-11, AC-05, AC-08, J-10 |
| APP-04 | Agents | `/w/[ws]/agents` | `Agents.dc.html` | Command Center & AI | `StatesCore.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-04, PE-04 |
| APP-05 | Agent detail | `/w/[ws]/agents/[id]` | `AgentDetail.dc.html` | Command Center & AI | `StatesCore.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor (edit: owners/managers) | FR-04, PE-02, AC-08 |
| APP-06 | Create agent · authorize autonomous | `/w/[ws]/agents/new` | `CreateAgent.dc.html` | Command Center & AI | `StatesCore.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-04, D-05, D-12 |
| APP-07 | Workspace switcher | `(top bar menu)` | `WorkspaceSwitcher.dc.html` | Command Center & AI | `StatesCore.dc.html` | All operator roles | FR-03, AC-02 |
| NT-01 | Notifications | `/w/[ws]/notifications (+ panel)` | `Notifications.dc.html` | Command Center & AI | `StatesCore.dc.html` | All | FR-12, AC-06 |
| CL-01 | Media library | `/w/[ws]/media` | `MediaLibrary.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-06 |
| CL-02 | Upload / authorized import | `/w/[ws]/media/upload` | `Upload.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-06, FR-08, D-08, J-01 |
| CL-03 | Clipping Studio | `/w/[ws]/studio/[projectId]` | `ClippingStudio.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-06, FR-07, MP1-06a |
| CL-04 | Batch variants | `/w/[ws]/studio/[projectId]/variants` | `Variants.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-07, MP1-06a |
| CL-05 | Render & export queue | `/w/[ws]/exports` | `Exports.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-06, AC-01, D-12 |
| CS-01 | Content Studio | `/w/[ws]/content` | `ContentStudio.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | MP1-07 |
| CS-02 | Post composer | `/w/[ws]/content/compose` | `Composer.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-07, FR-09, MP1-07 |
| CS-03 | Original AI video (gated) | `/w/[ws]/content/video-generation` | `AIVideo.dc.html` | Clipping & Content | `StatesClipping.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | MP1-07a, Q-2 |
| PB-01 | Content calendar | `/w/[ws]/calendar` | `Calendar.dc.html` | Calendar, approvals & publishing | `StatesPublishing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor, Viewer | FR-10, PE-06 |
| PB-02 | Drafts | `/w/[ws]/drafts` | `Drafts.dc.html` | Calendar, approvals & publishing | `StatesPublishing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-09, FR-10 |
| PB-03 | Post detail | `/w/[ws]/posts/[id]` | `PostDetail.dc.html` | Calendar, approvals & publishing | `StatesPublishing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-09, AC-04, PE-06, J-10 |
| PB-04 | Approvals queue | `/w/[ws]/approvals` | `Approvals.dc.html` | Calendar, approvals & publishing | `StatesPublishing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-10, J-03 |
| PB-05 | Approval detail | `/w/[ws]/approvals/[id]` | `ApprovalDetail.dc.html` | Calendar, approvals & publishing | `StatesPublishing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-10, AC-03, AS-B1 |
| AN-01 | Analytics overview | `/w/[ws]/analytics` | `Analytics.dc.html` | Analytics | — | Creator, Business, Agency owner/admin, Workspace manager, Editor, Viewer | FR-13 |
| AN-02 | Content performance | `/w/[ws]/analytics/content` | `ContentPerformance.dc.html` | Analytics | — | Creator, Business, Agency owner/admin, Workspace manager, Editor, Viewer | FR-13 |
| AN-03 | Agent performance | `/w/[ws]/analytics/agents` | `AgentPerformance.dc.html` | Analytics | — | Creator, Business, Agency owner/admin, Workspace manager, Editor, Viewer | FR-13, MP1-09 |
| AN-04 | Campaigns & experiments | `/w/[ws]/analytics/campaigns` | `Campaigns.dc.html` | Analytics | — | Creator, Business, Agency owner/admin, Workspace manager, Editor, Viewer | MP1-09 |
| LI-01 | Marketplace discovery | `/w/[ws]/licensing` | `Marketplace.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-08, J-07 |
| LI-02 | Source detail & terms | `/w/[ws]/licensing/sources/[id]` | `SourceDetail.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-08, J-07 |
| LI-03 | Request / accept license | `/w/[ws]/licensing/sources/[id]/request` | `RequestLicense.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Owners, managers (editors: request only) | FR-08, J-07 |
| LI-04 | My licenses | `/w/[ws]/licensing/mine` | `MyLicenses.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-08, AC-09, J-05 |
| LI-05 | Creator portal overview | `/creator` | `CreatorOverview.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | D-15, J-06 |
| LI-06 | Ownership verification | `/creator/verify` | `Verification.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | FR-08, J-06 |
| LI-07 | Licensing terms | `/creator/terms` | `LicenseTerms.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | FR-08, D-15 |
| LI-08 | Usage audit | `/creator/usage` | `Usage.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | FR-08, J-05 |
| LI-09 | Revoke a license | `/creator/revocations` | `Revoke.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | J-05, AC-09 |
| LI-10 | Paid licensing & payouts (gated) | `/creator/payouts` | `Payouts.dc.html` | Licensing & Creator Portal | `StatesLicensing.dc.html` | Content owner | D-15 |
| IN-01 | Social connections hub | `/w/[ws]/connections` | `Connections.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Creator, Business owner, Agency owner/admin, Workspace manager | MP1-11, J-11, D-06 |
| IN-02 | Connection detail | `/w/[ws]/connections/[platform]` | `ConnectionDetail.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Creator, Business owner, Agency owner/admin, Workspace manager | MP1-11, J-11 |
| AG-01 | Agency hub | `/org/[org]` | `AgencyHub.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Agency owner/admin | MP1-12, FR-03 |
| AG-02 | Client workspaces | `/org/[org]/clients` | `Clients.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Agency owner/admin | FR-03, J-02 |
| AG-03 | Client workspace settings | `/org/[org]/clients/[ws]` | `ClientSettings.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Agency owner/admin | FR-03, D-Q4, AS-B6 |
| AG-04 | Team & invitations | `/org/[org]/team` | `Team.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Owner/admin; managers (assigned ws) | FR-03, J-02 |
| AG-05 | Roles & permissions | `/org/[org]/roles` | `Roles.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Agency owner/admin | FR-03, B §6 |
| AG-06 | Audit log | `/org/[org]/audit` | `AuditLog.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Owners, admins; managers (assigned) | FR-03, AC-03 |
| CP-01 | Client portal home | `/portal/[ws]` | `ClientPortal.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Client approver | MP1-12, FR-10, J-03 |
| CP-02 | Client approval detail | `/portal/[ws]/approvals/[id]` | `ClientApproval.dc.html` | Connections, agency & client portal | `StatesAgency.dc.html` | Client approver | FR-10, AC-03, D-Q4 |
| BI-01 | Plan & usage | `/org/[org]/billing` | `Billing.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin (managers: view) | FR-14, D-10 |
| BI-02 | Plans & checkout | `/org/[org]/plans` | `Plans.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin | FR-14, D-14 |
| BI-03 | Credit ledger | `/org/[org]/ledger` | `Ledger.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin (managers: view) | FR-14, AC-07 |
| BI-04 | Top-ups | `/org/[org]/top-up` | `TopUp.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin | D-13 |
| BI-05 | Spend limits | `/org/[org]/limits` | `SpendLimits.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin (managers: request) | FR-14, AC-07, J-08 |
| BI-06 | Invoices | `/org/[org]/invoices` | `Invoices.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin | FR-14 |
| BI-07 | Payment failure | `/org/[org]/billing (state)` | `PaymentFailed.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin | J-14, AS-B3 |
| BI-08 | Trial status | `(banner + /org/[org]/billing)` | `Trial.dc.html` | Billing & credits | `StatesBilling.dc.html` | Creator, Business owner, Agency owner/admin | D-12, J-09 |
| ST-01 | Profile | `/account/profile` | `Profile.dc.html` | Settings | `StatesSystem.dc.html` | All | FR-01 |
| ST-02 | Security | `/account/security` | `Security.dc.html` | Settings | `StatesSystem.dc.html` | All | FR-01 |
| ST-03 | Appearance | `/account/appearance` | `Appearance.dc.html` | Settings | `StatesSystem.dc.html` | All | D-03 |
| ST-04 | Notification preferences | `/account/notifications` | `NotificationPrefs.dc.html` | Settings | `StatesSystem.dc.html` | All | FR-12 |
| ST-05 | Workspace members | `/w/[ws]/settings/members` | `Members.dc.html` | Settings | `StatesSystem.dc.html` | Owners, managers | FR-03 |
| ST-06 | Brand kits | `/w/[ws]/settings/brand-kits` | `BrandKits.dc.html` | Settings | `StatesSystem.dc.html` | Creator, Business, Agency owner/admin, Workspace manager, Editor | FR-07 |
| ST-07 | AI & processing | `/w/[ws]/settings/ai` | `AISettings.dc.html` | Settings | `StatesSystem.dc.html` | Owners, managers | D-07, D-08 |
| ST-08 | Integration status | `/w/[ws]/settings/integrations` | `IntegrationStatus.dc.html` | Settings | `StatesSystem.dc.html` | Owners, managers | D-01 |
| ST-09 | Privacy & data | `/account/privacy` | `Privacy.dc.html` | Settings | `StatesSystem.dc.html` | All | NFR-PRIV, AS-9 |
| ST-10 | Workspace settings | `/w/[ws]/settings` | `WorkspaceSettings.dc.html` | Settings | `StatesSystem.dc.html` | Owners, managers | PE-05, J-12 |
| AD-01 | Ops overview | `/admin` | `AdminOps.dc.html` | Platform admin | — | Platform admin | FR-15, J-13 |
| AD-02 | Jobs & dead-letter | `/admin/jobs` | `AdminJobs.dc.html` | Platform admin | — | Platform admin | FR-15 |
| AD-03 | Audit search | `/admin/audit` | `AdminAudit.dc.html` | Platform admin | — | Platform admin | FR-15 |
| AD-04 | License review | `/admin/licenses` | `AdminLicenses.dc.html` | Platform admin | — | Platform admin | FR-15 |
| AD-05 | Support access | `/admin/support` | `AdminSupport.dc.html` | Platform admin | — | Platform admin | FR-15, B §6 note 9 |
| AD-06 | Abuse & moderation | `/admin/abuse` | `AdminAbuse.dc.html` | Platform admin | — | Platform admin | FR-15 |
| AD-07 | Diagnostics | `/admin/diagnostics` | `AdminDiagnostics.dc.html` | Platform admin | — | Platform admin | FR-15, AT-13 |
| AD-08 | Feature flags | `/admin/flags` | `AdminFlags.dc.html` | Platform admin | — | Platform admin | MP2 §11 |
| SY-01 | Install prompt (PWA) | `(in-app prompt)` | `PWAInstall.dc.html` | System screens | `StatesSystem.dc.html` | All | MP1-15, D-02 |
| SY-02 | Offline state | `/offline` | `Offline.dc.html` | System screens | `StatesSystem.dc.html` | All | MP1-15 |
| SY-03 | Error & permission pages | `not-found · /denied · /maintenance` | `ErrorPages.dc.html` | System screens | `StatesSystem.dc.html` | All | AC-02, NFR-SEC |

## Supporting boards (28)

Foundations, the interactive onboarding flow, state sheets, mobile and light-theme boards.

| Board | Title | Canvas page |
|---|---|---|
| `Main.dc.html` | Nelio design foundations | Foundations |
| `Onboarding.dc.html` | Onboarding flow (interactive) | Sign in & onboarding |
| `StatesCore.dc.html` | States · Command Center, agents & Nelio AI | States |
| `StatesClipping.dc.html` | States · Clipping & Content Studio | States |
| `StatesPublishing.dc.html` | States · Calendar, approvals & publishing | States |
| `StatesLicensing.dc.html` | States · Licensing & Creator Portal | States |
| `StatesAgency.dc.html` | States · Connections, agency & client portal | States |
| `StatesBilling.dc.html` | States · Billing, credits & trial | States |
| `StatesSystem.dc.html` | States · Sign-in, settings & system | States |
| `MobileHome.dc.html` | Mobile · Command Center | Mobile |
| `MobileActivity.dc.html` | Mobile · Activity | Mobile |
| `MobileApprovals.dc.html` | Mobile · Approvals | Mobile |
| `MobileClientApproval.dc.html` | Mobile · Client approval | Mobile |
| `MobileClipTrim.dc.html` | Mobile · Clip review & trim | Mobile |
| `MobileCalendar.dc.html` | Mobile · Calendar | Mobile |
| `MobileNotifications.dc.html` | Mobile · Notifications | Mobile |
| `MobileOnboarding.dc.html` | Mobile · Onboarding | Mobile |
| `MobileAgent.dc.html` | Mobile · Agent | Mobile |
| `MobileUpload.dc.html` | Mobile · Upload | Mobile |
| `LightCommandCenter.dc.html` | Light · APP-01 Command Center | Light theme |
| `LightStrategist.dc.html` | Light · APP-02 AI Strategist | Light theme |
| `LightClippingStudio.dc.html` | Light · CL-03 Clipping Studio | Light theme |
| `LightPostDetail.dc.html` | Light · PB-03 Post detail | Light theme |
| `LightClientApproval.dc.html` | Light · CP-02 Client approval detail | Light theme |
| `LightPricing.dc.html` | Light · M-04 Pricing | Light theme |
| `LightOnboarding.dc.html` | Light · ON-04 Automation mode | Light theme |
| `LightMobileHome.dc.html` | Light · Mobile · Command Center | Light theme |
| `LightMobileClientApproval.dc.html` | Light · Mobile · Client approval | Light theme |
