# Nelio: Screen & state inventory (v2)

Every screen ID, its name, and every board (state) on the canvas. Board files are in `docs/design/E_hifi/canvas/`. Light is the default theme; “Dark:” boards show parity.

Legend: *Filled* = typical data · *Empty* = first-use with illustration · *Loading* = skeleton loader · other names = specific states.

| ID | Screen | Boards (states) |
|---|---|---|
| M-01 | Home | Board `Home.dc.html` |
| M-02 | Product | Board `Product.dc.html` |
| M-03 | Use cases | Board `UseCases.dc.html` |
| M-04 | Pricing | Board `Pricing.dc.html` |
| M-05 | Licensing & Creator Partners | Board `Licensing.dc.html` |
| M-06 | FAQ | Board `FAQ.dc.html` |
| M-07 | Legal | Board `Legal.dc.html` |
| M-08 | Status | Board `Status.dc.html` |
| AU-01 | Sign up | Filled `SignUp.dc.html`<br>Validation errors `SignUp-Error.dc.html`<br>Email already used `SignUp-Taken.dc.html`<br>Submitting `SignUp-Submitting.dc.html` |
| AU-02 | Log in | Filled `LogIn.dc.html`<br>Wrong password `LogIn-Error.dc.html`<br>Too many attempts `LogIn-Locked.dc.html` |
| AU-03 | Verify email | Filled `VerifyEmail.dc.html`<br>Resent `VerifyEmail-Resent.dc.html`<br>Link expired `VerifyEmail-Expired.dc.html` |
| AU-04 | Reset password | Filled `ResetPassword.dc.html`<br>Link sent `ResetPassword-Sent.dc.html`<br>Set new password `ResetPassword-Newpass.dc.html`<br>Link expired `ResetPassword-Expired.dc.html` |
| AU-05 | Two-step verification | Filled `MFA.dc.html`<br>Setup `MFA-Setup.dc.html`<br>Wrong code `MFA-Wrong.dc.html` |
| AU-06 | Accept invitation | Filled `AcceptInvite.dc.html`<br>Invite expired `AcceptInvite-Expired.dc.html`<br>Already accepted `AcceptInvite-Accepted.dc.html`<br>Signed in as someone else `AcceptInvite-Mismatch.dc.html` |
| AU-07 | Join as content owner | Filled `ContentOwnerJoin.dc.html` |
| ON-01 | Account type | Filled `OnbAccountType.dc.html`<br>Agency selected `OnbAccountType-Selected.dc.html`<br>Dark: Filled `Dark-OnbAccountType.dc.html` |
| ON-02 | Goals & niche | Filled `OnbGoals.dc.html` |
| ON-03 | Connect accounts | Filled `OnbConnect.dc.html`<br>One connected `OnbConnect-Connected.dc.html`<br>Plan limit `OnbConnect-Limit.dc.html` |
| ON-04 | Automation mode | Filled `OnbAutomation.dc.html`<br>Autonomous picked `OnbAutomation-Autonomous.dc.html`<br>Free plan (locked) `OnbAutomation-Free.dc.html` |
| ON-05 | All set | Filled `OnbDone.dc.html` |
| APP-01 | Command Center | Filled `CommandCenter.dc.html`<br>Empty `CommandCenter-Empty.dc.html`<br>Loading `CommandCenter-Loading.dc.html`<br>Workspace paused `CommandCenter-Paused.dc.html`<br>Trial `CommandCenter-Trial.dc.html`<br>Payment failed `CommandCenter-Pastdue.dc.html`<br>Dark: Filled `Dark-CommandCenter.dc.html`<br>Dark: Empty `Dark-CommandCenter-Empty.dc.html`<br>Dark: Loading `Dark-CommandCenter-Loading.dc.html` |
| APP-02 | AI Strategist | Filled `Strategist.dc.html`<br>Empty `Strategist-Empty.dc.html`<br>Thinking `Strategist-Thinking.dc.html`<br>Error `Strategist-Error.dc.html`<br>History `Strategist-History.dc.html` |
| APP-03 | AI Activity Center | Filled `Activity.dc.html`<br>Empty `Activity-Empty.dc.html`<br>Loading `Activity-Loading.dc.html`<br>Reconnecting `Activity-Reconnecting.dc.html`<br>Back online `Activity-Synced.dc.html`<br>Filtered: none `Activity-Filtered.dc.html`<br>Dark: Filled `Dark-Activity.dc.html` |
| APP-04 | Agents | Filled `Agents.dc.html`<br>Empty `Agents-Empty.dc.html`<br>Loading `Agents-Loading.dc.html`<br>Plan limit `Agents-Limit.dc.html` |
| APP-05 | Agent detail | Filled `AgentDetail.dc.html`<br>Budget tab `AgentDetail-Budget.dc.html`<br>Destinations tab `AgentDetail-Destinations.dc.html`<br>Runs tab `AgentDetail-Runs.dc.html`<br>Loading `AgentDetail-Loading.dc.html`<br>Re-authorize `AgentDetail-Reauth.dc.html`<br>Stopped `AgentDetail-Stopped.dc.html` |
| APP-06 | Create agent | 1 · Goal `CreateAgent-Goal.dc.html`<br>2 · Sources `CreateAgent-Sources.dc.html`<br>3 · Destinations `CreateAgent-Destinations.dc.html`<br>4 · Budget `CreateAgent-Budget.dc.html`<br>Filled `CreateAgent.dc.html`<br>Authorize autonomous `CreateAgent-Authorize.dc.html`<br>Plan limit `CreateAgent-Limit.dc.html` |
| APP-07 | Workspace switcher | Filled `WorkspaceSwitcher.dc.html`<br>No match `WorkspaceSwitcher-Search.dc.html` |
| NT-01 | Notifications | Filled `Notifications.dc.html`<br>Empty `Notifications-Empty.dc.html`<br>Loading `Notifications-Loading.dc.html`<br>Dropdown panel `Notifications-Panel.dc.html`<br>Push prompt `Notifications-Push.dc.html` |
| CL-01 | Media library | Filled `MediaLibrary.dc.html`<br>Empty `MediaLibrary-Empty.dc.html`<br>Loading `MediaLibrary-Loading.dc.html`<br>Storage almost full `MediaLibrary-Storage.dc.html` |
| CL-02 | Upload | Filled `Upload.dc.html`<br>Uploading `Upload-Uploading.dc.html`<br>Wrong file type `Upload-Wrongtype.dc.html`<br>Rights not chosen `Upload-Norights.dc.html`<br>Not enough credits `Upload-Lowcredits.dc.html` |
| CL-03 | Clipping Studio | Filled `ClippingStudio.dc.html`<br>Processing `ClippingStudio-Processing.dc.html`<br>Loading `ClippingStudio-Loading.dc.html`<br>Render blocked: license `ClippingStudio-Blocked.dc.html`<br>Unsaved changes `ClippingStudio-Unsaved.dc.html`<br>Render estimate `ClippingStudio-Estimate.dc.html`<br>Render queued `ClippingStudio-Queued.dc.html`<br>Dark: Filled `Dark-ClippingStudio.dc.html` |
| CL-04 | Batch variants | Filled `Variants.dc.html`<br>Generating `Variants-Generating.dc.html`<br>Not enough credits `Variants-Lowcredits.dc.html` |
| CL-05 | Exports | Filled `Exports.dc.html`<br>Empty `Exports-Empty.dc.html`<br>Loading `Exports-Loading.dc.html`<br>Trial limit reached `Exports-Trial.dc.html` |
| CS-01 | Content Studio | Filled `ContentStudio.dc.html`<br>Empty `ContentStudio-Empty.dc.html`<br>Loading `ContentStudio-Loading.dc.html` |
| CS-02 | Post composer | Filled `Composer.dc.html`<br>Text too long `Composer-Invalid.dc.html`<br>No account connected `Composer-Nodest.dc.html`<br>Licensed source `Composer-Licensed.dc.html` |
| CS-03 | Original AI video | Filled `AIVideo.dc.html` |
| PB-01 | Content calendar | Filled `Calendar.dc.html`<br>Empty `Calendar-Empty.dc.html`<br>Loading `Calendar-Loading.dc.html`<br>Month view `Calendar-Month.dc.html`<br>Rescheduling `Calendar-Drag.dc.html` |
| PB-02 | Drafts | Filled `Drafts.dc.html`<br>Empty `Drafts-Empty.dc.html`<br>Loading `Drafts-Loading.dc.html` |
| PB-03 | Post detail | Filled `PostDetail.dc.html`<br>Loading `PostDetail-Loading.dc.html`<br>Published `PostDetail-Published.dc.html`<br>Failed `PostDetail-Failed.dc.html`<br>Uploading `PostDetail-Uploading.dc.html`<br>On hold: license `PostDetail-Held.dc.html`<br>On hold: sign-in `PostDetail-Expired.dc.html`<br>Dark: Filled `Dark-PostDetail.dc.html` |
| PB-04 | Approvals | Filled `Approvals.dc.html`<br>Empty `Approvals-Empty.dc.html`<br>Loading `Approvals-Loading.dc.html`<br>Internal review `Approvals-Internal.dc.html` |
| PB-05 | Approval detail | Filled `ApprovalDetail.dc.html`<br>Loading `ApprovalDetail-Loading.dc.html`<br>All approved `ApprovalDetail-Allapproved.dc.html`<br>Re-approval needed `ApprovalDetail-Invalidated.dc.html`<br>Dark: Filled `Dark-ApprovalDetail.dc.html` |
| AN-01 | Analytics overview | Filled `Analytics.dc.html`<br>Empty `Analytics-Empty.dc.html`<br>Loading `Analytics-Loading.dc.html`<br>Data delayed `Analytics-Delayed.dc.html`<br>Dark: Filled `Dark-Analytics.dc.html` |
| AN-02 | Content performance | Filled `ContentPerformance.dc.html`<br>Empty `ContentPerformance-Empty.dc.html`<br>Loading `ContentPerformance-Loading.dc.html` |
| AN-03 | Agent performance | Filled `AgentPerformance.dc.html`<br>Empty `AgentPerformance-Empty.dc.html`<br>Loading `AgentPerformance-Loading.dc.html` |
| AN-04 | Campaigns & experiments | Filled `Campaigns.dc.html`<br>Empty `Campaigns-Empty.dc.html`<br>Loading `Campaigns-Loading.dc.html` |
| LI-01 | Marketplace | Filled `Marketplace.dc.html`<br>Empty `Marketplace-Empty.dc.html`<br>Loading `Marketplace-Loading.dc.html`<br>Dark: Filled `Dark-Marketplace.dc.html` |
| LI-02 | Source detail & terms | Filled `SourceDetail.dc.html`<br>Loading `SourceDetail-Loading.dc.html`<br>Private license `SourceDetail-Private.dc.html`<br>Paid (coming later) `SourceDetail-Paid.dc.html`<br>Owner suspended `SourceDetail-Suspended.dc.html`<br>Already licensed `SourceDetail-Licensed.dc.html` |
| LI-03 | Request / accept license | Filled `RequestLicense.dc.html`<br>Private request `RequestLicense-Private.dc.html`<br>Request sent `RequestLicense-Sent.dc.html`<br>Approved `RequestLicense-Approved.dc.html`<br>Declined `RequestLicense-Declined.dc.html` |
| LI-04 | My licenses | Filled `MyLicenses.dc.html`<br>Empty `MyLicenses-Empty.dc.html`<br>Loading `MyLicenses-Loading.dc.html`<br>License expired `MyLicenses-Expired.dc.html` |
| LI-05 | Creator portal overview | Filled `CreatorOverview.dc.html`<br>Empty `CreatorOverview-Empty.dc.html`<br>Loading `CreatorOverview-Loading.dc.html`<br>Not verified yet `CreatorOverview-Unverified.dc.html` |
| LI-06 | Verification | Filled `Verification.dc.html`<br>Pending `Verification-Pending.dc.html`<br>Failed `Verification-Failed.dc.html`<br>Empty `Verification-Empty.dc.html` |
| LI-07 | Licensing terms | Filled `LicenseTerms.dc.html`<br>Can’t publish yet `LicenseTerms-Unverified.dc.html`<br>Published `LicenseTerms-Saved.dc.html` |
| LI-08 | Usage audit | Filled `Usage.dc.html`<br>Empty `Usage-Empty.dc.html`<br>Loading `Usage-Loading.dc.html` |
| LI-09 | Revoke a license | Filled `Revoke.dc.html`<br>Revoked `Revoke-Done.dc.html`<br>Empty `Revoke-Empty.dc.html` |
| LI-10 | Payouts | Filled `Payouts.dc.html` |
| IN-01 | Connections | Filled `Connections.dc.html`<br>Empty `Connections-Empty.dc.html`<br>Loading `Connections-Loading.dc.html`<br>Account limit `Connections-Limit.dc.html` |
| IN-02 | Connection detail | Filled `ConnectionDetail.dc.html`<br>Expiring `ConnectionDetail-Expiring.dc.html`<br>Disconnect confirm `ConnectionDetail-Disconnect.dc.html` |
| AG-01 | Agency hub | Filled `AgencyHub.dc.html`<br>Empty `AgencyHub-Empty.dc.html`<br>Loading `AgencyHub-Loading.dc.html`<br>Client over limit `AgencyHub-Overlimit.dc.html`<br>Dark: Filled `Dark-AgencyHub.dc.html` |
| AG-02 | Client workspaces | Filled `Clients.dc.html`<br>Empty `Clients-Empty.dc.html`<br>New client `Clients-Create.dc.html`<br>Workspace limit `Clients-Limit.dc.html` |
| AG-03 | Client workspace settings | Filled `ClientSettings.dc.html`<br>Saved `ClientSettings-Saved.dc.html`<br>Policy change `ClientSettings-Policy.dc.html` |
| AG-04 | Team & invitations | Filled `Team.dc.html`<br>Invite `Team-Invite.dc.html`<br>Seat limit `Team-Seats.dc.html`<br>Loading `Team-Loading.dc.html` |
| AG-05 | Roles & permissions | Filled `Roles.dc.html` |
| AG-06 | Audit log | Filled `AuditLog.dc.html`<br>Empty `AuditLog-Empty.dc.html`<br>Loading `AuditLog-Loading.dc.html` |
| CP-01 | Client portal home | Filled `ClientPortal.dc.html`<br>Empty `ClientPortal-Empty.dc.html`<br>Loading `ClientPortal-Loading.dc.html`<br>Approved tab `ClientPortal-Approved.dc.html`<br>Published tab `ClientPortal-Published.dc.html` |
| CP-02 | Client approval detail | Filled `ClientApproval.dc.html`<br>Approved `ClientApproval-Decided.dc.html`<br>Newer revision `ClientApproval-Newer.dc.html`<br>Loading `ClientApproval-Loading.dc.html`<br>Dark: Filled `Dark-ClientApproval.dc.html` |
| BI-01 | Plan & usage | Filled `Billing.dc.html`<br>Loading `Billing-Loading.dc.html`<br>Free plan `Billing-Free.dc.html`<br>Dark: Filled `Dark-Billing.dc.html` |
| BI-02 | Plans & checkout | Filled `Plans.dc.html`<br>Checkout `Plans-Checkout.dc.html`<br>Processing `Plans-Processing.dc.html`<br>Success `Plans-Success.dc.html`<br>Declined `Plans-Declined.dc.html` |
| BI-03 | Credit ledger | Filled `Ledger.dc.html`<br>Loading `Ledger-Loading.dc.html` |
| BI-04 | Top-ups | Filled `TopUp.dc.html`<br>Locked on Free `TopUp-Locked.dc.html` |
| BI-05 | Spend limits | Filled `SpendLimits.dc.html`<br>Limit reached `SpendLimits-Reached.dc.html`<br>Manager request `SpendLimits-Request.dc.html` |
| BI-06 | Invoices | Filled `Invoices.dc.html`<br>Empty `Invoices-Empty.dc.html`<br>Loading `Invoices-Loading.dc.html` |
| BI-07 | Payment failure | Filled `PaymentFailed.dc.html`<br>Recovered `PaymentFailed-Recovered.dc.html`<br>Downgraded `PaymentFailed-Downgraded.dc.html` |
| BI-08 | Trial status | Filled `Trial.dc.html`<br>Limit reached `Trial-Limit.dc.html`<br>Ends tomorrow `Trial-Ending.dc.html`<br>Ended `Trial-Ended.dc.html` |
| ST-01 | Profile | Filled `Profile.dc.html`<br>Saved `Profile-Saved.dc.html`<br>Email change pending `Profile-Emailchange.dc.html`<br>Loading `Profile-Loading.dc.html` |
| ST-02 | Security | Filled `Security.dc.html`<br>Delete blocked `Security-Deleteblocked.dc.html`<br>Sessions `Security-Sessions.dc.html` |
| ST-03 | Appearance | Filled `Appearance.dc.html`<br>Dark selected `Appearance-Dark.dc.html` |
| ST-04 | Notification preferences | Filled `NotificationPrefs.dc.html`<br>Push blocked `NotificationPrefs-Pushdenied.dc.html`<br>Push unsupported `NotificationPrefs-Unsupported.dc.html` |
| ST-05 | Workspace members | Filled `Members.dc.html`<br>Empty `Members-Empty.dc.html` |
| ST-06 | Brand kits | Filled `BrandKits.dc.html`<br>Empty `BrandKits-Empty.dc.html`<br>Editing `BrandKits-Editing.dc.html` |
| ST-07 | AI & processing | Filled `AISettings.dc.html` |
| ST-08 | Integration status | Filled `IntegrationStatus.dc.html` |
| ST-09 | Privacy & data | Filled `Privacy.dc.html`<br>Export ready `Privacy-Exportready.dc.html`<br>Deletion requested `Privacy-Deleting.dc.html` |
| ST-10 | Workspace settings | Filled `WorkspaceSettings.dc.html`<br>Workspace paused `WorkspaceSettings-Paused.dc.html`<br>Resumed `WorkspaceSettings-Resumed.dc.html` |
| AD-01 | Ops overview | Filled `AdminOps.dc.html`<br>Loading `AdminOps-Loading.dc.html`<br>All healthy `AdminOps-Healthy.dc.html`<br>Global pause `AdminOps-Paused.dc.html` |
| AD-02 | Jobs & dead-letter | Filled `AdminJobs.dc.html`<br>Empty `AdminJobs-Empty.dc.html`<br>Loading `AdminJobs-Loading.dc.html` |
| AD-03 | Audit search | Filled `AdminAudit.dc.html`<br>Empty `AdminAudit-Empty.dc.html` |
| AD-04 | License review | Filled `AdminLicenses.dc.html`<br>Empty `AdminLicenses-Empty.dc.html` |
| AD-05 | Support access | Filled `AdminSupport.dc.html`<br>Request access `AdminSupport-Request.dc.html`<br>Active session `AdminSupport-Active.dc.html` |
| AD-06 | Abuse & moderation | Filled `AdminAbuse.dc.html`<br>Empty `AdminAbuse-Empty.dc.html` |
| AD-07 | Diagnostics | Filled `AdminDiagnostics.dc.html` |
| AD-08 | Feature flags | Filled `AdminFlags.dc.html` |
| AD-09 | Global pause confirm | Filled `AdminPauseConfirm.dc.html` |
| SY-01 | Install prompt (PWA) | Filled `PWAInstall.dc.html`<br>iPhone instructions `PWAInstall-Ios.dc.html`<br>Installed `PWAInstall-Installed.dc.html` |
| SY-02 | Offline | Filled `Offline.dc.html`<br>Reconnecting `Offline-Reconnecting.dc.html`<br>Back online `Offline-Synced.dc.html` |
| SY-03 | Not found | Filled `NotFound.dc.html` |
| SY-04 | Access denied | Filled `Denied.dc.html` |
| SY-05 | Server error | Filled `ServerError.dc.html` |
| SY-06 | Maintenance | Filled `Maintenance.dc.html` |
| SY-07 | Command palette | Filled `CommandPalette.dc.html`<br>Results `CommandPalette-Results.dc.html`<br>No results `CommandPalette-Empty.dc.html` |
| SY-08 | Account menu | Filled `AccountMenu.dc.html` |
| SY-09 | Pause all confirm | Filled `PauseConfirm.dc.html`<br>Resume `PauseConfirm-Resume.dc.html` |
| MB-01 | Mobile | Home · Filled `MobileHome.dc.html`<br>Home · Empty `MobileHome-Empty.dc.html`<br>Home · Loading `MobileHome-Loading.dc.html`<br>Dark: Home · Filled `Dark-MobileHome.dc.html` |
| MB-02 | Mobile | Activity · Filled `MobileActivity.dc.html`<br>Activity · Empty `MobileActivity-Empty.dc.html`<br>Activity · Loading `MobileActivity-Loading.dc.html` |
| MB-03 | Mobile | Approvals · Filled `MobileApprovals.dc.html`<br>Approvals · Empty `MobileApprovals-Empty.dc.html`<br>Approvals · Loading `MobileApprovals-Loading.dc.html`<br>Dark: Approvals · Empty `Dark-MobileApprovals-Empty.dc.html` |
| MB-04 | Mobile | Calendar · Filled `MobileCalendar.dc.html`<br>Calendar · Empty `MobileCalendar-Empty.dc.html`<br>Calendar · Loading `MobileCalendar-Loading.dc.html` |
| MB-05 | Mobile | More · Filled `MobileMore.dc.html` |
| MB-06 | Mobile | Notifications · Filled `MobileNotifications.dc.html`<br>Notifications · Empty `MobileNotifications-Empty.dc.html` |
| MB-07 | Mobile | Client portal · Filled `MobileClientPortal.dc.html`<br>Client portal · Empty `MobileClientPortal-Empty.dc.html` |
| MB-08 | Mobile | Client approval · Filled `MobileClientApproval.dc.html`<br>Client approval · Approved `MobileClientApproval-Decided.dc.html`<br>Dark: Client approval · Filled `Dark-MobileClientApproval.dc.html` |
| MB-09 | Mobile | Clip review & trim · Filled `MobileClipTrim.dc.html`<br>Clip review & trim · Loading `MobileClipTrim-Loading.dc.html` |
| MB-10 | Mobile | Onboarding · Filled `MobileOnboarding.dc.html`<br>Onboarding · All set `MobileOnboarding-Done.dc.html` |
| MB-11 | Mobile | Agent · Filled `MobileAgent.dc.html`<br>Agent · Paused `MobileAgent-Paused.dc.html` |
| MB-12 | Mobile | Upload · Filled `MobileUpload.dc.html`<br>Upload · Uploading `MobileUpload-Uploading.dc.html` |
| MB-13 | Mobile | Offline · Filled `MobileOffline.dc.html` |
| J-01 | Creator first run (flow) | Board `Flow-J-01.dc.html` |
| J-02 | Agency setup (flow) | Board `Flow-J-02.dc.html` |
| J-03 | Per-platform client approval (flow) | Board `Flow-J-03.dc.html` |
| J-04 | Autonomous run (flow) | Board `Flow-J-04.dc.html` |
| J-05 | License revocation (flow) | Board `Flow-J-05.dc.html` |
| J-06 | Content-owner onboarding (flow) | Board `Flow-J-06.dc.html` |
| J-07 | License acquisition (flow) | Board `Flow-J-07.dc.html` |
| J-08 | Spend limit hit (flow) | Board `Flow-J-08.dc.html` |
| J-09 | Trial (flow) | Board `Flow-J-09.dc.html` |
| J-10 | Publish confirmation (flow) | Board `Flow-J-10.dc.html` |
| J-11 | Connection lifecycle (flow) | Board `Flow-J-11.dc.html` |
| J-12 | Emergency pause (flow) | Board `Flow-J-12.dc.html` |
| J-13 | Platform admin incident (flow) | Board `Flow-J-13.dc.html` |
| J-14 | Payment failure (flow) | Board `Flow-J-14.dc.html` |
| J-15 | Mobile approvals (flow) | Board `Flow-J-15.dc.html` |

## Supporting boards

- `Main.dc.html`: Nelio design foundations v2
- `Illustrations.dc.html`: Illustration kit
- `Motion.dc.html`: Motion system (GSAP)
- `Onboarding.dc.html`: Onboarding flow (interactive)
- `Flows.dc.html`: Flow index

## Illustrations (32)

- **agents**: A friendly Nelio agent waving, ready to work
- **media**: A film strip being cut by scissors
- **calendar**: A calendar page with a paper plane flying out
- **approvals**: A big approved stamp with confetti
- **notifications**: A sleeping bell, all caught up
- **licenses**: A shield with a check and a creator card
- **analytics**: A rising bar chart with a magnifying glass
- **clients**: Three client workspace cards with happy faces
- **search**: A magnifying glass looking for something that is not there
- **offline**: A cloud with an unplugged cable
- **lost**: A lost agent holding an upside-down map
- **denied**: A padlock with a sticker saying members only
- **error**: A tangled cable and a dizzy agent
- **maintenance**: An agent with a wrench fixing things
- **success**: A rocket launching with confetti, post published
- **gift**: A gift box, your free trial
- **wallet**: A wallet with coins and a coming-soon clock
- **aivideo**: A clapperboard with sparkles, coming soon
- **upload**: A video file flying into a cloud
- **strategist**: Chat bubbles and a light bulb, planning with Nelio AI
- **limit**: A piggy bank with a stop sign, limit reached
- **connect**: A plug connecting to social platforms
- **verify**: An ID card with a big verified check
- **welcome**: Three Nelio agents cheering
- **inbox**: A cup of coffee, nothing waiting for you
- **drafts**: A stack of draft cards with a pencil
- **exports**: A download box full of finished clips
- **team**: Two people high-fiving
- **audit**: A clipboard with a checklist and magnifier
- **payment**: A credit card with a little warning sign
- **brand**: A palette with brushes and colour swatches
- **notfound_content**: An empty video frame with a question sticker

**Totals:** 369 boards · 101 product screen IDs · 13 mobile screens · 15 flows.
