from lib import *
CUR['page'] = 'licensing'; theme('dark')

def src(name, ini, col_, lic, tone, niche, plats, n):
    return card(row(person(ini, col_, 52, '#0D0D12'), col(h3(name,17), row(chip('verified','teal','check'), chip(lic, tone), gap=6), gap=6), gap=12),
                P(niche, size=13), row(*[plat(p,24) for p in plats], grow(), small(n), gap=6), btn('View terms','secondary',full=True,size='sm'), pad=18)
filters = card(h3('Filters'), field('Search','', 'input','Creators or topics'), field('Niche','Food & cooking','select'), field('License type','Free + private','select'), field('Allowed on','Instagram','select'), check('Commercial use allowed'), check('Verified owners only', True), pad=18)
inner = page_head('Licensing marketplace', 'Content you can legally clip, from verified owners.', [btn('My licenses','secondary','shield')]) + \
    grid([filters, grid([src('Chef Kemi','CK','#FF8AC8','Free','teal','Nigerian home cooking, 120 videos','ig yt tt'.split(),'12 licensees'), src('Lagos Money Talk','LM','#FFB547','Private','blue','Personal finance interviews','ig yt'.split(),'4 licensees'),
                          src('FitWithTobi','FT','#3DDBA0','Free','teal','Home workouts and nutrition','ig yt'.split(),'20 licensees'), src('Campus Comedy','CC','#6CB4FF','Private','blue','Student sketches','ig tt'.split(),'7 licensees'),
                          src('Mama’s Market','MM','#D4FF3F','Paid · later','neutral','Market tours and prices','yt'.split(),'—'), src('Naija Tech Daily','NT','#B7A4FF','Free','teal','Gadgets and apps','yt'.split(),'9 licensees')], cols=3, gap=14, minw=240)], cols=2, gap=20, style='grid-template-columns: 280px minmax(0, 1fr)')
app_page('Marketplace.dc.html', 'LI-01 Marketplace discovery', 'licensing', inner, h=1200)

terms = card(card_head('License terms', chip('Free','teal')), kv([('Allowed','Clips and compilations'),('Platforms', row(plat('ig',22), plat('yt',22), plat('tt',22), gap=4)),('Commercial use', chip('Not allowed','red','x')),('Attribution','Required: “@chefkemi”'),('Edits','Captions, crops and trims'),('Expires','30 Jun 2027'),('Scope','All videos except 2 flagged')]), btn('Get free license','primary','shield',full=True,size='lg'), pad=22)
inner = page_head('Chef Kemi', 'Verified YouTube channel · 120 videos in scope', [], crumbs='Licensing › Chef Kemi', badge=chip('verified','teal','check')) + \
    grid([col(card(wide_video('Chef Kemi · Ep 4 · Jollof for one'), pad=16), banner('orange','2 videos are excluded','They contain licensed music or guest footage the owner doesn’t control. We skip them automatically.'),
              card(card_head('Popular with licensees'), grid([video('JOLLOF FOR ONE',maxw=160,play=False,bg='#3A2A22'), video('₦2,000 SOUP',maxw=160,play=False), video('5-MIN PLANTAIN',maxw=160,play=False,bg='#21304A')], cols=3, gap=10), pad=18), gap=16), terms], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)')
app_page('SourceDetail.dc.html', 'LI-02 Source detail & terms', 'licensing', inner, h=1150)

modal = overlay(row(person('CK','#FF8AC8',48,'#0D0D12'), col(H('License from Chef Kemi',24), small('Free license · for Ada Studio'), gap=2), gap=12) +
    kv([('Scope','All videos except 2 flagged'),('Platforms','Instagram, YouTube, TikTok'),('Commercial use','Not allowed'),('Attribution','“@chefkemi” on every post')]) +
    check('I’ll follow the attribution and platform rules', True) + check('I understand the owner can revoke this license, which stops future posts', True) +
    row(btn('Cancel','ghost'), grow(), btn('Accept free license','primary','check'), gap=10), maxw=560)
app_page('RequestLicense.dc.html', 'LI-03 Request / accept license', 'licensing', page_head('Chef Kemi', None, [], crumbs='Licensing › Chef Kemi'), h=900, modal=modal)

rows_ = [(row(person('CK','#FF8AC8',28,'#0D0D12'), 'Chef Kemi', gap=10), chip('Free','teal'), chip('ends in 5 days','orange','clock'), '30 Nov 2026', '4 drafts'),
         (row(person('FT','#3DDBA0',28,'#0D0D12'), 'FitWithTobi', gap=10), chip('Free','teal'), chip('active','lime','check'), '2027', '—'),
         (row(person('CC','#6CB4FF',28,'#0D0D12'), 'Campus Comedy', gap=10), chip('Private','blue'), chip('revoked','red','x'), '—', '2 drafts · 1 scheduled · 1 published')]
inner = page_head('My licenses', None, [btn('Browse marketplace','secondary','search')], crumbs='Licensing') + \
    banner('red','Campus Comedy revoked your license','New clips and scheduled posts using it are on hold. 1 published post needs review.','Review affected content') + \
    table(['Source','Type','Status','Expires','Affected content'], rows_) + \
    card(card_head('Affected by the revocation'), lst([('Campus sketch #3','Scheduled Fri · now held', bubble('pause','orange',36), btn('Remove from schedule','secondary',size='sm')),('Campus sketch #1','Published on Instagram · flagged for review', bubble('flag','red',36), btn('Open takedown checklist','secondary',size='sm'))]), pad=18)
app_page('MyLicenses.dc.html', 'LI-04 My licenses', 'licensing', inner, h=1050)

# ---------------- Creator portal ----------------
inner = page_head('Hi Kemi', 'Here’s how your content is being used.', []) + \
    grid([stat('Active licenses','12',ic='shield', fill=T['lime']), stat('Clips made','148',ic='scissors'), stat('Published uses','131',ic='eye'), stat('Pending requests','1',ic='clock')], cols=4, minw=200) + \
    card(card_head('Requests'), lst([('Lagos Food Agency wants a private license','For: Instagram · commercial use · 6 months', person('LF','#FFB547',36,'#0D0D12'), row(btn('Decline','ghost',size='sm'), btn('Review','primary',size='sm'), gap=6))]), pad=18) + \
    card(card_head('Recent uses', f'<a href="#" style="font-size: 13px; font-weight: 700">All usage →</a>'), table(['Licensee','From video','Platform','When'], [('Ada Studio','Ep 4 · Jollof for one', plat('ig',22), 'Today'), ('Naija Eats','Ep 9 · Pepper soup', plat('yt',22), 'Yesterday'), ('Campus Hub','Ep 2 · Plantain', plat('ig',22), '3 days ago')]), pad=18)
creator_page('CreatorOverview.dc.html', 'LI-05 Creator portal overview', 'c-over', inner, h=1100)

inner = page_head('Verify your channels', 'We check you own a channel by having you sign in with that platform.', []) + \
    lst([('YouTube · Chef Kemi','Verified 2 Nov 2026', plat('yt',40), chip('verified','teal','check')), ('Instagram · @chefkemi','Waiting for Instagram to confirm', plat('ig',40), chip('pending','blue','clock')),
         ('TikTok','Coming later', plat('tt',40), chip('Coming later','neutral')), ('YouTube · Kemi Vlogs','Sign-in didn’t match this channel’s owner', plat('yt',40), row(chip('failed','red','x'), btn('Try again','secondary',size='sm'), gap=8))]) + \
    btn('Verify another channel','primary','plus')
creator_page('Verification.dc.html', 'LI-06 Ownership verification', 'c-verify', inner, h=900)

inner = page_head('Your licensing terms', 'These apply to everyone who licenses your content.', [btn('Preview listing','secondary','eye'), btn('Publish terms','primary')]) + \
    grid([card(card_head('License type'), check('Free license', True, 'Anyone verified can clip within these rules.', radio=True), check('Private agreements only', False, 'You approve each request.', radio=True),
              f'<div style="opacity: 0.6">{check("Paid licensing", False, "Coming later, once payouts are ready.", radio=True)}</div>', card_head('Rules'), field('Allowed uses','Clips and compilations','select'), field('Platforms','Instagram, YouTube, TikTok','select'),
              toggle('Allow commercial use', False), field('Attribution text','@chefkemi'), field('Expires','12 months after license starts','select'), pad=22),
          col(card(card_head('Third-party rights', chip('Important','orange')), check('Some of my videos contain music or footage I don’t own', True), field('Which ones?','Ep 7 (licensed music), Ep 12 (guest footage)','textarea'), pad=22),
              card(card_head('Excluded videos'), lst([('Ep 7 · Party jollof','Licensed music', bubble('music','orange',36), btn('Include','ghost',size='sm')),('Ep 12 · Market day','Guest footage', bubble('users','orange',36), btn('Include','ghost',size='sm'))]), pad=22), gap=16)], cols=2, gap=20)
creator_page('LicenseTerms.dc.html', 'LI-07 Licensing terms', 'c-terms', inner, h=1150)

inner = page_head('Where your content is used', None, [btn('Export CSV','secondary','download')]) + tabs(['All','Published','Scheduled','Held'],0) + \
    table(['Licensee','Source video','Clip','Platform','Status'], [('Ada Studio','Ep 4','Jollof for one', plat('ig',22), chip('published','teal','check')), ('Ada Studio','Ep 4','Plantain hack', plat('yt',22), chip('scheduled','blue','clock')),
                                                                   ('Campus Hub','Ep 2','Pepper soup', plat('ig',22), chip('held · revoked','red','pause')), ('Naija Eats','Ep 9','Pepper soup', plat('yt',22), chip('published','teal','check'))])
creator_page('Usage.dc.html', 'LI-08 Usage audit', 'c-usage', inner, h=900)

modal = overlay(row(bubble('alert','red',52), col(H('Revoke Campus Hub’s license?',24), small('Private license since 3 Sep 2026'), gap=2), gap=12) +
    card(h3('Stops right away',15), P('New clips, renders and 1 scheduled post.', size=13), pad=14, bg=T['s2'], bd=False) +
    card(h3('Flagged for review',15), P('1 published post. Campus Hub is asked to review it and take it down if required.', size=13), pad=14, bg=T['s2'], bd=False) +
    field('Reason (shared with Campus Hub)','', 'textarea','Optional') + row(btn('Keep license','ghost'), grow(), btn('Revoke license','danger','x'), gap=10), maxw=560)
creator_page('Revoke.dc.html', 'LI-09 Revoke a license', 'c-rev', page_head('Revocations','Past revocations and their impact.', []) + table(['Licensee','Revoked','Held','Flagged'], [('Old Blog Co','2 Oct 2026','3','0')]), h=950, modal=modal)
inner = page_head('Payouts', None, []) + empty('wallet','Paid licensing and payouts are coming later','We’ll open paid licenses once legal, tax and payment requirements are in place. Your free and private licenses keep working.','Notify me', tone='grape')
creator_page('Payouts.dc.html', 'LI-10 Paid licensing & payouts (gated)', 'c-pay', inner, h=750)
