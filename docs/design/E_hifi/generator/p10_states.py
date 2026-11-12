from lib import *
CUR['page'] = 'states'; theme('dark')

def S(label, ids, *content):
    tag = f'<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"><span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: {T["grape"]}">State</span><span style="font-size: 15px; font-weight: 700; color: {T["tx"]}">{e(label)}</span><span style="font-size: 12px; color: {T["mu"]}">{e(ids)}</span></div>'
    return f'<section style="background: {T["bg"]}; border: 1px solid {T["bd"]}; border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 12px; min-width: 0">{tag}{"".join(content)}</section>'
def skel(lines=3, h=14):
    return '<div aria-label="Loading" role="status" style="display: flex; flex-direction: column; gap: 10px">' + ''.join(f'<span style="display: block; height: {h}px; width: {w}%; border-radius: 8px; background: {T["s3"]}"></span>' for w in ([70, 95, 55, 85, 40][:lines])) + '</div>'
def sheet(fname, title, intro, states, h):
    body = f'<main style="padding: 48px; display: flex; flex-direction: column; gap: 24px">' + row(logo(22), chip('State sheet','grape'), gap=12) + H(title, 40) + P(intro, size=16) + \
           f'<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 18px">{"".join(states)}</div></main>'
    write(fname, doc(title, body, 1440, h))

# 1 Command Center & AI
sheet('StatesCore.dc.html', 'States · Command Center, agents & Nelio AI', 'Every state for APP-01 to APP-07, ON-05 and NT-01.', [
  S('New workspace', 'APP-01', empty('bot','No agents yet','Start with one, or let Nelio AI suggest a plan.','Create your first agent', second='Ask Nelio AI')),
  S('Loading', 'APP-01 · all lists', card(skel(2,22), pad=18), card(skel(4), pad=18)),
  S('Workspace paused', 'APP-01 · PE-05', banner('orange','All agents paused by Ada at 14:02','Nothing new will start. 1 render in progress will finish.','Resume all')),
  S('Trial banner', 'APP-01 · BI-08', banner('grape','Trial · 2 days left','No card on file. You won’t be charged.','Choose a plan')),
  S('Past due banner', 'APP-01 · BI-07', banner('red','Payment failed · 6 days to update','Top-ups are paused until it’s fixed.','Update payment')),
  S('Agent blocked (with fix)', 'APP-04/05', card(row(agent('grape','blob',40), col(h3('Recipe Reels'), small('Blocked: weekly budget reached (300/300)'), gap=2), grow(), chip('blocked','orange','lock'), gap=10), row(btn('Raise limit','primary',size='sm'), btn('Wait for Monday','ghost',size='sm'), gap=8), pad=16)),
  S('Agent stopped (read-only)', 'APP-05', card(row(agent('blue','square',40), col(h3('Old Promo Agent'), small('Stopped 2 Oct · history kept'), gap=2), grow(), chip('stopped','neutral','x'), gap=10), btn('Duplicate as new agent','secondary',size='sm'), pad=16)),
  S('Plan limit reached', 'APP-04/06', banner('blue','You’re using 5 of 5 agents','Pause one, or move to Business for 10.','Compare plans')),
  S('Re-authorization needed', 'APP-05', card(row(bubble('zap','grape',40), col(h3('Confirm new limits'), small('You raised posts from 3 to 5 a week.'), gap=2), gap=10), btn('Review & authorize','grape',size='sm'), pad=16)),
  S('Nelio AI thinking', 'APP-02', card(row(agent('grape','blob',34), f'<span style="display: inline-flex; gap: 6px">{dot(T["grape"],9)}{dot(T["grape"],9)}{dot(T["grape"],9)}</span>', small('Researching your niche…'), gap=10), pad=16, bg=T['grapeT'], bd=False)),
  S('Nelio AI error', 'APP-02', banner('red','Nelio AI couldn’t finish that','Nothing was changed and no credits were used.','Try again')),
  S('Plan approved', 'APP-02', banner('teal','Budget Shorts is ready','First run is scheduled for Mon 18:00.','Open agent')),
  S('Reconnecting', 'APP-03', banner('orange','Reconnecting…','Your agents keep working in the background.')),
  S('Back online · synced', 'APP-03 · AC-08', banner('teal','Back online','Showing the latest from the server: 2 runs finished while you were away.')),
  S('Filtered: nothing here', 'APP-03', empty('search','No failed runs','Nice. Everything that ran this week succeeded.','Show all activity')),
  S('Checklist complete', 'ON-05', banner('teal','You’re all set up','The checklist hides itself now.')),
  S('No notifications', 'NT-01', empty('bell','You’re all caught up','We’ll let you know when something needs you.','Notification settings')),
  S('Push blocked by browser', 'ST-04 · NT-01', banner('orange','Browser notifications are blocked','Allow them in your browser settings for this site, then come back.')),
], 2050)

# 2 Clipping & content
sheet('StatesClipping.dc.html', 'States · Clipping & Content Studio', 'Every state for CL-01 to CL-05 and CS-01 to CS-03.', [
  S('Empty library', 'CL-01', empty('scissors','Add your first video','Upload something you own or import from a license.','Upload video', second='Browse licenses')),
  S('Uploading', 'CL-02', card(row(bubble('film','lime',40), col(h3('podcast_ep13.mp4'), small('2.3 GB'), gap=2), gap=10), meter('Uploading', 64, '1 min left'), pad=16)),
  S('Wrong file type', 'CL-02', banner('red','We can’t use that file','Upload MP4 or MOV up to 2 GB and 2 hours.')),
  S('Rights not declared', 'CL-02', banner('orange','Tell us who owns this video','Pick an option before we can process it.')),
  S('Not enough credits', 'CL-02 · CL-03', banner('orange','This needs ≈22 credits, you have 12','Top up, or choose Fast quality (≈9 credits).','Top up')),
  S('Processing', 'CL-03', card(stepper_list([('Upload & check','done','2.1 GB'),('Transcribe','running','Balanced'),('Detect scenes','queued',''),('Rank moments','queued','')]), pad=16)),
  S('Render blocked: license', 'CL-03 · PE-03', banner('red','Can’t render: license expired','Chef Kemi’s license ended on 30 Nov. Renew or pick another source.','View license')),
  S('Unsaved changes', 'CL-03', banner('blue','You have unsaved edits','Changes since you last saved: trim and caption size.','Save version')),
  S('Credit estimate before render', 'CL-03', card(kv([('Render 1 clip','≈18 credits'),('Balance','1,240'),('After','≈1,222')]), btn('Render','primary','film',full=True), pad=16)),
  S('Render queued', 'CL-03 · CL-05', banner('blue','Render queued','Estimated wait 3 minutes. You can leave this page.')),
  S('Variants generating', 'CL-04', card(row(f'<span style="width: 72px; aspect-ratio: 9/16; border-radius: 12px; background: {T["s3"]}"></span>', f'<span style="width: 72px; aspect-ratio: 9/16; border-radius: 12px; background: {T["s3"]}"></span>', f'<span style="width: 72px; aspect-ratio: 9/16; border-radius: 12px; background: {T["s3"]}"></span>', gap=10), small('Generating 3 variants…'), pad=16)),
  S('Render failed (refunded)', 'CL-05', banner('red','Render failed','The source file was unreadable at 12:40. 15 credits refunded.','Retry')),
  S('Trial export limit', 'CL-05 · D-12', banner('orange','You’ve used both trial exports','Choose a plan to export more. Your clips are saved.','See plans')),
  S('Storage almost full', 'CL-01', meter('Storage', 94, '94 of 100 GB', 'orange')),
  S('Platform text too long', 'CS-02', field('YouTube title','5 budgeting myths every Nigerian student secretly believes in 2026', err='100 characters max for Shorts titles (you have 104)')),
  S('No account to post to', 'CS-02', banner('blue','Connect an account to schedule','You can still save the draft and download the video.','Connect')),
  S('AI video (gated)', 'CS-03', empty('film','Coming later','Original AI video needs a specialist partner.','Notify me', tone='grape')),
], 2100)

# 3 Publishing
pst = lambda n, t, i: chip(n, t, i)
sheet('StatesPublishing.dc.html', 'States · Calendar, approvals & publishing', 'Every publish and approval state for PB-01 to PB-05 (PE-06, AS-B1, J-10).', [
  S('All publish states', 'PE-06', row(pst('draft','neutral','file'), pst('needs approval','orange','alert'), pst('partly approved','orange','alert'), pst('approved','teal','check'), pst('scheduled','blue','clock'), pst('queued','blue','clock'), pst('uploading','lime','upload'), pst('published','teal','check'), pst('failed','red','x'), pst('confirming','blue','clock'), gap=6)),
  S('Uploading', 'PB-03', card(row(plat('ig',32), h3('Instagram'), grow(), chip('uploading','lime','upload'), gap=10), meter('', 70, '38 of 54 MB'), pad=16)),
  S('Published', 'PB-03', banner('teal','Published on Instagram','Confirmed by Instagram at 18:02.','View post')),
  S('Failed (with retry)', 'PB-03', banner('red','YouTube didn’t accept the upload','Daily upload limit reached. Retry after 00:00 UTC; it won’t double-post.','Retry')),
  S('Confirming (unknown)', 'PB-03 · J-10', banner('blue','Confirming with Instagram','The upload finished but we haven’t heard back. We check before any retry.')),
  S('Held: license revoked', 'PB-03 · J-05', banner('red','On hold: license revoked','Campus Comedy revoked this license. Remove it from the schedule.','Remove')),
  S('Held: sign-in expired', 'PB-03 · J-11', banner('orange','On hold: Instagram sign-in expired','Reconnect @adaclips and this post goes out as scheduled.','Reconnect')),
  S('Approval invalidated', 'PB-05 · AS-B1', banner('grape','Video changed, so both platforms need re-approval','You re-cut the video. Instagram’s and YouTube’s earlier approvals no longer apply.')),
  S('All approved', 'PB-05', banner('teal','Approved for every platform','Ready to schedule.','Schedule')),
  S('Overdue (never auto-approves)', 'PB-04', banner('orange','Overdue since Monday','Still held. We reminded Chioma this morning.','Remind again')),
  S('No approvals waiting', 'PB-04', empty('check','Nothing waiting','Posts you submit for approval show up here.','New post')),
  S('Empty week', 'PB-01', empty('calendar','Nothing scheduled this week','Your agents will fill this as they draft. Or add a post yourself.','New post')),
  S('Reschedule (drag)', 'PB-01', card(row(plat('ig',24), h3('Stop budgeting like this',14), grow(), chip('Fri → Sat 18:00','blue','calendar'), gap=8), small('Drop to move. Approval stays valid: the time isn’t a material change.'), pad=14, style=f'border: 2px dashed {T["lime"]}')),
  S('Timezone note', 'PB-01', small('Times in West Africa Time (WAT). Acme Foods’ workspace uses WAT too.')),
], 1750)

# 4 Licensing
sheet('StatesLicensing.dc.html', 'States · Licensing & Creator Portal', 'Every license and verification state for LI-01 to LI-10.', [
  S('Free: accepted', 'LI-03', banner('teal','License active','You can clip Chef Kemi’s videos now. Attribution is added automatically.')),
  S('Private: request sent', 'LI-03', banner('blue','Request sent to Lagos Money Talk','We’ll notify you when they decide.')),
  S('Private: approved', 'LI-03', banner('teal','Lagos Money Talk approved your request','6-month private license, Instagram only.')),
  S('Private: declined', 'LI-03', banner('orange','Lagos Money Talk declined','Their note: “Not licensing to new accounts right now.”')),
  S('Expiring soon', 'LI-04', banner('orange','Chef Kemi’s license ends in 5 days','4 drafts use it. Renew, or finish and publish before 30 Nov.','Renew')),
  S('Expired', 'LI-04 · AC-09', banner('red','License expired','New clips and renders from Chef Kemi are blocked. 4 drafts are flagged.')),
  S('Paid (coming later)', 'LI-02', card(row(chip('Paid','neutral','lock'), small('Paid licensing is coming later'), gap=8), btn('Notify me','secondary',size='sm'), pad=16)),
  S('Owner suspended', 'LI-02', banner('red','This listing is suspended','Ownership is under review. Existing licenses are paused.')),
  S('No results', 'LI-01', empty('search','No sources match','Try fewer filters or a different niche.','Clear filters')),
  S('Verification pending', 'LI-06', banner('blue','Waiting for Instagram to confirm','Usually a few minutes.')),
  S('Verification failed', 'LI-06', banner('red','That sign-in didn’t own this channel','Sign in with the account that owns “Kemi Vlogs”.','Try again')),
  S('Unverified: can’t publish terms', 'LI-07', banner('orange','Verify a channel first','Terms go live once at least one channel is verified.','Verify')),
  S('Revocation done', 'LI-09', banner('teal','License revoked','Campus Hub was notified. 1 published post flagged for their review.')),
  S('No licensees yet', 'LI-05', empty('shield','No one has licensed your content yet','Your listing is live. Share it to get started.','Copy listing link')),
], 1600)

# 5 Connections, agency, client portal
sheet('StatesAgency.dc.html', 'States · Connections, agency & client portal', 'Every state for IN-01/02, AG-01 to AG-06, CP-01/02 and AU-06.', [
  S('Connection states', 'IN-01 · MP1-11', row(chip('not connected','neutral','link'), chip('connecting…','lime','refresh'), chip('connected','teal','check'), chip('permissions needed','orange','lock'), chip('pending platform approval','blue','clock'), chip('not supported','neutral','x'), chip('sign-in expired','red','alert'), gap=6)),
  S('Account limit', 'IN-01', banner('blue','2 of 2 accounts on Starter','Disconnect one or upgrade to add more.','Compare plans')),
  S('Disconnect confirmation', 'IN-02', card(h3('Disconnect @adastudio?'), P('7 scheduled posts will be held and 2 agents paused.', size=13), row(btn('Keep connected','ghost',size='sm'), btn('Disconnect','danger',size='sm'), gap=8), pad=16)),
  S('No clients yet', 'AG-01', empty('users','Add your first client','Each client gets its own workspace, accounts and approvals.','Add client')),
  S('Client over limit', 'AG-01', banner('orange','Kemi’s Kitchen reached its monthly limit','Agents paused until 1 Dec, or raise the limit.','Raise limit')),
  S('Client workspace limit', 'AG-02', banner('blue','10 of 10 client workspaces','Archive one or talk to us about Enterprise.')),
  S('Policy change', 'AG-03', banner('grape','3 pending approvals now need per-platform decisions','We let Chioma know.')),
  S('Invite expired', 'AU-06', banner('orange','This invite expired','Ask Bola to send a new one.')),
  S('Already accepted', 'AU-06', banner('teal','You’ve already joined Acme Foods','Log in to continue.','Log in')),
  S('Signed in as someone else', 'AU-06', banner('orange','This invite is for chioma@acmefoods.ng','You’re signed in as ada@adastudio.ng.','Switch account')),
  S('Seat limit', 'AG-04', banner('blue','10 of 10 seats used','Remove someone or add seats.')),
  S('Access denied (isolation)', 'SY-03 · AC-02', card(bubble('lock','orange',44), h3('You don’t have access to this workspace'), P('We don’t show whether it exists.', size=13), pad=18)),
  S('Client: nothing waiting', 'CP-01', empty('smile','Nothing waiting for you','We’ll email you when BrightReach sends something.','View published posts')),
  S('Client: decided', 'CP-02', banner('teal','You approved YouTube','BrightReach was notified. Thanks!')),
  S('Client: newer revision', 'CP-02', banner('grape','There’s a newer version','The video changed, so your earlier approval no longer applies.','View revision 3')),
], 1700)

# 6 Billing
sheet('StatesBilling.dc.html', 'States · Billing, credits & trial', 'Every state for BI-01 to BI-08 (D-10 to D-14, AS-B2, AS-B3).', [
  S('Checkout processing', 'BI-02', card(row(bubble('refresh','lime',40), col(h3('Waiting for Paystack'), small('Don’t close this tab.'), gap=2), gap=10), pad=16)),
  S('Payment success', 'BI-02', banner('teal','Welcome to Business','Receipt sent to ada@adastudio.ng.')),
  S('Payment declined', 'BI-02', banner('red','Paystack declined the card','You weren’t charged. Try another card or bank transfer.','Try again')),
  S('Spend warning 80%', 'BI-05', banner('orange','80% of this week’s budget used','Budget Shorts: 240 of 300 credits.')),
  S('Limit reached', 'BI-05 · AC-07', banner('orange','Weekly limit reached','New work is paused until Monday 00:00 WAT.','Raise limit')),
  S('Manager request', 'BI-05', card(row(person('SE','#6CB4FF',36,'#0D0D12'), col(h3('Seun asks to raise Ada Studio to 1,200'), small('“Big campaign this week”'), gap=2), gap=10), row(btn('Approve','primary',size='sm'), btn('Decline','ghost',size='sm'), gap=8), pad=16)),
  S('Top-ups locked (Free/trial)', 'BI-04', banner('blue','Top-ups are for paid plans','Upgrade to buy extra credits.','See plans')),
  S('Trial ending', 'BI-08', banner('grape','Your trial ends tomorrow','You’ll move to Free. Nothing is charged.','Choose a plan')),
  S('Trial ended', 'BI-08', banner('blue','Trial ended: you’re on Free','Autonomous agents paused. Drafts and videos are safe.')),
  S('Downgraded', 'BI-07', banner('orange','Moved to Free after 7 days','Update payment any time to get Creator Pro back.','Update payment')),
  S('Ledger: reserve → settle → refund', 'BI-03', row(chip('reserve −40','blue'), chip('settle +4','teal'), chip('refund +15','teal'), gap=6)),
  S('Free plan', 'BI-01', banner('blue','You’re on Free','1 manual agent, 1 account, no autonomous publishing.','Upgrade')),
], 1400)

# 7 Auth, settings, system
sheet('StatesSystem.dc.html', 'States · Sign-in, settings & system', 'States for AU-01 to AU-07, ST-01 to ST-10 and SY-01 to SY-03.', [
  S('Field errors', 'AU-01', field('Email','ada@','email', err='Enter a full email address')),
  S('Email already used', 'AU-01', banner('orange','That email already has an account','Log in instead, or reset your password.','Log in')),
  S('Too many attempts', 'AU-02', banner('red','Too many tries','Wait 15 minutes or reset your password.')),
  S('Wrong code', 'AU-05', banner('red','That code didn’t work','Codes change every 30 seconds.')),
  S('Link expired', 'AU-03 · AU-04', banner('orange','This link expired','We can send a new one.','Resend')),
  S('Saving', 'ST-*', row(btn('Saving…','secondary','refresh'), small('Changes saved automatically'), gap=10)),
  S('Saved', 'ST-*', banner('teal','Saved','')),
  S('Email change pending', 'ST-01', banner('blue','Confirm your new email','We sent a link to ada@newmail.ng. Your old email stays active until then.')),
  S('Delete blocked', 'ST-02', banner('orange','Transfer BrightReach Agency first','You own an organization. Transfer it or delete it before deleting your account.')),
  S('Export ready', 'ST-09', banner('teal','Your data export is ready','Download link expires in 7 days.','Download')),
  S('Workspace resumed', 'ST-10', banner('teal','Workspace resumed','Budgets and licenses re-checked: 1 agent stays paused (budget).')),
  S('Install: unsupported browser', 'SY-01', banner('blue','Install isn’t available in this browser','On iPhone, tap Share then “Add to Home Screen”.')),
  S('Offline', 'SY-02', banner('orange','You’re offline','Approving and publishing are paused until you’re back.')),
  S('Maintenance', 'SY-03', banner('blue','Scheduled maintenance until 03:00 WAT','Scheduled agent work resumes automatically.')),
], 1500)
