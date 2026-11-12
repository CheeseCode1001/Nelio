from frame import *

def src(name, ini, c, lic, tone, niche, plats, n, d):
    return f'<a href="SourceDetail.dc.html" style="text-decoration: none; color: {T["tx"]}">' + card(f'<div style="height: 110px; border-radius: 20px; background: {c}; border: 2px solid {OL}; position: relative; overflow: hidden"><svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%">{IL.person(100, 92, 1.2, d, "#2B1A10", "#FFFFFF", d)}</svg><span style="position: absolute; top: 10px; left: 10px">{chip("verified","ok","check")}</span></div>', row(h3(name,17), grow(), chip(lic, tone), gap=8), P(niche, size=13), row(*[plat(p,26) for p in plats], grow(), small(n), gap=6), pad=14, anim=A('up', .05*d)) + '</a>'
SRCS = lambda: [src('Chef Kemi','CK','#FF4FB8','Free','ok','Nigerian home cooking · 120 videos','ig yt tt'.split(),'12 licensees',0), src('Lagos Money Talk','LM','#FFD43B','Private','blue','Personal finance interviews','ig yt'.split(),'4 licensees',1),
                src('FitWithTobi','FT','#B6F24A','Free','ok','Home workouts and nutrition','ig yt'.split(),'20 licensees',2), src('Campus Comedy','CC','#59D8FF','Private','blue','Student sketches','ig tt'.split(),'7 licensees',3),
                src('Mama’s Market','MM','#FF7A2F','Paid · later','neutral','Market tours and prices','yt'.split(),'—',4), src('Naija Tech Daily','NT','#9B7BFF','Free','ok','Gadgets and apps','yt'.split(),'9 licensees',0)]
@screen('LI-01','Marketplace','Marketplace','licensing',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Licensing marketplace', 'Content you can legally clip, from verified owners.', [btn('My licenses','secondary','shield','MyLicenses.dc.html')], eb='Grow')
    filters = card(h3('Filters'), field('Search','food' if st == 'empty' else '', 'input','Creators or topics'), field('Niche','Food & cooking','select'), field('License type','Free + private','select'), field('Allowed on','Instagram','select'), check('Commercial use allowed', st == 'empty'), check('Verified owners only', True), pad=18)
    if st == 'empty': body = empty('search','No sources match','No verified owners allow commercial food clips on Instagram yet. Try fewer filters.','Clear filters', w=200)
    elif st == 'loading': body = grid([card(f'<div style="height: 110px; border-radius: 20px; background: {T["s3"]}; {A("pulse",.05*i)}"></div>', sk('60%',16), sk('80%',10), pad=14) for i in range(6)], cols=3, gap=14, minw=240)
    else: body = grid(SRCS(), cols=3, gap=14, minw=240)
    app_page(f, t, 'licensing', head + grid([filters, body], cols=2, gap=20, style='grid-template-columns: 280px minmax(0, 1fr)'), h=1300)

@screen('LI-02','Source detail & terms','SourceDetail','licensing',('filled','loading',('private','Private license'),('paid','Paid (coming later)'),('suspended','Owner suspended'),('licensed','Already licensed')))
def _(st, f, t):
    if st == 'loading': app_page(f, t, 'licensing', sk_head() + grid([card(f'<div style="aspect-ratio: 16/9; border-radius: 20px; background: {T["s3"]}; {A("pulse")}"></div>', pad=16), sk_rows(6)], cols=2, gap=20), h=1100); return
    lt = {'private':('Private','blue'),'paid':('Paid · coming later','neutral')}.get(st, ('Free','ok'))
    cta = {'private': btn('Request a private license','cta',None,'RequestLicense-Private.dc.html','lg',True,arrow=True), 'paid': btn('Notify me when paid licensing opens','secondary','bell',full=True,size='lg'), 'suspended': banner('err','This listing is suspended','Ownership is under review. Existing licenses are paused.'), 'licensed': banner('ok','You already have this license','Active until 30 Jun 2027. Use it in the Clipping Studio.','Open studio', href='MediaLibrary.dc.html')}.get(st, btn('Get free license','cta',None,'RequestLicense.dc.html','lg',True,arrow=True))
    terms = card(card_head('License terms', chip(*lt)), kv([('Allowed','Clips and compilations'),('Platforms', row(plat('ig',24), plat('yt',24), plat('tt',24), gap=4)),('Commercial use', chip('Not allowed','err','x')),('Attribution','Required: “@chefkemi”'),('Edits','Captions, crops and trims'),('Expires','30 Jun 2027'),('Scope','All videos except 2 flagged')]), cta, pad=24)
    inner = page_head('Chef Kemi', 'Verified YouTube channel · 120 videos in scope', [], crumbs='Licensing › Chef Kemi', badge=chip('verified','ok','check')) + \
        grid([col(card(wide_video('Chef Kemi · Ep 4 · Jollof for one', '#FF4FB8'), pad=16), banner('warn','2 videos are excluded','They contain licensed music or guest footage the owner doesn’t control. We skip them automatically.'), card(card_head('Popular with licensees'), grid([video('JOLLOF FOR ONE',170,'#FF7A2F',0,'#FFD43B',play=False), video('₦2,000 SOUP',170,'#B6F24A',3,'#FF4FB8',play=False), video('5-MIN PLANTAIN',170,'#59D8FF',1,'#2F5BFF',play=False)], cols=3, gap=10), pad=18), gap=16), terms], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)')
    app_page(f, t, 'licensing', inner, h=1300)

@screen('LI-03','Request / accept license','RequestLicense','licensing',('filled',('private','Private request'),('sent','Request sent'),('approved','Approved'),('declined','Declined')))
def _(st, f, t):
    if st in ('sent','approved','declined'):
        il, ti, tx, tone = {'sent':('notifications','Request sent to Lagos Money Talk','We’ll notify you when they decide. Most owners reply within 2 days.','blue'),'approved':('success','Lagos Money Talk said yes!','6-month private license, Instagram only. You can use it now.','ok'),'declined':('denied','Lagos Money Talk declined','Their note: “Not licensing to new accounts right now.”','warn')}[st]
        m = f'<div style="display: flex; justify-content: center">{art(il, 240)}</div>' + H(ti, 26) + P(tx) + btn('Done','cta',None,'MyLicenses.dc.html',full=True,arrow=True)
    elif st == 'private':
        m = row(person('LM','#FFD43B',52), col(H('Request from Lagos Money Talk',24), small('Private license · they approve each request'), gap=2), gap=12) + field('What will you use it for?','Short clips for my student finance channel','textarea') + field('Platforms','Instagram','select') + field('How long?','6 months','select') + check('I’ll follow the attribution and platform rules', True) + row(btn('Cancel','ghost'), grow(), btn('Send request','cta',None,'RequestLicense-Sent.dc.html',arrow=True), gap=10)
    else:
        m = row(person('CK','#FF4FB8',52), col(H('License from Chef Kemi',24), small('Free license · for Ada Studio'), gap=2), gap=12) + kv([('Scope','All videos except 2 flagged'),('Platforms','Instagram, YouTube, TikTok'),('Commercial use','Not allowed'),('Attribution','“@chefkemi” on every post')]) + check('I’ll follow the attribution and platform rules', True) + check('I understand the owner can revoke this license, which stops future posts', True) + row(btn('Cancel','ghost'), grow(), btn('Accept free license','cta',None,'MyLicenses.dc.html',arrow=True), gap=10)
    app_page(f, t, 'licensing', page_head('Chef Kemi' if st == 'filled' else 'Lagos Money Talk', None, [], crumbs='Licensing'), h=1000, modal=overlay(m, maxw=560))

LROWS = lambda: [(row(person('CK','#FF4FB8',32), 'Chef Kemi', gap=10), chip('Free','ok'), chip('ends in 5 days','warn','clock'), '30 Nov 2026', '4 drafts'), (row(person('FT','#B6F24A',32), 'FitWithTobi', gap=10), chip('Free','ok'), chip('active','blue','check'), '2027', '—'), (row(person('CC','#59D8FF',32), 'Campus Comedy', gap=10), chip('Private','blue'), chip('revoked','err','x'), '—', '2 drafts · 1 scheduled · 1 published')]
@screen('LI-04','My licenses','MyLicenses','licensing',('filled','empty','loading',('expired','License expired')))
def _(st, f, t):
    head = page_head('My licenses', None, [btn('Browse marketplace','secondary','search','Marketplace.dc.html')], crumbs='Licensing')
    if st == 'empty': inner = head + empty('licenses','No licenses yet','Licenses let you clip other creators’ videos legally. Browse verified owners in the marketplace.','Browse marketplace', href='Marketplace.dc.html')
    elif st == 'loading': inner = head + sk_rows(2) + sk_table(5, 3)
    else:
        b = banner('err','Chef Kemi’s license expired','New clips and renders from Chef Kemi are blocked. 4 drafts are flagged.','Renew', href='SourceDetail.dc.html') if st == 'expired' else banner('err','Campus Comedy revoked your license','New clips and scheduled posts using it are on hold. 1 published post needs review.','Review affected content')
        inner = head + b + table(['Source','Type','Status','Expires','Affected content'], LROWS()) + card(card_head('Affected by the revocation'), lst([('Campus sketch #3','Scheduled Fri · now on hold', bubble('pause','warn',38), btn('Remove from schedule','secondary',size='sm')),('Campus sketch #1','Published on Instagram · flagged for review', bubble('flag','err',38), btn('Open takedown checklist','secondary',size='sm'))]), pad=18)
    app_page(f, t, 'licensing', inner, h=1150)

# ---------------- Creator portal ----------------
@screen('LI-05','Creator portal overview','CreatorOverview','creator',('filled','empty','loading',('unverified','Not verified yet')))
def _(st, f, t):
    if st == 'loading': creator_page(f, t, 'c-over', sk_head() + grid([sk_stat() for _ in range(4)], cols=4, minw=200) + sk_rows(3) + sk_table(4, 3), h=1150); return
    head = page_head('Hi Kemi', 'Here’s how your content is being used.', [], eb='Creator Portal')
    if st == 'unverified': inner = head + f'<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding: 28px; border-radius: 32px; background: {T["lime"]}; color: {OL}">{art("verify", 240)}<div style="flex: 1 1 320px; display: flex; flex-direction: column; gap: 10px">{big("First, verify your channel.", 36, OL)}<p style="margin: 0; font-size: 15px">Sign in with YouTube or Instagram to prove the channel is yours. Takes a minute.</p>{btn("Verify a channel","cta",None,"Verification.dc.html",arrow=True)}</div></div>'
    elif st == 'empty': inner = head + grid([stat('Active licenses','0',ic='shield'), stat('Clips made','0',ic='scissors'), stat('Published uses','0',ic='eye'), stat('Pending requests','0',ic='clock')], cols=4, minw=200) + empty('licenses','No one has licensed your content yet','Your listing is live. Share it with creators who’d love to clip you.','Copy listing link','Edit terms', None, 'LicenseTerms.dc.html')
    else: inner = head + grid([stat('Active licenses','12',ic='shield',fill='#B6F24A'), stat('Clips made','148',ic='scissors'), stat('Published uses','131',ic='eye'), stat('Pending requests','1',ic='clock',fill='#FFD43B')], cols=4, minw=200) + \
        card(card_head('Requests'), lst([('Lagos Food Agency wants a private license','Instagram · commercial use · 6 months', person('LF','#FF7A2F',40), row(btn('Decline','ghost',size='sm'), btn('Review','primary',size='sm'), gap=6))]), pad=18) + \
        card(card_head('Recent uses', link('All usage →','Usage.dc.html')), table(['Licensee','From video','Platform','When'], [('Ada Studio','Ep 4 · Jollof for one', plat('ig',26), 'Today'), ('Naija Eats','Ep 9 · Pepper soup', plat('yt',26), 'Yesterday'), ('Campus Hub','Ep 2 · Plantain', plat('ig',26), '3 days ago')]), pad=18)
    creator_page(f, t, 'c-over', inner, h=1250)

@screen('LI-06','Verification','Verification','creator',('filled',('pending','Pending'),('failed','Failed'),'empty'))
def _(st, f, t):
    head = page_head('Verify your channels', 'We check ownership by having you sign in with that platform.', [btn('Verify a channel','primary','plus')])
    if st == 'empty': inner = head + empty('verify','No channels yet','Verify at least one channel before your licensing terms can go live.','Verify with YouTube','Verify with Instagram')
    else:
        rows_ = [('YouTube · Chef Kemi','Verified 2 Nov 2026', plat('yt',44), chip('verified','ok','check'))]
        if st in ('filled','pending'): rows_.append(('Instagram · @chefkemi','Waiting for Instagram to confirm · usually minutes', plat('ig',44), chip('pending','blue','clock')))
        if st in ('filled','failed'): rows_.append(('YouTube · Kemi Vlogs','That sign-in didn’t own this channel. Sign in with the owner account.', plat('yt',44), row(chip('failed','err','x'), btn('Try again','secondary',size='sm'), gap=8)))
        rows_.append(('TikTok','Coming later', plat('tt',44), chip('Coming later','neutral')))
        inner = head + lst(rows_)
    creator_page(f, t, 'c-verify', inner, h=950)

@screen('LI-07','Licensing terms','LicenseTerms','creator',('filled',('unverified','Can’t publish yet'),('saved','Published')))
def _(st, f, t):
    b = {'unverified': banner('warn','Verify a channel first','Terms go live once at least one channel is verified.','Verify', href='Verification.dc.html'), 'saved': banner('ok','Terms published','Your listing is live in the marketplace.')}.get(st, '')
    inner = page_head('Your licensing terms', 'These apply to everyone who licenses your content.', [btn('Preview listing','secondary','eye'), btn('Publish terms','primary')]) + b + \
        grid([card(card_head('License type'), check('Free license', True, 'Anyone verified can clip within these rules.', radio=True), check('Private agreements only', False, 'You approve each request.', radio=True), f'<div style="opacity: 0.55">{check("Paid licensing", False, "Coming later, once payouts are ready.", radio=True)}</div>', card_head('Rules'), field('Allowed uses','Clips and compilations','select'), field('Platforms','Instagram, YouTube, TikTok','select'), toggle('Allow commercial use', False), field('Attribution text','@chefkemi'), field('Expires','12 months after license starts','select'), pad=24),
              col(card(card_head('Third-party rights', chip('Important','warn')), check('Some of my videos contain music or footage I don’t own', True), field('Which ones?','Ep 7 (licensed music), Ep 12 (guest footage)','textarea'), pad=24), card(card_head('Excluded videos'), lst([('Ep 7 · Party jollof','Licensed music', bubble('music','warn',38), btn('Include','ghost',size='sm')),('Ep 12 · Market day','Guest footage', bubble('users','warn',38), btn('Include','ghost',size='sm'))]), pad=24), gap=16)], cols=2, gap=20)
    creator_page(f, t, 'c-terms', inner, h=1300)

@screen('LI-08','Usage audit','Usage','creator',('filled','empty','loading'))
def _(st, f, t):
    head = page_head('Where your content is used', None, [btn('Export CSV','secondary','download')])
    if st == 'empty': inner = head + empty('search','No uses yet','When licensees publish clips of your videos, every use shows up here.', None)
    elif st == 'loading': inner = head + sk_table(5, 4)
    else: inner = head + tabs(['All','Published','Scheduled','On hold'],0) + table(['Licensee','Source video','Clip','Platform','Status'], [('Ada Studio','Ep 4','Jollof for one', plat('ig',26), chip('published','ok','check')), ('Ada Studio','Ep 4','Plantain hack', plat('yt',26), chip('scheduled','blue','clock')), ('Campus Hub','Ep 2','Pepper soup', plat('ig',26), chip('on hold · revoked','err','pause')), ('Naija Eats','Ep 9','Pepper soup', plat('yt',26), chip('published','ok','check'))])
    creator_page(f, t, 'c-usage', inner, h=1000)

@screen('LI-09','Revoke a license','Revoke','creator',('filled',('done','Revoked'),'empty'))
def _(st, f, t):
    head = page_head('Revocations','Past revocations and their impact.', [])
    if st == 'empty': creator_page(f, t, 'c-rev', head + empty('licenses','You haven’t revoked any licenses','If you revoke one, new use stops at once and published posts get flagged for review.', None), h=900); return
    if st == 'done': creator_page(f, t, 'c-rev', head + banner('ok','License revoked','Campus Hub was notified. 1 published post flagged for their review.') + table(['Licensee','Revoked','Held','Flagged'], [('Campus Hub','Today','1','1'),('Old Blog Co','2 Oct 2026','3','0')]), h=900); return
    m = row(f'<span aria-hidden="true">{art("denied",120)}</span>', col(H('Revoke Campus Hub’s license?',24), small('Private license since 3 Sep 2026'), gap=2), gap=12) + card(h3('Stops right away',15), P('New clips, renders and 1 scheduled post.', size=13), pad=14, bg=T['s2'], bd=False) + card(h3('Flagged for review',15), P('1 published post. Campus Hub is asked to review it and take it down if required.', size=13), pad=14, bg=T['s2'], bd=False) + field('Reason (shared with Campus Hub)','', 'textarea','Optional') + row(btn('Keep license','ghost'), grow(), btn('Revoke license','danger','x','Revoke-Done.dc.html'), gap=10)
    creator_page(f, t, 'c-rev', head + table(['Licensee','Revoked','Held','Flagged'], [('Old Blog Co','2 Oct 2026','3','0')]), h=1000, modal=overlay(m, maxw=580))

@screen('LI-10','Payouts','Payouts','creator',('filled',))
def _(st, f, t):
    creator_page(f, t, 'c-pay', page_head('Payouts', None, []) + empty('wallet','Paid licensing and payouts are coming later','We’ll open paid licenses once legal, tax and payment requirements are in place. Your free and private licenses keep working.','Notify me', w=300), h=900)
build_all(only=['licensing','creator'])
