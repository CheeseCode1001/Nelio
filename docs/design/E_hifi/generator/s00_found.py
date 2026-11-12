from frame import *
import illus as IL

def swatch(name, hexv, note='', fg=None):
    return f'<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0"><div style="height: 88px; border-radius: 20px; background: {hexv}; border: 2px solid {OL}; display: flex; align-items: flex-end; padding: 10px; box-sizing: border-box"><span style="font-size: 12px; font-weight: 800; color: {fg or OL}; background: #FFFFFF; padding: 2px 8px; border-radius: 999px">{e(hexv)}</span></div><div style="font-size: 13px; font-weight: 800">{e(name)}</div><div style="font-size: 12px; color: {T["mu"]}">{e(note)}</div></div>'

def foundations():
    CUR['page'] = 'foundations'; CUR['row'] = 'F'
    brand = grid([swatch('Electric blue','#2F5BFF','Primary action, links, active nav'), swatch('Ink','#0B0B14','CTA pills, outlines, text'), swatch('Lime','#B6F24A','Highlights, credits, success fills'),
                  swatch('Hot pink','#FF4FB8','Nelio AI, agents, AI badges'), swatch('Sunny yellow','#FFD43B','Stickers, captions, fun'), swatch('Sky cyan','#59D8FF','Illustration fill'), swatch('Tangerine','#FF7A2F','Illustration fill'), swatch('Paper','#F4F6FB','Page background')], cols=8, gap=14, minw=120)
    status = grid([swatch('Info','#E8EEFF','text #1E40D8 · 6.5:1'), swatch('Success','#DDF7E6','text #0E6F38 · 5.2:1'), swatch('Warning','#FFF1DC','text #9A4A06 · 5.4:1'), swatch('Error','#FDE3E3','text #C81E1E · 4.7:1'), swatch('AI','#FFE6F4','text #B5176F · 5.4:1'), swatch('Lime tint','#EEFCD6','text #3B6300 · 6.6:1')], cols=6, gap=14, minw=140)
    dark = f'<div style="padding: 20px; border-radius: 28px; background: #0B0B14; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px">' + ''.join(f'<div style="display: flex; flex-direction: column; gap: 6px"><div style="height: 64px; border-radius: 16px; background: {c}; border: 1px solid #2A2A38"></div><span style="font-size: 12px; font-weight: 700; color: #F5F6FA">{n} {c}</span></div>' for n, c in [('Bg','#0B0B14'),('Surface','#15151F'),('Surface 2','#1D1D29'),('Blue','#3D63FF'),('Text','#F5F6FA'),('Muted','#A7AABD')]) + '</div>'
    type_ = col(big('Display 72 · Jakarta 800', 64), H('Page title 36 · 800', 36), H('Section 22 · 800', 22), f'<div style="font-size: 16px; font-weight: 600">Body strong 16 · Inter 600</div>', P('Body 14 · Inter 400 · line-height 1.55'), eyebrow('Eyebrow 12 · caps · blue'), gap=14)
    comps = col(card_head('Buttons'), row(btn('Start free','cta',arrow=True), btn('Generate clips','primary','spark'), btn('Ask Nelio AI','ai','spark'), btn('Lime action','lime'), btn('Secondary','secondary'), btn('Ghost','ghost'), btn('Revoke','danger'), ibtn('more','More'), gap=10),
                card_head('Chips & stickers'), row(chip('active','blue','zap'), chip('Nelio AI','ai','spark'), chip('published','ok','check'), chip('needs approval','warn','alert'), chip('failed','err','x'), chip('draft'), chip('credits','lime','zap'), gap=8),
                row(sticker('New!','#FFD43B',-6,'star'), sticker('Nelio AI picked this','#FF4FB8',3,'spark'), sticker('97','#B6F24A',-3), sticker('Coming later','#59D8FF',4), gap=18, style='padding: 10px 0'), gap=14)
    forms = grid([col(field('Workspace name','Ada Studio'), field('Email','ada@','email', err='Enter a full email address')), col(check('Client approval required', True), check('Approve each platform separately', True), toggle('Autonomous publishing', False, 'Needs your authorization'), toggle('Email when renders finish', True))], cols=2, gap=24)
    ch = grid([choice('Assisted','Agents prepare, you approve.', True, 'check','blue','Recommended'), choice('Autonomous','Agents publish within your limits.', False, 'zap','ai','Paid plans', locked=True)], cols=2)
    ban = col(banner('warn','Recipe Reels is paused','It hit its weekly budget of 300 credits.','Raise limit'), banner('err','License revoked','2 drafts and 1 scheduled post are on hold.','Review'), banner('ai','Nelio AI suggestion','Post at 18:00 on Fridays.','Apply'), banner('ok','Published to Instagram','Confirmed by Instagram at 18:02.'), gap=10)
    skel = card(card_head('Skeleton loaders', chip('pulse 1.6s','neutral')), grid([sk_stat(), sk_card()], cols=2), sk_rows(3))
    avatars = row(agent('lime','circle',52), agent('pink','blob',52), agent('blue','square',52), agent('orange','pill',52), agent('yellow','blob',52), plat('yt',40), plat('ig',40), plat('tt',40), plat('fb',40), person('AO','#FF7A2F',44), gap=12)
    rules = lst([('Flat colour only','No gradients, glows or glass. Fun comes from colour blocks, stickers, illustrations and bold type.', bubble('palette','lime',38)),
                 ('Light by default','Dark is available with full parity. Users choose Light, Dark or System.', bubble('sun','blue',38)),
                 ('Blue means go','One blue (or ink CTA) primary action per view. Focus ring is 3 px blue.', bubble('cursor','blue',38)),
                 ('Pink means Nelio AI','Anything the AI did or suggests carries pink. No vendor names, ever.', bubble('spark','ai',38)),
                 ('Status = icon + word + colour','Never colour alone.', bubble('eye','warn',38)),
                 ('Honest states','“In development”, “Coming later”, “Confirming with Instagram”. No fake success.', bubble('shield','ok',38))])
    inner = row(logo(64), grow(), sticker('Design system v2','#B6F24A',-3), sticker('Light default','#FFD43B',4), gap=16) + \
        P('Nelio feels like a bright creative studio: clean white canvas and electric blue (like a pro video tool), Retro-style sticker cards and illustrations for fun, lime organic shapes and black pill buttons for punch, all flat.', size=18, color=T['tx']) + \
        card(card_head('Brand colours'), brand) + card(card_head('Status tints (light)'), status) + card(card_head('Dark theme'), dark) + \
        grid([card(card_head('Type: Plus Jakarta Sans + Inter'), type_), card(card_head('Agents, platforms, people'), avatars, P('Agents are flat shapes with blinking eyes and a 2 px ink outline. Each agent keeps one colour and shape.', size=13))], cols=2, gap=20) + \
        card(comps) + card(card_head('Forms'), forms) + card(card_head('Choice cards'), ch) + grid([card(card_head('Banners'), ban), skel], cols=2, gap=20) + card(card_head('Rules'), rules)
    write('Main.dc.html', doc('Nelio design foundations v2', f'<main style="padding: 56px; display: flex; flex-direction: column; gap: 24px; max-width: 1328px">{inner}</main>', 1440, 3800))

    # Illustration gallery
    CUR['row'] = 'ILL'
    tiles = ''.join(f'<figure style="margin: 0; background: #FFFFFF; border: 1px solid {T["bd"]}; border-radius: 28px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px">{IL.get(k, 240)}<figcaption style="font-size: 13px; font-weight: 800">{e(k)}</figcaption><span style="font-size: 12px; color: {T["mu"]}; text-align: center">{e(lab)}</span></figure>' for k, (fn, lab) in IL.L.items())
    body = f'<main style="padding: 56px; display: flex; flex-direction: column; gap: 24px">{row(logo(32), sticker("Illustration kit","#FF4FB8",-4), gap=16)}{big("32 illustrations, one style.", 56)}{P("Flat fills, 3 px ink outline, a soft organic blob behind each scene, sparkles and tilted stickers. Used for every empty state, error page, onboarding moment and marketing feature. They pop in on load (0.8 s, overshoot ease).", size=17)}<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px">{tiles}</div></main>'
    write('Illustrations.dc.html', doc('Illustration kit', body, 1440, 3300))

    # Motion
    CUR['page'] = 'motion'; CUR['row'] = 'MOT'
    def demo(title, gsap, visual):
        return card(row(h3(title,18), grow(), chip('GSAP','blue','zap'), gap=8), f'<div style="height: 220px; border-radius: 22px; background: {T["s2"]}; display: flex; align-items: center; justify-content: center; gap: 14px; overflow: hidden; position: relative">{visual}</div>', mono_block(gsap), pad=20)
    def mono_block(t): return f'<pre style="margin: 0; padding: 14px; border-radius: 16px; background: #0B0B14; color: #B6F24A; font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow: hidden">{e(t)}</pre>'
    demos = [
      demo('Hero intro: stagger up', 'gsap.from("[data-hero] > *", {y: 24, opacity: 0, duration: .7, ease: "expo.out", stagger: .08})', ''.join(f'<span style="width: 60px; height: 60px; border-radius: 18px; background: {c}; border: 2px solid {OL}; {A("up", .1*i)}"></span>' for i, c in enumerate(['#2F5BFF','#B6F24A','#FF4FB8','#FFD43B']))),
      demo('Phones fan out & float', 'gsap.from(".phone", {rotate: 0, x: 0, duration: 1, ease: "back.out(1.4)", stagger: .06})\ngsap.to(".phone", {y: -10, repeat: -1, yoyo: true, duration: 2.5, ease: "sine.inOut", stagger: .3})', ''.join(phone_html(vid_svg(c, 'WOW', i+1, '#FFD43B'), r, 90, .3*i) for i, (c, r) in enumerate([('#9B7BFF',-10),('#59D8FF',0),('#FF7A2F',10)]))),
      demo('Sticker pop', 'gsap.from(".sticker", {scale: .6, rotate: -8, opacity: 0, duration: .7, ease: "back.out(2)"})', sticker('Nelio AI picked this','#FF4FB8',3,'spark',16)),
      demo('Skeleton → content', 'gsap.to(".skeleton", {opacity: 0, duration: .2})\ngsap.from(".content > *", {y: 12, opacity: 0, stagger: .05, duration: .5, ease: "power3.out"})', col(sk('220px',14), sk('180px',14,8,.2), sk('240px',14,8,.4), gap=10)),
      demo('Approval stamp', 'gsap.fromTo(".stamp", {scale: 2.2, rotate: -14, opacity: 0}, {scale: 1, rotate: -8, opacity: 1, duration: .6, ease: "back.out(2.5)"})', f'<span style="--r: -8deg; display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 18px; border: 4px solid #0E6F38; color: #0E6F38; font-family: {HF}; font-weight: 800; font-size: 26px; {A("stamp",.2)}">{icon("check",26,"#0E6F38",3)}APPROVED</span>'),
      demo('Agent at work', 'gsap.to(".agent", {y: -6, repeat: -1, yoyo: true, duration: .8, ease: "sine.inOut"})\ngsap.to(".eye", {scaleY: .1, repeat: -1, repeatDelay: 3, duration: .1, yoyo: true})', f'<span style="{A("float",0,1.6)}">{agent("lime","circle",90)}</span>'),
      demo('Numbers count up', 'gsap.from(".stat-value", {textContent: 0, duration: 1.2, ease: "power2.out", snap: {textContent: 1}})', f'<span style="font-family: {HF}; font-weight: 800; font-size: 64px; {A("up")}">1,240</span>'),
      demo('Meters fill', 'gsap.from(".meter-fill", {scaleX: 0, transformOrigin: "left", duration: .9, ease: "expo.out"})', f'<div style="width: 70%">{meter("Credits used", 38, "760 / 2,000")}</div>'),
      demo('Published! confetti', 'gsap.from(".confetti", {y: -40, rotate: "random(-90,90)", opacity: 0, stagger: .03, duration: .8, ease: "power2.out"})', art('success', 200)),
    ]
    tokens = card(card_head('Motion tokens'), table(['Token','Value','Use'], [('dur.fast','0.2 s','hover, press, fades out'),('dur.base','0.5 s','lists, cards, banners'),('dur.slow','0.8 s','hero, illustrations, page enter'),('ease.out','expo.out','things arriving'),('ease.pop','back.out(1.6–2.5)','stickers, stamps, badges'),('ease.loop','sine.inOut','floats, idle agents'),('stagger','0.05–0.08 s','list rows, cards'),('reduced motion','all off','prefers-reduced-motion: reduce')]))
    body = f'<main style="padding: 56px; display: flex; flex-direction: column; gap: 24px">{row(logo(32), sticker("Motion with GSAP","#B6F24A",-4,"zap"), gap=16)}{big("Everything moves with purpose.", 56)}{P("These boards play the motion with CSS keyframes that mirror the GSAP timelines. In the app, GSAP (useGSAP + ScrollTrigger) runs them. Nothing loops forever except idle agents and floating phones, and everything turns off for people who prefer reduced motion.", size=17)}{tokens}<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 18px">{"".join(demos)}</div></main>'
    write('Motion.dc.html', doc('Motion system (GSAP)', body, 1440, 2700))
foundations()
