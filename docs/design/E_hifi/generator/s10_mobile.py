from frame import *

def mstat(l, v, fill=None): return stat(l, v, fill=fill)
def mhead(t, right=''): return row(H(t, 28), grow(), right, gap=8)
@screen('MB-01','Mobile · Home','MobileHome','mobile',('filled','empty','loading'))
def _(st, f, t):
    if st == 'loading': inner = f'<div style="height: 190px; border-radius: 28px; background: {T["s3"]}; {A("pulse")}"></div>' + sk_rows(3) + grid([sk_stat(), sk_stat()], cols=2, gap=10)
    elif st == 'empty': inner = f'<div style="border-radius: 28px; background: {T["lime"]}; padding: 18px; display: flex; flex-direction: column; gap: 10px; color: {OL}">{art("welcome", 300)}{H("Let’s make your first short.", 26, OL)}{btn("Upload a video","cta",None,"MobileUpload.dc.html",full=True,arrow=True)}</div>' + card(row(h3('Finish setting up'), grow(), chip('0 of 5','neutral'), gap=8), meter('', 4, ''), pad=16)
    else: inner = f'<div style="border-radius: 28px; background: {T["acc"]}; padding: 18px; color: #FFFFFF; display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden">{lime_blob(200,"#3D63FF","right: -60px; bottom: -80px")}<div style="position: relative; display: flex; flex-direction: column; gap: 10px">{sticker("Nelio AI · this week","#FF4FB8",-3,"spark",12)}<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: 26px; letter-spacing: -0.03em; line-height: 1.05">3 shorts are ready for you.</h1>{btn("Review","lime",None,"MobileApprovals.dc.html")}</div></div>' + \
        card(card_head('Needs you', chip('4','warn')), lst([('4 posts to approve', None, bubble('check','warn',34), icon('chev',18)), ('Instagram sign-in expiring', None, bubble('link','err',34), icon('chev',18)), ('Recipe Reels paused', None, bubble('wallet','warn',34), icon('chev',18))]), pad=14, gap=10) + grid([mstat('Active','2'), mstat('Credits used','760','#B6F24A')], cols=2, gap=10)
    mobile_page(f, t, inner, 'home')
FEED = lambda: lst([('Transcribing podcast_ep12', 'Budget Shorts · step 2 of 5', agent('lime','circle',34), chip('running','blue')), ('Render needs 40 cr', '24 left in budget', agent('pink','blob',34), chip('blocked','warn')), ('Confirming with Instagram', 'No retry until we know', agent('pink','blob',34), chip('confirming','blue')), ('YouTube upload failed', 'Daily limit reached', agent('lime','circle',34), chip('failed','err')), ('Render finished', '36 cr (est. 40)', agent('lime','circle',34), chip('done','ok'))])
@screen('MB-02','Mobile · Activity','MobileActivity','mobile',('filled','empty','loading'))
def _(st, f, t):
    tb = f'<div style="overflow: hidden">{tabs(["All","Running","Blocked","Failed"],0)}</div>'
    body = {'filled': FEED(), 'empty': empty('agents','Nothing running yet','Agent work shows up here live.','Create an agent', w=200), 'loading': sk_rows(5)}[st]
    mobile_page(f, t, mhead('Activity', ibtn('pause','Pause all','PauseConfirm.dc.html')) + tb + body, 'activity')
@screen('MB-03','Mobile · Approvals','MobileApprovals','mobile',('filled','empty','loading'))
def _(st, f, t):
    items = [('MYTHS','5 budgeting myths',['ig','yt'],'Fri','#9B7BFF'),('JOLLOF','Jollof on a budget',['ig'],'Thu','#FF7A2F'),('RECAP','Weekly recap',['yt'],'—','#59D8FF'),('RENT','Rent hacks part 2',['ig'],'Overdue','#B6F24A')]
    if st == 'filled': body = col(*[f'<a href="MobileClientApproval.dc.html" style="text-decoration: none; color: {T["tx"]}">' + card(row(thumb(c, bg, 52, i, '#FFD43B'), col(h3(n,15), row(*[plat(p,22) for p in ps], small(d), gap=4), gap=4), grow(), icon('chev',18), gap=10), pad=12, anim=A('up',.05*i)) + '</a>' for i, (c, n, ps, d, bg) in enumerate(items)], gap=10)
    elif st == 'empty': body = empty('approvals','Nothing to approve','You’re all caught up.', None, w=220)
    else: body = col(*[card(row(sk('52px',92,10), col(sk('70%',14), sk('40%',10), gap=8, style='flex: 1'), gap=10), pad=12) for _ in range(4)], gap=10)
    mobile_page(f, t, mhead('Approvals') + f'<div style="overflow: hidden">{tabs(["Waiting 4","Changes","Decided"],0)}</div>' + body, 'approvals')
def agenda(d, items): return col(f'<div style="font-size: 13px; font-weight: 800; color: {T["mu"]}">{d}</div>', *[card(row(plat(p,30), col(h3(ti,14), small(s), gap=1), grow(), chip(stt, tn), gap=10), pad=12) for p, ti, s, stt, tn in items], gap=8)
@screen('MB-04','Mobile · Calendar','MobileCalendar','mobile',('filled','empty','loading'))
def _(st, f, t):
    if st == 'filled': body = agenda('Today · Wed 12', [('ig','5 budgeting myths','18:00','scheduled','blue'), ('yt','5 budgeting myths','18:00','changes','warn')]) + agenda('Thu 13', [('ig','Jollof on a budget','09:00','approval','warn')]) + agenda('Fri 14', [('ig','Stop budgeting','18:00','scheduled','blue')])
    elif st == 'empty': body = empty('calendar','Nothing this week','Agents fill this as they draft.','New post', w=220)
    else: body = sk('40%',12) + sk_rows(2) + sk('30%',12) + sk_rows(1)
    mobile_page(f, t, mhead('This week', ibtn('plus','New post','Composer.dc.html')) + body, 'calendar')
@screen('MB-05','Mobile · More','MobileMore','mobile',('filled',))
def _(st, f, t):
    items = [('spark','Strategist','Strategist.dc.html'),('bot','Agents','Agents.dc.html'),('scissors','Clipping Studio','MobileClipTrim.dc.html'),('pen','Content Studio','ContentStudio.dc.html'),('chart','Analytics','Analytics.dc.html'),('shield','Licensing','Marketplace.dc.html'),('link','Connections','Connections.dc.html'),('wallet','Billing & usage','Billing.dc.html'),('gear','Settings','WorkspaceSettings.dc.html')]
    body = f'<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px">' + ''.join(f'<a href="{h}" style="text-decoration: none; color: {T["tx"]}; background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 20px; padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 700; text-align: center; {A("up",.03*i)}">{bubble(ic, ["blue","ai","lime","warn","ok","blue","ai","lime","neutral"][i], 42)}{l}</a>' for i, (ic, l, h) in enumerate(items)) + '</div>'
    mobile_page(f, t, mhead('More') + body + banner('blue','Full editing is on bigger screens','On your phone: approve, monitor, trim and pause.'), 'more')
@screen('MB-06','Mobile · Notifications','MobileNotifications','mobile',('filled','empty'))
def _(st, f, t):
    body = lst([('Chioma approved Instagram','5 budgeting myths · 2m', bubble('check','ok',34)), ('Render finished','Stop budgeting · 10m', bubble('film','lime',34)), ('License ends in 5 days','Chef Kemi · 1h', bubble('shield','blue',34)), ('80% of budget used','Budget Shorts · 3h', bubble('wallet','warn',34)), ('New sign-in','Chrome on Windows · 1d', bubble('key','ai',34))]) if st == 'filled' else empty('notifications','All caught up','We’ll ping you when something needs you.', None, w=220)
    mobile_page(f, t, mhead('Notifications') + body, 'more', top=mtop('Notifications'))
ptop = lambda: f'<header style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}"><span aria-hidden="true" style="width: 40px; height: 40px; border-radius: 12px; background: {T["orange"]}; border: 2px solid {OL}; box-sizing: border-box; color: {OL}; font-family: {HF}; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">B</span><div><div style="font-size: 14px; font-weight: 800">BrightReach</div><div style="font-size: 11px; color: {T["mu"]}">Acme Foods</div></div>{grow()}{ibtn("bell","Notifications")}</header>'
@screen('MB-07','Mobile · Client portal','MobileClientPortal','mobile',('filled','empty'))
def _(st, f, t):
    body = (col(*[f'<a href="MobileClientApproval.dc.html" style="text-decoration: none; color: {T["tx"]}">' + card(row(thumb(c, bg, 52, i, '#FFD43B'), col(h3(n,15), small(d), gap=4), grow(), btn('Review','cta',size='sm'), gap=10), pad=12) + '</a>' for i, (c, n, d, bg) in enumerate([('MYTHS','5 budgeting myths','Due Fri','#9B7BFF'),('JOLLOF','Jollof on a budget','Due Thu','#FF7A2F')])], gap=10)) if st == 'filled' else empty('inbox','Nothing waiting','We’ll email you when BrightReach sends something.', None, w=220)
    mobile_page(f, t, H('Hi Chioma',28) + P('BrightReach needs your OK on these.') + body, bar=False, top=ptop())
@screen('MB-08','Mobile · Client approval','MobileClientApproval','mobile',('filled',('decided','Approved')))
def _(st, f, t):
    act = f'<div style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 22px; background: {T["okT"]}"><span style="--r: -8deg; display: inline-flex; padding: 6px 12px; border-radius: 12px; border: 3px solid {T["okTx"]}; color: {T["okTx"]}; font-family: {HF}; font-weight: 800; font-size: 17px; {A("stamp",.2)}">APPROVED</span>{small("BrightReach was notified.", T["tx"], 700)}</div>' if st == 'decided' else btn('Approve YouTube','cta',None,'MobileClientApproval-Decided.dc.html','lg',True,arrow=True) + row(f'<div style="flex: 1">{btn("Request changes","secondary","pen",full=True)}</div>', f'<div style="flex: 0 0 auto">{btn("Reject","danger")}</div>', gap=8, wrap=False)
    mobile_page(f, t, col(small('Revision 2 · due Fri'), H('5 budgeting myths',24), gap=2) + tabs(['Instagram ✓','YouTube'],1) + video('5 BUDGETING MYTHS', 200, '#59D8FF', 1, '#FF4FB8') + P('YouTube title: “5 budgeting myths students believe”', size=13, color=T['tx']) + act, top=ptop(), bar=False)
@screen('MB-09','Mobile · Clip review & trim','MobileClipTrim','mobile',('filled','loading'))
def _(st, f, t):
    top = f'<header style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}">{ibtn("x","Close","MobileHome.dc.html")}<div style="flex-grow: 1"><div style="font-size: 14px; font-weight: 800">Clip 1</div><div style="font-size: 11px; color: {T["mu"]}">podcast_ep12</div></div>{btn("Render","primary",size="sm")}</header>'
    if st == 'loading': body = f'<div style="aspect-ratio: 9/16; width: 220px; margin: 0 auto; border-radius: 22px; background: {T["s3"]}; {A("pulse")}"></div>' + sk('100%',56,16) + sk('60%',12)
    else:
        trim = f'<div style="position: relative; height: 58px; border-radius: 16px; background: {T["s2"]}"><div style="position: absolute; left: 14%; right: 30%; top: 0; bottom: 0; border-radius: 16px; border: 3px solid {T["acc"]}; background: {T["accT"]}; box-sizing: border-box"></div><span aria-hidden="true" style="position: absolute; left: calc(14% - 8px); top: 10px; width: 16px; height: 38px; border-radius: 6px; background: {T["acc"]}"></span><span aria-hidden="true" style="position: absolute; right: calc(30% - 8px); top: 10px; width: 16px; height: 38px; border-radius: 6px; background: {T["acc"]}"></span></div>'
        body = video('STOP BUDGETING LIKE THIS', 220, '#9B7BFF', 2, '#FFD43B') + trim + row(small('0:12'), grow(), small('42 s', T['tx'], 800), grow(), small('0:54'), gap=4) + row(chip('Bold pop','lime','type'), chip('9:16','neutral'), chip('Hook A','ai','spark'), gap=6) + banner('blue','Full timeline is on bigger screens','Trim, style and approve here.')
    mobile_page(f, t, body, top=top, bar=False)
@screen('MB-10','Mobile · Onboarding','MobileOnboarding','mobile',('filled',('done','All set')))
def _(st, f, t):
    top = f'<header style="display: flex; align-items: center; padding: 14px 16px">{logo(20)}{grow()}<a href="MobileHome-Empty.dc.html" style="font-size: 14px; font-weight: 700; color: {T["tx"]}">Skip</a></header>'
    if st == 'done': body = f'<div style="display: flex; justify-content: center">{art("success", 260)}</div>' + big('You’re in.', 40) + P('Your studio is ready.', size=15) + btn('Go to Home','cta',None,'MobileHome-Empty.dc.html','lg',True,arrow=True)
    else: body = steps(4,0) + H('How will you use Nelio?',28) + P('You can change it later.') + col(choice('Creator','My own channels', True, 'smile','lime'), choice('Business','My brand, small team', False, 'grid','blue'), choice('Agency','Client work', False, 'users','ai'), gap=10) + btn('Continue','cta',None,'MobileOnboarding-Done.dc.html','lg',True,arrow=True)
    mobile_page(f, t, body, top=top, bar=False)
@screen('MB-11','Mobile · Agent','MobileAgent','mobile',('filled',('paused','Paused')))
def _(st, f, t):
    p = st == 'paused'
    body = row(agent('lime','circle',64), col(H('Budget Shorts',24), chip('paused' if p else 'active','neutral' if p else 'blue','pause' if p else 'zap'), gap=6), gap=12) + meter('Weekly budget', 60, '180 / 300') + kv([('Mode','Assisted'),('Posts to', row(plat('ig',22), plat('yt',22), gap=4)),('Next run','—' if p else 'Today 15:00')]) + (btn('Resume agent','primary','play',full=True,size='lg') if p else btn('Pause agent','secondary','pause','MobileAgent-Paused.dc.html','lg',True)) + btn('Open full settings on desktop','ghost',full=True)
    mobile_page(f, t, body, 'more')
@screen('MB-12','Mobile · Upload','MobileUpload','mobile',('filled',('uploading','Uploading')))
def _(st, f, t):
    drop = f'<div style="border: 3px dashed {T["acc"]}; border-radius: 24px; padding: 18px; background: {T["accT"]}; display: flex; flex-direction: column; gap: 10px">' + (row(thumb('EP13','#59D8FF',44,1,'#FF4FB8'), col(h3('ep13.mp4',15), small('2.3 GB'), gap=1), gap=10) + meter('', 64, '1 min left') if st == 'uploading' else f'<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center">{art("upload",200)}{btn("Choose a video","primary","upload")}</div>') + '</div>'
    body = H('Add a video',28) + drop + card(h3('Who owns this?',15), check('I own it', True, radio=True), check('I have permission', False, radio=True), check('Nelio license', False, radio=True), pad=16, gap=10) + kv([('Quality','Balanced'),('Estimated','≈22 credits')]) + btn('Start processing','cta',None,None,'lg',True,arrow=True)
    mobile_page(f, t, body, 'more')
@screen('MB-13','Mobile · Offline','MobileOffline','mobile',('filled',))
def _(st, f, t):
    mobile_page(f, t, f'<div style="padding: 10px 14px; border-radius: 16px; background: {T["warnT"]}; display: flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 700">{icon("wifioff",16,T["warnTx"])}You’re offline · showing cached data</div>' + f'<div style="display: flex; justify-content: center">{art("offline", 240)}</div>' + H('Approvals paused',24) + P('Nothing is queued while offline, so nothing posts by surprise.') + lst([('5 budgeting myths','Last synced 14:02', thumb('M','#9B7BFF',36,2,'#FFD43B'), chip('waiting','blue'))]), 'approvals')
build_all(only=['mobile'])
