from lib import *
CUR['page'] = 'core'; theme('dark')

def agent_card(name, color, shape, state, tone, ic, line, meta, budget, pct, bt='lime'):
    return card(row(agent(color, shape, 48), col(h3(name, 18), small(line), gap=3), grow(), chip(state, tone, ic), gap=12, wrap=False),
                meter('Weekly budget', pct, budget, bt), row(small(meta), grow(), btn('', 'secondary', 'pause' if state=='active' else 'play', size='sm'), btn('Open','secondary',size='sm'), gap=8), pad=18)

checklist = card(row(col(h3('Finish setting up', 18), small('2 of 5 done. Agents work better with a brand kit.'), gap=3), grow(), f'<span style="font-family: {HF}; font-weight: 800; font-size: 28px; color: {T["lime"]}">40%</span>', ibtn('x','Dismiss checklist'), gap=12),
    meter('Setup', 40, '', 'lime'),
    grid([card(row(icon('check',18,T['teal']), small('Upload your first video'), gap=8), pad=12, bg=T['s2'], bd=False), card(row(icon('check',18,T['teal']), small('Connect an account'), gap=8), pad=12, bg=T['s2'], bd=False),
          card(row(icon('palette',18,T['orange']), f'<a href="#" style="font-size: 13px; font-weight: 700; color: {T["tx"]}">Add a brand kit</a>', gap=8), pad=12, bd=False, bg=T['orangeT']),
          card(row(icon('bot',18,T['grape']), f'<a href="#" style="font-size: 13px; font-weight: 700; color: {T["tx"]}">Create your first agent</a>', gap=8), pad=12, bd=False, bg=T['grapeT']),
          card(row(icon('bell',18,T['blue']), f'<a href="#" style="font-size: 13px; font-weight: 700; color: {T["tx"]}">Choose notifications</a>', gap=8), pad=12, bd=False, bg=T['blueT'])], cols=5, gap=10, minw=180), pad=20)

needs = card(card_head('Needs you', chip('4','orange')),
    lst([('4 posts waiting for approval','Oldest: 2 days', bubble('check','orange',36), btn('Review','primary',size='sm')),
         ('Instagram sign-in expires in 2 days','7 scheduled posts depend on it', bubble('link','red',36), btn('Reconnect','secondary',size='sm')),
         ('License from Chef Kemi ends in 5 days','4 drafts use it', bubble('shield','blue',36), btn('View','secondary',size='sm')),
         ('Recipe Reels paused: budget reached','276 of 300 credits used this week', bubble('wallet','orange',36), btn('Fix','secondary',size='sm'))]), pad=20)

act = card(card_head('Live activity', f'<a href="#" style="font-size: 13px; font-weight: 700">See all →</a>'),
    lst([('Transcribing podcast_ep12.mp4','Budget Shorts · Balanced quality · step 2 of 5', agent('lime','circle',32), chip('running','lime','refresh')),
         ('Render finished: “5 budgeting myths”','36 credits (estimated 40)', agent('lime','circle',32), chip('done','teal','check')),
         ('Confirming upload with Instagram','We’ll know in a moment', agent('grape','blob',32), chip('confirming','blue','clock'))]), pad=20)

hero = f'''<section style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch">
<div style="flex: 2 1 480px; background: {T["lime"]}; border-radius: 28px; padding: 28px; display: flex; flex-direction: column; gap: 14px; color: {T["onlime"]}">
<div style="display: flex; align-items: center; gap: 10px">{agent("grape","blob",44)}<span style="font-size: 14px; font-weight: 700">Nelio AI · this week</span></div>
<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: 44px; letter-spacing: -0.035em; line-height: 1">Good morning, Ada. 3 shorts are ready for you.</h1>
<p style="margin: 0; font-size: 16px; font-weight: 500">Your agents made 9 drafts from 2 videos. Review the best 3 and they’ll go out on schedule.</p>
<div style="display: flex; gap: 10px; flex-wrap: wrap"><a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 14px; background: {T["onlime"]}; color: {T["lime"]}; font-weight: 800; text-decoration: none; min-height: 44px; box-sizing: border-box">Review drafts {icon("arrowr",16)}</a><a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 14px; border: 2px solid {T["onlime"]}; color: {T["onlime"]}; font-weight: 800; text-decoration: none; min-height: 44px; box-sizing: border-box">{icon("upload",16)} New upload</a></div></div>
<div style="flex: 1 1 260px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">{stat("Agents active","2","1 paused",ic="bot")}{stat("Waiting on you","4","2 for clients",ic="check")}{stat("Published","12","this week",ic="zap")}{stat("Credits","760","of 1,000 budget",ic="wallet")}</div>
</section>'''

agents = section_title('Your agents', btn('New agent','secondary','plus',size='sm')) + grid([
    agent_card('Budget Shorts','lime','circle','active','lime','zap','Clips your podcast into 3 shorts a week','Next run today 15:00','180 / 300 cr',60),
    agent_card('Podcast Clipper','blue','square','paused','neutral','pause','Paused by you on Monday','Resume re-checks budget & licenses','0 / 200 cr',0),
    agent_card('Recipe Reels','grape','blob','budget reached','orange','alert','Autonomous · Instagram only','Resets Monday 00:00','300 / 300 cr',100,'orange')], cols=3, minw=280)

pipe = card(card_head('Content pipeline', small('This week')), pipeline([('Ideas','6','neutral'),('Drafts','9','grape'),('Needs approval','4','orange'),('Scheduled','7','blue'),('Published','12','teal')]), pad=20)
inner = hero + checklist + grid([col(agents, pipe, gap=16), col(needs, act, gap=16)], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr)')
app_page('CommandCenter.dc.html', 'APP-01 Command Center', 'home', inner, h=1450)

# ON-05 checklist board (focused)
app_page('SetupChecklist.dc.html', 'ON-05 Setup checklist', 'home', page_head('Command Center', 'New workspace view: the checklist leads until it’s done or dismissed.') + checklist +
    empty('bot','No agents yet','Agents research, clip and schedule for you. Start with one, or let Nelio AI suggest a plan.','Create your first agent', second='Ask Nelio AI') +
    banner('teal','Setup complete','Nice. The checklist hides itself now. Bring it back any time from Help.'), h=1000)

# APP-02 Strategist
msg_u = lambda t: f'<div style="align-self: flex-end; max-width: 78%; background: {T["s3"]}; border-radius: 20px 20px 6px 20px; padding: 12px 16px; font-size: 15px; line-height: 1.5">{e(t)}</div>'
msg_a = lambda t, extra='': f'<div style="display: flex; gap: 10px; align-items: flex-start; max-width: 86%">{agent("grape","blob",34)}<div style="background: {T["grapeT"]}; border-radius: 20px 20px 20px 6px; padding: 12px 16px; font-size: 15px; line-height: 1.5; color: {T["tx"]}">{e(t)}{extra}</div></div>'
plan = card(row(chip('Proposed plan','grape','spark'), chip('Not active yet','neutral'), gap=8), H('Budget tips for students', 24),
    kv([('Goal','Grow Instagram + YouTube Shorts'),('Cadence','3 posts a week · Mon, Wed, Fri 18:00'),('Sources','Your uploads + 2 licensed creators'),('Posts to', row(plat('ig',24), plat('yt',24), gap=6)),('Mode', chip('Assisted · you approve','lime','check')),('Budget','300 credits / week (estimate)')]),
    banner('blue','Nothing runs until you approve','Approving creates the agent. You can pause it any time.'),
    row(btn('Approve & create agent','primary','check'), btn('Edit plan','secondary','pen'), gap=10), pad=22)
chat = col(msg_u('I want 3 shorts a week on budgeting tips for Nigerian students.'),
    msg_a('Love it. I looked at what’s working for student finance creators: myth-busting and “I tried it for a week” formats are strong. Here’s a plan using your podcast and two licensed creators.'),
    msg_u('Can we keep it under 300 credits a week?'), msg_a('Done. I trimmed it to 3 posts and Balanced transcription. Estimated 280–300 credits a week.'), gap=14)
composer = f'<div style="display: flex; gap: 10px; align-items: center; padding: 10px 10px 10px 18px; border-radius: 20px; border: 2px solid {T["bd"]}; background: {T["s1"]}"><label for="ask" style="position: absolute; left: -9999px">Message Nelio AI</label><input id="ask" placeholder="Ask Nelio AI to plan, research or write…" style="flex-grow: 1; background: transparent; border: none; color: {T["tx"]}; font-size: 15px; font-family: {BF}; min-height: 44px">{btn("","grape","arrowr")}</div>'
sugg = row(chip('Research my niche','grape','search'), chip('Write 5 hooks','grape','pen'), chip('Plan next month','grape','calendar'), gap=8)
research = card(card_head('What Nelio AI found'), lst([('Myth-busting formats','Top theme in your niche this month', bubble('trophy','lime',36)),('Peak time: 18:00–21:00 WAT','For your audience on Instagram', bubble('clock','blue',36)),('Gap: rent & side hustles','Few creators covering it', bubble('zap','orange',36))]), small('Insights are suggestions based on public trends, not guarantees.'), pad=20)
inner = page_head('Strategist', 'Plan with Nelio AI. It proposes, you decide.', [btn('History','secondary','clock')], badge=chip('Nelio AI','grape','spark')) + \
    grid([col(card(chat, sugg, composer, pad=22, gap=18), gap=16), col(plan, research, gap=16)], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr)')
app_page('Strategist.dc.html', 'APP-02 AI Strategist', 'strategist', inner, h=1250)

# APP-03 Activity
feed = lst([
 ('Transcribing podcast_ep12.mp4','Budget Shorts · Balanced · started 14:02', agent('lime','circle',36), row(chip('running','lime','refresh'), small('now'), gap=8)),
 ('Scene detection','Budget Shorts · waiting for transcript', agent('lime','circle',36), row(chip('queued','neutral','clock'), small('—'), gap=8)),
 ('Render “Jollof on a budget”','Needs 40 credits, 24 left in this agent’s budget', agent('grape','blob',36), row(chip('blocked · budget','orange','lock'), small('5m'), gap=8)),
 ('“5 budgeting myths” → Acme client','Waiting for client approval', agent('blue','square',36), row(chip('needs approval','orange','alert'), small('12m'), gap=8)),
 ('Upload to Instagram','Upload finished but Instagram hasn’t confirmed yet. We won’t retry until we know.', agent('grape','blob',36), row(chip('confirming','blue','clock'), small('14m'), gap=8)),
 ('Upload to YouTube','YouTube said: daily upload limit reached. Retry after 00:00 UTC.', agent('lime','circle',36), row(chip('failed','red','x'), small('1h'), gap=8)),
 ('Render “Stop budgeting like this”','36 credits used (estimated 40) · 4 refunded', agent('lime','circle',36), row(chip('done','teal','check'), small('1h'), gap=8))])
detail = card(row(agent('lime','circle',44), col(h3('Budget Shorts · run #128',18), small('Started 14:02 · triggered by schedule'), gap=2), gap=12),
    grid([stat('Estimated','52 cr'), stat('Used so far','18 cr')], cols=2, gap=10),
    stepper_list([('Upload & check file','done','2.1 GB · 48 min'),('Transcribe','running','Balanced quality'),('Detect scenes','queued','Waits for transcript'),('Rank moments','queued','Nelio AI'),('Render previews','queued','3 clips')]),
    row(btn('Pause run','secondary','pause'), btn('View log','ghost','list'), gap=8), pad=22)
inner = page_head('Activity', 'Everything your agents are doing, live.', [btn('Pause all','secondary','pause')]) + \
    row(tabs(['All','Running 2','Queued 3','Blocked 1','Needs approval 4','Failed 1','Done'],0), grow(), chip('Live','teal','activity'), gap=10) + \
    grid([feed, detail], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr)')
app_page('Activity.dc.html', 'APP-03 AI Activity Center', 'activity', inner, h=1150)

# APP-04 Agents
rows_ = [ (row(agent('lime','circle',32), 'Budget Shorts', gap=10), chip('Assisted','lime','check'), chip('active','lime','zap'), '3 drafts', meter('',60,'180/300'), 'Today 15:00'),
          (row(agent('blue','square',32), 'Podcast Clipper', gap=10), chip('Manual','blue','pen'), chip('paused','neutral','pause'), '—', meter('',0,'0/200'), '—'),
          (row(agent('grape','blob',32), 'Recipe Reels', gap=10), chip('Autonomous','grape','zap'), chip('budget reached','orange','alert'), '2 posts', meter('',100,'300/300','orange'), 'Mon 00:00')]
inner = page_head('Agents', '3 of 5 agents on Creator Pro.', [btn('Ask Nelio AI','grape','spark'), btn('New agent','primary','plus')]) + \
    table(['Agent','Mode','State','This week','Budget','Next run'], rows_) + \
    grid([card(bubble('spark','grape',44), h3('Not sure where to start?'), P('Tell Nelio AI your goal and it will propose an agent with a budget.'), btn('Plan with Nelio AI','grape'), pad=22), card(bubble('lock','neutral',44), h3('Need more agents?'), P('Business includes 10 agents and team seats.'), btn('Compare plans','secondary'), pad=22)], cols=2)
app_page('Agents.dc.html', 'APP-04 Agents', 'agents', inner, h=1000)

# APP-05 Agent detail
perm = card(card_head('Permissions', chip('Assisted','lime','check')),
    toggle('Publish without asking', False, 'Autonomous. Requires authorization'), toggle('Use licensed sources', True, 'Only active licenses, checked before every use'),
    grid([field('Max posts per day','1'), field('Max posts per week','3')], cols=2), field('Approval','Owner approves every post','select'),
    banner('orange','Widening permissions needs re-authorization','You’ll confirm the new limits before they apply.'), pad=22)
setup = card(card_head('Goal & sources'), field('Goal','Grow Shorts with budgeting tips for students'), field('Content types','Short clips from long videos','select'), field('Source pool','Your uploads + Chef Kemi (licensed) + FitWithTobi (licensed)','select'),
    field('Schedule','Mon, Wed, Fri at 18:00 WAT','select'), field('Brand rules','Friendly, no slang. Captions in Volt. Always credit licensed creators.','textarea'), pad=22)
inner = page_head('Budget Shorts', 'Created by Ada · runs on schedule', [btn('Run now','secondary','play'), btn('Pause agent','secondary','pause'), btn('Save changes','primary')], crumbs='Agents › Budget Shorts', badge=chip('active','lime','zap')) + \
    row(agent('lime','circle',64), col(H('Hi, I’m Budget Shorts.',24), P('I clip your podcast into 3 shorts a week and wait for your approval.'), gap=4), gap=16) + \
    tabs(['Overview','Policy & permissions','Budget','Destinations','Runs'],1) + grid([setup, perm], cols=2, gap=20)
app_page('AgentDetail.dc.html', 'APP-05 Agent detail', 'agents', inner, h=1250)

# APP-06 Create agent + authorization
wiz = page_head('New agent', None, [], crumbs='Agents › New') + steps(5, 4) + row(*[chip(s, 'lime' if i < 4 else 'ink') for i, s in enumerate(['1 Goal','2 Sources','3 Destinations','4 Budget','5 Mode & review'])], gap=8) + \
    grid([choice('Manual','You start everything.', False, 'pen','blue'), choice('Assisted','Agent prepares, you approve.', False, 'check','lime'), choice('Autonomous','Agent publishes within limits.', True, 'zap','grape','Needs authorization')], cols=3)
modal = overlay(row(bubble('zap','grape',52), col(H('Let Recipe Reels publish on its own?',26), P('It will only publish inside these limits. You can pause it any time.'), gap=4), gap=14, align='flex-start', wrap=False) +
    kv([('Account', row(plat('ig',22), '@adastudio', gap=6)), ('What','Short clips from licensed sources'), ('How often','Up to 3 posts a week, 1 a day'), ('Budget','300 credits a week, then it pauses'), ('Approval','Not required (you can still review)')]) +
    check('I understand that pausing stops future posts but can’t undo posts that are already published.', True) +
    row(btn('Cancel','ghost'), grow(), btn('Authorize','primary','check'), gap=10) + small('We’ll email you a copy of this authorization.'), maxw=600)
app_page('CreateAgent.dc.html', 'APP-06 Create agent · authorize autonomous', 'agents', wiz, h=1000, modal=modal)

# APP-07 Workspace switcher
sw = overlay(H('Switch workspace',24) + field('Search','', 'input', 'Search workspaces') +
    lst([('BrightReach Agency','Organization · 3 clients', person('B',T['orange'],36,'#0D0D12'), chip('current','lime')),('Acme Foods','Client workspace', person('A','#6CB4FF',36,'#0D0D12'), chip('3 waiting','orange')),
         ('Lagos Fitness','Client workspace', person('L','#3DDBA0',36,'#0D0D12'), ''),('Kemi’s Kitchen','Client workspace', person('K','#FF8AC8',36,'#0D0D12'), chip('over limit','red'))]) +
    btn('New client workspace','secondary','plus',full=True) + small('You only see workspaces you’re a member of.'), top=80, maxw=480)
app_page('WorkspaceSwitcher.dc.html', 'APP-07 Workspace switcher', 'agencyhub', page_head('Agency hub','All clients at a glance.'), h=900, ws='BrightReach', kind='Agency', agency=True, modal=sw)

# NT-01 Notifications
def note_row(ic, tone, title, sub, when, unread=True):
    d = dot(T['lime'], 10) if unread else '<span style="width: 10px"></span>'
    return (title, sub, row(d, bubble(ic, tone, 40), gap=10, wrap=False), small(when))
inner = page_head('Notifications', None, [btn('Mark all read','secondary','check'), btn('Preferences','ghost','gear')]) + tabs(['All','Approvals','Publishing','Licenses','Billing','Security'],0) + \
    lst([note_row('check','teal','Chioma approved Instagram for “5 budgeting myths”','Acme Foods · YouTube still needs changes','2m'), note_row('film','lime','Render finished: “Stop budgeting like this”','Ready to review','10m'),
         note_row('shield','blue','Chef Kemi’s license ends in 5 days','4 drafts use it','1h'), note_row('wallet','orange','80% of this week’s budget used','Budget Shorts · 240 of 300 credits','3h', False),
         note_row('x','red','YouTube upload failed','Daily upload limit reached. Retry after 00:00 UTC.','5h', False), note_row('key','grape','New sign-in from Chrome on Windows','Lagos, Nigeria · wasn’t you? Secure your account','1d', False)]) + \
    card(row(bubble('bell','lime',44), col(h3('Get notified even when Nelio is closed'), small('Approvals and failed posts, straight to this device.'), gap=2), grow(), btn('Turn on browser notifications','primary'), gap=14), pad=18)
app_page('Notifications.dc.html', 'NT-01 Notifications', 'home', inner, h=1050)
