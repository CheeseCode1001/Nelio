from frame import *

def ev(p, tm, title, tone):
    bg, fg = TONES()[tone]
    return f'<a href="PostDetail.dc.html" style="text-decoration: none; display: flex; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 14px; background: {bg}">{plat(p,24)}<div style="min-width: 0"><div style="font-size: 12.5px; font-weight: 800; color: {T["tx"]}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{e(title)}</div><div style="font-size: 11.5px; color: {fg}; font-weight: 700">{e(tm)}</div></div></a>'
@screen('PB-01','Content calendar','Calendar','publishing',('filled','empty','loading',('month','Month view'),('drag','Rescheduling')))
def _(st, f, t):
    head = page_head('Calendar', 'Times in West Africa Time (WAT).', [tabs(['Week','Month'], 1 if st == 'month' else 0), btn('New post','primary','plus','Composer.dc.html')], eb='Publish')
    tb = row(tabs(['All','Instagram','YouTube'],0), grow(), ibtn('chev','Previous week'), small('10 – 16 Nov 2026', T['tx'], 800), ibtn('chev','Next week'), gap=10)
    legend = row(chip('scheduled','blue','clock'), chip('needs approval','warn','alert'), chip('published','ok','check'), chip('failed / on hold','err','x'), chip('draft'), gap=8)
    days = ['Mon 10','Tue 11','Wed 12','Thu 13','Fri 14','Sat 15','Sun 16']
    evs = {0:[ev('ig','18:00 · published','Rent hacks','ok')], 1:[ev('yt','12:00 · failed','Savings 101','err')], 2:[ev('ig','18:00 · scheduled','5 budgeting myths','blue'), ev('yt','18:00 · changes requested','5 budgeting myths','warn')], 3:[ev('ig','09:00 · needs approval','Jollof on a budget','warn')], 4:[ev('ig','18:00 · scheduled','Stop budgeting like this','blue'), ev('yt','18:30 · on hold: license','Chef Kemi remix','err')], 6:[ev('ig','17:00 · draft','Weekly recap','neutral')]}
    if st == 'empty': evs = {}
    if st == 'loading':
        cells = ''.join(f'<div style="min-height: 300px; padding: 12px; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 10px">{sk("60%",12)}{sk("100%",44,14,.1*i)}{sk("100%",44,14,.2+.1*i) if i%2 else ""}</div>' for i in range(7))
    else:
        cells = ''
        for i, d in enumerate(days):
            items = ''.join(evs.get(i, []))
            if st == 'drag' and i == 5: items = f'<div style="border: 2px dashed {T["acc"]}; border-radius: 14px; padding: 4px; background: {T["accT"]}">{ev("ig","Drop: Sat 18:00","Stop budgeting like this","blue")}</div>'
            cells += f'<div style="min-height: 300px; padding: 12px; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 8px; {"background: "+T["accT"]+";" if i == 2 else ""}"><div style="font-size: 13px; font-weight: 800; color: {T["accTx"] if i == 2 else T["mu"]}">{d}{" · today" if i == 2 else ""}</div>{items}</div>'
    if st == 'month':
        cells = ''.join(f'<div style="min-height: 120px; padding: 8px; border-right: 1px solid {T["bd"]}; border-bottom: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; font-weight: 800; color: {T["mu"]}">{n}</span>{"".join(dot(c,8) for c in ([T["acc"],T["warn"]] if n in (12,19,26) else ([T["ok"]] if n in (10,17,24) else [])))}</div>' for n in range(1, 31))
        grid_ = f'<div style="overflow-x: auto; border: 1px solid {T["bd"]}; border-radius: 24px; background: {T["s1"]}"><div style="display: grid; grid-template-columns: repeat(7, minmax(120px, 1fr)); min-width: 840px">{cells}</div></div>'
    else: grid_ = f'<div style="overflow-x: auto; border: 1px solid {T["bd"]}; border-radius: 24px; background: {T["s1"]}; box-shadow: {T["shadow"]}"><div style="display: grid; grid-template-columns: repeat(7, minmax(150px, 1fr)); min-width: 1050px">{cells}</div></div>'
    extra = (empty('calendar','Nothing scheduled this week','Your agents fill this as they draft. Or add a post yourself.','New post', None, 'Composer.dc.html', w=220) if st == 'empty' else '') + (banner('blue','Moving to Saturday 18:00','Approvals stay valid. The time isn’t a material change.') if st == 'drag' else '')
    app_page(f, t, 'calendar', head + tb + extra + grid_ + legend, h=1250 if st == 'empty' else 1050)

DRAFTS = lambda: [('5 budgeting myths', row(plat('ig',26), plat('yt',26), gap=4), row(chip('IG approved','ok','check'), chip('YT changes','warn','alert'), gap=4), row(person('TA','#59D8FF',28), 'Tunde', gap=6), '2h'),
                  ('Jollof on a budget', plat('ig',26), chip('waiting on client','warn','clock'), row(agent('pink','blob',28,False), 'Recipe Reels', gap=6), '5h'),
                  ('Savings challenge', plat('yt',26), chip('not submitted'), row(person('AO','#FF7A2F',28), 'Ada', gap=6), '1d'),
                  ('Chef Kemi remix', plat('yt',26), chip('on hold: license revoked','err','alert'), row(agent('lime','circle',28,False), 'Budget Shorts', gap=6), '2d')]
@screen('PB-02','Drafts','Drafts','publishing',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Drafts', None, [btn('New post','primary','plus','Composer.dc.html')], eb='Publish')
    if st == 'empty': inner = head + empty('drafts','No drafts yet','Drafts you and your agents create land here, ready to polish and submit.','New post','Plan with Nelio AI','Composer.dc.html','Strategist.dc.html')
    elif st == 'loading': inner = head + sk('360px',40,999) + sk_table(5, 5)
    else: inner = head + tabs(['All 9','Mine','By agents','On hold 1'],0) + table(['Draft','Platforms','Approval','Created by','Updated'], DRAFTS())
    app_page(f, t, 'drafts', inner, h=1000)

@screen('PB-03','Post detail','PostDetail','publishing',('filled','loading',('published','Published'),('failed','Failed'),('uploading','Uploading'),('held','On hold: license'),('expired','On hold: sign-in')))
def _(st, f, t):
    if st == 'loading':
        app_page(f, t, 'drafts', sk_head() + sk_table(5, 2) + grid([card(f'<div style="aspect-ratio: 9/16; max-width: 280px; margin: 0 auto; width: 100%; border-radius: 22px; background: {T["s3"]}; {A("pulse")}"></div>', pad=18), col(sk_rows(4), sk_rows(3), gap=16)], cols=2, gap=20), h=1300); return
    ig = {'filled':(chip('approved · r2','ok','check'), chip('confirming with Instagram','blue','clock'), '1', small('We’ll update this automatically')),
          'published':(chip('approved · r2','ok','check'), chip('published','ok','check'), '1', link('View on Instagram')),
          'failed':(chip('approved · r2','ok','check'), chip('failed','err','x'), '2', btn('Retry','secondary','refresh',size='sm')),
          'uploading':(chip('approved · r2','ok','check'), row(chip('uploading','blue','upload'), meter('',70,''), gap=8), '1', small('38 of 54 MB')),
          'held':(chip('approved · r2','ok','check'), chip('on hold · license revoked','err','pause'), '0', btn('Remove from schedule','danger',size='sm')),
          'expired':(chip('approved · r2','ok','check'), chip('on hold · sign-in expired','warn','pause'), '0', btn('Reconnect','secondary',None,'Connections.dc.html','sm'))}[st]
    rows_ = [(row(plat('ig',30), 'Instagram Reels', gap=10), *ig), (row(plat('yt',30), 'YouTube Shorts', gap=10), chip('changes requested','warn','alert'), chip('held','neutral','pause'), '0', btn('Revise','secondary','pen',size='sm'))]
    msg = {'filled': banner('blue','Instagram upload is being confirmed','The upload finished but Instagram hasn’t confirmed it yet. We check before any retry, so it never posts twice.'),
           'published': f'<div style="display: flex; align-items: center; gap: 18px; padding: 18px 22px; border-radius: 28px; background: {T["okT"]}; {A("up")}">{art("success",120)}<div>{H("Live on Instagram!",24)}{P("Confirmed by Instagram at 18:02. YouTube is still waiting on changes.", T["tx"])}</div></div>',
           'failed': banner('err','Instagram didn’t accept the upload','Error 2207026: video too long for Reels. Retry uses the same post ID, so it never double-posts.','Retry'),
           'uploading': banner('blue','Uploading to Instagram','Keep this tab open or not, it continues in the background.'),
           'held': banner('err','On hold: license revoked','Campus Comedy revoked this license. This post can’t go out.','Remove', href='MyLicenses.dc.html'),
           'expired': banner('warn','On hold: Instagram sign-in expired','Reconnect @adaclips and this post goes out as scheduled.','Reconnect', href='Connections.dc.html')}[st]
    hist = lst([('Revision 2: YouTube title shortened','Tunde · Tue 13:40 · Instagram approval kept', person('TA','#59D8FF',34)),('Instagram approved, YouTube changes requested','Chioma (client) · Tue 12:10 · “Title too long”', person('CN','#22C55E',34)),('Submitted revision 1','Tunde · Mon 16:02', person('TA','#59D8FF',34))])
    checks = card(card_head('Pre-publish checks', small('Run again right before posting')), lst([('Latest revision','r2', icon('check',20,T['okTx'])),('Approval','Instagram ✓ · YouTube pending', icon('alert',20,T['warnTx'])),('License','Own upload' if st != 'held' else 'Revoked', icon('check' if st != 'held' else 'x',20,T['okTx'] if st != 'held' else T['errTx'])),('Account connected','Instagram ✓ · YouTube ✓' if st != 'expired' else 'Instagram sign-in expired', icon('check' if st != 'expired' else 'alert',20,T['okTx'] if st != 'expired' else T['warnTx']))]), pad=18)
    inner = page_head('5 budgeting myths', 'Scheduled Wed 12 Nov, 18:00 WAT', [btn('Edit','secondary','pen','Composer.dc.html'), btn('Schedule approved platforms','primary','calendar')], crumbs='Drafts › 5 budgeting myths', badge=chip('partly approved','warn','alert')) + \
        table(['Platform','Approval','Publish status','Attempts',''], rows_) + msg + grid([card(video('5 BUDGETING MYTHS', 300, '#9B7BFF', 2, '#FFD43B'), pad=18), col(checks, card(card_head('History'), hist, pad=18), gap=16)], cols=2, gap=20, style='grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr)')
    app_page(f, t, 'drafts', inner, h=1400)

APPR = lambda: [('5 budgeting myths', row(chip('IG ✓','ok'), chip('YT ✎','warn'), gap=4), row(person('CN','#22C55E',28), 'Chioma · client', gap=6), 'Fri', chip('partly approved','warn','alert')),
                ('Jollof on a budget', chip('IG','neutral'), row(person('CN','#22C55E',28), 'Chioma · client', gap=6), 'Thu', chip('waiting','blue','clock')),
                ('Weekly recap', chip('YT','neutral'), row(person('AO','#FF7A2F',28), 'You · internal', gap=6), '—', chip('waiting on you','ai','alert')),
                ('Rent hacks part 2', chip('IG','neutral'), row(person('CN','#22C55E',28), 'Chioma · client', gap=6), 'Mon · overdue', chip('overdue · still held','err','clock'))]
@screen('PB-04','Approvals','Approvals','publishing',('filled','empty','loading',('internal','Internal review')))
def _(st, f, t):
    head = page_head('Approvals', 'Every post that needs a yes before it goes out.', [], eb='Publish')
    if st == 'empty': inner = head + empty('approvals','Nothing waiting for approval','Posts you submit show up here until every platform is approved.','New post', None, 'Composer.dc.html')
    elif st == 'loading': inner = head + sk('480px',40,999) + sk_table(5, 4)
    elif st == 'internal':
        inner = head + tabs(['Waiting on client 3','Waiting on you 1','Changes requested 1','Decided'],1) + banner('ai','Internal review comes first','For Acme Foods, your team reviews before Chioma sees anything.') + table(['Post','Platforms','Step','Due',''], [('Weekly recap', chip('YT','neutral'), row(chip('1 Internal','ink'), icon('arrowr',14), chip('2 Client','neutral'), gap=6), '—', row(btn('Approve for client','primary',size='sm'), btn('Send back','ghost',size='sm'), gap=6))])
    else: inner = head + tabs(['Waiting on client 3','Waiting on you 1','Changes requested 1','Decided'],0) + table(['Post','Platforms','Approver','Due','Status'], APPR()) + banner('warn','Overdue posts never auto-approve','“Rent hacks part 2” stays held until Chioma decides.','Send reminder')
    app_page(f, t, 'approvals', inner, h=1000)

@screen('PB-05','Approval detail','ApprovalDetail','publishing',('filled','loading',('allapproved','All approved'),('invalidated','Re-approval needed')))
def _(st, f, t):
    if st == 'loading':
        app_page(f, t, 'approvals', sk_head() + grid([card(f'<div style="aspect-ratio: 9/16; max-width: 300px; margin: 0 auto; width: 100%; border-radius: 22px; background: {T["s3"]}; {A("pulse")}"></div>', pad=20), col(sk_rows(2), sk_rows(3), gap=16)], cols=2, gap=20), h=1200); return
    dec = lambda p, n, s, tn, ic: card(row(plat(p,36), h3(n,16), grow(), chip(s, tn, ic), gap=10), pad=14)
    if st == 'allapproved': decs = dec('ig','Instagram','approved','ok','check') + dec('yt','YouTube','approved (r2)','ok','check'); note = f'<div style="display: flex; align-items: center; gap: 16px; padding: 18px; border-radius: 28px; background: {T["okT"]}"><span style="--r: -8deg; display: inline-flex; padding: 8px 16px; border-radius: 16px; border: 4px solid {T["okTx"]}; color: {T["okTx"]}; font-family: {HF}; font-weight: 800; font-size: 22px; {A("stamp",.2)}">APPROVED</span>{P("Every platform approved. Ready to schedule.", T["tx"])}{grow()}{btn("Schedule","primary","calendar")}</div>'
    elif st == 'invalidated': decs = dec('ig','Instagram','needs re-approval','warn','alert') + dec('yt','YouTube','needs re-approval','warn','alert'); note = banner('ai','The video changed, so both platforms need a fresh look','Tunde re-cut the video in revision 3. Earlier approvals no longer apply.')
    else: decs = dec('ig','Instagram','approved (kept from r1)','ok','check') + dec('yt','YouTube','changes requested','warn','alert'); note = banner('ai','Only YouTube needs a fresh look','This revision changed YouTube text only, so Instagram’s approval still stands.')
    comments = lst([('“Title too long for Shorts.”','Chioma · YouTube · Tue 12:10', person('CN','#22C55E',34)), ('“Shortened it, please check again.”','Tunde · YouTube · Tue 13:40', person('TA','#59D8FF',34))])
    inner = page_head('5 budgeting myths · revision ' + ('3' if st == 'invalidated' else '2'), None, [btn('Compare revisions','secondary','eye')], crumbs='Approvals › 5 budgeting myths') + \
        grid([card(tabs(['Instagram','YouTube'],1), video('5 BUDGETING MYTHS', 300, '#59D8FF', 1, '#FF4FB8'), kv([('YouTube title','5 budgeting myths students believe'),('Changed in this revision','Video re-cut' if st == 'invalidated' else 'Title only')]), pad=22),
              col(card(card_head('Decisions by platform'), decs, pad=18), note, card(card_head('Comments'), comments, field('Add a comment','', 'textarea','Write a comment…'), pad=18), gap=16)], cols=2, gap=20)
    app_page(f, t, 'approvals', inner, h=1300)

# ---------------- Analytics ----------------
def bars(vals, color, h=170, labels=None):
    mx = max(vals) or 1
    return f'<div role="img" aria-label="Bar chart" style="display: flex; align-items: flex-end; gap: 10px; height: {h}px">' + ''.join(f'<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end"><div style="width: 100%; height: {int(v/mx*(h-24))}px; border-radius: 12px; background: {color}; border: 2px solid {OL}; box-sizing: border-box; transform-origin: bottom; {A("bar", .05*i)}"></div><span style="font-size: 11.5px; color: {T["mu"]}; font-weight: 700">{(labels or [""]*len(vals))[i]}</span></div>' for i, v in enumerate(vals)) + '</div>'
@screen('AN-01','Analytics overview','Analytics','analytics',('filled','empty','loading',('delayed','Data delayed')))
def _(st, f, t):
    head = page_head('Analytics', 'Only numbers the platforms give us, each with when it was last updated.', [tabs(['7 days','28 days','90 days'],1)], eb='Grow')
    if st == 'empty': inner = head + empty('analytics','No numbers yet','Connect an account and publish your first post. Results show up here once the platform reports them.','Connect an account','Publish a post','Connections.dc.html','Composer.dc.html')
    elif st == 'loading': inner = head + grid([sk_stat() for _ in range(4)], cols=4, minw=220) + card(sk('30%',16), f'<div style="height: 200px; border-radius: 18px; background: {T["s3"]}; {A("pulse")}"></div>', pad=22) + sk_table(3, 4)
    else:
        dl = banner('warn','Instagram data is delayed','Last update 6 hours ago. Numbers will catch up automatically.') if st == 'delayed' else ''
        mrows = [('Views','12.4k','8.1k'),('Watch time', chip('not provided','neutral'), '41 h'),('Saves','312', chip('not provided','neutral')),('New followers','+184','+96')]
        inner = head + dl + grid([stat('Views','20.5k','+18% vs last 28 days',ic='eye',fill='#B6F24A',anim=A('up')), stat('Engagement','6.2%','likes, comments, shares',ic='heart',anim=A('up',.05)), stat('Followers gained','+280',ic='users',anim=A('up',.1)), stat('Posts published','24',ic='zap',anim=A('up',.15))], cols=4, minw=220) + \
            card(card_head('Views by week', row(chip('Instagram','neutral'), chip('YouTube','neutral'), gap=6)), bars([3.1,4.2,3.8,5.6,5.2,7.1,6.4,8.8], T['acc'], 200, ['W1','W2','W3','W4','W5','W6','W7','W8']), row(small('Instagram updated 14:00 WAT'), small('· YouTube updated 12:30 WAT'), gap=6), pad=22) + table(['Metric','Instagram','YouTube'], mrows)
    app_page(f, t, 'analytics', inner, h=1300)
@screen('AN-02','Content performance','ContentPerformance','analytics',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Content performance', None, [tabs(['28 days'],0)], crumbs='Analytics')
    if st == 'empty': inner = head + empty('analytics','No published posts yet','Once posts go live, see which ones landed.','Go to calendar', href='Calendar.dc.html')
    elif st == 'loading': inner = head + sk_table(5, 5)
    else: inner = head + table(['Post','Platform','Views','Engagement','Updated'], [(row(thumb('M','#9B7BFF',38,2,'#FFD43B'), '5 budgeting myths', gap=10), plat('ig',26), '6.8k', '7.4%', '14:00'), (row(thumb('S','#59D8FF',38,1,'#FF4FB8'), 'Stop budgeting like this', gap=10), plat('yt',26), '4.2k', '5.1%', '12:30'), (row(thumb('R','#FF7A2F',38,3,'#2F5BFF'), 'Rent hacks', gap=10), plat('ig',26), '3.1k', '6.0%', '14:00')])
    app_page(f, t, 'analytics', inner, h=950)
@screen('AN-03','Agent performance','AgentPerformance','analytics',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Agent performance', 'What each agent produced and what it cost.', [], crumbs='Analytics')
    if st == 'empty': inner = head + empty('agents','No agent results yet','When agents publish, you’ll see posts, views and cost per post for each one.','Create an agent', href='CreateAgent.dc.html')
    elif st == 'loading': inner = head + sk_table(5, 3) + card(f'<div style="height: 190px; border-radius: 18px; background: {T["s3"]}; {A("pulse")}"></div>', pad=22)
    else: inner = head + table(['Agent','Posts','Avg views','Credits used','Cost per post'], [(row(agent('lime','circle',30,False), 'Budget Shorts', gap=10), '9', '2.3k', '540 cr', '60 cr'), (row(agent('pink','blob',30,False), 'Recipe Reels', gap=10), '6', '1.1k', '600 cr', '100 cr'), (row(agent('blue','square',30,False), 'Podcast Clipper', gap=10), '2', '0.9k', '120 cr', '60 cr')]) + card(card_head('Credits used per week', small('Last 8 weeks')), bars([30,45,40,60,58,72,70,88], T['ai'], 180), pad=22)
    app_page(f, t, 'analytics', inner, h=1100)
@screen('AN-04','Campaigns & experiments','Campaigns','analytics',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Campaigns & experiments', None, [btn('New experiment','primary','plus')], crumbs='Analytics')
    if st == 'empty': inner = head + empty('analytics','No campaigns yet','Set a goal and track it, or A/B test two hooks to see which lands.','New experiment')
    elif st == 'loading': inner = head + grid([sk_card(), sk_card()], cols=2)
    else: inner = head + grid([card(row(h3('Back-to-school push'), grow(), chip('running','blue','zap'), gap=8), meter('Goal: 1,000 new followers', 62, '620 / 1,000'), small('Ends 30 Nov'), pad=22), card(row(h3('Hook A vs Hook B'), grow(), chip('collecting data','ai','clock'), gap=8), grid([stat('Hook A','7.4%','engagement',fill='#FFD43B'), stat('Hook B','6.1%','engagement')], cols=2, gap=10), small('Too early to call: 2 more days needed'), pad=22)], cols=2, minw=360) + banner('blue','Attribution is approximate','Platforms report different numbers on different delays, so results are directional.')
    app_page(f, t, 'analytics', inner, h=950)
build_all(only=['publishing','analytics'])
