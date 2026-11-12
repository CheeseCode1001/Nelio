from frame import *

def tile(name, kind, tone, ic, meta, bg, cap, d, href='ClippingStudio.dc.html'):
    th = f'<div style="position: relative; aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; border: 2px solid {OL}"><svg viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%"><rect width="160" height="200" fill="{bg}"></rect>{IL.person(80, 130, 1.5, d % 5, "#2B1A10", ["#FFD43B","#FF4FB8","#2F5BFF","#B6F24A"][d % 4], d % 3)}</svg>{"<div style=\"position: absolute; left: 8px; right: 8px; bottom: 10px; text-align: center\"><span style=\"background: #FFD43B; border: 2px solid #0B0B14; border-radius: 6px; padding: 2px 6px; font-family: "+HF+"; font-weight: 800; font-size: 11px; color: #0B0B14\">"+e(cap)+"</span></div>" if cap else ""}</div>'
    return f'<a href="{href}" style="text-decoration: none; color: {T["tx"]}">' + card(th, col(f'<div style="font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{e(name)}</div>', small(meta), gap=2), chip(kind, tone, ic), pad=12, gap=10, anim=A('up', .05*d)) + '</a>'
TILES = lambda: [tile('podcast_ep12.mp4','processing','blue','refresh','48 min · uploaded 14:02','#59D8FF',None,0), tile('interview_raw.mov','ready','ok','check','22 min · own upload','#B6F24A',None,1), tile('Chef Kemi · Ep 4','licensed','ai','shield','31 min · free license','#FF7A2F',None,2),
                 tile('Stop budgeting like this','draft clip','lime','scissors','0:42 · from ep12','#9B7BFF','STOP THIS',3), tile('5 budgeting myths','exported','ok','download','0:31 · 9:16','#FFD43B','5 MYTHS',4), tile('old_vlog_2024.mp4','license expired','err','alert','14 min · can’t be used','#E4E8F1',None,5)]
@screen('CL-01','Media library','MediaLibrary','clipping',('filled','empty','loading',('storage','Storage almost full')))
def _(st, f, t):
    head = page_head('Clipping Studio', 'Your videos, licensed sources and clips.', [btn('Import licensed','secondary','shield','Marketplace.dc.html'), btn('Upload video','primary','upload','Upload.dc.html')], eb='Create')
    drop = f'<a href="Upload.dc.html" style="text-decoration: none; display: flex; flex-wrap: wrap; align-items: center; gap: 18px; padding: 20px 24px; border-radius: 28px; border: 2px dashed {T["acc"]}; background: {T["accT"]}; color: {T["tx"]}">{art("upload", 140)}<div style="flex: 1 1 280px">{h3("Drop a long video here",19)}{P("We’ll transcribe it, find scenes and suggest the best moments.")}</div>{btn("Choose file","primary","upload")}</a>'
    if st == 'empty': inner = head + empty('media','Add your first video','Upload something you own, or import from a creator who licensed it to you. We’ll find the best moments.','Upload video','Browse licenses','Upload.dc.html','Marketplace.dc.html')
    elif st == 'loading': inner = head + row(sk('360px',40,999), grow(), sk('140px',14), gap=10) + sk_media(6)
    else:
        sb = banner('warn','Storage almost full · 94 of 100 GB','Delete old uploads or upgrade for more space.','Manage storage') if st == 'storage' else ''
        inner = head + sb + row(tabs(['All','Uploads','Licensed','Clips','Exports'],0), grow(), small('Storage: 20 of 100 GB' if st != 'storage' else 'Storage: 94 of 100 GB'), gap=12) + grid(TILES(), cols=6, gap=14, minw=170) + drop
    app_page(f, t, 'media', inner, h=1250)

@screen('CL-02','Upload','Upload','clipping',('filled',('uploading','Uploading'),('wrongtype','Wrong file type'),('norights','Rights not chosen'),('lowcredits','Not enough credits')))
def _(st, f, t):
    if st == 'filled': drop = f'<div style="border: 3px dashed {T["acc"]}; border-radius: 32px; padding: 32px; background: {T["accT"]}; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center">{art("upload", 220)}{H("Drop a video here", 26)}{P("MP4 or MOV · up to 2 GB · up to 2 hours (provisional)")}{btn("Choose file","primary","upload")}</div>'
    elif st == 'wrongtype': drop = f'<div style="border: 3px dashed {T["errTx"]}; border-radius: 32px; padding: 28px; background: {T["errT"]}; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center">{art("notfound_content", 180)}{H("We can’t use that file", 24)}{P("party_photos.zip isn’t a video. Upload MP4 or MOV up to 2 GB.", T["tx"])}{btn("Choose another file","primary","upload")}</div>'
    else: drop = f'<div style="border: 3px dashed {T["acc"]}; border-radius: 32px; padding: 28px; background: {T["accT"]}; display: flex; flex-direction: column; gap: 14px">' + row(f'<span style="display: inline-flex">{thumb("EP13","#59D8FF",54,1,"#FF4FB8")}</span>', col(h3('podcast_ep13.mp4',18), small('2.3 GB · 52 min · MP4'), gap=2), grow(), chip('Uploading 64%' if st == 'uploading' else 'Uploaded','blue' if st == 'uploading' else 'ok','upload' if st == 'uploading' else 'check'), gap=14) + (meter('', 64, '1.5 of 2.3 GB · about 1 min left') if st == 'uploading' else '') + '</div>'
    err = st == 'norights'
    rights = card(card_head('Who owns this video?', chip('Required','warn')), col(check('I own this content', not err, 'I made it, or my company did.', radio=True), check('I have the owner’s permission', False, 'You may be asked for proof later.', radio=True), check('It’s from a Nelio license', False, 'Pick an active license instead.', radio=True), gap=12),
        (banner('err','Tell us who owns this video','Pick an option before we can process it.') if err else ''), field('Notes or proof (optional)','', 'textarea','e.g. link to agreement'), banner('blue','Public videos aren’t automatically licensed','If you found it online, you need the owner’s permission or a Nelio license.'), pad=24)
    low = st == 'lowcredits'
    proc = card(card_head('Processing'), tabs(['Fast','Balanced','High quality'],1), P('Balanced: good accuracy for most speech. High quality is slower and costs more; best for accents, music or noisy audio.', size=13), field('Caption language','English (Nigeria)','select'),
        kv([('Estimated cost','≈ 22 credits'),('Your balance','12 credits' if low else '1,240 credits'),('After this','—' if low else '≈ 1,218 credits')]),
        (banner('warn','This needs ≈22 credits, you have 12','Top up, or choose Fast quality (≈9 credits).','Top up', href='TopUp.dc.html') if low else ''), btn('Start processing','cta',None,'ClippingStudio-Processing.dc.html','lg',True,arrow=True), pad=24)
    inner = page_head('Add a video', None, [], crumbs='Clipping Studio › Upload') + grid([col(drop, rights, gap=16), proc], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr)')
    app_page(f, t, 'media', inner, h=1250)

def cand(title, score, rng, sel=False, d=0):
    return f'<button type="button" aria-pressed="{"true" if sel else "false"}" style="text-align: left; width: 100%; padding: 14px; border-radius: 20px; border: 2px solid {T["acc"] if sel else T["bd"]}; background: {T["accT"] if sel else T["s1"]}; color: {T["tx"]}; cursor: pointer; display: flex; flex-direction: column; gap: 8px; font-family: {BF}; {A("up",d)}"><span style="font-size: 15px; font-weight: 700">{e(title)}</span><span style="display: flex; gap: 6px; flex-wrap: wrap">{chip("score "+score,"ai","spark")}{chip(rng,"neutral","clock")}</span></button>'
def transcript():
    lines = [('00:12','Ada','Okay, stop budgeting like this. Seriously.',True),('00:16','Ada','Everyone tells you to write down every naira you spend.',True),('00:21','Tobi','And nobody actually does that.',True),('00:24','Ada','Exactly. So here’s what works instead.',True),('00:31','Ada','Pay yourself first, then spend the rest guilt-free.',False)]
    out = ''.join(f'<div style="display: flex; gap: 12px; padding: 8px 10px; border-radius: 12px; {"background: "+T["accT"]+";" if on else ""}"><span style="font-size: 12px; color: {T["mu"]}; width: 42px; flex: none">{tm}</span><span style="font-size: 12px; font-weight: 800; color: {T["aiTx"] if w=="Tobi" else T["accTx"]}; width: 40px; flex: none">{w}</span><span style="font-size: 14px">{e(x)}</span></div>' for tm, w, x, on in lines)
    return card(card_head('Transcript', small('Select text to set the clip')), f'<div style="display: flex; flex-direction: column; gap: 2px">{out}</div>', pad=18)
def trk(name, segs, color):
    s = ''.join(f'<span style="position: absolute; left: {a}%; width: {b}%; top: 5px; bottom: 5px; border-radius: 9px; background: {color}; border: 2px solid {OL}; box-sizing: border-box"></span>' for a, b in segs)
    return f'<div style="display: flex; align-items: center; gap: 10px"><span style="width: 70px; font-size: 12px; font-weight: 700; color: {T["mu"]}">{name}</span><div style="position: relative; flex-grow: 1; height: 38px; border-radius: 12px; background: {T["s2"]}">{s}</div></div>'
def timeline():
    return card(row(h3('Timeline'), grow(), small('0:00 – 0:42'), ibtn('play','Play'), gap=10), f'<div style="position: relative; display: flex; flex-direction: column; gap: 8px">{trk("Video",[(0,100)],"#9B7BFF")}{trk("Captions",[(2,22),(26,20),(49,24),(76,22)],"#FFD43B")}{trk("Brand",[(0,8),(92,8)],"#FF4FB8")}{trk("Audio",[(0,100)],"#59D8FF")}<span aria-hidden="true" style="position: absolute; left: 34%; top: -4px; bottom: -4px; width: 3px; border-radius: 2px; background: {T["acc"]}"></span></div>', pad=18)
@screen('CL-03','Clipping Studio','ClippingStudio','clipping',('filled',('processing','Processing'),'loading',('blocked','Render blocked: license'),('unsaved','Unsaved changes'),('estimate','Render estimate'),('queued','Render queued')))
def _(st, f, t):
    head = page_head('podcast_ep12 · Studio', 'Source: your upload · 48 min', [btn('Versions','secondary','clock'), btn('Variants','secondary','grid','Variants.dc.html'), btn('Render · ≈18 cr','primary','film','ClippingStudio-Estimate.dc.html')], crumbs='Clipping Studio › podcast_ep12')
    if st == 'loading':
        app_page(f, t, 'media', sk_head() + grid([col(sk_rows(4), card(sk_lines(5), pad=18), gap=14), card(f'<div style="aspect-ratio: 9/16; max-width: 280px; margin: 0 auto; width: 100%; border-radius: 22px; background: {T["s3"]}; {A("pulse")}"></div>', pad=18), col(card(sk_lines(4), pad=18), card(sk_lines(2), pad=18), gap=14)], cols=3, gap=16), h=1250); return
    if st == 'processing':
        body = grid([card(f'<div style="display: flex; justify-content: center">{art("media", 300)}</div>', H('Working on podcast_ep12…', 28), P('This takes about 6 minutes for a 48-minute video. You can leave; we’ll notify you.', size=15), pad=28),
                     card(stepper_list([('Upload & check file','done','2.1 GB · 48 min'),('Transcribe','running','Balanced quality · 61%'),('Detect scenes','queued',''),('Rank moments','queued','Nelio AI'),('Build previews','queued','')]), kv([('Estimated','≈ 22 credits'),('Used so far','9 credits')]), pad=24)], cols=2, gap=20)
        app_page(f, t, 'media', head + body, h=1050); return
    cands = card(card_head('Best moments', small('Ranked by Nelio AI')), cand('“Stop budgeting like this”','82','0:12–0:54',True), cand('“The 50/30/20 myth”','74','3:10–3:51',d=.05), cand('“Why savings fail”','61','7:02–7:40',d=.1), cand('“Rent hacks that work”','58','12:40–13:15',d=.15), small('Scores estimate how well a moment works as a short, not a promise of views.'), pad=18, gap=10)
    center = card(video('STOP BUDGETING LIKE THIS', 300, '#9B7BFF', 2, '#FFD43B'), row(chip('Speaker kept in frame','ok','check'), chip('Own upload · rights r-881','blue','shield'), gap=6, justify='center'), pad=18)
    style_ = card(card_head('Style'), grid([field('Caption style','Bold pop','select'), field('Brand kit','Ada Studio','select'), field('Format','9:16 vertical','select'), field('Hook','“Stop budgeting like this”','select')], cols=2, gap=12), pad=18)
    nl = card(row(bubble('wand','ai',38), h3('Edit with words'), gap=10), f'<div style="display: flex; gap: 8px"><label for="nl" style="position: absolute; left: -9999px">Describe an edit</label><input id="nl" value="Cut the first pause and make captions bigger" style="flex-grow: 1; padding: 12px 16px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; font-size: 14px; font-family: {BF}; min-height: 46px">{btn("Apply","ai")}</div>', pad=18)
    b = {'blocked': banner('err','Can’t render: license expired','Chef Kemi’s license ended on 30 Nov. Renew it or pick another source.','View license', href='MyLicenses.dc.html'), 'unsaved': banner('blue','You have unsaved edits','Trim and caption size changed since your last save.','Save version'), 'queued': banner('blue','Render queued','About 3 minutes. You can leave this page; we’ll notify you.')}.get(st, '')
    modal = overlay(row(bubble('film','lime',52), col(H('Render this clip?',26), P('You’ll see the actual cost when it’s done. If it fails, credits are refunded.'), gap=4), gap=14, wrap=False) + kv([('Render 1 clip · 1080p','≈ 18 credits'),('Your balance','1,240'),('After','≈ 1,222')]) + row(btn('Cancel','ghost'), grow(), btn('Render','cta',None,'Exports.dc.html',arrow=True), gap=10), maxw=520) if st == 'estimate' else ''
    inner = head + b + grid([col(cands, transcript(), gap=14), col(center, timeline(), gap=14), col(style_, nl, gap=14)], cols=3, gap=16, style='grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr)')
    app_page(f, t, 'media', inner, h=1350, modal=modal)

@screen('CL-04','Batch variants','Variants','clipping',('filled',('generating','Generating'),('lowcredits','Not enough credits')))
def _(st, f, t):
    def var(lbl, cap, sel, bg, skin, sh, d):
        v = f'<div style="aspect-ratio: 9/16; max-width: 220px; margin: 0 auto; width: 100%; border-radius: 22px; background: {T["s3"]}; {A("pulse", d)}"></div>' if st == 'generating' else video(cap, 220, bg, skin, sh, play=False)
        return card(v, check(lbl, sel), pad=14, gap=10, style=f'border: 2px solid {T["acc"] if sel else T["bd"]}', anim=A('up', d))
    vs = [('Hook A · bold pop','STOP BUDGETING LIKE THIS',True,'#9B7BFF',2,'#FFD43B'),('Hook B · question','ARE YOU BUDGETING WRONG?',True,'#59D8FF',1,'#FF4FB8'),('Hook C · number','3 BUDGET MISTAKES',True,'#FF7A2F',3,'#2F5BFF'),('No captions','',False,'#B6F24A',0,'#FF4FB8'),('1:1 square','STOP BUDGETING',False,'#FFD43B',4,'#2F5BFF'),('Minimal captions','stop budgeting like this',False,'#FF4FB8',2,'#B6F24A')]
    b = {'generating': banner('ai','Nelio AI is making 6 variants','About 1 minute. Previews are free; you only pay to render.'), 'lowcredits': banner('warn','Rendering 3 variants needs ≈54 credits, you have 40','Pick fewer, or top up.','Top up', href='TopUp.dc.html')}.get(st, banner('blue','You have 1,240 credits','Rendering 3 variants uses about 54. Unselected variants aren’t charged.'))
    inner = page_head('Variants · “Stop budgeting like this”', 'Test different hooks and formats. Pick the ones to render.', [btn('Render 3 selected · ≈54 cr','primary','film','Exports.dc.html')], crumbs='Studio › Variants') + b + grid([var(*v, .05*i) for i, v in enumerate(vs)], cols=6, gap=14, minw=200)
    app_page(f, t, 'media', inner, h=1150)

@screen('CL-05','Exports','Exports','clipping',('filled','empty','loading',('trial','Trial limit reached')))
def _(st, f, t):
    head = page_head('Exports', 'Rendered clips ready to download or post.', [])
    if st == 'empty': inner = head + empty('exports','No exports yet','Render a clip from the Clipping Studio and it lands here, ready to download or schedule.','Open Clipping Studio', href='MediaLibrary.dc.html')
    elif st == 'loading': inner = head + sk_table(5, 4)
    else:
        rows_ = [(row(thumb('MYTHS','#9B7BFF',40,2,'#FFD43B'), '“5 budgeting myths” · Hook A', gap=10), '9:16 · 1080p', row(chip('rendering','blue','refresh'), meter('',60,''), gap=8), '18 → —', btn('Cancel','ghost',size='sm')),
                 (row(thumb('STOP','#59D8FF',40,1,'#FF4FB8'), '“Stop budgeting like this”', gap=10), '9:16 · 1080p', chip('ready','ok','check'), '20 → 17', btn('Download','secondary','download',size='sm')),
                 (row(thumb('RENT','#FF7A2F',40,3,'#2F5BFF'), '“Rent hacks that work”', gap=10), '9:16 · 1080p', chip('failed · refunded','err','x'), '15 → 0', btn('Retry','secondary','refresh',size='sm'))]
        tb = banner('warn','You’ve used both trial exports','Choose a plan to export more. Your clips are saved.','See plans', href='Plans.dc.html') if st == 'trial' else banner('ai','Trial: 1 of 2 exports used','Choose a plan any time to export more.')
        inner = head + tb + table(['Clip','Format','Status','Credits (est → actual)',''], rows_)
    app_page(f, t, 'exports', inner, h=1000)

@screen('CS-01','Content Studio','ContentStudio','clipping',('filled','empty','loading'))
def _(st, f, t):
    def tool(bg, il, ti, s, extra=''):
        return f'<a href="Composer.dc.html" style="text-decoration: none; color: {OL}; border-radius: 30px; background: {bg}; border: 2px solid {OL}; box-shadow: 5px 5px 0 {OL}; padding: 20px; display: flex; flex-direction: column; gap: 8px; {A("up")}">{art(il, 180)}<span style="font-family: {HF}; font-weight: 800; font-size: 19px">{e(ti)}</span><span style="font-size: 13.5px">{e(s)}</span>{extra}</a>'
    tools = grid([tool('#FFD43B','drafts','Write a script','Hooks, outlines and full scripts.'), tool('#59D8FF','strategist','Posts & captions','Platform-ready captions in your voice.'), tool('#B6F24A','brand','Create an image','Thumbnails and quote cards.'),
                  tool('#FF4FB8','aivideo','Original AI video','Generate video from a prompt.', sticker('Coming later','#FFFFFF',-3,size=12,anim=False)), tool('#FF7A2F','exports','Templates','Reusable formats for your brand.'), tool('#9B7BFF','licenses','Remix licensed content','Within each license’s rules.')], cols=3, minw=260)
    head = page_head('Content Studio', 'Write, design and remix with Nelio AI.', [btn('New post','primary','plus','Composer.dc.html')], eb='Create')
    if st == 'loading': inner = head + grid([card(f'<div style="height: 140px; border-radius: 20px; background: {T["s3"]}; {A("pulse",.06*i)}"></div>', sk('60%',16), sk('80%',10), pad=20) for i in range(6)], cols=3, minw=260) + sk_table(4, 3)
    elif st == 'empty': inner = head + tools + empty('drafts','No drafts yet','Start with a script, a caption or a clip. Drafts you and your agents make show up here.','New post', href='Composer.dc.html')
    else: inner = head + tools + section_title('Recent drafts', link('All drafts →','Drafts.dc.html')) + table(['Draft','Type','For','Updated'], [('5 budgeting myths', chip('Clip + caption','lime'), row(plat('ig',24), plat('yt',24), gap=4), '2h ago'), ('Rent hacks thread', chip('Caption','ai'), plat('ig',24), '5h ago'), ('Savings challenge script', chip('Script','blue'), plat('yt',24), 'Yesterday')])
    app_page(f, t, 'content', inner, h=1500)

@screen('CS-02','Post composer','Composer','clipping',('filled',('invalid','Text too long'),('nodest','No account connected'),('licensed','Licensed source')))
def _(st, f, t):
    lic = st == 'licensed'
    dest = lambda p, n, s, on: card(row(plat(p,36), col(h3(n,15), small(s), gap=1), grow(), check('Include', on), gap=10), pad=12)
    dests = grid([dest('ig','Instagram Reels','@adastudio', st != 'nodest'), dest('yt','YouTube Shorts','Ada Studio', st != 'nodest'), card(row(plat('tt',36), h3('TikTok',15), grow(), chip('Coming later','neutral'), gap=10), pad=12), card(row(plat('fb',36), h3('Facebook',15), grow(), chip('Coming later','neutral'), gap=10), pad=12)], cols=2, gap=10)
    if st == 'nodest': dests = banner('blue','Connect an account to schedule','You can still save the draft and download the video.','Connect', href='Connections.dc.html') + dests.replace('Include', 'Include (not connected)')
    cap = 'Myth #1: you need to track every naira. Here’s what actually works. #budgeting #studentlife' + (' · via @chefkemi' if lic else '')
    fld = field('YouTube title','5 budgeting myths every Nigerian student secretly believes in 2026', err='100 characters max for Shorts titles (you have 104)') if st == 'invalid' else field('Caption', cap, 'textarea', hint='118 / 2,200' + (' · attribution added automatically' if lic else ''))
    prev = f'<div style="background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 30px; padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: {T["shadow"]}">' + row(person('A','#FFD43B',30), small('adastudio · Reel', T['tx'], 700), gap=8) + video('5 BUDGETING MYTHS' if not lic else 'JOLLOF FOR ONE', 260, '#9B7BFF' if not lic else '#FF7A2F', 2, '#FFD43B') + P(cap, size=13, color=T['tx']) + '</div>'
    side = col(prev, banner('ok','License OK','Chef Kemi · free license · attribution required. Checked again right before publishing.') if lic else banner('ok','License OK','Own upload. Checked again right before publishing.'), banner('warn','Client approval required','Chioma reviews each platform separately.'), gap=14)
    inner = page_head('New post', None, [btn('Save draft','secondary'), btn('Submit for approval','primary','check','PostDetail.dc.html')], crumbs='Content Studio › Compose') + \
        grid([col(card(card_head('Media'), row(thumb('M','#9B7BFF' if not lic else '#FF7A2F',56,2,'#FFD43B'), col(h3('“5 budgeting myths” · Hook A' if not lic else 'Chef Kemi · “Jollof for one”',15), small('0:31 · 9:16 · ' + ('licensed: Chef Kemi' if lic else 'own upload')), gap=2), grow(), btn('Change','ghost',size='sm'), gap=12), pad=18),
                  card(card_head('Post to'), dests, pad=18), card(row(tabs(['Instagram','YouTube'], 1 if st == 'invalid' else 0), grow(), btn('Rewrite with Nelio AI','ai','spark',size='sm'), gap=10), fld, field('First comment (optional)',''), pad=18), gap=14), side], cols=2, gap=20, style='grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)')
    app_page(f, t, 'content', inner, h=1350)

@screen('CS-03','Original AI video','AIVideo','clipping',('filled',))
def _(st, f, t):
    inner = page_head('Original AI video', None, [], crumbs='Content Studio') + empty('aivideo','Original AI video is coming later','Generating new video from a prompt needs a specialist video partner we haven’t switched on yet. Clipping, editing and captions all work today.','Notify me','Go to Clipping Studio', None, 'MediaLibrary.dc.html', 300)
    app_page(f, t, 'content', inner, h=1000)
build_all(only=['clipping'])
