from lib import *
CUR['page'] = 'clipping'; theme('dark')

def media_tile(name, kind, tone, ic, meta, cap=None, vbg=None):
    thumb = video(cap or name.upper()[:22], ratio='4/5', maxw=400, bg=vbg, sub='', play=False) if cap is not None else f'<div style="aspect-ratio: 4/5; border-radius: 16px; background: {vbg or T["video2"]}; display: flex; align-items: center; justify-content: center">{icon("film",36,"#FFFFFF")}</div>'
    return card(thumb, row(col(f'<div style="font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{e(name)}</div>', small(meta), gap=2, style='flex: 1 1 auto'), gap=8), chip(kind, tone, ic), pad=12, gap=10)

# CL-01 Media library
tiles = grid([media_tile('podcast_ep12.mp4','processing','lime','refresh','48 min · uploaded 14:02'),
              media_tile('interview_raw.mov','ready','teal','check','22 min · own upload', vbg='#2A3A22'),
              media_tile('Chef Kemi · Ep 4','licensed','blue','shield','31 min · free license', vbg='#3A2A22'),
              media_tile('Stop budgeting like this','draft clip','grape','scissors','0:42 · from ep12', cap='STOP BUDGETING LIKE THIS'),
              media_tile('5 budgeting myths','exported','teal','download','0:31 · 9:16', cap='5 BUDGETING MYTHS', vbg='#21304A'),
              media_tile('old_vlog_2024.mp4','license expired','red','alert','14 min · can’t be used', vbg='#3A2228')], cols=6, gap=14, minw=170)
inner = page_head('Clipping Studio', 'Your videos, licensed sources and clips.', [btn('Import licensed','secondary','shield'), btn('Upload video','primary','upload')]) + \
    row(tabs(['All','Uploads','Licensed','Clips','Exports'],0), grow(), field('Search','', 'input','Search media') if False else '', small('Storage: 20 of 100 GB'), gap=12) + tiles + \
    card(row(bubble('scissors','lime',48), col(h3('Drop a long video here', 18), small('We’ll transcribe it, find scenes and suggest the best moments.'), gap=2), grow(), btn('Choose file','primary','upload'), gap=14), pad=20, bg=T['s1'])
app_page('MediaLibrary.dc.html', 'CL-01 Media library', 'media', inner, h=1150)

# CL-02 Upload
drop = f'<div style="border: 2px dashed {T["lime"]}; border-radius: 24px; padding: 32px; background: {T["limeT"]}; display: flex; flex-direction: column; gap: 14px">' + row(bubble('film','lime',52), col(h3('podcast_ep13.mp4',18), small('2.3 GB · 52 min · MP4'), gap=2), grow(), chip('Uploading 64%','lime','upload'), gap=14) + meter('', 64, '1.5 of 2.3 GB · about 1 min left') + '</div>'
rights = card(card_head('Who owns this video?', chip('Required','orange')), col(check('I own this content', True, 'I made it, or my company did.', radio=True), check('I have the owner’s permission', False, 'You may be asked for proof later.', radio=True), check('It’s from a Nelio license', False, 'Pick an active license instead.', radio=True), gap=12),
    field('Notes or proof (optional)','', 'textarea','e.g. link to agreement'), banner('blue','Public videos aren’t automatically licensed','If you found it online, you’ll need the owner’s permission or a Nelio license.'), pad=22)
proc = card(card_head('Processing'), tabs(['Fast','Balanced','High quality'],1), P('Balanced: good accuracy for most speech. High quality is slower and costs more; best for accents, music or noisy audio.', size=13),
    field('Caption language','English (Nigeria)','select'), kv([('Estimated cost','≈ 22 credits'),('Your balance','1,240 credits'),('After this','≈ 1,218 credits')]), btn('Start processing','primary','zap',full=True,size='lg'), pad=22)
inner = page_head('Add a video', None, [], crumbs='Clipping Studio › Upload') + grid([col(drop, rights, gap=16), proc], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr)')
app_page('Upload.dc.html', 'CL-02 Upload / authorized import', 'media', inner, h=1100)

# CL-03 Clipping Studio
def cand(title, score, rng, sel=False):
    bd = T['lime'] if sel else T['bd']; bg = T['limeT'] if sel else T['s1']
    return f'<button type="button" aria-pressed="{"true" if sel else "false"}" style="text-align: left; width: 100%; padding: 14px; border-radius: 16px; border: 2px solid {bd}; background: {bg}; color: {T["tx"]}; cursor: pointer; display: flex; flex-direction: column; gap: 6px; font-family: {BF}"><span style="font-size: 15px; font-weight: 700">{e(title)}</span><span style="display: flex; gap: 6px; flex-wrap: wrap">{chip("score "+score,"grape","spark")}{chip(rng,"neutral","clock")}</span></button>'
cands = card(card_head('Best moments', small('Ranked by Nelio AI')), cand('“Stop budgeting like this”','82','0:12–0:54',True), cand('“The 50/30/20 myth”','74','3:10–3:51'), cand('“Why savings fail”','61','7:02–7:40'), cand('“Rent hacks that work”','58','12:40–13:15'),
    small('Scores are estimates of how well a moment works as a short, not a promise of views.'), pad=18, gap=10)
tr_lines = [('00:12','Ada','Okay, stop budgeting like this. Seriously.',True),('00:16','Ada','Everyone tells you to write down every naira you spend.',True),('00:21','Tobi','And nobody actually does that.',True),('00:24','Ada','Exactly. So here’s what works instead.',True),('00:31','Ada','Pay yourself first, then spend the rest guilt-free.',False)]
trs = ''.join(f'<div style="display: flex; gap: 12px; padding: 8px 10px; border-radius: 10px; {"background: "+T["limeT"]+";" if on else ""}"><span style="font-size: 12px; color: {T["mu"]}; width: 42px; flex: none; font-variant-numeric: tabular-nums">{t}</span><span style="font-size: 12px; font-weight: 700; color: {T["grape"] if who=="Tobi" else T["lime"] if T["bg"]=="#0D0D12" else T["tx"]}; width: 40px; flex: none">{who}</span><span style="font-size: 14px; color: {T["tx"]}">{e(txt)}</span></div>' for t, who, txt, on in tr_lines)
transcript = card(card_head('Transcript', small('Select text to set the clip')), f'<div style="display: flex; flex-direction: column; gap: 2px">{trs}</div>', pad=18)
def track(name, segs, color):
    s = ''.join(f'<span style="position: absolute; left: {a}%; width: {b}%; top: 4px; bottom: 4px; border-radius: 8px; background: {color}"></span>' for a, b in segs)
    return f'<div style="display: flex; align-items: center; gap: 10px"><span style="width: 70px; font-size: 12px; font-weight: 600; color: {T["mu"]}">{name}</span><div style="position: relative; flex-grow: 1; height: 34px; border-radius: 10px; background: {T["s2"]}">{s}</div></div>'
tl = card(row(h3('Timeline'), grow(), small('0:00 – 0:42'), btn('','secondary','play',size='sm'), gap=10),
    f'<div style="position: relative; display: flex; flex-direction: column; gap: 8px">{track("Video",[(0,100)],"#4A3F6B")}{track("Captions",[(2,22),(26,20),(49,24),(76,22)],T["lime"])}{track("Brand",[(0,8),(92,8)],T["grape"])}{track("Audio",[(0,100)],"#2C5E52")}<span aria-hidden="true" style="position: absolute; left: 34%; top: -4px; bottom: -4px; width: 3px; border-radius: 2px; background: {T["tx"]}"></span></div>', pad=18)
style_ = card(card_head('Style'), grid([field('Caption style','Bold pop','select'), field('Brand kit','Ada Studio','select'), field('Format','9:16 vertical','select'), field('Hook','“Stop budgeting like this”','select')], cols=2, gap=12), pad=18)
nl = card(row(bubble('wand','grape',36), h3('Edit with words'), gap=10), f'<div style="display: flex; gap: 8px"><label for="nl" style="position: absolute; left: -9999px">Describe an edit</label><input id="nl" value="Cut the first pause and make captions bigger" style="flex-grow: 1; padding: 12px 14px; border-radius: 12px; border: 2px solid {T["bd"]}; background: {T["s2"]}; color: {T["tx"]}; font-size: 14px; font-family: {BF}; min-height: 46px">{btn("Apply","grape")}</div>', pad=18)
center = col(f'<div style="background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 12px; align-items: center">{video("STOP BUDGETING LIKE THIS", maxw=300)}{row(chip("Speaker kept in frame","teal","check"), chip("Own upload · rights snapshot r-881","blue","shield"), gap=6, justify="center")}</div>', gap=14)
inner = page_head('podcast_ep12 · Studio', 'Source: your upload · 48 min', [btn('Versions','secondary','clock'), btn('Variants','secondary','grid'), btn('Render · ≈18 cr','primary','film')], crumbs='Clipping Studio › podcast_ep12') + \
    grid([col(cands, transcript, gap=14), col(center, tl, gap=14), col(style_, nl, gap=14)], cols=3, gap=16, style='grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr)')
app_page('ClippingStudio.dc.html', 'CL-03 Clipping Studio', 'media', inner, h=1250)

# CL-04 Variants
def var(label, cap, sel, vbg=None, extra=''):
    return card(video(cap, maxw=220, bg=vbg, play=False), row(check(label, sel), gap=8), extra, pad=14, gap=10, style=f'border: 2px solid {T["lime"] if sel else T["bd"]}')
inner = page_head('Variants · “Stop budgeting like this”', 'Test different hooks and formats. Pick the ones to render.', [btn('Render 3 selected · ≈54 cr','primary','film')], crumbs='Studio › Variants') + \
    grid([var('Hook A · bold pop','STOP BUDGETING LIKE THIS',True), var('Hook B · question','ARE YOU BUDGETING WRONG?',True,'#21304A'), var('Hook C · number','3 BUDGET MISTAKES',True,'#3A2A22'),
          var('No captions','',False,'#2A3A22'), var('1:1 square','STOP BUDGETING LIKE THIS',False,'#3B2F1E'), var('Minimal captions','stop budgeting like this',False,'#2A2240')], cols=6, gap=14, minw=200) + \
    banner('blue','You have 1,240 credits','Rendering 3 variants uses about 54. Unselected variants aren’t charged.')
app_page('Variants.dc.html', 'CL-04 Batch variants', 'media', inner, h=1050)

# CL-05 Exports
rows_ = [(row(video('5 MYTHS',maxw=40,play=False,sub=''), '“5 budgeting myths” · Hook A', gap=10), '9:16 · 1080p', chip('rendering','lime','refresh'), '18 → —', btn('Cancel','ghost',size='sm')),
         (row(video('STOP',maxw=40,play=False,sub='',bg='#21304A'), '“Stop budgeting like this”', gap=10), '9:16 · 1080p', chip('ready','teal','check'), '20 → 17', btn('Download','secondary','download',size='sm')),
         (row(video('RENT',maxw=40,play=False,sub='',bg='#3A2A22'), '“Rent hacks that work”', gap=10), '9:16 · 1080p', chip('failed','red','x'), '15 → 0 · refunded', btn('Retry','secondary','refresh',size='sm'))]
inner = page_head('Exports', None, []) + banner('orange','Trial: 1 of 2 exports used','Your trial includes 2 short exports. Choose a plan to export more.','See plans') + table(['Clip','Format','Status','Credits (est → actual)',''], rows_)
app_page('Exports.dc.html', 'CL-05 Render & export queue', 'exports', inner, h=900)

# CS-01 Content Studio
tool = lambda ic, tone, t, s, extra='': card(bubble(ic, tone, 48), h3(t,18), P(s, size=13), extra, pad=20)
inner = page_head('Content Studio', 'Write, design and remix with Nelio AI.', [btn('New post','primary','plus')]) + \
    grid([tool('pen','lime','Write a script','Hooks, outlines and full scripts.'), tool('msg','grape','Posts & captions','Platform-ready captions in your voice.'), tool('image','blue','Create an image','Thumbnails and quote cards.'),
          tool('film','neutral','Original AI video','Generate video from a prompt.', chip('Coming later','neutral','clock')), tool('grid','orange','Templates','Reusable formats for your brand.'), tool('shield','teal','Remix licensed content','Within each license’s rules.')], cols=3, minw=260) + \
    section_title('Recent drafts') + table(['Draft','Type','For','Updated'], [('5 budgeting myths', chip('Clip + caption','lime'), row(plat('ig',22), plat('yt',22), gap=4), '2h ago'), ('Rent hacks thread', chip('Caption','grape'), plat('ig',22), '5h ago'), ('Savings challenge script', chip('Script','blue'), plat('yt',22), 'Yesterday')])
app_page('ContentStudio.dc.html', 'CS-01 Content Studio', 'content', inner, h=1150)

# CS-02 Composer
dest = lambda p, n, st: card(row(plat(p,32), col(h3(n,15), small(st), gap=1), grow(), check('Include', st=='Selected'), gap=10), pad=12)
ig_prev = f'<div style="background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 24px; padding: 16px; display: flex; flex-direction: column; gap: 10px">' + row(person('A',T['grape'],28,T['ongrape']), small('adastudio · Reel'), gap=8) + video('5 BUDGETING MYTHS', maxw=260) + P('Myth #1: you need to track every naira. Here’s what actually works 👇 #budgeting #studentlife', size=13, color=T['tx']).replace('👇','↓') + '</div>'
inner = page_head('New post', None, [btn('Save draft','secondary'), btn('Submit for approval','primary','check')], crumbs='Content Studio › Compose') + \
    grid([col(card(card_head('Media'), row(video('5 MYTHS',maxw=64,play=False,sub=''), col(h3('“5 budgeting myths” · Hook A',15), small('0:31 · 9:16 · own upload'), gap=2), grow(), btn('Change','ghost',size='sm'), gap=12), pad=18),
              card(card_head('Post to'), grid([dest('ig','Instagram Reels','Selected'), dest('yt','YouTube Shorts','Selected'), card(row(plat('tt',32), h3('TikTok',15), grow(), chip('Coming later','neutral'), gap=10), pad=12), card(row(plat('fb',32), h3('Facebook',15), grow(), chip('Coming later','neutral'), gap=10), pad=12)], cols=2, gap=10), pad=18),
              card(row(tabs(['Instagram','YouTube'],0), grow(), btn('Rewrite with Nelio AI','grape','spark',size='sm'), gap=10), field('Caption','Myth #1: you need to track every naira. Here’s what actually works. #budgeting #studentlife','textarea', hint='118 / 2,200'), field('First comment (optional)',''), pad=18), gap=14),
         col(ig_prev, banner('teal','License OK','Own upload. Checked again right before publishing.'), banner('orange','Client approval required','Chioma will review each platform separately.'), gap=14)], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)')
app_page('Composer.dc.html', 'CS-02 Post composer', 'content', inner, h=1250)

# CS-03 AI video (gated)
inner = page_head('Original AI video', None, [], crumbs='Content Studio') + empty('film','Original AI video is coming later','Generating new video from a prompt needs a specialist video partner we haven’t switched on yet. Clipping, editing and captions all work today.','Notify me', tone='grape', second='Go to Clipping Studio') + \
    grid([card(bubble('scissors','lime',44), h3('Clip a long video'), P('Turn podcasts and streams into shorts now.', size=13), pad=20), card(bubble('image','blue',44), h3('Create an image'), P('Thumbnails and quote cards.', size=13), pad=20), card(bubble('pen','grape',44), h3('Write a script'), P('Then film it yourself.', size=13), pad=20)], cols=3, minw=240)
app_page('AIVideo.dc.html', 'CS-03 Original AI video (gated)', 'content', inner, h=900)
