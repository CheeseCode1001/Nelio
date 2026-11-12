# Nelio: Screen & state inventory (v2.3)

Every screen on the design canvas, the boards (states) that show it, and its mobile board.
Canvas: https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu · Board source files: `docs/design/E_hifi/canvas/` · Routes: `docs/design/B_INFORMATION_ARCHITECTURE.md` §5.

States: *Filled* = default board name (no suffix) · `-Empty` = first-use with illustration · `-Loading` = skeleton · other suffixes = specific states. Mobile boards (`*-Mobile.dc.html`) show every state of the screen at 390 px.


## 0 · Foundations & illustrations

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| Nelio design foundations v2 | `Main` | — |
| Illustration kit | `Illustrations` | — |

## 0b · Motion (GSAP)

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| Motion system (GSAP) | `Motion` | — |

## 1 · Public site

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| M-01 Home | `Home` | — |
| M-02 Product | `Product` | — |
| M-03 Use cases | `UseCases` | — |
| M-04 Pricing | `Pricing` | — |
| M-05 Licensing & Creator Partners | `Licensing` | — |
| M-06 FAQ | `FAQ` | — |
| M-07 Legal | `Legal` | — |
| M-08 Status | `Status` | `Home-Mobile`, `Product-Mobile`, `UseCases-Mobile`, `Pricing-Mobile`, `Licensing-Mobile`, `FAQ-Mobile`, `Legal-Mobile`, `Status-Mobile` |

## 2 · Sign in & onboarding

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| AU-01 Sign up | `SignUp`, `SignUp-Error`, `SignUp-Taken`, `SignUp-Submitting` | `SignUp-Mobile` |
| AU-02 Log in | `LogIn`, `LogIn-Error`, `LogIn-Locked` | `LogIn-Mobile` |
| AU-03 Verify email | `VerifyEmail`, `VerifyEmail-Resent`, `VerifyEmail-Expired` | `VerifyEmail-Mobile` |
| AU-04 Reset password | `ResetPassword`, `ResetPassword-Sent`, `ResetPassword-Newpass`, `ResetPassword-Expired` | `ResetPassword-Mobile` |
| AU-05 Two-step verification | `MFA`, `MFA-Setup`, `MFA-Wrong` | `MFA-Mobile` |
| AU-06 Accept invitation | `AcceptInvite`, `AcceptInvite-Expired`, `AcceptInvite-Accepted`, `AcceptInvite-Mismatch` | `AcceptInvite-Mobile` |
| AU-07 Join as content owner | `ContentOwnerJoin` | `ContentOwnerJoin-Mobile` |
| ON-01 Account type | `OnbAccountType`, `OnbAccountType-Selected` | `OnbAccountType-Mobile` |
| ON-02 Goals & niche | `OnbGoals` | `OnbGoals-Mobile` |
| ON-03 Connect accounts | `OnbConnect`, `OnbConnect-Connected`, `OnbConnect-Limit` | `OnbConnect-Mobile` |
| ON-04 Automation mode | `OnbAutomation`, `OnbAutomation-Autonomous`, `OnbAutomation-Free` | `OnbAutomation-Mobile` |
| ON-05 All set | `OnbDone` | `OnbDone-Mobile` |
| ON-FLOW Onboarding (interactive) | `Onboarding` | `Onboarding-Mobile` |

## 3 · Command Center & AI

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| APP-01 Command Center | `CommandCenter`, `CommandCenter-Empty`, `CommandCenter-Loading`, `CommandCenter-Paused`, `CommandCenter-Trial`, `CommandCenter-Pastdue` | `CommandCenter-Mobile` |
| APP-02 AI Strategist | `Strategist`, `Strategist-Empty`, `Strategist-Thinking`, `Strategist-Error`, `Strategist-History` | `Strategist-Mobile` |
| APP-03 AI Activity Center | `Activity`, `Activity-Empty`, `Activity-Loading`, `Activity-Reconnecting`, `Activity-Synced`, `Activity-Filtered` | `Activity-Mobile` |
| APP-04 Agents | `Agents`, `Agents-Empty`, `Agents-Loading`, `Agents-Limit` | `Agents-Mobile` |
| APP-05 Agent detail | `AgentDetail`, `AgentDetail-Budget`, `AgentDetail-Destinations`, `AgentDetail-Runs`, `AgentDetail-Loading`, `AgentDetail-Reauth`, `AgentDetail-Stopped` | `AgentDetail-Mobile` |
| APP-06 Create agent | `CreateAgent-Goal`, `CreateAgent-Sources`, `CreateAgent-Destinations`, `CreateAgent-Budget`, `CreateAgent`, `CreateAgent-Authorize`, `CreateAgent-Limit` | `CreateAgent-Goal-Mobile` |
| APP-07 Workspace switcher | `WorkspaceSwitcher`, `WorkspaceSwitcher-Search` | `WorkspaceSwitcher-Mobile` |
| NT-01 Notifications | `Notifications`, `Notifications-Empty`, `Notifications-Loading`, `Notifications-Panel`, `Notifications-Push` | `Notifications-Mobile` |

## 4 · Clipping & Content

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| CL-01 Media library | `MediaLibrary`, `MediaLibrary-Empty`, `MediaLibrary-Loading`, `MediaLibrary-Storage` | `MediaLibrary-Mobile` |
| CL-02 Upload | `Upload`, `Upload-Uploading`, `Upload-Wrongtype`, `Upload-Norights`, `Upload-Lowcredits` | `Upload-Mobile` |
| CL-03 Clipping Studio | `ClippingStudio`, `ClippingStudio-Processing`, `ClippingStudio-Loading`, `ClippingStudio-Blocked`, `ClippingStudio-Unsaved`, `ClippingStudio-Estimate`, `ClippingStudio-Queued` | `ClippingStudio-Mobile` |
| CL-04 Batch variants | `Variants`, `Variants-Generating`, `Variants-Lowcredits` | `Variants-Mobile` |
| CL-05 Exports | `Exports`, `Exports-Empty`, `Exports-Loading`, `Exports-Trial` | `Exports-Mobile` |
| CS-01 Content Studio | `ContentStudio`, `ContentStudio-Empty`, `ContentStudio-Loading` | `ContentStudio-Mobile` |
| CS-02 Post composer | `Composer`, `Composer-Invalid`, `Composer-Nodest`, `Composer-Licensed` | `Composer-Mobile` |
| CS-03 Original AI video | `AIVideo` | `AIVideo-Mobile` |

## 5 · Calendar, approvals & publishing

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| PB-01 Content calendar | `Calendar`, `Calendar-Empty`, `Calendar-Loading`, `Calendar-Month`, `Calendar-Drag` | `Calendar-Mobile` |
| PB-02 Drafts | `Drafts`, `Drafts-Empty`, `Drafts-Loading` | `Drafts-Mobile` |
| PB-03 Post detail | `PostDetail`, `PostDetail-Loading`, `PostDetail-Published`, `PostDetail-Failed`, `PostDetail-Uploading`, `PostDetail-Held`, `PostDetail-Expired` | `PostDetail-Mobile` |
| PB-04 Approvals | `Approvals`, `Approvals-Empty`, `Approvals-Loading`, `Approvals-Internal` | `Approvals-Mobile` |
| PB-05 Approval detail | `ApprovalDetail`, `ApprovalDetail-Loading`, `ApprovalDetail-Allapproved`, `ApprovalDetail-Invalidated` | `ApprovalDetail-Mobile` |

## 6 · Analytics

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| AN-01 Analytics overview | `Analytics`, `Analytics-Empty`, `Analytics-Loading`, `Analytics-Delayed` | `Analytics-Mobile` |
| AN-02 Content performance | `ContentPerformance`, `ContentPerformance-Empty`, `ContentPerformance-Loading` | `ContentPerformance-Mobile` |
| AN-03 Agent performance | `AgentPerformance`, `AgentPerformance-Empty`, `AgentPerformance-Loading` | `AgentPerformance-Mobile` |
| AN-04 Campaigns & experiments | `Campaigns`, `Campaigns-Empty`, `Campaigns-Loading` | `Campaigns-Mobile` |

## 7 · Licensing

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| LI-01 Marketplace | `Marketplace`, `Marketplace-Empty`, `Marketplace-Loading` | `Marketplace-Mobile` |
| LI-02 Source detail & terms | `SourceDetail`, `SourceDetail-Loading`, `SourceDetail-Private`, `SourceDetail-Paid`, `SourceDetail-Suspended`, `SourceDetail-Licensed` | `SourceDetail-Mobile` |
| LI-03 Request / accept license | `RequestLicense`, `RequestLicense-Private`, `RequestLicense-Sent`, `RequestLicense-Approved`, `RequestLicense-Declined` | `RequestLicense-Mobile` |
| LI-04 My licenses | `MyLicenses`, `MyLicenses-Empty`, `MyLicenses-Loading`, `MyLicenses-Expired` | `MyLicenses-Mobile` |

## 8 · Creator Portal

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| LI-05 Creator portal overview | `CreatorOverview`, `CreatorOverview-Empty`, `CreatorOverview-Loading`, `CreatorOverview-Unverified` | `CreatorOverview-Mobile` |
| LI-06 Verification | `Verification`, `Verification-Pending`, `Verification-Failed`, `Verification-Empty` | `Verification-Mobile` |
| LI-07 Licensing terms | `LicenseTerms`, `LicenseTerms-Unverified`, `LicenseTerms-Saved` | `LicenseTerms-Mobile` |
| LI-08 Usage audit | `Usage`, `Usage-Empty`, `Usage-Loading` | `Usage-Mobile` |
| LI-09 Revoke a license | `Revoke`, `Revoke-Done`, `Revoke-Empty` | `Revoke-Mobile` |
| LI-10 Payouts | `Payouts` | `Payouts-Mobile` |

## 9 · Connections, agency & client portal

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| IN-01 Connections | `Connections`, `Connections-Empty`, `Connections-Loading`, `Connections-Limit` | `Connections-Mobile` |
| IN-02 Connection detail | `ConnectionDetail`, `ConnectionDetail-Expiring`, `ConnectionDetail-Disconnect` | `ConnectionDetail-Mobile` |
| AG-01 Agency hub | `AgencyHub`, `AgencyHub-Empty`, `AgencyHub-Loading`, `AgencyHub-Overlimit` | `AgencyHub-Mobile` |
| AG-02 Client workspaces | `Clients`, `Clients-Empty`, `Clients-Create`, `Clients-Limit` | `Clients-Mobile` |
| AG-03 Client workspace settings | `ClientSettings`, `ClientSettings-Saved`, `ClientSettings-Policy` | `ClientSettings-Mobile` |
| AG-04 Team & invitations | `Team`, `Team-Invite`, `Team-Seats`, `Team-Loading` | `Team-Mobile` |
| AG-05 Roles & permissions | `Roles` | `Roles-Mobile` |
| AG-06 Audit log | `AuditLog`, `AuditLog-Empty`, `AuditLog-Loading` | `AuditLog-Mobile` |
| CP-01 Client portal home | `ClientPortal`, `ClientPortal-Empty`, `ClientPortal-Loading`, `ClientPortal-Approved`, `ClientPortal-Published` | `ClientPortal-Mobile` |
| CP-02 Client approval detail | `ClientApproval`, `ClientApproval-Decided`, `ClientApproval-Newer`, `ClientApproval-Loading` | `ClientApproval-Mobile` |

## 10 · Billing & credits

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| BI-01 Plan & usage | `Billing`, `Billing-Loading`, `Billing-Free` | `Billing-Mobile` |
| BI-02 Plans & checkout | `Plans`, `Plans-Checkout`, `Plans-Processing`, `Plans-Success`, `Plans-Declined` | `Plans-Mobile` |
| BI-03 Credit ledger | `Ledger`, `Ledger-Loading` | `Ledger-Mobile` |
| BI-04 Top-ups | `TopUp`, `TopUp-Locked` | `TopUp-Mobile` |
| BI-05 Spend limits | `SpendLimits`, `SpendLimits-Reached`, `SpendLimits-Request` | `SpendLimits-Mobile` |
| BI-06 Invoices | `Invoices`, `Invoices-Empty`, `Invoices-Loading` | `Invoices-Mobile` |
| BI-07 Payment failure | `PaymentFailed`, `PaymentFailed-Recovered`, `PaymentFailed-Downgraded` | `PaymentFailed-Mobile` |
| BI-08 Trial status | `Trial`, `Trial-Limit`, `Trial-Ending`, `Trial-Ended` | `Trial-Mobile` |

## 11 · Settings

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| ST-01 Profile | `Profile`, `Profile-Saved`, `Profile-Emailchange`, `Profile-Loading` | `Profile-Mobile` |
| ST-02 Security | `Security`, `Security-Deleteblocked`, `Security-Sessions` | `Security-Mobile` |
| ST-03 Appearance | `Appearance`, `Appearance-Dark` | `Appearance-Mobile` |
| ST-04 Notification preferences | `NotificationPrefs`, `NotificationPrefs-Pushdenied`, `NotificationPrefs-Unsupported` | `NotificationPrefs-Mobile` |
| ST-05 Workspace members | `Members`, `Members-Empty` | `Members-Mobile` |
| ST-06 Brand kits | `BrandKits`, `BrandKits-Empty`, `BrandKits-Editing` | `BrandKits-Mobile` |
| ST-07 AI & processing | `AISettings` | `AISettings-Mobile` |
| ST-08 Integration status | `IntegrationStatus` | `IntegrationStatus-Mobile` |
| ST-09 Privacy & data | `Privacy`, `Privacy-Exportready`, `Privacy-Deleting` | `Privacy-Mobile` |
| ST-10 Workspace settings | `WorkspaceSettings`, `WorkspaceSettings-Paused`, `WorkspaceSettings-Resumed` | `WorkspaceSettings-Mobile` |

## 12 · Platform admin

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| AD-01 Ops overview | `AdminOps`, `AdminOps-Loading`, `AdminOps-Healthy`, `AdminOps-Paused` | `AdminOps-Mobile` |
| AD-02 Jobs & dead-letter | `AdminJobs`, `AdminJobs-Empty`, `AdminJobs-Loading` | `AdminJobs-Mobile` |
| AD-03 Audit search | `AdminAudit`, `AdminAudit-Empty` | `AdminAudit-Mobile` |
| AD-04 License review | `AdminLicenses`, `AdminLicenses-Empty` | `AdminLicenses-Mobile` |
| AD-05 Support access | `AdminSupport`, `AdminSupport-Request`, `AdminSupport-Active` | `AdminSupport-Mobile` |
| AD-06 Abuse & moderation | `AdminAbuse`, `AdminAbuse-Empty` | `AdminAbuse-Mobile` |
| AD-07 Diagnostics | `AdminDiagnostics` | `AdminDiagnostics-Mobile` |
| AD-08 Feature flags | `AdminFlags` | `AdminFlags-Mobile` |
| AD-09 Global pause confirm | `AdminPauseConfirm` | `AdminPauseConfirm-Mobile` |

## 13 · System & overlays

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| SY-01 Install prompt (PWA) | `PWAInstall`, `PWAInstall-Ios`, `PWAInstall-Installed` | `PWAInstall-Mobile` |
| SY-02 Offline | `Offline`, `Offline-Reconnecting`, `Offline-Synced` | `Offline-Mobile` |
| SY-03 Not found | `NotFound` | `NotFound-Mobile` |
| SY-04 Access denied | `Denied` | `Denied-Mobile` |
| SY-05 Server error | `ServerError` | `ServerError-Mobile` |
| SY-06 Maintenance | `Maintenance` | `Maintenance-Mobile` |
| SY-07 Command palette | `CommandPalette`, `CommandPalette-Results`, `CommandPalette-Empty` | `CommandPalette-Mobile` |
| SY-08 Account menu | `AccountMenu` | `AccountMenu-Mobile` |
| SY-09 Pause all confirm | `PauseConfirm`, `PauseConfirm-Resume` | `PauseConfirm-Mobile` |

## 14 · Mobile

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| MB-01 Mobile · Home | `MobileHome`, `MobileHome-Empty`, `MobileHome-Loading` | — |
| MB-02 Mobile · Activity | `MobileActivity`, `MobileActivity-Empty`, `MobileActivity-Loading` | — |
| MB-03 Mobile · Approvals | `MobileApprovals`, `MobileApprovals-Empty`, `MobileApprovals-Loading` | — |
| MB-04 Mobile · Calendar | `MobileCalendar`, `MobileCalendar-Empty`, `MobileCalendar-Loading` | — |
| MB-05 Mobile · More | `MobileMore` | — |
| MB-06 Mobile · Notifications | `MobileNotifications`, `MobileNotifications-Empty` | — |
| MB-07 Mobile · Client portal | `MobileClientPortal`, `MobileClientPortal-Empty` | — |
| MB-08 Mobile · Client approval | `MobileClientApproval`, `MobileClientApproval-Decided` | — |
| MB-09 Mobile · Clip review & trim | `MobileClipTrim`, `MobileClipTrim-Loading` | — |
| MB-10 Mobile · Onboarding | `MobileOnboarding`, `MobileOnboarding-Done` | — |
| MB-11 Mobile · Agent | `MobileAgent`, `MobileAgent-Paused` | — |
| MB-12 Mobile · Upload | `MobileUpload`, `MobileUpload-Uploading` | — |
| MB-13 Mobile · Offline | `MobileOffline` | — |

## 15 · Dark theme

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| Dark | `Dark-CommandCenter` | — |
| Dark | `Dark-CommandCenter-Empty` | — |
| Dark | `Dark-CommandCenter-Loading` | — |
| Dark | `Dark-Activity` | — |
| Dark | `Dark-ClippingStudio` | — |
| Dark | `Dark-PostDetail` | — |
| Dark | `Dark-ApprovalDetail` | — |
| Dark | `Dark-Analytics` | — |
| Dark | `Dark-Marketplace` | — |
| Dark | `Dark-Billing` | — |
| Dark | `Dark-AgencyHub` | — |
| Dark | `Dark-OnbAccountType` | — |
| Dark | `Dark-ClientApproval` | — |
| Dark | `Dark-MobileHome` | — |
| Dark | `Dark-MobileClientApproval` | — |
| Dark | `Dark-MobileApprovals-Empty` | — |

## 0c · Flows

| Screen | Desktop boards (states) | Mobile board |
|---|---|---|
| J-01 Creator first run (flow) | `Flow-J-01` | — |
| J-02 Agency setup (flow) | `Flow-J-02` | — |
| J-03 Per-platform client approval (flow) | `Flow-J-03` | — |
| J-04 Autonomous run (flow) | `Flow-J-04` | — |
| J-05 License revocation (flow) | `Flow-J-05` | — |
| J-06 Content-owner onboarding (flow) | `Flow-J-06` | — |
| J-07 License acquisition (flow) | `Flow-J-07` | — |
| J-08 Spend limit hit (flow) | `Flow-J-08` | — |
| J-09 Trial (flow) | `Flow-J-09` | — |
| J-10 Publish confirmation (flow) | `Flow-J-10` | — |
| J-11 Connection lifecycle (flow) | `Flow-J-11` | — |
| J-12 Emergency pause (flow) | `Flow-J-12` | — |
| J-13 Platform admin incident (flow) | `Flow-J-13` | — |
| J-14 Payment failure (flow) | `Flow-J-14` | — |
| J-15 Mobile approvals (flow) | `Flow-J-15` | — |
| Flow index | `Flows` | — |
