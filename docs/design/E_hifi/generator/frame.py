from lib2 import *
import illus as IL

def art(name, w=240, anim=True): return IL.get(name, w, anim)
def empty(ill_name, title, text, action=None, second=None, href=None, href2=None, w=260):
    a = btn(action, 'cta', None, href, arrow=True) if action else ''
    s = btn(second, 'secondary', href=href2) if second else ''
    return f'<div style="border-radius: 32px; padding: 40px 24px 44px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; background: {T["s1"]}; border: 2px dashed {T["bd"]}; {A("up")}">{art(ill_name, w)}{H(title, 26)}<p style="margin: 0; max-width: 460px; font-size: 15px; line-height: 1.55; color: {T["mu"]}">{e(text)}</p><div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center">{a}{s}</div></div>'

LABELS = {'filled':'Filled','empty':'Empty','loading':'Loading'}
SC = []
def screen(sid, title, base, page, states=('filled',)):
    def deco(fn):
        SC.append(dict(id=sid, title=title, base=base, page=page, states=states, fn=fn)); return fn
    return deco
def fname(base, st): return base + ('' if st == 'filled' else '-' + st.replace('_', '-').title().replace('-', '')) + '.dc.html'
def build_all(theme_name='light', only=None):
    for s in SC:
        if only and s['page'] not in only: continue
        CUR['page'] = s['page']; CUR['row'] = s['id']
        for st in s['states']:
            key, lab = (st if isinstance(st, tuple) else (st, LABELS.get(st, st.title())))
            f = fname(s['base'], key)
            s['fn'](key, f, f"{s['id']} {s['title']} · {lab}")

# ---------- other shells ----------
def pubnav():
    links = ''.join(f'<a href="{h}" style="color: {T["tx"]}; text-decoration: none; font-size: 15px; font-weight: 600">{l}</a>' for l, h in [('Product','Product.dc.html'),('Use cases','UseCases.dc.html'),('Pricing','Pricing.dc.html'),('Licensing','Licensing.dc.html'),('FAQ','FAQ.dc.html')])
    return f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding: 18px 48px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}"><a href="Home.dc.html" style="text-decoration: none">{logo(26)}</a><nav aria-label="Site" style="display: flex; gap: 26px; flex-wrap: wrap; margin-left: 24px">{links}</nav>{grow()}{btn("Log in","ghost",href="LogIn.dc.html")}{btn("Start free","cta",href="SignUp.dc.html",arrow=True)}</header>'
def pubfoot():
    cols_ = [('Product',['Features','Pricing','Status','Changelog']),('Use cases',['Creators','Businesses','Agencies']),('Company',['Licensing','Creator partners','FAQ','Contact']),('Legal',['Terms','Privacy','Acceptable use','Takedown requests'])]
    cs = ''.join(f'<div style="display: flex; flex-direction: column; gap: 10px; min-width: 140px"><span style="font-size: 14px; font-weight: 800; color: {T["tx"]}">{t}</span>' + ''.join(f'<a href="#" style="font-size: 14px; color: {T["mu"]}; text-decoration: none">{l}</a>' for l in ls) + '</div>' for t, ls in cols_)
    wm = f'<div aria-hidden="true" style="font-family: {HF}; font-weight: 800; font-size: 300px; letter-spacing: -0.06em; line-height: 0.8; color: {T["s3"]}; text-align: center; overflow: hidden; white-space: nowrap; margin-top: 24px">nelio</div>'
    return f'<footer style="background: {T["s1"]}; border-top: 1px solid {T["bd"]}; padding: 56px 48px 0; overflow: hidden"><div style="display: flex; flex-wrap: wrap; gap: 48px; max-width: 1200px; margin: 0 auto"><div style="display: flex; flex-direction: column; gap: 12px; flex: 1 1 260px">{logo(26)}{P("Your AI content team, under your control.")}{row(plat("ig",30), plat("yt",30), plat("tt",30), gap=8)}</div>{cs}</div><div style="max-width: 1200px; margin: 32px auto 0; display: flex; justify-content: space-between; font-size: 13px; color: {T["mu"]}"><span>© 2026 Nelio. Made in Lagos.</span><span>Prices in USD · pay in NGN at checkout</span></div>{wm}</footer>'
def pub_page(fname_, title, inner, h=3000, w=1440):
    write(fname_, doc(title, pubnav() + f'<main style="display: flex; flex-direction: column; background: {T["s1"]}">{inner}</main>' + pubfoot(), w, h))
def center_page(fname_, title, inner, h=920, w=1440, top='', width=480, side=None):
    tb = top or f'<header style="display: flex; align-items: center; padding: 20px 32px">{logo(24)}</header>'
    if side:
        body = f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1"><div style="flex: 1 1 520px; display: flex; flex-direction: column">{tb}<main style="flex-grow: 1; display: flex; justify-content: center; padding: 32px 24px"><div style="width: 100%; max-width: {width}px; display: flex; flex-direction: column; gap: 18px">{inner}</div></main></div><aside style="flex: 1 1 480px; background: {side[0]}; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px; gap: 24px; position: relative; overflow: hidden">{side[1]}</aside></div>'
    else:
        body = tb + f'<main style="flex-grow: 1; display: flex; justify-content: center; align-items: flex-start; padding: 40px 20px"><div style="width: 100%; max-width: {width}px; display: flex; flex-direction: column; gap: 18px">{inner}</div></main>'
    write(fname_, doc(title, body, w, h))
def portal_page(fname_, title, inner, h=1000, w=1440, modal=''):
    hd = f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 14px 28px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}"><span aria-hidden="true" style="width: 44px; height: 44px; border-radius: 14px; background: {T["orange"]}; color: {OL}; border: 2px solid {OL}; box-sizing: border-box; font-family: {HF}; font-weight: 800; font-size: 20px; display: inline-flex; align-items: center; justify-content: center">B</span><div><div style="font-size: 15px; font-weight: 800">BrightReach Agency</div><div style="font-size: 12px; color: {T["mu"]}">Client portal · Acme Foods</div></div>{grow()}<span style="font-size: 12px; color: {T["mu"]}">Powered by</span>{logo(16)}{ibtn("bell","Notifications")}{person("CN","#22C55E",44)}</header>'
    write(fname_, doc(title, hd + content_wrap(inner, maxw=1080) + modal, w, h))
def creator_nav(active):
    items = [('c-over','home','Overview','CreatorOverview'),('c-verify','shield','Verification','Verification'),('c-terms','file','Licensing terms','LicenseTerms'),('c-usage','eye','Usage','Usage'),('c-rev','x','Revocations','Revoke'),('c-pay','wallet','Payouts','Payouts')]
    return f'<nav aria-label="Creator portal" style="flex: 1 1 250px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 2px">' + ''.join(navitem(ic, l, k == active, f + '.dc.html') for k, ic, l, f in items) + '</nav>'
def creator_page(fname_, title, active, inner, h=1000, w=1440, modal=''):
    hd = f'<header style="display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}">{logo(22)}{sticker("Creator Portal","#FF4FB8",-3,"shield",12,False)}{grow()}{ibtn("bell","Notifications")}{person("CK","#FF4FB8",44)}</header>'
    write(fname_, doc(title, hd + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1">{creator_nav(active)}{content_wrap(inner)}</div>' + modal, w, h))
def admin_nav(active):
    items = [('a-ops','activity','Ops overview','AdminOps'),('a-jobs','list','Jobs & dead-letter','AdminJobs'),('a-audit','search','Audit search','AdminAudit'),('a-lic','shield','License review','AdminLicenses'),('a-sup','key','Support access','AdminSupport'),('a-abuse','flag','Abuse & moderation','AdminAbuse'),('a-diag','zap','Diagnostics','AdminDiagnostics'),('a-flags','gear','Feature flags','AdminFlags')]
    return f'<nav aria-label="Admin" style="flex: 1 1 250px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 2px">' + ''.join(navitem(ic, l, k == active, f + '.dc.html') for k, ic, l, f in items) + '</nav>'
def admin_page(fname_, title, active, inner, h=1000, w=1440, modal=''):
    strip = f'<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 9px 20px; background: {OL}; color: #FFD43B; font-size: 13px; font-weight: 800"><span>NELIO ADMIN</span><span>Every action here is audited · session A-2291</span></div>'
    hd = f'<header style="display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}">{logo(22)}{chip("Platform admin","warn","key")}{grow()}{btn("Global pause","danger","pause","AdminPauseConfirm.dc.html","sm")}{person("PA","#59D8FF",44)}</header>'
    write(fname_, doc(title, strip + hd + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1">{admin_nav(active)}{content_wrap(inner)}</div>' + modal, w, h))

# ---------- mobile ----------
MTAB = {'home':'MobileHome','activity':'MobileActivity','approvals':'MobileApprovals','calendar':'MobileCalendar','more':'MobileMore'}
def tabbar(active):
    out = ''
    for k, ic, l in [('home','home','Home'),('activity','activity','Activity'),('approvals','check','Approvals'),('calendar','calendar','Calendar'),('more','menu','More')]:
        on = k == active
        pill = f'background: {T["acc"]}; color: {T["onacc"]};' if on else f'color: {T["mu"]};'
        badge = f'<span style="position: absolute; top: -4px; right: -8px; min-width: 18px; height: 18px; border-radius: 999px; background: {T["ai"]}; color: {OL}; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">4</span>' if k == 'approvals' else ''
        out += f'<a href="{MTAB[k]}.dc.html" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; color: {T["tx"] if on else T["mu"]}; font-size: 11px; font-weight: 700"><span style="position: relative; width: 54px; height: 32px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; {pill}">{icon(ic,20)}{badge}</span>{l}</a>'
    return f'<nav aria-label="Main" style="display: flex; padding: 10px 6px 20px; border-top: 1px solid {T["bd"]}; background: {T["s1"]}">{out}</nav>'
def mtop(title=None):
    t = f'<span style="font-family: {HF}; font-weight: 800; font-size: 17px">{e(title)}</span>' if title else f'<a href="WorkspaceSwitcher.dc.html" style="display: flex; align-items: center; gap: 8px; padding: 4px 12px 4px 4px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; text-decoration: none; font-weight: 700; font-size: 14px; min-height: 44px; box-sizing: border-box">{person("A","#FFD43B",30)}Ada Studio{icon("chevd",14)}</a>'
    return f'<header style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}">{t}{grow()}{ibtn("search","Search","CommandPalette.dc.html")}{ibtn("bell","Notifications","MobileNotifications.dc.html")}</header>'
def mobile_page(fname_, title, inner, tab='home', top=None, h=844, w=390, bar=True):
    tp = top if top is not None else mtop()
    write(fname_, doc(title, tp + f'<main style="flex-grow: 1; overflow: hidden; padding: 16px; display: flex; flex-direction: column; gap: 14px">{inner}</main>' + (tabbar(tab) if bar else ''), w, h, fixed=True))

# ---------- marketing pieces ----------
def phone_html(inner_svg_or_html, rot=0, w=210, d=0, float_=True, r=None):
    fl = A('float', d, 5) if float_ else ''
    return f'<div style="--r: {rot}deg; transform: rotate({rot}deg); width: {w}px; aspect-ratio: 9/19; border-radius: 36px; background: {OL}; padding: 9px; box-sizing: border-box; flex: none; position: relative; {fl}"><div style="position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 70px; height: 20px; border-radius: 999px; background: {OL}; z-index: 2"></div><div style="width: 100%; height: 100%; border-radius: 28px; overflow: hidden; background: #FFFFFF; position: relative">{inner_svg_or_html}</div></div>'
def vid_svg(bg='#9B7BFF', cap='WAIT FOR IT', skin=2, shirt='#FFD43B', score=None, plat_=None, style=0):
    sc = f'<div style="position: absolute; top: 46px; right: 12px; padding: 4px 10px; border-radius: 999px; background: #B6F24A; border: 2px solid {OL}; font-family: {HF}; font-weight: 800; font-size: 14px; color: {OL}">{score}</div>' if score else ''
    pb = f'<div style="position: absolute; top: 46px; left: 12px">{plat(plat_, 30)}</div>' if plat_ else ''
    svgp = f'<svg viewBox="0 0 200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%"><rect width="200" height="420" fill="{bg}"></rect>{IL.person(100, 260, 2.6, skin, "#2B1A10", shirt, style)}</svg>'
    capd = f'<div style="position: absolute; left: 12px; right: 12px; bottom: 70px; text-align: center"><span style="background: #FFD43B; color: {OL}; font-family: {HF}; font-weight: 800; font-size: 16px; padding: 3px 10px; border-radius: 8px; line-height: 1.6; box-decoration-break: clone; -webkit-box-decoration-break: clone; border: 2px solid {OL}">{e(cap)}</span></div>'
    return f'<div role="img" aria-label="Short video: {e(cap)}" style="position: absolute; inset: 0">{svgp}{pb}{sc}{capd}</div>'
def video(caption='STOP BUDGETING LIKE THIS', maxw=260, bg='#9B7BFF', skin=2, shirt='#FFD43B', score=None, plat_=None, play=True, style=0, radius=22):
    pl = f'<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 56px; height: 56px; border-radius: 50%; background: rgba(11,11,20,0.75); display: flex; align-items: center; justify-content: center">{icon("play",24,"#FFFFFF")}</div>' if play else ''
    return f'<div style="position: relative; width: 100%; max-width: {maxw}px; aspect-ratio: 9/16; border-radius: {radius}px; overflow: hidden; margin: 0 auto; flex: none; border: 2px solid {OL}; box-sizing: border-box">{vid_svg(bg, caption, skin, shirt, score, plat_, style)}{pl}</div>'
def thumb(caption='MYTHS', bg='#9B7BFF', w=44, skin=2, shirt='#FFD43B'):
    return f'<span aria-hidden="true" style="position: relative; display: inline-block; width: {w}px; aspect-ratio: 9/16; border-radius: 10px; overflow: hidden; flex: none; border: 2px solid {OL}; box-sizing: border-box"><svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" style="position: absolute; inset: 0; width: 100%; height: 100%"><rect width="90" height="160" fill="{bg}"></rect>{IL.person(45, 100, 1.1, skin, "#2B1A10", shirt, w % 3)}</svg></span>'
def wide_video(label='podcast_ep12.mp4', bg='#59D8FF'):
    return f'<div role="img" aria-label="Source video {e(label)}" style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 22px; overflow: hidden; border: 2px solid {OL}; box-sizing: border-box"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%"><rect width="320" height="180" fill="{bg}"></rect><rect x="20" y="120" width="280" height="60" fill="#FFD43B" stroke="{OL}" stroke-width="3"></rect>{IL.person(100, 140, 1.5, 1, "#2B1A10", "#FF4FB8", 0)}{IL.person(220, 140, 1.5, 3, "#1B0F08", "#2F5BFF", 1)}</svg><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 60px; height: 60px; border-radius: 50%; background: rgba(11,11,20,0.75); display: flex; align-items: center; justify-content: center">{icon("play",26,"#FFFFFF")}</div><div style="position: absolute; left: 12px; top: 12px">{chip(label, "ink")}</div></div>'
def lime_blob(w=520, color=None, style=''):
    c = color or T['lime']
    return f'<svg aria-hidden="true" viewBox="0 0 200 200" style="position: absolute; width: {w}px; height: {w}px; {style}"><path d="M44,-58 C58,-46 70,-28 72,-9 C74,10 66,30 52,44 C38,58 18,66 -3,69 C-24,72 -46,70 -60,57 C-74,44 -80,20 -77,-1 C-74,-22 -62,-40 -46,-52 C-30,-64 -15,-70 3,-73 C21,-76 30,-70 44,-58 Z" transform="translate(100 100)" fill="{c}"></path></svg>'
def big(t, s=68, color=None, anim=''):
    return f'<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: {s}px; line-height: 1.02; letter-spacing: -0.045em; color: {color or T["tx"]}; {anim}">{t}</h1>'
def hl(t, bg=None, fg=None): return f'<span style="background: {bg or T["lime"]}; color: {fg or OL}; padding: 0 14px; border-radius: 18px; display: inline-block; line-height: 1.1">{t}</span>'
def section(inner, pad='88px 48px', bg=None, center=False, style=''):
    al = 'align-items: center; text-align: center;' if center else ''
    return f'<section style="padding: {pad}; position: relative; overflow: hidden; {"background: "+bg+";" if bg else ""} {style}"><div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; position: relative; {al}">{inner}</div></section>'
def sec_head(eb, title, sub=None, center=True):
    al = 'align-items: center; text-align: center;' if center else ''
    return f'<div style="display: flex; flex-direction: column; gap: 12px; {al} {A("up")}">{eyebrow(eb)}{H(title, 48)}{P(sub, size=17) if sub else ""}</div>'
