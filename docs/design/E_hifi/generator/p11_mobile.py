from lib import *
CUR['page'] = 'mobile'; theme('dark')

mobile_page('MobileHome.dc.html', 'Mobile · Command Center',
  f'<div style="background: {T["lime"]}; border-radius: 24px; padding: 18px; color: {T["onlime"]}; display: flex; flex-direction: column; gap: 10px"><span style="font-size: 13px; font-weight: 700">Nelio AI · this week</span><h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: 28px; letter-spacing: -0.03em; line-height: 1.05">3 shorts are ready for you.</h1><a href="#" style="align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 12px; background: {T["onlime"]}; color: {T["lime"]}; font-weight: 800; text-decoration: none; font-size: 14px; min-height: 44px; box-sizing: border-box">Review {icon("arrowr",14)}</a></div>' +
  card(card_head('Needs you', chip('4','orange')), lst([('4 posts to approve', None, bubble('check','orange',32), icon('chev',18)), ('Instagram sign-in expiring', None, bubble('link','red',32), icon('chev',18)), ('Recipe Reels paused', None, bubble('wallet','orange',32), icon('chev',18))]), pad=14, gap=10) +
  grid([stat('Active','2',ic='bot'), stat('Credits','760',ic='zap')], cols=2, gap=10) +
  card(row(agent('lime','circle',36), col(h3('Budget Shorts',15), small('Next run 15:00'), gap=1), grow(), chip('active','lime','zap'), gap=10), pad=14), tab='home')

mobile_page('MobileActivity.dc.html', 'Mobile · Activity',
  row(H('Activity',28), grow(), btn('','secondary','pause',size='sm'), gap=8) + f'<div style="overflow: hidden">{tabs(["All","Running","Blocked","Failed"],0)}</div>' +
  lst([('Transcribing podcast_ep12', 'Budget Shorts · step 2 of 5', agent('lime','circle',32), chip('running','lime')), ('Render needs 40 cr', '24 left in budget', agent('grape','blob',32), chip('blocked','orange')),
       ('Confirming with Instagram', 'No retry until we know', agent('grape','blob',32), chip('confirming','blue')), ('YouTube upload failed', 'Daily limit reached', agent('lime','circle',32), chip('failed','red')),
       ('Render finished', '36 cr (est. 40)', agent('lime','circle',32), chip('done','teal'))]), tab='activity')

mobile_page('MobileApprovals.dc.html', 'Mobile · Approvals',
  H('Approvals',28) + f'<div style="overflow: hidden">{tabs(["Waiting 4","Changes","Decided"],0)}</div>' +
  col(*[card(row(video(t, maxw=56, play=False, sub=''), col(h3(n,15), row(*[plat(p,20) for p in ps], small(d), gap=4), gap=4), grow(), icon('chev',18), gap=10), pad=12) for t, n, ps, d in
        [('MYTHS','5 budgeting myths',['ig','yt'],'Fri'),('JOLLOF','Jollof on a budget',['ig'],'Thu'),('RECAP','Weekly recap',['yt'],'—'),('RENT','Rent hacks part 2',['ig'],'Overdue')]], gap=10), tab='approvals')

ptop = f'<header style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}"><span aria-hidden="true" style="width: 36px; height: 36px; border-radius: 10px; background: {T["orange"]}; color: #0D0D12; font-family: {HF}; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">B</span><div><div style="font-size: 14px; font-weight: 700">BrightReach</div><div style="font-size: 11px; color: {T["mu"]}">Acme Foods</div></div>{grow()}{ibtn("bell","Notifications")}</header>'
mobile_page('MobileClientApproval.dc.html', 'Mobile · Client approval',
  col(small('Revision 2 · due Fri'), H('5 budgeting myths',24), gap=2) + tabs(['Instagram ✓','YouTube'],1) + video('5 BUDGETING MYTHS', maxw=210, bg='#21304A') +
  P('YouTube title: “5 budgeting myths students believe”', size=13, color=T['tx']) +
  btn('Approve YouTube','primary','check',full=True,size='lg') + row(f'<div style="flex: 1">{btn("Request changes","secondary","pen",full=True)}</div>', f'<div style="flex: 0 0 auto">{btn("Reject","danger")}</div>', gap=8, wrap=False), top=ptop, bar=False)

mtop = f'<header style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid {T["bd"]}">{ibtn("x","Close")}<div style="flex-grow: 1"><div style="font-size: 14px; font-weight: 700">Clip 1</div><div style="font-size: 11px; color: {T["mu"]}">podcast_ep12</div></div>{btn("Render","primary",size="sm")}</header>'
trim = f'<div style="position: relative; height: 56px; border-radius: 14px; background: {T["s2"]}"><div style="position: absolute; left: 14%; right: 30%; top: 0; bottom: 0; border-radius: 14px; border: 3px solid {T["lime"]}; box-sizing: border-box"></div><span aria-hidden="true" style="position: absolute; left: calc(14% - 8px); top: 10px; width: 16px; height: 36px; border-radius: 6px; background: {T["lime"]}"></span><span aria-hidden="true" style="position: absolute; right: calc(30% - 8px); top: 10px; width: 16px; height: 36px; border-radius: 6px; background: {T["lime"]}"></span></div>'
mobile_page('MobileClipTrim.dc.html', 'Mobile · Clip review & trim',
  video('STOP BUDGETING LIKE THIS', maxw=230) + trim + row(small('0:12'), grow(), small('42 s'), grow(), small('0:54'), gap=4) +
  row(chip('Bold pop','lime','type'), chip('9:16','neutral'), chip('Hook A','grape','spark'), gap=6) + banner('blue','Full timeline editing is on bigger screens','Trim, style and approve here.'), top=mtop, bar=False)

agenda = lambda d, items: col(f'<div style="font-size: 13px; font-weight: 700; color: {T["mu"]}">{d}</div>', *[card(row(plat(p,28), col(h3(t,14), small(s), gap=1), grow(), chip(st, tn), gap=10), pad=12) for p, t, s, st, tn in items], gap=8)
mobile_page('MobileCalendar.dc.html', 'Mobile · Calendar',
  row(H('This week',28), grow(), btn('','primary','plus',size='sm'), gap=8) +
  agenda('Today · Wed 12', [('ig','5 budgeting myths','18:00','scheduled','blue'), ('yt','5 budgeting myths','18:00','changes','orange')]) +
  agenda('Thu 13', [('ig','Jollof on a budget','09:00','approval','orange')]) + agenda('Fri 14', [('ig','Stop budgeting like this','18:00','scheduled','blue')]), tab='calendar')

mobile_page('MobileNotifications.dc.html', 'Mobile · Notifications',
  row(H('Notifications',28), grow(), gap=8) + lst([('Chioma approved Instagram','5 budgeting myths · 2m', bubble('check','teal',32)), ('Render finished','Stop budgeting like this · 10m', bubble('film','lime',32)), ('License ends in 5 days','Chef Kemi · 1h', bubble('shield','blue',32)), ('80% of budget used','Budget Shorts · 3h', bubble('wallet','orange',32)), ('New sign-in','Chrome on Windows · 1d', bubble('key','grape',32))]), tab='more')

otop = f'<header style="display: flex; align-items: center; padding: 14px 16px">{logo(20)}{grow()}<a href="#" style="font-size: 14px; font-weight: 700; color: {T["tx"]}">Skip</a></header>'
mobile_page('MobileOnboarding.dc.html', 'Mobile · Onboarding',
  steps(4,0) + H('How will you use Nelio?',30) + P('You can change it later.') + col(choice('Creator','My own channels', True, 'smile','lime'), choice('Business','My brand, small team', False, 'grid','grape'), choice('Agency','Client work', False, 'users','blue'), gap=10) + btn('Continue','primary','arrowr',full=True,size='lg'), top=otop, bar=False)

mobile_page('MobileAgent.dc.html', 'Mobile · Agent',
  row(agent('lime','circle',56), col(H('Budget Shorts',22), chip('active','lime','zap'), gap=6), gap=12) + meter('Weekly budget', 60, '180 / 300') +
  kv([('Mode','Assisted'),('Posts to', row(plat('ig',20), plat('yt',20), gap=4)),('Next run','Today 15:00')]) + btn('Pause agent','secondary','pause',full=True,size='lg') + btn('Open full settings on desktop','ghost',full=True), tab='more')

mobile_page('MobileUpload.dc.html', 'Mobile · Upload',
  H('Add a video',28) + f'<div style="border: 2px dashed {T["lime"]}; border-radius: 20px; padding: 18px; background: {T["limeT"]}; display: flex; flex-direction: column; gap: 10px">' + row(bubble('film','lime',40), col(h3('ep13.mp4',15), small('2.3 GB'), gap=1), gap=10) + meter('', 64, '1 min left') + '</div>' +
  card(h3('Who owns this?',15), check('I own it', True, radio=True), check('I have permission', False, radio=True), check('Nelio license', False, radio=True), pad=14, gap=10) +
  kv([('Quality','Balanced'),('Estimated','≈22 credits')]) + btn('Start processing','primary','zap',full=True,size='lg'), tab='more')
