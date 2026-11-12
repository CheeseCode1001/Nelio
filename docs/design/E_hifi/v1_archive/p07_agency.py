from lib import *
CUR['page'] = 'agency'; theme('dark')

def conn(p, name, handle, state, tone, ic, note, action, caps):
    capr = row(*[chip(c, 'neutral' if not ok else 'teal', 'check' if ok else 'x') for c, ok in caps], gap=6)
    return card(row(plat(p,44), col(h3(name,17), small(handle), gap=2), grow(), chip(state, tone, ic), gap=12), P(note, size=13), capr, action, pad=20)
inner = page_head('Connections', 'Agents can only post to accounts connected here.', []) + \
    banner('blue','YouTube and Instagram are in development','Connections use the official sign-in for each platform. We switch publishing on once each platform approves Nelio.') + \
    grid([conn('ig','Instagram','@adastudio · Business','connected','teal','check','Healthy. Token renews automatically.', btn('Manage','secondary',size='sm'), [('Publish Reels',True),('Analytics',True),('Native scheduling',False)]),
          conn('ig','Instagram','@adaclips · Creator','sign-in expired','red','alert','7 scheduled posts are on hold until you reconnect.', btn('Reconnect','primary','refresh',size='sm'), [('Publish Reels',True),('Analytics',True)]),
          conn('yt','YouTube','Ada Studio','permissions needed','orange','lock','Upload permission wasn’t granted. Reconnect and allow uploads.', btn('Grant permission','primary',size='sm'), [('Upload Shorts',False),('Analytics',True)]),
          conn('yt','YouTube','Ada Brand channel','pending platform approval','blue','clock','Waiting on YouTube’s review of Nelio. Nothing for you to do.', btn('Learn more','ghost',size='sm'), [('Upload Shorts',False)]),
          conn('tt','TikTok','—','coming later','neutral','clock','We’ll let you know when TikTok is ready.', btn('Notify me','secondary',size='sm'), []),
          conn('fb','Facebook','—','coming later','neutral','clock','We’ll let you know when Facebook is ready.', btn('Notify me','secondary',size='sm'), [])], cols=3, minw=320) + \
    small('Plan: 2 of 6 accounts used.')
app_page('Connections.dc.html', 'IN-01 Social connections hub', 'connections', inner, h=1150)

inner = page_head('Instagram · @adastudio', 'Business account · connected 12 Oct 2026', [btn('Reconnect','secondary','refresh'), btn('Disconnect','danger','x')], crumbs='Connections › Instagram', badge=chip('connected','teal','check')) + \
    grid([card(card_head('Health'), kv([('Status', chip('connected','teal','check')),('Sign-in renews','in 2 days (automatic)'),('Last post','Today 18:02'),('Rate limit','12 of 50 posts today')]), pad=20),
          card(card_head('What Nelio can do here'), lst([('Publish Reels','Yes', icon('check',20,T['teal'])),('Read analytics','Views, reach, saves', icon('check',20,T['teal'])),('Schedule inside Instagram','Not available, so Nelio schedules instead', icon('x',20,T['mu']))]), pad=20)], cols=2) + \
    card(card_head('Used by'), lst([('Budget Shorts','Agent · posts 3×/week', agent('lime','circle',32)),('Recipe Reels','Agent · autonomous', agent('grape','blob',32)),('7 scheduled posts','Next: Fri 18:00', bubble('calendar','blue',32))]), pad=20) + \
    banner('orange','Disconnecting holds 7 scheduled posts and pauses 2 agents','You can reconnect any time to resume them.')
app_page('ConnectionDetail.dc.html', 'IN-02 Connection detail', 'connections', inner, h=1050)

AGWS, AGK = 'BrightReach', 'Agency'
clients = [(row(person('A','#6CB4FF',32,'#0D0D12'), 'Acme Foods', gap=10), '2', chip('3 waiting','orange','clock'), chip('IG sign-in expiring','red','alert'), meter('',52,'420 / 800 cr')),
           (row(person('L','#3DDBA0',32,'#0D0D12'), 'Lagos Fitness', gap=10), '1', chip('none','neutral'), chip('all good','teal','check'), meter('',30,'120 / 400 cr')),
           (row(person('K','#FF8AC8',32,'#0D0D12'), 'Kemi’s Kitchen', gap=10), '3', chip('1 waiting','orange','clock'), chip('license ending','orange','shield'), meter('',100,'600 / 600 cr · paused','orange'))]
inner = page_head('BrightReach · all clients', None, [btn('Add client','primary','plus')]) + \
    grid([stat('Clients','3',ic='users', fill=T['grape']), stat('Waiting on clients','4',ic='clock'), stat('Published this week','31',ic='zap'), stat('Credits this month','1,140',ic='wallet')], cols=4, minw=200) + \
    table(['Client','Agents','Waiting on client','Issues','Credits this month'], clients) + \
    card(card_head('Across clients today'), lst([('Chioma approved Instagram for “5 budgeting myths”','Acme Foods · 2m', person('CN','#3DDBA0',32,'#0D0D12')),('Kemi’s Kitchen reached its monthly limit','Agents paused · raise limit or wait until 1 Dec', bubble('wallet','orange',32)),('Tunde submitted 2 posts to Lagos Fitness','12m', person('TA','#6CB4FF',32,'#0D0D12'))]), pad=20)
app_page('AgencyHub.dc.html', 'AG-01 Agency hub', 'agencyhub', inner, h=1150, ws=AGWS, kind=AGK, agency=True)

modal = overlay(H('New client workspace',26) + P('Everything in it stays separate from your other clients.') + field('Client name','Lagos Fitness') + grid([field('Logo','Upload…'), field('Timezone','Africa/Lagos (WAT)','select')], cols=2) + field('Monthly credit limit','400', hint='Work pauses when it’s reached') +
    row(btn('Cancel','ghost'), grow(), btn('Create workspace','primary','plus'), gap=10) + small('Agency plan: 3 of 10 client workspaces used.'), maxw=540)
app_page('Clients.dc.html', 'AG-02 Client workspaces', 'clients', page_head('Clients', None, [btn('Add client','primary','plus')]) + table(['Client','Members','Accounts','Created'], [('Acme Foods','4','3','Sep 2026'),('Lagos Fitness','2','2','Oct 2026'),('Kemi’s Kitchen','3','2','Oct 2026')]), h=950, ws=AGWS, kind=AGK, agency=True, modal=modal)

inner = page_head('Acme Foods', 'Client workspace settings', [btn('Save','primary')], crumbs='Clients › Acme Foods') + tabs(['Approval policy','Members','Accounts','Brand kit','Limits'],0) + \
    grid([card(card_head('Approval policy'), toggle('Client approval required before publishing', True), toggle('Approve each platform separately', True, 'Chioma can approve Instagram and send YouTube back.'), toggle('Internal review before the client sees it', False),
              field('Approval deadline','2 days after submission','select'), toggle('Let the client see analytics for published posts', False), pad=22),
          col(banner('orange','A missed deadline never auto-approves','Posts stay held and we remind the client.'), card(card_head('Who approves'), lst([('Chioma Nwosu','Client approver · chioma@acmefoods.ng', person('CN','#3DDBA0',36,'#0D0D12'), chip('active','teal'))]), btn('Add approver','secondary','plus'), pad=22), gap=16)], cols=2, gap=20)
app_page('ClientSettings.dc.html', 'AG-03 Client workspace settings', 'clients', inner, h=1000, ws='Acme Foods', kind='Client · BrightReach', agency=True)

team = [(row(person('BO','#FFB547',28,'#0D0D12'), 'Bola Okeke', gap=10), chip('Agency admin','grape'), 'All clients', chip('active','teal')),
        (row(person('TA','#6CB4FF',28,'#0D0D12'), 'Tunde Ade', gap=10), chip('Editor','blue'), 'Acme, Lagos Fitness', chip('active','teal')),
        (row(person('CN','#3DDBA0',28,'#0D0D12'), 'Chioma Nwosu', gap=10), chip('Client approver','orange'), 'Acme Foods', chip('active','teal')),
        (row(person('IF','#3A3A4A',28), 'ifeoma@…', gap=10), chip('Editor','blue'), 'Kemi’s Kitchen', row(chip('invited · 6 days left','neutral','clock'), btn('Resend','ghost',size='sm'), gap=6))]
modal = overlay(H('Invite someone',24) + field('Email','ifeoma@brightreach.ng','email') + field('Role','Editor','select') + field('Workspaces','Kemi’s Kitchen','select') + P('Editors can create and schedule content, but can’t change approval rules or billing.', size=13) + row(btn('Cancel','ghost'), grow(), btn('Send invite','primary','mail'), gap=10), top=140, maxw=500)
app_page('Team.dc.html', 'AG-04 Team & invitations', 'team', page_head('Team', '4 people · 5 of 10 seats', [btn('Invite','primary','plus')]) + table(['Person','Role','Workspaces','Status'], team), h=950, ws=AGWS, kind=AGK, agency=True, modal=modal)

Y, N = icon('check',18,T['teal']), small('—')
roles = [('Approve content',Y,Y,small('assigned'),N,N,small('per platform')),('Connect accounts',Y,Y,small('assigned'),N,N,N),('Create & edit content',Y,Y,Y,Y,N,N),('Authorize autonomous agents',Y,Y,small('assigned'),N,N,N),('Change billing',Y,Y,N,N,N,N),('View audit log',Y,Y,small('assigned'),N,N,N),('See other clients',Y,Y,small('assigned'),small('assigned'),small('assigned'),N)]
app_page('Roles.dc.html', 'AG-05 Roles & permissions', 'team', page_head('Roles', 'What each role can do. Platform admins are separate and audited.', []) + table(['Capability','Owner','Admin','Manager','Editor','Viewer','Client'], roles), h=900, ws=AGWS, kind=AGK, agency=True)

audit = [('Tue 14:02', row(person('CN','#3DDBA0',24,'#0D0D12'), 'Chioma', gap=6), chip('approved · Instagram','teal','check'), '5 budgeting myths · r2', 'Acme Foods'),
         ('Tue 13:40', row(person('TA','#6CB4FF',24,'#0D0D12'), 'Tunde', gap=6), chip('edited YouTube title','blue','pen'), '5 budgeting myths', 'Acme Foods'),
         ('Tue 12:10', row(person('CN','#3DDBA0',24,'#0D0D12'), 'Chioma', gap=6), chip('requested changes · YouTube','orange','alert'), '5 budgeting myths · r1', 'Acme Foods'),
         ('Mon 09:12', row(person('BO','#FFB547',24,'#0D0D12'), 'Bola', gap=6), chip('invited client approver','grape','mail'), 'chioma@acmefoods.ng', 'Acme Foods'),
         ('Mon 09:00', row(agent('grape','blob',24), 'Recipe Reels', gap=6), chip('paused · budget','orange','pause'), 'Agent', 'Kemi’s Kitchen')]
app_page('AuditLog.dc.html', 'AG-06 Audit log', 'audit', page_head('Audit log', 'Every change, approval and publish. Entries can’t be edited.', [btn('Export','secondary','download')]) + row(field('Workspace','All clients','select'), field('Person','Anyone','select'), field('Action','All actions','select'), gap=12) + table(['When','Who','Action','Item','Workspace'], audit), h=1000, ws=AGWS, kind=AGK, agency=True)

# Client portal
item = lambda t, due, plats, tone='orange': card(row(video(t.upper()[:14], maxw=72, play=False, sub=''), col(h3(t,17), row(*[plat(p,22) for p in plats], small(due), gap=6), gap=6), grow(), btn('Review','primary','arrowr',size='sm'), gap=14), pad=16)
inner = col(H('Hi Chioma',34), P('BrightReach needs your OK on these posts.', size=16), gap=6) + tabs(['Waiting for you 3','Approved','Changes requested','Published'],0) + \
    col(item('5 budgeting myths','Due Fri','ig yt'.split()), item('Jollof on a budget','Due Thu','ig'.split()), item('Rent hacks part 2','Overdue since Mon','ig'.split()), gap=12) + small('You can only see Acme Foods content.')
portal_page('ClientPortal.dc.html', 'CP-01 Client portal home', inner, h=900)
inner = col(small('From BrightReach · revision 2 · due Fri'), H('5 budgeting myths',34), gap=4) + tabs(['Instagram · approved','YouTube · needs you'],1) + \
    grid([card(video('5 BUDGETING MYTHS', maxw=320, bg='#21304A'), pad=18),
          col(card(card_head('YouTube title & description'), P('5 budgeting myths students believe', size=17, color=T['tx'], w=700), P('Myth #1: you need to track every naira. Here’s what actually works instead.', size=14), chip('Changed since you last looked','grape','spark'), pad=20),
              field('Comment (optional)','', 'textarea','Anything the team should know?'), row(btn('Approve YouTube','primary','check',size='lg'), btn('Request changes','secondary','pen',size='lg'), btn('Reject','danger','x'), gap=10),
              small('Your decision only applies to YouTube. Instagram is already approved.'), gap=14)], cols=2, gap=20)
portal_page('ClientApproval.dc.html', 'CP-02 Client approval detail', inner, h=1000)
