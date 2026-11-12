from frame import *

def aload(f, t, a): admin_page(f, t, a, sk_head() + grid([sk_stat() for _ in range(4)], cols=4, minw=200) + sk_table(5, 5), h=1000)
@screen('AD-01','Ops overview','AdminOps','admin',('filled','loading',('healthy','All healthy'),('paused','Global pause')))
def _(st, f, t):
    if st == 'loading': return aload(f, t, 'a-ops')
    q = [('transcribe','12','4','0','1m'),('analyze','3','2','0','30s'),('render', chip('412','warn','alert') if st == 'filled' else '14','8', chip('6','err') if st == 'filled' else '0','24m' if st == 'filled' else '2m'),('publish','3','1', chip('1','err') if st == 'filled' else '0','2m'),('notify','0','0','0','—'),('rights-recheck','40','2','0','5m')]
    b = {'filled': banner('warn','Render queue backlog above threshold','412 jobs waiting, oldest 24 minutes. Auto-scaling requested.','Inspect jobs', href='AdminJobs.dc.html'), 'healthy': banner('ok','All queues healthy','No alerts in the last 24 hours.'), 'paused': banner('err','Global pause is ON','Started by Precious at 09:40 · reason: “incident #41”. No new jobs are dispatched for any workspace.','Lift pause')}[st]
    inner = page_head('Ops overview', None, [], eb='Admin') + b + grid([stat('Queue depth','470' if st == 'filled' else '72',ic='list'), stat('Failed (1h)','7' if st == 'filled' else '0',ic='x'), stat('AI spend today','$184',ic='wallet'), stat('Active workspaces','1,206',ic='users')], cols=4, minw=200) + table(['Queue','Waiting','Running','Failed','Oldest'], q)
    admin_page(f, t, 'a-ops', inner, h=1100)
@screen('AD-02','Jobs & dead-letter','AdminJobs','admin',('filled','empty','loading'))
def _(st, f, t):
    if st == 'loading': return aload(f, t, 'a-jobs')
    head = page_head('Dead-letter · render', '6 jobs failed after all retries.' if st == 'filled' else 'Nothing in dead-letter.', [btn('Retry selected','secondary','refresh'), btn('Discard selected','danger','trash')], eb='Admin')
    if st == 'empty': admin_page(f, t, 'a-jobs', head + empty('approvals','Dead-letter is empty','Every failed job was retried successfully or handled.', None), h=900); return
    dl = [(check('Select', False), 'job_8f21', 'Acme Foods', 'Render timeout after 600s', '3'), (check('Select', False), 'job_8f22', 'Ada Studio', 'Source file unreadable', '3'), (check('Select', True), 'job_8f30', 'Lagos Fitness', 'Instagram 5xx', '5')]
    admin_page(f, t, 'a-jobs', head + table(['','Job','Workspace','Error','Attempts'], dl) + field('Reason (required to discard)','', 'textarea','Logged to the audit trail'), h=1000)
@screen('AD-03','Audit search','AdminAudit','admin',('filled','empty'))
def _(st, f, t):
    head = page_head('Audit search', None, [], eb='Admin') + field('Search','support access acme' if st == 'filled' else 'zzzz','input')
    body = table(['When','Actor','Action','Tenant'], [('09:12','admin · Precious','support access granted (1h)','Acme Foods'),('09:40','admin · Precious','viewed post detail','Acme Foods'),('10:12','system','support access expired','Acme Foods')]) if st == 'filled' else empty('search','No audit entries match','Try an actor, object ID or workspace name.', None)
    admin_page(f, t, 'a-audit', head + body, h=950)
@screen('AD-04','License review','AdminLicenses','admin',('filled','empty'))
def _(st, f, t):
    head = page_head('License review', None, [], eb='Admin') + tabs(['Disputes 2','Takedown requests 1','Verification issues'],0)
    body = table(['Owner','Channel','Verification','Reports',''], [(row(person('CK','#FF4FB8',30),'Chef Kemi',gap=8), plat('yt',26), chip('verified','ok','check'), '0', ''), (row(person('FC','#E4E8F1',30),'“Kemi Kitchen TV”',gap=8), plat('yt',26), chip('disputed','warn','alert'), '3', row(btn('Investigate','secondary',size='sm'), btn('Suspend','danger',size='sm'), gap=6))]) if st == 'filled' else empty('licenses','No disputes','Ownership disputes and takedown requests show up here.', None)
    admin_page(f, t, 'a-lic', head + body, h=950)
@screen('AD-05','Support access','AdminSupport','admin',('filled',('request','Request access'),('active','Active session')))
def _(st, f, t):
    head = page_head('Support access', None, [btn('Request access','primary','key','AdminSupport-Request.dc.html')], eb='Admin')
    tbl = table(['Admin','Workspace','Reason','Ends'], [('Precious','Acme Foods','Ticket #4821','10:12')])
    b = banner('warn','You’re in Acme Foods with support access','Ends 10:12. The owner was notified and everything you do is logged.','End session') if st == 'active' else ''
    m = overlay(row(bubble('key','warn',56), H('Request support access',26), gap=12) + field('Workspace','Acme Foods','select') + field('Reason (shown to the workspace owner)','Customer ticket #4821: post stuck in “confirming”','textarea') + field('Duration','1 hour (max 2)','select') + banner('blue','The owner is notified and the session is recorded','You won’t see connected-account tokens or payment details.') + row(btn('Cancel','ghost'), grow(), btn('Request access','cta',arrow=True), gap=10), maxw=580) if st == 'request' else ''
    admin_page(f, t, 'a-sup', head + b + tbl, h=1000, modal=m)
@screen('AD-06','Abuse & moderation','AdminAbuse','admin',('filled','empty'))
def _(st, f, t):
    head = page_head('Abuse & moderation', None, [], eb='Admin') + tabs(['Open 3','In review','Closed'],0)
    body = table(['Report','About','Type','Status'], [('#r-201','Clip “Campus sketch #1”', chip('copyright','warn'), chip('open','blue')),('#r-202','Workspace “Fast Followers”', chip('spam','err'), chip('open','blue')),('#r-203','Comment in client portal', chip('harassment','err'), chip('in review','ai'))]) if st == 'filled' else empty('approvals','No open reports','Nice and quiet.', None)
    admin_page(f, t, 'a-abuse', head + body, h=900)
@screen('AD-07','Diagnostics','AdminDiagnostics','admin',('filled',))
def _(st, f, t):
    admin_page(f, t, 'a-diag', page_head('Diagnostics', None, [], eb='Admin') + tabs(['Payments','Webhooks','Social platforms','AI providers'],1) + table(['Event','Provider','Signature','Result'], [('charge.success','Paystack', chip('valid','ok','check'), 'processed'),('charge.success','Paystack', chip('valid','ok','check'), chip('duplicate · ignored','neutral')),('unknown','unknown', chip('invalid','err','x'), chip('rejected','err'))]), h=900)
@screen('AD-08','Feature flags','AdminFlags','admin',('filled',))
def _(st, f, t):
    admin_page(f, t, 'a-flags', page_head('Feature flags', 'Changing a flag is audited.', [], eb='Admin') + card(toggle('instagram_publishing', False, 'Global · awaiting platform approval'), toggle('youtube_publishing', False, 'Beta workspaces only'), toggle('ai_video_generation', False, 'Needs specialist provider'), toggle('paid_licensing', False, 'Needs legal & payouts'), toggle('naira_checkout', True, 'Paystack'), pad=24), h=950)
@screen('AD-09','Global pause confirm','AdminPauseConfirm','admin',('filled',))
def _(st, f, t):
    m = overlay(f'<div style="display: flex; justify-content: center">{art("maintenance",200)}</div>' + H('Pause every workspace?',26) + P('No new jobs dispatch anywhere. Running jobs finish or stop cooperatively. Published posts aren’t affected. Every tenant sees a maintenance banner.') + field('Reason (required)','Incident #41: render nodes failing','textarea') + row(btn('Cancel','ghost'), grow(), btn('Pause everything','danger','pause'), gap=10), maxw=560)
    admin_page(f, t, 'a-ops', page_head('Ops overview', None, [], eb='Admin'), h=950, modal=m)

# ---------------- System & overlays ----------------
@screen('SY-01','Install prompt (PWA)','PWAInstall','system',('filled',('ios','iPhone instructions'),('installed','Installed')))
def _(st, f, t):
    if st == 'ios': inner_m = row(logo(28), grow(), ibtn('x','Dismiss'), gap=8) + h3('Add Nelio to your Home Screen',18) + P('Tap Share, then “Add to Home Screen”.', size=14) + row(chip('1 Share','blue'), icon('arrowr',14), chip('2 Add to Home Screen','blue'), gap=6)
    elif st == 'installed': inner_m = row(icon('check',22,T['okTx'],3), h3('Nelio is installed',18), grow(), ibtn('x','Dismiss'), gap=8) + P('Open it from your home screen for faster approvals.', size=14)
    else: inner_m = row(logo(28), grow(), ibtn('x','Dismiss'), gap=8) + f'<div style="display: flex; gap: 14px; align-items: center">{art("success",110)}<div>{h3("Install Nelio on this device",18)}{P("Approve posts and get alerts faster, from your home screen.", size=14)}</div></div>' + row(btn('Install','primary','download'), btn('Not now','ghost'), gap=8)
    card_ = f'<div style="position: absolute; right: 24px; bottom: 24px; width: 420px; max-width: calc(100% - 48px); background: {T["s1"]}; border: 2px solid {OL}; box-shadow: 6px 6px 0 {OL}; border-radius: 28px; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; {A("up",.2)}">{inner_m}</div>'
    app_page(f, t, 'home', page_head('Command Center', None, []) + grid([stat('Agents active','2'), stat('Waiting on you','4'), stat('Published','12',fill='#B6F24A')], cols=3), h=850, modal=card_)
@screen('SY-02','Offline','Offline','system',('filled',('reconnecting','Reconnecting'),('synced','Back online')))
def _(st, f, t):
    strip = {'filled': topstrip('warn','wifioff','You’re offline. Showing what was last loaded. Approving, publishing and editing are paused.'), 'reconnecting': topstrip('blue','refresh','Reconnecting…'), 'synced': topstrip('ok','check','Back online · everything synced')}[st]
    body = (f'<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px; padding: 24px; border-radius: 32px; background: {T["s1"]}; border: 2px dashed {T["bd"]}">{art("offline",200)}<div style="flex: 1 1 300px">{H("You’re offline",26)}{P("Nothing is queued while offline, so nothing posts by surprise later.", size=15)}</div></div>' if st == 'filled' else '') + \
        table(['Post','Platforms','Status'], [('5 budgeting myths','IG · YT', chip('partly approved','warn')),('Jollof on a budget','IG', chip('waiting','blue'))]) + row(f'<button type="button" disabled style="padding: 12px 20px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s2"]}; color: {T["mu"]}; font-weight: 700; font-size: 14px; min-height: 44px; font-family: {BF}">Approve (offline)</button>' if st != 'synced' else btn('Approve','primary','check'), small('Last synced 14:02' if st != 'synced' else 'Synced just now'), gap=12)
    app_page(f, t, 'approvals', page_head('Approvals', None, []) + body, h=950, banner_html=strip)
def err_page(f, t, il, title, text, a, b=None, ha='CommandCenter.dc.html'):
    inner = f'<main style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 18px; padding: 48px; position: relative; overflow: hidden">{lime_blob(700, T["s2"], "left: 50%; top: 50%; transform: translate(-50%,-50%)")}<div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 18px">{art(il, 400)}{big(title, 52)}<p style="margin: 0; max-width: 520px; font-size: 17px; line-height: 1.55; color: {T["mu"]}">{e(text)}</p><div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center">{btn(a,"cta",None,ha,"lg",arrow=True)}{btn(b,"secondary",size="lg") if b else ""}</div></div></main>'
    write(f, doc(t, f'<header style="display: flex; align-items: center; padding: 20px 32px">{logo(24)}</header>' + inner, 1440, 900))
@screen('SY-03','Not found','NotFound','system',('filled',))
def _(st, f, t): err_page(f, t, 'lost', 'We can’t find that page', 'It may have moved, or the link is wrong. Your agents are fine.', 'Go to Command Center')
@screen('SY-04','Access denied','Denied','system',('filled',))
def _(st, f, t): err_page(f, t, 'denied', 'You don’t have access to this workspace', 'Ask an admin to invite you, or switch to a workspace you belong to.', 'Switch workspace', 'Contact support', 'WorkspaceSwitcher.dc.html')
@screen('SY-05','Server error','ServerError','system',('filled',))
def _(st, f, t): err_page(f, t, 'error', 'Something went wrong on our side', 'Try again in a moment. If it keeps happening, quote error ID e-7f21 to support.', 'Try again', 'Contact support')
@screen('SY-06','Maintenance','Maintenance','system',('filled',))
def _(st, f, t): err_page(f, t, 'maintenance', 'Back soon', 'Scheduled maintenance until 03:00 WAT. Your agents’ scheduled work resumes automatically.', 'View status', None, 'Status.dc.html')
@screen('SY-07','Command palette','CommandPalette','system',('filled',('results','Results'),('empty','No results')))
def _(st, f, t):
    q = {'filled':'','results':'budget','empty':'xyzq'}[st]
    inp = f'<div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 999px; border: 2px solid {T["acc"]}; background: {T["s1"]}">{icon("search",18,T["mu"])}<input aria-label="Search or ask Nelio AI" value="{e(q)}" placeholder="Search or ask Nelio AI" style="flex-grow: 1; border: none; background: transparent; font-size: 16px; color: {T["tx"]}; font-family: {BF}; min-height: 32px"><kbd style="font-size: 12px; padding: 2px 8px; border-radius: 8px; background: {T["s2"]}; color: {T["mu"]}; font-family: {BF}">Esc</kbd></div>'
    if st == 'empty': body = inp + empty('search','Nothing called “xyzq”','Try a post, agent or client name, or ask Nelio AI.', 'Ask Nelio AI', w=160)
    elif st == 'results': body = inp + small('Results', T['mu'], 800) + lst([('Budget Shorts','Agent', agent('lime','circle',34), chip('Open','neutral')),('5 budgeting myths','Post · Acme Foods', thumb('M','#9B7BFF',30,2,'#FFD43B'), chip('Open','neutral')),('Budget tips for students','Strategist plan', bubble('spark','ai',34), chip('Open','neutral')),('Spend limits','Billing', bubble('wallet','warn',34), chip('Open','neutral'))])
    else: body = inp + small('Quick actions', T['mu'], 800) + lst([('New upload','U', bubble('upload','blue',34), chip('U','neutral')),('Create agent','A', bubble('bot','ai',34), chip('A','neutral')),('Pause all agents','P', bubble('pause','warn',34), chip('P','neutral')),('Ask Nelio AI','Type a question', bubble('spark','ai',34), chip('Enter','neutral'))]) + small('Recent', T['mu'], 800) + lst([('Approvals','Page', bubble('check','ok',34)),('Chef Kemi','License', person('CK','#FF4FB8',34))])
    app_page(f, t, 'home', page_head('Command Center', None, []), h=950, modal=overlay(body, top=70, maxw=640))
@screen('SY-08','Account menu','AccountMenu','system',('filled',))
def _(st, f, t):
    pn = f'<div style="position: absolute; top: 76px; right: 20px; width: 340px; background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 28px; box-shadow: 0 20px 60px rgba(11,11,20,0.18); padding: 16px; display: flex; flex-direction: column; gap: 6px; {A("up",0,.4)}">' + row(person('AO','#FF7A2F',48), col(h3('Ada Okafor',16), small('ada@adastudio.ng'), gap=2), gap=10) + f'<div style="height: 1px; background: {T["bd"]}; margin: 8px 0"></div>' + small('Switch surface', T['mu'], 800) + \
        navitem('home','Operator app · Ada Studio', True, 'CommandCenter.dc.html') + navitem('grid','Agency · BrightReach', False, 'AgencyHub.dc.html') + navitem('shield','Creator Portal', False, 'CreatorOverview.dc.html') + f'<div style="height: 1px; background: {T["bd"]}; margin: 8px 0"></div>' + navitem('gear','Account settings', False, 'Profile.dc.html') + navitem('sun','Appearance: Light', False, 'Appearance.dc.html') + navitem('arrowr','Sign out', False, 'LogIn.dc.html') + '</div>'
    app_page(f, t, 'home', page_head('Command Center', None, []), h=850, modal=pn)
@screen('SY-09','Pause all confirm','PauseConfirm','system',('filled',('resume','Resume')))
def _(st, f, t):
    if st == 'resume': m = row(bubble('play','ok',56), H('Resume Ada Studio?',26), gap=12) + P('Before restarting, we re-check every agent’s budget and licenses.') + lst([('Budget Shorts','Budget OK · license OK', agent('lime','circle',34), chip('will resume','ok','check')),('Recipe Reels','Weekly budget reached', agent('pink','blob',34), chip('stays paused','warn','pause'))]) + row(btn('Cancel','ghost'), grow(), btn('Resume','cta',None,'WorkspaceSettings-Resumed.dc.html',arrow=True), gap=10)
    else: m = f'<div style="display: flex; justify-content: center">{art("limit",190)}</div>' + H('Pause everything in Ada Studio?',26) + kv([('Stops now','3 agents · 5 queued jobs'),('Finishes or stops safely','1 render in progress'),('Not affected','Posts already published')]) + row(btn('Cancel','ghost'), grow(), btn('Pause all','danger','pause','CommandCenter-Paused.dc.html'), gap=10)
    app_page(f, t, 'home', page_head('Command Center', None, []), h=950, modal=overlay(m, maxw=560))
build_all(only=['admin','system'])
