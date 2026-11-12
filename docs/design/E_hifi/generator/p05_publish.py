from lib import *
CUR['page'] = 'publishing'; theme('dark')

# PB-01 Calendar
def ev(p, t, title, tone):
    bg, fg = TONES()[tone]
    return f'<div style="display: flex; gap: 6px; align-items: center; padding: 6px 8px; border-radius: 10px; background: {bg}; border-left: 0">{plat(p,20)}<div style="min-width: 0"><div style="font-size: 12px; font-weight: 700; color: {T["tx"]}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{e(title)}</div><div style="font-size: 11px; color: {fg}; font-weight: 600">{e(t)}</div></div></div>'
days = ['Mon 10','Tue 11','Wed 12','Thu 13','Fri 14','Sat 15','Sun 16']
evs = {0:[ev('ig','18:00 · published','Rent hacks','teal')], 1:[ev('yt','12:00 · failed','Savings 101','red')], 2:[ev('ig','18:00 · scheduled','5 budgeting myths','blue'), ev('yt','18:00 · changes requested','5 budgeting myths','orange')],
       3:[ev('ig','09:00 · needs approval','Jollof on a budget','orange')], 4:[ev('ig','18:00 · scheduled','Stop budgeting like this','blue'), ev('yt','18:30 · held: license','Chef Kemi remix','red')], 6:[ev('ig','17:00 · draft','Weekly recap','neutral')]}
cells = ''.join(f'<div style="min-height: 260px; padding: 10px; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 8px; {"background: "+T["s2"]+";" if i==2 else ""}"><div style="font-size: 13px; font-weight: 700; color: {T["tx"] if i==2 else T["mu"]}">{d}{" · today" if i==2 else ""}</div>{"".join(evs.get(i,[]))}</div>' for i, d in enumerate(days))
cal = f'<div style="overflow-x: auto; border: 1px solid {T["bd"]}; border-radius: 20px; background: {T["s1"]}"><div style="display: grid; grid-template-columns: repeat(7, minmax(150px, 1fr)); min-width: 1050px">{cells}</div></div>'
legend = row(chip('scheduled','blue','clock'), chip('needs approval','orange','alert'), chip('published','teal','check'), chip('failed / held','red','x'), chip('draft'), gap=8)
inner = page_head('Calendar', 'Times shown in West Africa Time (WAT).', [tabs(['Week','Month'],0), btn('New post','primary','plus')]) + row(tabs(['All','Instagram','YouTube'],0), grow(), btn('','secondary','chev'), small('10 – 16 Nov 2026'), gap=10) + cal + legend
app_page('Calendar.dc.html', 'PB-01 Content calendar', 'calendar', inner, h=1000)

# PB-02 Drafts
rows_ = [('5 budgeting myths', row(plat('ig',22), plat('yt',22), gap=4), row(chip('IG approved','teal','check'), chip('YT changes','orange','alert'), gap=4), row(person('TA','#6CB4FF',24,'#0D0D12'), 'Tunde', gap=6), '2h'),
         ('Jollof on a budget', plat('ig',22), chip('waiting on client','orange','clock'), row(agent('grape','blob',24), 'Recipe Reels', gap=6), '5h'),
         ('Savings challenge', plat('yt',22), chip('not submitted'), row(person('AO','#FFB547',24,'#0D0D12'), 'Ada', gap=6), '1d'),
         ('Chef Kemi remix', plat('yt',22), chip('held: license revoked','red','alert'), row(agent('lime','circle',24), 'Budget Shorts', gap=6), '2d')]
inner = page_head('Drafts', None, [btn('New post','primary','plus')]) + row(tabs(['All 9','Mine','By agents','Held 1'],0), grow(), gap=10) + table(['Draft','Platforms','Approval','Created by','Updated'], rows_)
app_page('Drafts.dc.html', 'PB-02 Drafts', 'drafts', inner, h=900)

# PB-03 Post detail
dest_rows = [(row(plat('ig',28), 'Instagram Reels', gap=10), chip('approved · r2','teal','check'), chip('confirming with Instagram','blue','clock'), '1', small('We’ll update this automatically')),
             (row(plat('yt',28), 'YouTube Shorts', gap=10), chip('changes requested','orange','alert'), chip('held','neutral','pause'), '0', btn('Revise','secondary','pen',size='sm'))]
hist = lst([('Revision 2: YouTube title shortened','Tunde · Tue 13:40 · Instagram approval kept', person('TA','#6CB4FF',32,'#0D0D12')),
            ('Instagram approved, YouTube changes requested','Chioma (client) · Tue 12:10 · “Title too long for Shorts”', person('CN','#3DDBA0',32,'#0D0D12')),
            ('Submitted revision 1','Tunde · Mon 16:02', person('TA','#6CB4FF',32,'#0D0D12'))])
checks = card(card_head('Pre-publish checks', small('Run again right before posting')), lst([('Latest revision','r2', icon('check',20,T['teal'])),('Approval','Instagram ✓ · YouTube pending', icon('alert',20,T['orange'])),('License','Own upload', icon('check',20,T['teal'])),('Account connected','Instagram ✓ · YouTube ✓', icon('check',20,T['teal']))]), pad=18)
inner = page_head('5 budgeting myths', 'Scheduled Wed 12 Nov, 18:00 WAT', [btn('Edit','secondary','pen'), btn('Schedule approved platforms','primary','calendar')], crumbs='Drafts › 5 budgeting myths', badge=chip('partly approved','orange','alert')) + \
    table(['Platform','Approval','Publish status','Attempts',''], dest_rows) + \
    banner('blue','Instagram upload is being confirmed','The upload finished but Instagram hasn’t confirmed it yet. We check before any retry so it never posts twice.') + \
    grid([card(video('5 BUDGETING MYTHS', maxw=280), pad=18), col(checks, card(card_head('History'), hist, pad=18), gap=16)], cols=2, gap=20, style='grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr)')
app_page('PostDetail.dc.html', 'PB-03 Post detail', 'drafts', inner, h=1250)

# PB-04 Approvals queue
rows_ = [('5 budgeting myths', row(chip('IG ✓','teal'), chip('YT ✎','orange'), gap=4), row(person('CN','#3DDBA0',24,'#0D0D12'), 'Chioma · client', gap=6), 'Fri', chip('partly approved','orange','alert')),
         ('Jollof on a budget', chip('IG','neutral'), row(person('CN','#3DDBA0',24,'#0D0D12'), 'Chioma · client', gap=6), 'Thu', chip('waiting','blue','clock')),
         ('Weekly recap', chip('YT','neutral'), row(person('AO','#FFB547',24,'#0D0D12'), 'You · internal', gap=6), '—', chip('waiting on you','lime','alert')),
         ('Rent hacks part 2', chip('IG','neutral'), row(person('CN','#3DDBA0',24,'#0D0D12'), 'Chioma · client', gap=6), 'Mon (overdue)', chip('overdue · still held','red','clock'))]
inner = page_head('Approvals', None, []) + tabs(['Waiting on client 3','Waiting on you 1','Changes requested 1','Decided'],0) + table(['Post','Platforms','Approver','Due','Status'], rows_) + \
    banner('orange','Overdue posts never auto-approve','“Rent hacks part 2” stays held until Chioma decides. Send a reminder?','Send reminder')
app_page('Approvals.dc.html', 'PB-04 Approvals queue', 'approvals', inner, h=900)

# PB-05 Approval detail
dec = lambda p, n, st, tone, ic: card(row(plat(p,32), h3(n,15), grow(), chip(st, tone, ic), gap=10), pad=14)
comments = lst([('“Title too long for Shorts.”','Chioma · YouTube · Tue 12:10', person('CN','#3DDBA0',32,'#0D0D12')), ('“Shortened it, please check again.”','Tunde · YouTube · Tue 13:40', person('TA','#6CB4FF',32,'#0D0D12'))])
inner = page_head('5 budgeting myths · revision 2', None, [btn('Compare r1 ↔ r2','secondary','eye')], crumbs='Approvals › 5 budgeting myths') + \
    grid([card(tabs(['Instagram','YouTube'],1), video('5 BUDGETING MYTHS', maxw=300, bg='#21304A'), kv([('YouTube title','5 budgeting myths students believe'),('Changed in r2','Title only')]), pad=20),
          col(card(card_head('Decisions by platform'), dec('ig','Instagram','approved (kept from r1)','teal','check'), dec('yt','YouTube','changes requested','orange','alert'), pad=18),
              banner('grape','Only YouTube needs a fresh look','This revision changed YouTube text only, so Instagram’s approval still stands.'),
              card(card_head('Comments'), comments, field('Add a comment','', 'textarea','Write a comment…'), pad=18), gap=16)], cols=2, gap=20)
app_page('ApprovalDetail.dc.html', 'PB-05 Approval detail', 'approvals', inner, h=1200)

# ---------------- Analytics ----------------
CUR['page'] = 'analytics'
mrows = [('Views','12.4k','8.1k'),('Watch time', chip('not provided','neutral'), '41 h'),('Saves','312', chip('not provided','neutral')),('New followers','+184','+96')]
inner = page_head('Analytics', 'Only numbers the platforms give us, each with when it was last updated.', [tabs(['7 days','28 days','90 days'],1)]) + \
    grid([stat('Views','20.5k','+18% vs last 28 days',ic='eye'), stat('Engagement','6.2%','likes, comments, shares',ic='smile'), stat('Followers gained','+280',ic='users'), stat('Posts published','24',ic='zap')], cols=4, minw=220) + \
    card(card_head('Views over time', row(chip('Instagram','neutral'), chip('YouTube','neutral'), gap=6)), spark((40,52,48,70,66,90,84,110,96,130), label='Views over time, rising'), row(small('Instagram updated 14:00 WAT'), small('· YouTube updated 12:30 WAT'), gap=6), pad=20) + \
    table(['Metric','Instagram','YouTube'], mrows)
app_page('Analytics.dc.html', 'AN-01 Analytics overview', 'analytics', inner, h=1150)
rows_ = [(row(video('MYTHS',maxw=36,play=False,sub=''), '5 budgeting myths', gap=10), plat('ig',22), '6.8k', '7.4%', '14:00'), (row(video('STOP',maxw=36,play=False,sub='',bg='#21304A'), 'Stop budgeting like this', gap=10), plat('yt',22), '4.2k', '5.1%', '12:30'),
         (row(video('RENT',maxw=36,play=False,sub='',bg='#3A2A22'), 'Rent hacks', gap=10), plat('ig',22), '3.1k', '6.0%', '14:00')]
inner = page_head('Content performance', None, [tabs(['28 days'],0)], crumbs='Analytics') + table(['Post','Platform','Views','Engagement','Updated'], rows_)
app_page('ContentPerformance.dc.html', 'AN-02 Content performance', 'analytics', inner, h=800)
rows_ = [(row(agent('lime','circle',28), 'Budget Shorts', gap=10), '9', '2.3k', '540 cr', '60 cr'), (row(agent('grape','blob',28), 'Recipe Reels', gap=10), '6', '1.1k', '600 cr', '100 cr'), (row(agent('blue','square',28), 'Podcast Clipper', gap=10), '2', '0.9k', '120 cr', '60 cr')]
inner = page_head('Agent performance', 'What each agent produced and what it cost.', [], crumbs='Analytics') + table(['Agent','Posts','Avg views','Credits used','Cost per post'], rows_) + \
    card(card_head('Credits vs views', small('Last 8 weeks')), spark((30,45,40,60,58,72,70,88), color=T['grape'], bars=True, label='Credits used per week'), pad=20)
app_page('AgentPerformance.dc.html', 'AN-03 Agent performance', 'analytics', inner, h=950)
inner = page_head('Campaigns & experiments', None, [btn('New experiment','primary','plus')], crumbs='Analytics') + \
    grid([card(row(h3('Back-to-school push'), grow(), chip('running','lime','zap'), gap=8), meter('Goal: 1,000 new followers', 62, '620 / 1,000'), small('Ends 30 Nov'), pad=20),
          card(row(h3('Hook A vs Hook B'), grow(), chip('collecting data','blue','clock'), gap=8), grid([stat('Hook A','7.4%','engagement'), stat('Hook B','6.1%','engagement')], cols=2, gap=10), small('Too early to call: 2 more days of data needed'), pad=20)], cols=2, minw=360) + \
    banner('blue','Attribution is approximate','Platforms report different numbers on different delays, so results are directional, not exact.')
app_page('Campaigns.dc.html', 'AN-04 Campaigns & experiments', 'analytics', inner, h=850)
