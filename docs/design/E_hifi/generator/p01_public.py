from lib import *
CUR['page'] = 'public'; theme('dark')
W = lambda inner, pad='72px 48px', bg=None: f'<section style="padding: {pad}; {"background: "+bg+";" if bg else ""}"><div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px">{inner}</div></section>'
BIG = lambda t, s=72, c=None: f'<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: {s}px; line-height: 0.98; letter-spacing: -0.045em; color: {c or T["tx"]}">{t}</h1>'
hl = lambda t: f'<span style="background: {T["lime"]}; color: {T["onlime"]}; padding: 0 12px; border-radius: 16px">{t}</span>'

def plat_strip():
    return grid([card(row(plat('yt',40), col(h3('YouTube Shorts'), chip('In development','blue','clock'), gap=6), gap=12), pad=16),
                 card(row(plat('ig',40), col(h3('Instagram Reels'), chip('In development','blue','clock'), gap=6), gap=12), pad=16),
                 card(row(plat('tt',40), col(h3('TikTok'), chip('Coming later','neutral'), gap=6), gap=12), pad=16),
                 card(row(plat('fb',40), col(h3('Facebook'), chip('Coming later','neutral'), gap=6), gap=12), pad=16)], cols=4, minw=220)

# M-01 Home
agents_vis = f'''<div style="position: relative; display: flex; gap: 16px; align-items: flex-end; justify-content: center; flex-wrap: wrap">
{card(row(agent('lime','circle',44), col(h3('Budget Shorts'), small('Clipping your podcast · 3 drafts ready'), gap=2), gap=12), chip('active','lime','zap'), pad=16, style='max-width: 300px')}
{video('5 BUDGETING MYTHS', maxw=220)}
{card(row(agent('grape','blob',44), col(h3('Recipe Reels'), small('Waiting for your approval'), gap=2), gap=12), chip('needs approval','orange','alert'), pad=16, style='max-width: 300px')}
</div>'''
hero = W(row(col(chip('Your AI content team','grape','spark'), BIG(f'Turn long videos into {hl("scroll-stoppers")}'),
          P('Nelio’s AI agents find the best moments, cut and caption them, then schedule and publish, but only from content you own or have licensed, and only with the approvals and budgets you set.', size=19),
          row(btn('Start free','primary','arrowr',size='lg'), btn('See how it works','secondary','play',size='lg')), small('Free plan forever · 3-day trial of paid features, no card needed'), gap=20, style='flex: 1 1 520px'),
          f'<div style="flex: 1 1 480px">{agents_vis}</div>', gap=48, align='center'), pad='80px 48px 56px')
feat = W(col(H('One studio. A whole team of agents.', 44), grid([
    card(bubble('scissors','lime',48), h3('Clip the good bits', 20), P('Upload a podcast or stream. Nelio AI ranks the moments worth posting and reframes them to 9:16 with bold captions.'), pad=24),
    card(bubble('spark','grape',48), h3('Plan with Nelio AI', 20), P('Tell it your goal. It proposes a weekly plan, a budget and the accounts to post to. Nothing runs until you say yes.'), pad=24),
    card(bubble('check','orange',48), h3('Approve on the go', 20), P('Clients approve each platform separately from their phone. Every decision is logged.'), pad=24),
    card(bubble('shield','teal',48), h3('Licensed, always', 20), P('Only your uploads or content licensed from verified creators. Revoked? Posts stop automatically.'), pad=24),
    card(bubble('wallet','blue',48), h3('No surprise bills', 20), P('See the estimated cost before every job and the actual cost after. Hard limits pause work, never overspend.'), pad=24),
    card(bubble('users','lime',48), h3('Built for agencies', 20), P('Separate client workspaces, client logins and an audit log from day one.'), pad=24)], cols=3, minw=300), gap=28))
who = W(grid([stat('For creators','Post daily','without editing for hours', fill=T['lime']), stat('For businesses','Stay consistent','with a small team', fill=T['grape']), stat('For agencies','Scale clients','with approvals built in')], cols=3, minw=280))
plats = W(col(H('Where you can post', 32), P('We only switch a platform on once the official integration is approved. Here is where things stand.'), plat_strip(), gap=16))
honest = W(card(row(col(H('What we will never promise', 32), P('Guaranteed views. Guaranteed monetization. Posting from videos you don’t have rights to. We would rather be honest than viral.', size=16), gap=10, style='flex: 1 1 400px'), btn('Read our licensing policy','secondary','shield'), gap=24), pad=36, bg=T['s2']))
cta = W(f'<div style="border-radius: 32px; background: {T["lime"]}; padding: 56px; display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between">{BIG("Meet your agents.", 56, T["onlime"])}<a href="#" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 26px; border-radius: 14px; background: {T["onlime"]}; color: {T["lime"]}; font-weight: 800; font-size: 17px; text-decoration: none">Start free {icon("arrowr",18)}</a></div>', pad='24px 48px 72px')
pub_page('Home.dc.html', 'M-01 Home', hero + feat + who + plats + honest + cta, h=3300)

# M-02 Product
prod = W(col(chip('Product','grape'), BIG('How Nelio works', 64), tabs(['Agents','Clipping','Content Studio','Approvals','Licensing','Analytics'], 1), gap=20), pad='72px 48px 24px')
prod += W(row(f'<div style="flex: 1 1 520px">{card(wide_video(), row(chip("“Stop budgeting like this”","lime"), chip("score 82 · estimate","neutral"), chip("0:12–0:54","neutral")), pad=16)}</div>',
    col(H('Find the 40 seconds that matter', 40), P('Nelio AI reads the transcript and scenes of your long video and ranks the moments most likely to work as shorts. Scores are estimates, and you always pick.', size=17),
        lst([('Transcribe','Fast, Balanced or High Quality: you choose speed vs accuracy', bubble('type','lime',36)), ('Detect scenes','Clean cuts at natural scene changes', bubble('film','grape',36)),
             ('Reframe to 9:16','Keeps the speaker in frame', bubble('phone','blue',36)), ('Caption with your brand','Bold animated captions in your fonts and colours', bubble('palette','orange',36))]), gap=16, style='flex: 1 1 440px'), gap=40, align='center'))
prod += W(grid([card(bubble('spark','grape',48), h3('Nelio AI plans and writes',20), P('Strategy, hooks, captions and research.'), pad=24),
                card(bubble('wand','lime',48), h3('Edit with words',20), P('“Cut the first pause, make captions bigger.”'), pad=24),
                card(bubble('image','orange',48), h3('Original AI video',20), chip('Coming later','neutral','clock'), P('Needs a specialist video partner. We’ll tell you when it’s ready.'), pad=24)], cols=3, minw=300))
pub_page('Product.dc.html', 'M-02 Product', prod, h=1900)

# M-03 Use cases (agencies variant)
uc = W(col(tabs(['Creators','Businesses','Agencies'], 2), BIG(f'Run every client {hl("from one place")}', 64), P('Separate client workspaces, client logins and per-platform approvals, with an audit trail for every decision.', size=19),
          row(btn('Start agency trial','primary','arrowr',size='lg'), btn('Book a demo','secondary',size='lg')), gap=20), pad='72px 48px 32px')
uc += W(grid([card(bubble('grid','lime',48), h3('Client workspaces',20), P('Each client is fully isolated: accounts, content, licenses and spend.'), pad=24),
               card(bubble('check','orange',48), h3('Client approval portal',20), P('Clients sign in, preview each platform and approve or request changes.'), pad=24),
               card(bubble('users','grape',48), h3('Team roles',20), P('Owners, admins, managers, editors, viewers and client approvers.'), pad=24),
               card(bubble('list','blue',48), h3('Audit log',20), P('Who approved what, which revision, when.'), pad=24),
               card(bubble('wallet','teal',48), h3('Spend limits per client',20), P('Monthly credit limits that pause work instead of overspending.'), pad=24),
               card(bubble('chart','lime',48), h3('Cross-client overview',20), P('What’s waiting on whom across all clients.'), pad=24)], cols=3, minw=300))
pub_page('UseCases.dc.html', 'M-03 Use cases', uc, h=1600)

# M-04 Pricing
def plan(name, price, blurb, feats, hot=False, cta='Choose plan'):
    bg = T['lime'] if hot else T['s1']; fg = T['onlime'] if hot else T['tx']; mu = T['onlime'] if hot else T['mu']
    li = ''.join(f'<li style="display: flex; gap: 8px; font-size: 14px; color: {fg}; align-items: flex-start">{icon("check",16,fg,2.5)}<span>{e(f)}</span></li>' for f in feats)
    b = f'<a href="#" style="display: flex; justify-content: center; padding: 12px; border-radius: 12px; font-weight: 800; text-decoration: none; background: {T["onlime"] if hot else T["s2"]}; color: {T["lime"] if hot else T["tx"]}; min-height: 44px; box-sizing: border-box; align-items: center">{e(cta)}</a>'
    tag = f'<span style="align-self: flex-start; padding: 3px 10px; border-radius: 999px; background: {T["onlime"]}; color: {T["lime"]}; font-size: 12px; font-weight: 700">Most popular</span>' if hot else ''
    return f'<section style="background: {bg}; border: 1px solid {T["bd"] if not hot else bg}; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 14px">{tag}<div style="font-family: {HF}; font-weight: 800; font-size: 22px; color: {fg}">{e(name)}</div><div style="display: flex; align-items: baseline; gap: 4px"><span style="font-family: {HF}; font-weight: 800; font-size: 44px; letter-spacing: -0.03em; color: {fg}">{e(price)}</span><span style="font-size: 14px; color: {mu}">{"/month" if price.startswith("$") else ""}</span></div><p style="margin: 0; font-size: 14px; color: {mu}">{e(blurb)}</p><ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; flex-grow: 1">{li}</ul>{b}</section>'
pr = W(col(BIG('Simple plans. Hard limits.', 64), P('Prices in USD. Pay in naira at checkout where supported: you’ll see the exact amount before you confirm.', size=18), tabs(['Monthly','Yearly · coming later'],0), gap=16), pad='72px 48px 24px')
pr += W(grid([plan('Free','$0','Try Nelio by hand.',['1 agent, manual only','1 social account','Very limited credits','No autonomous publishing'],cta='Start free'),
              plan('Starter','$19','For getting consistent.',['2 agents','3 social accounts','Autonomous publishing','Top-ups']),
              plan('Creator Pro','$49','For full-time creators.',['5 agents','6 social accounts','Batch variants','Priority rendering'], hot=True),
              plan('Business','$99','For small teams.',['10 agents','12 social accounts','Team seats','Approval workflows']),
              plan('Agency','$249','For client work.',['25 agents','40 social accounts','10 client workspaces','Client portal & audit log']),
              plan('Enterprise','Custom','For big operations.',['Custom limits','SSO (planned)','Dedicated support'], cta='Talk to us')], cols=6, gap=14, minw=200))
pr += W(col(banner('blue','Plan limits and credit amounts are provisional','We are measuring real processing costs before launch. Final numbers will be shown here before you pay anything.'),
            card(row(bubble('clock','grape',48), col(h3('3-day trial of paid features',20), P('1 agent · 1 account · 2 short exports · a hard compute cap. No card needed, and you are never charged automatically when it ends.'), gap=4), grow(), btn('Start trial','grape'), gap=16), pad=24), gap=16), pad='8px 48px 72px')
pub_page('Pricing.dc.html', 'M-04 Pricing', pr, h=1900)

# M-05 Licensing
li = W(row(col(chip('For content owners','teal','shield'), BIG(f'Get clipped, {hl("on your terms")}', 64), P('Verify your channel, choose what people may do with your videos, see every use and revoke any time. Free, no subscription.', size=19),
         row(btn('Join free as a content owner','primary','arrowr',size='lg'), btn('How licensing works','secondary',size='lg')), gap=20, style='flex: 1 1 560px'),
         f'<div style="flex: 1 1 380px">{card(row(person("CK","#FF8AC8",48,"#0D0D12"), col(h3("Chef Kemi",18), chip("Verified · YouTube","teal","check"), gap=4), gap=12), kv([("Licensees","12 workspaces"),("Clips published","148"),("License","Free · attribution required"),("Commercial use","Not allowed")]), btn("Revoke a license","danger","x",full=True), pad=24)}</div>', gap=40, align='center'), pad='80px 48px 40px')
li += W(grid([card(bubble('shield','teal',48), h3('Verify ownership',20), P('Sign in with your platform to prove the channel is yours.'), pad=24), card(bubble('file','lime',48), h3('Set allowed uses',20), P('Clips, compilations, platforms, attribution and expiry.'), pad=24),
               card(bubble('eye','grape',48), h3('See every use',20), P('Every clip made from your videos, and where it was posted.'), pad=24), card(bubble('x','orange',48), h3('Revoke instantly',20), P('New use stops at once. Published posts are flagged for takedown review.'), pad=24)], cols=4, minw=240))
li += W(grid([banner('blue','Paid licensing and payouts are coming later','We will open them once legal, tax and payment requirements are met.'),
               card(h3('What we never do'), lst([('Treat public videos as licensed',None,icon('x',18,T['red'])),('Assume silence means yes',None,icon('x',18,T['red'])),('Ignore third-party music or footage',None,icon('x',18,T['red']))]), pad=20)], cols=2, minw=400), pad='8px 48px 72px')
pub_page('Licensing.dc.html', 'M-05 Licensing & Creator Partners', li, h=1700)

# M-06 FAQ
qa = [('Can Nelio post without me?','Only if you turn on autonomous publishing for a specific agent, account and budget, and confirm it. It is off by default and not available on the Free plan.', True),
      ('Which platforms work today?','YouTube and Instagram are in development. TikTok and Facebook are coming later. We switch each on only after the official integration is approved.', False),
      ('How do credits work?','',False),('What happens when a license is revoked?','',False),('Do you guarantee views or monetization?','',False),('Can I pay in naira?','',False)]
faq = ''.join(f'<details {"open" if o else ""} style="border: 1px solid {T["bd"]}; border-radius: 18px; background: {T["s1"]}; padding: 18px 20px"><summary style="cursor: pointer; font-family: {HF}; font-weight: 700; font-size: 19px; color: {T["tx"]}">{e(q)}</summary>{P(a, size=15) if a else ""}</details>' for q, a, o in qa)
f_ = W(col(BIG('Questions, answered', 64), tabs(['General','Licensing','Billing','Agencies','Platforms','Privacy'],0), f'<div style="display: flex; flex-direction: column; gap: 12px; max-width: 860px">{faq}</div>', gap=24))
pub_page('FAQ.dc.html', 'M-06 FAQ', f_, h=1400)

# M-07 Legal
side = lst([('Terms of Service',None,'',chip('Viewing','lime')),('Privacy Policy',None),('Acceptable Use',None),('Licensing Policy',None),('Takedown requests',None)])
lg = W(row(f'<div style="flex: 1 1 260px; align-self: flex-start">{side}</div>', col(banner('orange','Draft legal text','This copy is a placeholder and must be reviewed by a lawyer before launch.'), H('Terms of Service',44), small('Last updated: [DATE]'),
          H('1. Who we are',22), P('[LEGAL COPY]', size=15), H('2. Your content and licenses',22), P('[LEGAL COPY]', size=15), H('3. Credits and billing',22), P('[LEGAL COPY]', size=15), gap=14, style='flex: 999 1 560px'), gap=32, align='flex-start'))
pub_page('Legal.dc.html', 'M-07 Legal', lg, h=1300)

# M-08 Status
srv = [('Web app','Operational','teal'),('Video processing','Operational','teal'),('Rendering','Degraded: slower than usual','orange'),('Notifications','Operational','teal'),('YouTube publishing','In development','blue'),('Instagram publishing','In development','blue'),('TikTok publishing','Coming later','neutral'),('Facebook publishing','Coming later','neutral')]
bars = lambda: f'<div style="display: flex; gap: 2px" aria-hidden="true">' + ''.join(f'<span style="flex: 1; height: 26px; border-radius: 3px; background: {T["teal"] if i not in (61,62) else T["orange"]}"></span>' for i in range(90)) + '</div>'
st = W(col(BIG('System status', 56), banner('orange','Rendering is slower than usual','Renders are taking up to 10 minutes. Nothing is lost; jobs are queued.'), card(card_head('Last 90 days', chip('99.94% uptime','teal')), bars(), pad=24),
          lst([(n, None, '', chip(s, t, {'teal':'check','orange':'alert','blue':'clock','neutral':'clock'}[t])) for n, s, t in srv]), gap=20))
pub_page('Status.dc.html', 'M-08 Status', st, h=1400)
