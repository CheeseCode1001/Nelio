from frame import *
AG = dict(ws='BrightReach', kind='Agency', agency=True)

def conn(p, name, handle, state, tone, ic, note, action, caps, d=0):
    capr = row(*[chip(c, 'ok' if ok else 'neutral', 'check' if ok else 'x') for c, ok in caps], gap=6)
    return card(row(plat(p,48), col(h3(name,17), small(handle), gap=2), grow(), chip(state, tone, ic), gap=12), P(note, size=13), capr, action, pad=20, anim=A('up', d))
@screen('IN-01','Connections','Connections','agency',('filled','empty','loading',('limit','Account limit')))
def _(st, f, t):
    head = page_head('Connections', 'Agents can only post to accounts connected here.', [], eb='Workspace')
    if st == 'loading': app_page(f, t, 'connections', head + grid([sk_card(140,3) for _ in range(6)], cols=3, minw=320), h=1150); return
    if st == 'empty':
        inner = head + f'<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding: 28px; border-radius: 32px; background: {T["s1"]}; border: 2px dashed {T["bd"]}">{art("connect", 300)}<div style="flex: 1 1 320px; display: flex; flex-direction: column; gap: 12px">{H("Connect your first account", 30)}{P("Official sign-in for each platform. We never see your password, and you can disconnect any time.", size=15)}{row(btn("Connect Instagram","primary","link"), btn("Connect YouTube","secondary","link"), gap=10)}{small("TikTok and Facebook are coming later.")}</div></div>'
        app_page(f, t, 'connections', inner, h=1000); return
    lim = banner('blue','2 of 2 accounts on Starter','Disconnect one or upgrade to add more.','Compare plans', href='Plans.dc.html') if st == 'limit' else banner('blue','YouTube and Instagram are in development','Each platform switches on once it approves Nelio. Until then, connections show their real status.')
    inner = head + lim + grid([conn('ig','Instagram','@adastudio · Business','connected','ok','check','Healthy. Sign-in renews automatically.', btn('Manage','secondary',None,'ConnectionDetail.dc.html','sm'), [('Publish Reels',True),('Analytics',True),('Native scheduling',False)]),
          conn('ig','Instagram','@adaclips · Creator','sign-in expired','err','alert','7 scheduled posts are on hold until you reconnect.', btn('Reconnect','primary','refresh',size='sm'), [('Publish Reels',True),('Analytics',True)], .05),
          conn('yt','YouTube','Ada Studio','permissions needed','warn','lock','Upload permission wasn’t granted. Reconnect and allow uploads.', btn('Grant permission','primary',size='sm'), [('Upload Shorts',False),('Analytics',True)], .1),
          conn('yt','YouTube','Ada Brand channel','pending platform approval','blue','clock','Waiting on YouTube’s review of Nelio. Nothing for you to do.', btn('Learn more','ghost',size='sm'), [('Upload Shorts',False)], .15),
          conn('tt','TikTok','—','coming later','neutral','clock','We’ll let you know when TikTok is ready.', btn('Notify me','secondary',size='sm'), [], .2),
          conn('fb','Facebook','—','coming later','neutral','clock','We’ll let you know when Facebook is ready.', btn('Notify me','secondary',size='sm'), [], .25)], cols=3, minw=320) + small('Plan: 2 of 6 accounts used.')
    app_page(f, t, 'connections', inner, h=1250)

@screen('IN-02','Connection detail','ConnectionDetail','agency',('filled',('expiring','Expiring'),('disconnect','Disconnect confirm')))
def _(st, f, t):
    b = banner('warn','Sign-in expires in 2 days','Reconnect now so 7 scheduled posts aren’t held.','Reconnect') if st == 'expiring' else ''
    inner = page_head('Instagram · @adastudio', 'Business account · connected 12 Oct 2026', [btn('Reconnect','secondary','refresh'), btn('Disconnect','danger','x','ConnectionDetail-Disconnect.dc.html')], crumbs='Connections › Instagram', badge=chip('connected','ok','check')) + b + \
        grid([card(card_head('Health'), kv([('Status', chip('connected','ok','check')),('Sign-in renews','in 2 days (automatic)'),('Last post','Today 18:02'),('Rate limit','12 of 50 posts today')]), pad=22), card(card_head('What Nelio can do here'), lst([('Publish Reels','Yes', icon('check',20,T['okTx'])),('Read analytics','Views, reach, saves', icon('check',20,T['okTx'])),('Schedule inside Instagram','Not available, so Nelio schedules instead', icon('x',20,T['mu']))]), pad=22)], cols=2) + \
        card(card_head('Used by'), lst([('Budget Shorts','Agent · posts 3×/week', agent('lime','circle',36)),('Recipe Reels','Agent · autonomous', agent('pink','blob',36)),('7 scheduled posts','Next: Fri 18:00', bubble('calendar','blue',36))]), pad=22)
    m = overlay(f'<div style="display: flex; justify-content: center">{art("offline",200)}</div>' + H('Disconnect @adastudio?',26) + P('7 scheduled posts will be held and 2 agents paused. You can reconnect any time to resume them.') + row(btn('Keep connected','ghost'), grow(), btn('Disconnect','danger','x'), gap=10), maxw=500) if st == 'disconnect' else ''
    app_page(f, t, 'connections', inner, h=1100, modal=m)

CLIENTS = lambda: [(row(person('A','#59D8FF',36), 'Acme Foods', gap=10), '2', chip('3 waiting','warn','clock'), chip('IG sign-in expiring','err','alert'), meter('',52,'420 / 800 cr')), (row(person('L','#22C55E',36), 'Lagos Fitness', gap=10), '1', chip('none','neutral'), chip('all good','ok','check'), meter('',30,'120 / 400 cr')), (row(person('K','#FF4FB8',36), 'Kemi’s Kitchen', gap=10), '3', chip('1 waiting','warn','clock'), chip('license ending','warn','shield'), meter('',100,'600 / 600 · paused','warn'))]
@screen('AG-01','Agency hub','AgencyHub','agency',('filled','empty','loading',('overlimit','Client over limit')))
def _(st, f, t):
    head = page_head('BrightReach · all clients', None, [btn('Add client','primary','plus','Clients-Create.dc.html')], eb='Agency')
    if st == 'empty': inner = head + empty('clients','Add your first client','Each client gets its own workspace, accounts, approvals and spend limit.','Add client', None, 'Clients-Create.dc.html')
    elif st == 'loading': inner = head + grid([sk_stat() for _ in range(4)], cols=4, minw=200) + sk_table(5, 3) + sk_rows(3)
    else:
        ol = banner('warn','Kemi’s Kitchen reached its monthly limit','Agents paused until 1 Dec, or raise the limit.','Raise limit', href='ClientSettings.dc.html') if st == 'overlimit' else ''
        inner = head + ol + grid([stat('Clients','3',ic='users',fill='#FF4FB8',anim=A('up')), stat('Waiting on clients','4',ic='clock',anim=A('up',.05)), stat('Published this week','31',ic='zap',fill='#B6F24A',anim=A('up',.1)), stat('Credits this month','1,140',ic='wallet',anim=A('up',.15))], cols=4, minw=200) + table(['Client','Agents','Waiting on client','Issues','Credits this month'], CLIENTS()) + \
            card(card_head('Across clients today'), lst([('Chioma approved Instagram for “5 budgeting myths”','Acme Foods · 2m', person('CN','#22C55E',36)),('Kemi’s Kitchen reached its monthly limit','Agents paused · raise limit or wait until 1 Dec', bubble('wallet','warn',36)),('Tunde submitted 2 posts to Lagos Fitness','12m', person('TA','#59D8FF',36))]), pad=20)
    app_page(f, t, 'agencyhub', inner, h=1300, **AG)

@screen('AG-02','Client workspaces','Clients','agency',('filled','empty',('create','New client'),('limit','Workspace limit')))
def _(st, f, t):
    head = page_head('Clients', None, [btn('Add client','primary','plus','Clients-Create.dc.html')], eb='Agency')
    tbl = table(['Client','Members','Accounts','Created'], [(row(person('A','#59D8FF',32), 'Acme Foods', gap=10),'4','3','Sep 2026'),(row(person('L','#22C55E',32), 'Lagos Fitness', gap=10),'2','2','Oct 2026'),(row(person('K','#FF4FB8',32), 'Kemi’s Kitchen', gap=10),'3','2','Oct 2026')])
    if st == 'empty': app_page(f, t, 'clients', head + empty('clients','No client workspaces yet','Create one per client. Their content, accounts and approvals stay completely separate.','Add client', None, 'Clients-Create.dc.html'), h=1000, **AG); return
    lim = banner('blue','10 of 10 client workspaces','Archive one, or talk to us about Enterprise.') if st == 'limit' else ''
    m = overlay(row(art('clients',140), col(H('New client workspace',26), P('Everything in it stays separate from your other clients.'), gap=4), gap=10) + field('Client name','Lagos Fitness') + grid([field('Logo','Upload…'), field('Timezone','Africa/Lagos (WAT)','select')], cols=2) + field('Monthly credit limit','400', hint='Work pauses when it’s reached') + row(btn('Cancel','ghost'), grow(), btn('Create workspace','cta',None,'ClientSettings.dc.html',arrow=True), gap=10) + small('Agency plan: 3 of 10 client workspaces used.'), maxw=580) if st == 'create' else ''
    app_page(f, t, 'clients', head + lim + tbl, h=1000, modal=m, **AG)

@screen('AG-03','Client workspace settings','ClientSettings','agency',('filled',('saved','Saved'),('policy','Policy change')))
def _(st, f, t):
    b = {'saved': banner('ok','Saved','Approval policy updated for Acme Foods.'), 'policy': banner('ai','3 pending approvals now need per-platform decisions','We let Chioma know.')}.get(st, '')
    inner = page_head('Acme Foods', 'Client workspace settings', [btn('Save','primary')], crumbs='Clients › Acme Foods') + b + tabs(['Approval policy','Members','Accounts','Brand kit','Limits'],0) + \
        grid([card(card_head('Approval policy'), toggle('Client approval required before publishing', True), toggle('Approve each platform separately', True, 'Chioma can approve Instagram and send YouTube back.'), toggle('Internal review before the client sees it', False), field('Approval deadline','2 days after submission','select'), toggle('Let the client see analytics for published posts', False), pad=24),
              col(banner('warn','A missed deadline never auto-approves','Posts stay held and we remind the client.'), card(card_head('Who approves'), lst([('Chioma Nwosu','Client approver · chioma@acmefoods.ng', person('CN','#22C55E',40), chip('active','ok'))]), btn('Add approver','secondary','plus'), pad=24), gap=16)], cols=2, gap=20)
    app_page(f, t, 'clients', inner, h=1100, ws='Acme Foods', kind='Client · BrightReach', agency=True)

TEAM = lambda: [(row(person('BO','#FFD43B',32), 'Bola Okeke', gap=10), chip('Agency admin','ai'), 'All clients', chip('active','ok')), (row(person('TA','#59D8FF',32), 'Tunde Ade', gap=10), chip('Editor','blue'), 'Acme, Lagos Fitness', chip('active','ok')), (row(person('CN','#22C55E',32), 'Chioma Nwosu', gap=10), chip('Client approver','warn'), 'Acme Foods', chip('active','ok')), (row(person('IF','#E4E8F1',32), 'ifeoma@…', gap=10), chip('Editor','blue'), 'Kemi’s Kitchen', row(chip('invited · 6 days left','neutral','clock'), btn('Resend','ghost',size='sm'), gap=6))]
@screen('AG-04','Team & invitations','Team','agency',('filled',('invite','Invite'),('seats','Seat limit'),'loading'))
def _(st, f, t):
    head = page_head('Team', '4 people · 5 of 10 seats', [btn('Invite','primary','plus','Team-Invite.dc.html')], eb='Agency')
    if st == 'loading': app_page(f, t, 'team', head + sk_table(4, 4), h=950, **AG); return
    lim = banner('blue','10 of 10 seats used','Remove someone or add seats.') if st == 'seats' else ''
    m = overlay(row(art('team',150), col(H('Invite someone',26), P('They get an email and 7 days to accept.'), gap=4), gap=10) + field('Email','ifeoma@brightreach.ng','email') + field('Role','Editor','select') + field('Workspaces','Kemi’s Kitchen','select') + P('Editors create and schedule content, but can’t change approval rules or billing.', size=13) + row(btn('Cancel','ghost'), grow(), btn('Send invite','cta',arrow=True), gap=10), maxw=540) if st == 'invite' else ''
    app_page(f, t, 'team', head + lim + table(['Person','Role','Workspaces','Status'], TEAM()), h=1000, modal=m, **AG)

@screen('AG-05','Roles & permissions','Roles','agency',('filled',))
def _(st, f, t):
    Y, N = icon('check',18,T['okTx'],3), small('—')
    roles = [('Approve content',Y,Y,small('assigned'),N,N,small('per platform')),('Connect accounts',Y,Y,small('assigned'),N,N,N),('Create & edit content',Y,Y,Y,Y,N,N),('Authorize autonomous agents',Y,Y,small('assigned'),N,N,N),('Change billing',Y,Y,N,N,N,N),('See credits',Y,Y,Y,N,N,N),('Pause agents',Y,Y,small('assigned'),small('assigned'),N,N),('View audit log',Y,Y,small('assigned'),N,N,N)]
    app_page(f, t, 'team', page_head('Roles', 'What each role can do. Platform admins are separate and audited.', [], eb='Agency') + table(['Capability','Owner','Admin','Manager','Editor','Viewer','Client'], roles), h=1000, **AG)

AUD = lambda: [('Tue 14:02', row(person('CN','#22C55E',28), 'Chioma', gap=6), chip('approved · Instagram','ok','check'), '5 budgeting myths · r2', 'Acme Foods'), ('Tue 13:40', row(person('TA','#59D8FF',28), 'Tunde', gap=6), chip('edited YouTube title','blue','pen'), '5 budgeting myths', 'Acme Foods'), ('Tue 12:10', row(person('CN','#22C55E',28), 'Chioma', gap=6), chip('requested changes · YouTube','warn','alert'), '5 budgeting myths · r1', 'Acme Foods'), ('Mon 09:12', row(person('BO','#FFD43B',28), 'Bola', gap=6), chip('invited client approver','ai','mail'), 'chioma@acmefoods.ng', 'Acme Foods'), ('Mon 09:00', row(agent('pink','blob',28,False), 'Recipe Reels', gap=6), chip('paused · budget','warn','pause'), 'Agent', 'Kemi’s Kitchen')]
@screen('AG-06','Audit log','AuditLog','agency',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Audit log', 'Every change, approval and publish. Entries can’t be edited.', [btn('Export','secondary','download')], eb='Agency')
    flt = row(field('Workspace','All clients','select'), field('Person','Anyone','select'), field('Action','All actions','select'), gap=12)
    if st == 'empty': inner = head + flt + empty('audit','Nothing logged for these filters','Try a wider date range or a different person.', 'Clear filters')
    elif st == 'loading': inner = head + flt + sk_table(5, 5)
    else: inner = head + flt + table(['When','Who','Action','Item','Workspace'], AUD())
    app_page(f, t, 'audit', inner, h=1100, **AG)

# client portal
def item(ti, due, plats, bg, d, href='ClientApproval.dc.html', tag=None):
    return f'<a href="{href}" style="text-decoration: none; color: {T["tx"]}">' + card(row(thumb(ti[:4].upper(), bg, 64, d, '#FFD43B'), col(h3(ti,18), row(*[plat(p,24) for p in plats], small(due), gap=6), gap=6), grow(), tag or btn('Review','cta',arrow=True), gap=14), pad=16, anim=A('up', .06*d)) + '</a>'
@screen('CP-01','Client portal home','ClientPortal','agency',('filled','empty','loading',('approved','Approved tab'),('published','Published tab')))
def _(st, f, t):
    tabi = {'approved':1,'published':3}.get(st, 0)
    hi = row(col(H('Hi Chioma',36), P('BrightReach needs your OK on these posts.', size=16), gap=6), grow(), art('approvals', 160), gap=12)
    tb = tabs(['Waiting for you 3','Approved','Changes requested','Published'], tabi)
    if st == 'empty': inner = hi.replace('needs your OK on these posts.','will email you when something’s ready.') + tb + empty('inbox','Nothing waiting for you','We’ll email you when BrightReach sends something to review. Approving takes seconds, even on your phone.','View published posts', href='ClientPortal-Published.dc.html')
    elif st == 'loading': inner = col(sk('180px',30,10), sk('300px',14), gap=10) + tb + col(*[card(row(sk('64px',114,12), col(sk('60%',16), sk('40%',12), gap=8, style='flex: 1'), sk('110px',44,999), gap=14), pad=16) for _ in range(3)], gap=12)
    elif st == 'approved': inner = hi + tb + col(item('Weekly recap','Approved Tue','yt'.split(),'#59D8FF',1, tag=chip('approved','ok','check')), item('Meal prep Monday','Approved Mon','ig yt'.split(),'#FF7A2F',2, tag=chip('approved','ok','check')), gap=12)
    elif st == 'published': inner = hi + tb + col(item('Rent hacks','Live on Instagram · 3.1k views','ig'.split(),'#B6F24A',3, tag=chip('published','ok','check')), item('Savings 101','Live on YouTube','yt'.split(),'#FFD43B',0, tag=chip('published','ok','check')), gap=12) + small('Analytics are visible because BrightReach turned them on.')
    else: inner = hi + tb + col(item('5 budgeting myths','Due Fri','ig yt'.split(),'#9B7BFF',0), item('Jollof on a budget','Due Thu','ig'.split(),'#FF7A2F',1), item('Rent hacks part 2','Overdue since Mon','ig'.split(),'#59D8FF',2), gap=12) + small('You can only see Acme Foods content.')
    portal_page(f, t, inner, h=1000)

@screen('CP-02','Client approval detail','ClientApproval','agency',('filled',('decided','Approved'),('newer','Newer revision'),'loading'))
def _(st, f, t):
    if st == 'loading': portal_page(f, t, sk('240px',14) + sk('360px',34,10) + sk('320px',40,999) + grid([card(f'<div style="aspect-ratio: 9/16; max-width: 320px; margin: 0 auto; width: 100%; border-radius: 22px; background: {T["s3"]}; {A("pulse")}"></div>', pad=18), col(sk_card(), sk('100%',100,16), gap=14)], cols=2, gap=20), h=1100); return
    head = col(small('From BrightReach · revision 2 · due Fri'), H('5 budgeting myths',38), gap=4) + tabs(['Instagram · approved','YouTube · needs you'],1)
    if st == 'decided': act = f'<div style="display: flex; align-items: center; gap: 16px; padding: 18px; border-radius: 28px; background: {T["okT"]}"><span style="--r: -8deg; display: inline-flex; padding: 8px 16px; border-radius: 16px; border: 4px solid {T["okTx"]}; color: {T["okTx"]}; font-family: {HF}; font-weight: 800; font-size: 22px; {A("stamp",.2)}">APPROVED</span>{P("You approved YouTube. BrightReach was notified. Thanks!", T["tx"])}</div>'
    elif st == 'newer': act = banner('ai','There’s a newer version','The video changed, so your earlier approval no longer applies.','View revision 3')
    else: act = field('Comment (optional)','', 'textarea','Anything the team should know?') + row(btn('Approve YouTube','cta',None,'ClientApproval-Decided.dc.html','lg',arrow=True), btn('Request changes','secondary','pen',size='lg'), btn('Reject','danger','x'), gap=10) + small('Your decision only applies to YouTube. Instagram is already approved.')
    inner = head + grid([card(video('5 BUDGETING MYTHS', 320, '#59D8FF', 1, '#FF4FB8'), pad=18), col(card(card_head('YouTube title & description'), P('5 budgeting myths students believe', size=18, color=T['tx'], w=800), P('Myth #1: you need to track every naira. Here’s what actually works instead.', size=14), chip('Changed since you last looked','ai','spark'), pad=22), act, gap=14)], cols=2, gap=20)
    portal_page(f, t, inner, h=1100)
build_all(only=['agency'])
