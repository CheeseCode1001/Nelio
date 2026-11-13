from frame import *

def agent_card(name, color, shape, state, tone, ic, line, meta, budget, pct, bt='acc', d=0, href='AgentDetail.dc.html'):
    return card(row(agent(color, shape, 52), col(h3(name, 18), small(line), gap=3), grow(), chip(state, tone, ic), gap=12, wrap=False),
                meter('Weekly budget', pct, budget, bt), row(small(meta), grow(), ibtn('pause' if state == 'active' else 'play', 'Pause' if state == 'active' else 'Resume'), btn('Open','secondary',None,href,'sm'), gap=8), pad=20, anim=A('up', d))
AGENTS = lambda: [agent_card('Budget Shorts','lime','circle','active','blue','zap','Clips your podcast into 3 shorts a week','Next run today 15:00','180 / 300 cr',60,d=0),
                  agent_card('Podcast Clipper','blue','square','paused','neutral','pause','Paused by you on Monday','Resume re-checks budget & licenses','0 / 200 cr',0,d=.06),
                  agent_card('Recipe Reels','pink','blob','budget reached','warn','alert','Autonomous · Instagram only','Resets Monday 00:00','300 / 300 cr',100,'warn',d=.12)]
def needs():
    return card(card_head('Needs you', chip('4','warn')), lst([('4 posts waiting for approval','Oldest: 2 days', bubble('check','warn',40), btn('Review','primary',None,'Approvals.dc.html','sm')),
         ('Instagram sign-in expires in 2 days','7 scheduled posts depend on it', bubble('link','err',40), btn('Reconnect','secondary',None,'Connections.dc.html','sm')),
         ('License from Chef Kemi ends in 5 days','4 drafts use it', bubble('shield','blue',40), btn('View','secondary',None,'MyLicenses.dc.html','sm')),
         ('Recipe Reels paused: budget reached','300 of 300 credits this week', bubble('wallet','warn',40), btn('Fix','secondary',None,'SpendLimits.dc.html','sm'))]), pad=20)
def live():
    return card(card_head('Live activity', link('See all →','Activity.dc.html')), lst([('Transcribing podcast_ep12.mp4','Budget Shorts · Balanced · step 2 of 5', agent('lime','circle',36), chip('running','blue','refresh')),
         ('Render finished: “5 budgeting myths”','36 credits (estimated 40)', agent('lime','circle',36), chip('done','ok','check')),('Confirming upload with Instagram','We’ll know in a moment', agent('pink','blob',36), chip('confirming','blue','clock'))]), pad=20)
def hero(title='Good morning, Ada. 3 shorts are ready for you.', sub='Your agents made 9 drafts from 2 videos. Review the best 3 and they’ll go out on schedule.'):
    phones = ''.join(f'<div style="margin-left: {"-30px" if i else "0"}; margin-top: {[16,0,22][i]}px">{phone_html(vid_svg(c, cap, i+1, s, None, None, i), r, 120, .4*i)}</div>' for i, (c, cap, s, r) in enumerate([('#9B7BFF','5 MYTHS','#FFD43B',-8),('#FFD43B','STOP THIS','#FF4FB8',0),('#59D8FF','RENT HACK','#2F5BFF',8)]))
    return f'''<section style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch; {A("up")}">
<div style="flex: 2 1 560px; background: {T["acc"]}; border-radius: 36px; padding: {"20px" if MOB["on"] else "30px"}; display: flex; {"flex-direction: column; align-items: stretch;" if MOB["on"] else "align-items: center;"} gap: 20px; color: #FFFFFF; position: relative; overflow: hidden">{lime_blob(300,"#3D63FF","right: -60px; bottom: -120px")}
<div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 14px; position: relative">{sticker("Nelio AI · this week","#FF4FB8",-3,"spark",13)}<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: {ms(40)}px; letter-spacing: -0.035em; line-height: 1.05">{e(title)}</h1><p style="margin: 0; font-size: 16px; font-weight: 500">{e(sub)}</p><div style="display: flex; gap: 10px; flex-wrap: wrap">{btn("Review drafts","lime",None,"Drafts.dc.html",arrow=False)}<a href="Upload.dc.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; border: 2px solid #FFFFFF; color: #FFFFFF; font-weight: 700; text-decoration: none; min-height: 44px; box-sizing: border-box">{icon("upload",16)} New upload</a></div></div>
<div style="display: flex; position: relative; {"justify-content: center; padding: 4px 0 8px" if MOB["on"] else ""}">{phones}</div></div>
<div style="flex: 1 1 280px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">{stat("Agents active","2","1 paused",ic="bot",anim=A("up",.05))}{stat("Waiting on you","4","2 for clients",ic="check",anim=A("up",.1))}{stat("Published","12","this week",ic="zap",fill="#B6F24A",anim=A("up",.15))}{stat("Credits used","760","of 1,000 budget",ic="wallet",anim=A("up",.2))}</div></section>'''
def checklist(done=2):
    items = [('upload','Upload your first video','Upload.dc.html'),('link','Connect an account','Connections.dc.html'),('palette','Add a brand kit','BrandKits.dc.html'),('bot','Create your first agent','CreateAgent.dc.html'),('bell','Choose notifications','NotificationPrefs.dc.html')]
    tiles = ''.join(f'<a href="{h}" style="text-decoration: none; display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 20px; background: {T["okT"] if i < done else T["s2"]}; color: {T["tx"]}; {A("up", .05*i)}">{icon("check",18,T["okTx"],3) if i < done else icon(ic,18,T["accTx"])}<span style="font-size: 13.5px; font-weight: 700; {"text-decoration: line-through; color: "+T["mu"]+";" if i < done else ""}">{e(l)}</span></a>' for i, (ic, l, h) in enumerate(items))
    pct = done * 20
    return card(row(col(h3('Finish setting up', 19), small(f'{done} of 5 done. Agents work better with a brand kit.'), gap=3), grow(), f'<span style="font-family: {HF}; font-weight: 800; font-size: 30px; color: {T["accTx"]}">{pct}%</span>', ibtn('x','Dismiss checklist'), gap=12),
                meter('', pct, '', 'acc'), f'<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px">{tiles}</div>', pad=22)

@screen('APP-01','Command Center','CommandCenter','core',('filled','empty','loading',('paused','Workspace paused'),('trial','Trial'),('pastdue','Payment failed')))
def _(st, f, t):
    if st == 'loading':
        inner = f'<div style="display: flex; gap: 20px; flex-wrap: wrap"><div style="flex: 2 1 560px; height: 290px; border-radius: 36px; background: {T["s3"]}; {A("pulse")}"></div><div style="flex: 1 1 280px; display: grid; grid-template-columns: repeat(2,1fr); gap: 14px">{sk_stat()}{sk_stat()}{sk_stat()}{sk_stat()}</div></div>' + \
                grid([col(sk('180px',20), sk_card(), sk_card(), gap=14), col(sk('140px',20), sk_rows(4), gap=14)], cols=2, gap=20, style='grid-template-columns: minmax(0,1.6fr) minmax(0,1fr)') + loading_note('Loading your studio…')
        app_page(f, t, 'home', inner, h=1300); return
    if st == 'empty':
        hero_e = f'<section style="display: flex; flex-wrap: wrap; gap: 24px; align-items: center; background: {T["lime"]}; border-radius: 36px; padding: 32px; position: relative; overflow: hidden; {A("up")}"><div style="flex: 1 1 420px; display: flex; flex-direction: column; gap: 14px; color: {OL}">{sticker("Welcome, Ada!","#FFD43B",-4,"smile",14)}{big("Let’s make your first short.", 46, OL)}<p style="margin: 0; font-size: 16px; font-weight: 500">Upload a long video you own. Your first agent can take it from there.</p><div style="display: flex; gap: 10px; flex-wrap: wrap">{btn("Upload a video","cta",None,"Upload.dc.html","lg",arrow=True)}{btn("Plan with Nelio AI","secondary","spark","Strategist-Empty.dc.html","lg")}</div></div><div style="flex: 1 1 320px; display: flex; justify-content: center">{art("welcome", 380)}</div></section>'
        inner = hero_e + checklist(0) + grid([empty('agents','No agents yet','Agents research, clip and schedule for you. Start with one, or let Nelio AI suggest a plan.','Create your first agent', 'Ask Nelio AI', 'CreateAgent.dc.html', 'Strategist-Empty.dc.html', 220),
                                              empty('inbox','Nothing needs you','Approvals, expiring sign-ins and budget alerts will show up here.', None, None, w=220)], cols=2, gap=20)
        app_page(f, t, 'home', inner, h=1500); return
    strip = {'paused': topstrip('warn','pause','All agents paused by Ada at 14:02. Nothing new will start.','Resume all','PauseConfirm.dc.html'), 'trial': topstrip('ai','gift','Trial · 2 days left · no card needed, you won’t be charged','Choose a plan','Trial.dc.html'), 'pastdue': topstrip('err','alert','Payment failed · 6 days left to update. Top-ups are paused.','Update payment','PaymentFailed.dc.html')}.get(st, '')
    agents = section_title('Your agents', btn('New agent','secondary','plus','CreateAgent.dc.html','sm')) + grid(AGENTS(), cols=3, minw=280)
    pipe = card(card_head('Content pipeline', small('This week')), pipeline([('Ideas','6','neutral'),('Drafts','9','ai'),('Needs approval','4','warn'),('Scheduled','7','blue'),('Published','12','ok')]), pad=20)
    inner = hero() + checklist(2) + grid([col(agents, pipe, gap=16), col(needs(), live(), gap=16)], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr)')
    app_page(f, t, 'home', inner, h=1650, banner_html=strip)

msg_u = lambda t, d=0: f'<div style="align-self: flex-end; max-width: 78%; background: {T["acc"]}; color: #FFFFFF; border-radius: 24px 24px 6px 24px; padding: 13px 18px; font-size: 15px; line-height: 1.5; {A("up",d)}">{e(t)}</div>'
msg_a = lambda t, d=0: f'<div style="display: flex; gap: 10px; align-items: flex-end; max-width: 86%; {A("up",d)}">{agent("pink","blob",36)}<div style="background: {T["aiT"]}; border-radius: 24px 24px 24px 6px; padding: 13px 18px; font-size: 15px; line-height: 1.5; color: {T["tx"]}">{e(t)}</div></div>'
def composer():
    return f'<div style="display: flex; gap: 10px; align-items: center; padding: 8px 8px 8px 20px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}"><label for="ask" style="position: absolute; left: -9999px">Message Nelio AI</label><input id="ask" placeholder="Ask Nelio AI to plan, research or write…" style="flex-grow: 1; background: transparent; border: none; color: {T["tx"]}; font-size: 15px; font-family: {BF}; min-height: 44px">{btn("","primary","arrowr")}</div>'
def plan_card():
    return card(row(chip('Proposed plan','ai','spark'), chip('Not active yet','neutral'), gap=8), H('Budget tips for students', 26),
        kv([('Goal','Grow Instagram + YouTube Shorts'),('Cadence','3 posts a week · Mon, Wed, Fri 18:00'),('Sources','Your uploads + 2 licensed creators'),('Posts to', row(plat('ig',24), plat('yt',24), gap=6)),('Mode', chip('Assisted · you approve','blue','check')),('Budget','300 credits / week (estimate)')]),
        banner('blue','Nothing runs until you approve','Approving creates the agent. You can pause it any time.'), row(btn('Approve & create agent','cta',None,'AgentDetail.dc.html',arrow=True), btn('Edit plan','secondary','pen'), gap=10), pad=24, anim=A('up',.2))
@screen('APP-02','AI Strategist','Strategist','core',('filled','empty',('thinking','Thinking'),('error','Error'),('history','History')))
def _(st, f, t):
    head = page_head('Strategist', 'Plan with Nelio AI. It proposes, you decide.', [btn('History','secondary','clock','Strategist-History.dc.html')], badge=sticker('Nelio AI','#FF4FB8',-3,'spark',12,False))
    if st == 'empty':
        sugg = grid([card(bubble(ic, tn, 44), h3(a), P(b, size=13), pad=18, anim=A('up', .06*i)) for i, (ic, tn, a, b) in enumerate([('search','blue','Research my niche','Trends and gaps for student finance'),('pen','ai','Write 5 hooks','For my next podcast episode'),('calendar','lime','Plan next month','A posting calendar with budget'),('trophy','warn','What’s working?','From my published posts')])], cols=4, minw=200)
        inner = head + f'<div style="display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; padding: 20px 0">{art("strategist", 320)}{big("What should we make this week?", 44)}{P("Tell Nelio AI your goal. It researches, proposes a plan and a budget, and waits for your OK.", size=16)}</div>' + sugg + composer()
        app_page(f, t, 'strategist', inner, h=1200); return
    if st == 'history':
        inner = head + lst([(n, s, bubble('spark','ai',40), chip(c, tn)) for n, s, c, tn in [('Budget tips for students','12 Nov · became agent “Budget Shorts”','approved','ok'),('Back-to-school campaign','8 Nov · plan only','draft','neutral'),('Recipe Reels plan','2 Nov · became agent “Recipe Reels”','approved','ok'),('Competitor scan: money creators','30 Oct · research','saved','blue')]])
        app_page(f, t, 'strategist', inner, h=900); return
    chat = [msg_u('I want 3 shorts a week on budgeting tips for Nigerian students.'), msg_a('Love it. Myth-busting and “I tried it for a week” formats are strong in your niche. Here’s a plan using your podcast and two licensed creators.', .1), msg_u('Can we keep it under 300 credits a week?', .2)]
    if st == 'filled': chat.append(msg_a('Done. I trimmed it to 3 posts and Balanced transcription. Estimated 280–300 credits a week.', .3))
    elif st == 'thinking': chat.append(f'<div style="display: flex; gap: 10px; align-items: center">{agent("pink","blob",36)}<div style="background: {T["aiT"]}; border-radius: 24px; padding: 14px 18px; display: flex; gap: 6px; align-items: center">' + ''.join(f'<span style="width: 9px; height: 9px; border-radius: 50%; background: {T["aiTx"]}; {A("pulse", .2*i, 1)}"></span>' for i in range(3)) + f'<span style="margin-left: 8px; font-size: 14px; color: {T["aiTx"]}; font-weight: 700">Re-planning your budget…</span></div></div>')
    else: chat.append(banner('err','Nelio AI couldn’t finish that','Nothing was changed and no credits were used.','Try again'))
    right = col(plan_card() if st == 'filled' else card(sk('40%',14), sk('70%',26,10), sk_lines(5), pad=24), card(card_head('What Nelio AI found'), lst([('Myth-busting formats','Top theme in your niche this month', bubble('trophy','lime',38)),('Peak time: 18:00–21:00 WAT','For your audience on Instagram', bubble('clock','blue',38)),('Gap: rent & side hustles','Few creators covering it', bubble('zap','warn',38))]), small('Insights are suggestions from public trends, not guarantees.'), pad=20), gap=16)
    inner = head + grid([card(col(*chat, gap=14), row(chip('Research my niche','ai','search'), chip('Write 5 hooks','ai','pen'), chip('Plan next month','ai','calendar'), gap=8), composer(), pad=24, gap=18), right], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr)')
    app_page(f, t, 'strategist', inner, h=1300)

def feed():
    return lst([('Transcribing podcast_ep12.mp4','Budget Shorts · Balanced · started 14:02', agent('lime','circle',38), chip('running','blue','refresh')),
                ('Scene detection','Budget Shorts · waiting for transcript', agent('lime','circle',38), chip('queued','neutral','clock')),
                ('Render “Jollof on a budget”','Needs 40 credits, 24 left in this agent’s budget', agent('pink','blob',38), chip('blocked · budget','warn','lock')),
                ('“5 budgeting myths” → Acme client','Waiting for client approval', agent('blue','square',38), chip('needs approval','warn','alert')),
                ('Upload to Instagram','Finished, but Instagram hasn’t confirmed yet. No retry until we know.', agent('pink','blob',38), chip('confirming','blue','clock')),
                ('Upload to YouTube','Daily upload limit reached. Retry after 00:00 UTC.', agent('lime','circle',38), chip('failed','err','x')),
                ('Render “Stop budgeting like this”','36 credits used (estimated 40) · 4 refunded', agent('lime','circle',38), chip('done','ok','check'))])
def run_detail():
    return card(row(agent('lime','circle',48), col(h3('Budget Shorts · run #128',18), small('Started 14:02 · triggered by schedule'), gap=2), gap=12), grid([stat('Estimated','52 cr'), stat('Used so far','18 cr')], cols=2, gap=10),
        stepper_list([('Upload & check file','done','2.1 GB · 48 min'),('Transcribe','running','Balanced quality'),('Detect scenes','queued','Waits for transcript'),('Rank moments','queued','Nelio AI'),('Render previews','queued','3 clips')]), row(btn('Pause run','secondary','pause'), btn('View log','ghost','list'), gap=8), pad=22)
@screen('APP-03','AI Activity Center','Activity','core',('filled','empty','loading',('reconnecting','Reconnecting'),('synced','Back online'),('filtered','Filtered: none')))
def _(st, f, t):
    head = page_head('Activity', 'Everything your agents are doing, live.', [btn('Pause all','secondary','pause','PauseConfirm.dc.html')])
    tb = row(tabs(['All','Running 2','Queued 3','Blocked 1','Needs approval 4','Failed 1','Done'], 5 if st == 'filtered' else 0), grow(), chip('Live','ok','activity') if st not in ('reconnecting',) else chip('Reconnecting…','warn','refresh'), gap=10)
    if st == 'empty': inner = head + empty('agents','Nothing running yet','When agents start working, every step shows up here live: what they’re doing, what it costs and anything that needs you.','Create an agent','Upload a video','CreateAgent.dc.html','Upload.dc.html')
    elif st == 'loading': inner = head + tb + grid([sk_rows(7), card(sk('60%',18), grid([sk_stat(), sk_stat()], cols=2), sk_lines(5), pad=22)], cols=2, gap=20, style='grid-template-columns: minmax(0,1.5fr) minmax(0,1fr)')
    elif st == 'filtered': inner = head + tb + empty('search','No failed runs this week','Nice. Everything that ran succeeded.','Show all activity', href='Activity.dc.html')
    else:
        b = {'reconnecting': banner('warn','Reconnecting…','Your agents keep working in the background.'), 'synced': banner('ok','Back online · synced','2 runs finished while you were away. Showing the latest from the server.')}.get(st, '')
        inner = head + b + tb + grid([feed(), run_detail()], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr)')
    app_page(f, t, 'activity', inner, h=1250)

@screen('APP-04','Agents','Agents','core',('filled','empty','loading',('limit','Plan limit')))
def _(st, f, t):
    head = page_head('Agents', '3 of 5 agents on Creator Pro.', [btn('Ask Nelio AI','ai','spark','Strategist.dc.html'), btn('New agent','primary','plus','CreateAgent.dc.html')])
    if st == 'empty': inner = page_head('Agents', 'Your AI team lives here.', [btn('New agent','primary','plus','CreateAgent.dc.html')]) + empty('agents','Hire your first agent','An agent clips, plans or posts on a schedule, inside the budget and approval rules you set.','Create an agent','Plan with Nelio AI','CreateAgent.dc.html','Strategist-Empty.dc.html')
    elif st == 'loading': inner = head + grid([sk_card(), sk_card(), sk_card()], cols=3, minw=280) + sk_table(6, 3)
    else:
        rows_ = [(row(agent('lime','circle',34), 'Budget Shorts', gap=10), chip('Assisted','blue','check'), chip('active','blue','zap'), '3 drafts', meter('',60,'180/300'), 'Today 15:00'),
                 (row(agent('blue','square',34), 'Podcast Clipper', gap=10), chip('Manual','neutral','pen'), chip('paused','neutral','pause'), '—', meter('',0,'0/200'), '—'),
                 (row(agent('pink','blob',34), 'Recipe Reels', gap=10), chip('Autonomous','ai','zap'), chip('budget reached','warn','alert'), '2 posts', meter('',100,'300/300','warn'), 'Mon 00:00')]
        lim = banner('blue','You’re using 5 of 5 agents','Pause one, or move to Business for 10 agents.','Compare plans', href='Plans.dc.html') if st == 'limit' else ''
        inner = head + lim + grid(AGENTS(), cols=3, minw=280) + table(['Agent','Mode','State','This week','Budget','Next run'], rows_)
    app_page(f, t, 'agents', inner, h=1150)

def ad_head(state='active'):
    return page_head('Budget Shorts', 'Created by Ada · runs on schedule', [btn('Run now','secondary','play'), btn('Pause agent','secondary','pause'), btn('Save changes','primary')], crumbs='Agents › Budget Shorts', badge=chip(state, 'blue' if state == 'active' else 'neutral', 'zap' if state == 'active' else 'x')) + \
        row(agent('lime','circle',72), col(H('Hi, I’m Budget Shorts.',26), P('I clip your podcast into 3 shorts a week and wait for your approval.'), gap=4), gap=16)
@screen('APP-05','Agent detail','AgentDetail','core',('filled',('budget','Budget tab'),('destinations','Destinations tab'),('runs','Runs tab'),'loading',('reauth','Re-authorize'),('stopped','Stopped')))
def _(st, f, t):
    tabi = {'budget':2,'destinations':3,'runs':4}.get(st, 1)
    if st == 'loading':
        app_page(f, t, 'agents', sk_head() + row(sk('72px',72,999), col(sk('260px',22), sk('340px',12), gap=8), gap=16) + grid([sk_card(200,5), sk_card(200,5)], cols=2, gap=20), h=1100); return
    if st == 'stopped':
        inner = ad_head('stopped') + banner('neutral','This agent is stopped','Its history is kept. Stopped agents can’t be restarted; duplicate it to start fresh.','Duplicate as new agent') + card(card_head('Last runs'), lst([('Run #96','2 Oct · completed · 3 clips', bubble('check','ok',36)),('Run #95','30 Sep · completed', bubble('check','ok',36))]), pad=20)
        app_page(f, t, 'agents', inner, h=1000); return
    if tabi == 1:
        setup = card(card_head('Goal & sources'), field('Goal','Grow Shorts with budgeting tips for students'), field('Content types','Short clips from long videos','select'), field('Source pool','Your uploads + Chef Kemi + FitWithTobi (licensed)','select'), field('Schedule','Mon, Wed, Fri at 18:00 WAT','select'), field('Brand rules','Friendly, no slang. Captions in brand yellow. Always credit licensed creators.','textarea'), pad=22)
        perm = card(card_head('Permissions', chip('Assisted','blue','check')), toggle('Publish without asking', False, 'Autonomous: requires authorization'), toggle('Use licensed sources', True, 'Only active licenses, checked before every use'), grid([field('Max posts per day','1'), field('Max posts per week','3')], cols=2), field('Approval','Owner approves every post','select'), banner('warn','Widening permissions needs re-authorization','You’ll confirm the new limits before they apply.'), pad=22)
        body = grid([setup, perm], cols=2, gap=20)
    elif tabi == 2:
        body = grid([card(card_head('Weekly budget'), f'<div style="font-family: {HF}; font-weight: 800; font-size: 48px">180 <span style="font-size: 20px; color: {T["mu"]}">/ 300 credits</span></div>', meter('', 60, 'Resets Monday 00:00 WAT'), field('Weekly limit','300', hint='Up to the workspace limit of 1,000'), field('Per-run limit','60'), toggle('Pause when limit is reached', True, 'Always on: work never overspends'), pad=22),
                      card(card_head('Spend this week'), f'<div style="display: flex; align-items: flex-end; gap: 10px; height: 160px">' + ''.join(f'<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px"><div style="width: 100%; height: {v}px; border-radius: 10px; background: {T["acc"] if v else T["s3"]}; transform-origin: bottom; {A("bar", .05*i)}"></div><span style="font-size: 12px; color: {T["mu"]}">{d}</span></div>' for i, (d, v) in enumerate([('Mon',90),('Tue',20),('Wed',120),('Thu',0),('Fri',0),('Sat',0),('Sun',0)])) + '</div>', kv([('Estimated','192 cr'),('Actual','180 cr'),('Refunded','12 cr')]), pad=22)], cols=2, gap=20)
    elif tabi == 3:
        body = card(card_head('Where this agent can post', small('Only connected accounts can be chosen')), lst([('Instagram · @adastudio','Reels · connected', plat('ig',40), toggle('Instagram', True)),('YouTube · Ada Studio','Shorts · permissions needed', plat('yt',40), btn('Fix permission','secondary',None,'Connections.dc.html','sm')),('TikTok','Coming later', plat('tt',40), chip('Coming later','neutral')),('Facebook','Coming later', plat('fb',40), chip('Coming later','neutral'))]), pad=22)
    else:
        body = table(['Run','Started','Steps','Credits (est → actual)','Result'], [('#128','Today 14:02','2 of 5', '52 → 18 so far', chip('running','blue','refresh')),('#127','Mon 18:00','5 of 5','48 → 44', chip('done','ok','check')),('#126','Fri 18:00','3 of 5','40 → 12', chip('blocked · license','warn','lock')),('#125','Wed 18:00','5 of 5','45 → 45', chip('done','ok','check'))])
    modal = overlay(row(bubble('zap','ai',52), col(H('Confirm the new limits',24), P('You raised posts from 3 to 5 a week. Budget Shorts needs your OK before it can use them.'), gap=4), gap=14, align='flex-start', wrap=False) + kv([('Posts per week','3 → 5'),('Budget','300 → 450 credits / week')]) + row(btn('Cancel','ghost'), grow(), btn('Authorize','cta',arrow=True), gap=10), maxw=560) if st == 'reauth' else ''
    app_page(f, t, 'agents', ad_head() + tabs(['Overview','Policy & permissions','Budget','Destinations','Runs'], tabi) + body, h=1300, modal=modal)

@screen('APP-06','Create agent','CreateAgent','core',(('goal','1 · Goal'),('sources','2 · Sources'),('destinations','3 · Destinations'),('budget','4 · Budget'),'filled',('authorize','Authorize autonomous'),('limit','Plan limit')))
def _(st, f, t):
    i = {'goal':0,'sources':1,'destinations':2,'budget':3}.get(st, 4)
    head = page_head('New agent', None, [], crumbs='Agents › New') + steps(5, i) + row(*[chip(s, 'blue' if k < i else ('ink' if k == i else 'neutral')) for k, s in enumerate(['1 Goal','2 Sources','3 Destinations','4 Budget','5 Mode & review'])], gap=8)
    nav = row(btn('Back','ghost'), grow(), btn('Continue','cta',arrow=True), gap=10)
    if st == 'limit':
        app_page(f, t, 'agents', head + empty('limit','You’ve hit your agent limit','Creator Pro includes 5 agents. Pause or stop one, or upgrade to Business for 10.','Compare plans','Manage agents','Plans.dc.html','Agents.dc.html'), h=1000); return
    if i == 0: body = grid([card(field('Name your agent','Budget Shorts'), field('What should it do?','Clip my podcast into 3 shorts a week about budgeting','textarea'), row(*[chip(x,'ai','spark') for x in ['Clip my podcast','Repurpose streams','Post daily tips']], gap=8), pad=24), card(f'<div style="display: flex; justify-content: center">{agent("lime","circle",120)}</div>', h3('Pick a look'), row(*[agent(c, s, 44, False) for c, s in [('lime','circle'),('pink','blob'),('blue','square'),('orange','pill'),('yellow','blob')]], gap=10), pad=24)], cols=2, gap=20) + nav
    elif i == 1: body = card(card_head('Where can it get videos?', small('Only your uploads and active licenses')), lst([('Your uploads','14 videos', bubble('upload','blue',40), toggle('Your uploads', True)),('Chef Kemi','Free license · ends in 5 days', person('CK','#FF4FB8',40), toggle('Chef Kemi', True)),('FitWithTobi','Free license', person('FT','#22C55E',40), toggle('FitWithTobi', False)),('Campus Comedy','License revoked: can’t be used', person('CC','#59D8FF',40), chip('revoked','err','x'))]), pad=22) + nav
    elif i == 2: body = card(card_head('Where can it post?'), grid([choice('Instagram · @adastudio','Reels', True, None, 'blue', art=plat('ig',44)), choice('YouTube · Ada Studio','Shorts · needs upload permission', False, None, 'blue', art=plat('yt',44)), choice('TikTok','Coming later', False, None, 'blue', locked=True, art=plat('tt',44)), choice('Facebook','Coming later', False, None, 'blue', locked=True, art=plat('fb',44))], cols=2), pad=22) + nav
    elif i == 3: body = grid([card(field('Weekly budget (credits)','300', hint='About 6 short clips a week at Balanced quality'), field('Per-run limit','60'), field('Max posts per week','3'), pad=24), card(h3('Estimate'), f'<div style="font-family: {HF}; font-weight: 800; font-size: 44px">≈ 280–300</div>', small('credits per week'), meter('Share of workspace limit', 30, '300 of 1,000'), pad=24)], cols=2, gap=20) + nav
    else: body = grid([choice('Manual','You start everything.', False, 'pen','blue'), choice('Assisted','Agent prepares, you approve.', st != 'authorize', 'check','lime','Recommended'), choice('Autonomous','Agent publishes within limits.', st == 'authorize', 'zap','ai','Needs authorization')], cols=3) + card(card_head('Review'), kv([('Name','Budget Shorts'),('Sources','Uploads + Chef Kemi'),('Posts to', plat('ig',24)),('Budget','300 credits / week')]), pad=22) + row(btn('Back','ghost'), grow(), btn('Create agent','cta',None,'AgentDetail.dc.html',arrow=True), gap=10)
    modal = overlay(row(bubble('zap','ai',56), col(H('Let Budget Shorts publish on its own?',26), P('It will only publish inside these limits. You can pause it any time.'), gap=4), gap=14, align='flex-start', wrap=False) +
        kv([('Account', row(plat('ig',22), '@adastudio', gap=6)), ('What','Short clips from licensed sources'), ('How often','Up to 3 posts a week, 1 a day'), ('Budget','300 credits a week, then it pauses'), ('Approval','Not required (you can still review)')]) +
        check('I understand that pausing stops future posts but can’t undo posts that are already published.', True) + row(btn('Cancel','ghost'), grow(), btn('Authorize','cta',arrow=True), gap=10) + small('We’ll email you a copy of this authorization.'), maxw=600) if st == 'authorize' else ''
    app_page(f, t, 'agents', head + body, h=1150, modal=modal)

@screen('APP-07','Workspace switcher','WorkspaceSwitcher','core',('filled',('search','No match')))
def _(st, f, t):
    if st == 'search': body = field('Search','fitnes', 'input') + empty('search','No workspace called “fitnes”','You only see workspaces you’re a member of.', None, w=180)
    else: body = field('Search','', 'input', 'Search workspaces') + lst([('BrightReach Agency','Organization · 3 clients', person('B','#FF7A2F',40), chip('current','blue')),('Acme Foods','Client workspace', person('A','#59D8FF',40), chip('3 waiting','warn')),('Lagos Fitness','Client workspace', person('L','#22C55E',40), ''),('Kemi’s Kitchen','Client workspace', person('K','#FF4FB8',40), chip('over limit','err'))]) + btn('New client workspace','secondary','plus','Clients-Create.dc.html',full=True) + small('You only see workspaces you’re a member of.')
    app_page(f, t, 'agencyhub', page_head('Agency hub','All clients at a glance.'), h=950, ws='BrightReach', kind='Agency', agency=True, modal=overlay(H('Switch workspace',26) + body, top=80, maxw=500))

def note_row(ic, tn, title, sub, when, unread=True):
    return (title, sub, row(dot(T['acc'], 10) if unread else '<span style="width: 10px"></span>', bubble(ic, tn, 42), gap=10, wrap=False), small(when))
NOTES = lambda: [note_row('check','ok','Chioma approved Instagram for “5 budgeting myths”','Acme Foods · YouTube still needs changes','2m'), note_row('film','lime','Render finished: “Stop budgeting like this”','Ready to review','10m'), note_row('shield','blue','Chef Kemi’s license ends in 5 days','4 drafts use it','1h'), note_row('wallet','warn','80% of this week’s budget used','Budget Shorts · 240 of 300 credits','3h', False), note_row('x','err','YouTube upload failed','Daily upload limit reached. Retry after 00:00 UTC.','5h', False), note_row('key','ai','New sign-in from Chrome on Windows','Lagos, Nigeria · wasn’t you? Secure your account','1d', False)]
@screen('NT-01','Notifications','Notifications','core',('filled','empty','loading',('panel','Dropdown panel'),('push','Push prompt')))
def _(st, f, t):
    head = page_head('Notifications', None, [btn('Mark all read','secondary','check'), btn('Preferences','ghost','gear','NotificationPrefs.dc.html')]) + tabs(['All','Approvals','Publishing','Licenses','Billing','Security'],0)
    if st == 'panel':
        pn = f'<div style="position: absolute; top: 76px; right: 70px; width: 420px; background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 28px; box-shadow: 0 20px 60px rgba(11,11,20,0.18); padding: 16px; display: flex; flex-direction: column; gap: 10px; {A("up",0,.4)}">{row(h3("Notifications"), grow(), link("Mark all read"), gap=8)}{lst(NOTES()[:4])}{btn("See all","secondary",None,"Notifications.dc.html",full=True)}</div>'
        app_page(f, t, 'home', hero_lite(), h=950, modal=pn); return
    if st == 'empty': inner = head + empty('notifications','You’re all caught up','We’ll let you know when something needs you: approvals, finished renders, expiring licenses and spending alerts.','Notification settings', href='NotificationPrefs.dc.html')
    elif st == 'loading': inner = head + sk_rows(6)
    else:
        push = card(row(bubble('bell','blue',48), col(h3('Get notified even when Nelio is closed'), small('Approvals and failed posts, straight to this device.'), gap=2), grow(), btn('Turn on browser notifications','primary'), gap=14), pad=18) if st in ('filled','push') else ''
        if st == 'push': push = overlay(f'<div style="display: flex; justify-content: center">{art("notifications",220)}</div>' + H('Turn on notifications?',26) + P('We’ll only send approvals, failed posts, license and security alerts. You can change this any time.') + row(btn('Not now','ghost'), grow(), btn('Allow','cta',arrow=True), gap=10), maxw=480)
        inner = head + lst(NOTES()) + (push if st == 'filled' else '')
        if st == 'push': app_page(f, t, 'home', inner, h=1050, modal=push); return
    app_page(f, t, 'home', inner, h=1050)
def hero_lite():
    return page_head('Command Center', None, []) + grid([stat('Agents active','2',ic='bot'), stat('Waiting on you','4',ic='check'), stat('Published','12',ic='zap',fill='#B6F24A')], cols=3)
build_all(only=['core'])
