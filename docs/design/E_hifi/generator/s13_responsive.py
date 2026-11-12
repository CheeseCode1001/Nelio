# Responsive pass: a 390px mobile board for every desktop screen and state (modals become bottom sheets).
from frame import *
import frame, lib2, re, os
import s01_public
SKIP = {'mobile', 'dark', 'flows', 'foundations', 'motion'}
lib2.MOB['on'] = True
for s in frame.SC:
    if s['page'] in SKIP: continue
    CUR['page'] = s['page']; CUR['row'] = s['id']
    for st in s['states']:
        key, lab = (st if isinstance(st, tuple) else (st, frame.LABELS.get(st, st.title())))
        f = fname(s['base'], key)
        CUR['modal'] = False
        s['fn'](key, f, f"{s['id']} {s['title']} · {lab} · Mobile")
CUR['page'] = 'public'
s01_public.home.__globals__['pub_page'] = frame.pub_page
_t = {}
def _titled(fn):
    def w(f, t, *a, **k): return fn(f, t + ' · Mobile', *a, **k)
    return w
s01_public.pub_page = _titled(frame.pub_page)
s01_public.home()
s01_public.pub_page = frame.pub_page
lib2.MOB['on'] = False
# site menu sheet for the public mobile nav
links = ''.join(f'<a href="{h}" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 4px; border-bottom: 1px solid {T["bd"]}; color: {T["tx"]}; text-decoration: none; font-family: {HF}; font-weight: 800; font-size: 22px; min-height: 44px">{l}{icon("chev",20)}</a>' for l, h in [('Product','Product-Mobile.dc.html'),('Use cases','UseCases-Mobile.dc.html'),('Pricing','Pricing-Mobile.dc.html'),('Licensing','Licensing-Mobile.dc.html'),('FAQ','FAQ-Mobile.dc.html'),('Status','Status-Mobile.dc.html')])
sheet = f'<div style="position: absolute; inset: 0; z-index: 20; background: rgba(11,11,20,0.55); display: flex; flex-direction: column; justify-content: flex-end; {A("fade",0,.3)}"><div role="dialog" aria-modal="true" aria-label="Site menu" style="background: {T["s1"]}; border-radius: 28px 28px 0 0; padding: 10px 20px 28px; display: flex; flex-direction: column; gap: 8px; {A("up",.05,.45)}"><span aria-hidden="true" style="align-self: center; width: 44px; height: 5px; border-radius: 999px; background: {T["s3"]}; margin-bottom: 8px"></span>{row(logo(22), grow(), ibtn("x","Close menu","Home-Mobile.dc.html"))}{links}<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px">{btn("Start free","cta",None,"SignUp-Mobile.dc.html","lg",True,arrow=True)}{btn("Log in","secondary",None,"LogIn-Mobile.dc.html","lg",True)}</div></div></div>'
CUR['page'] = 'public'; CUR['row'] = 'Home.dc.html'
write('MobileSiteMenu.dc.html', doc('M-01 Site menu · Mobile', f'<header style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}">{logo(22)}</header><main style="padding: 24px 20px">{big("Your AI content team", 40)}</main>' + sheet, 390, 844, fixed=True), row_='Home.dc.html')
lib2.REG['MobileSiteMenu.dc.html'].update(mobile=True, desk='Home.dc.html')
# rewrite links inside mobile boards to their mobile twins
mob = {f for f in lib2.REG if lib2.REG[f].get('mobile')}
for f in mob:
    p = os.path.join(lib2.OUT, f); c = open(p).read()
    c = re.sub(r'href="([A-Za-z0-9-]+)\.dc\.html"', lambda m: f'href="{m.group(1)}-Mobile.dc.html"' if (m.group(1) + '-Mobile.dc.html') in mob else m.group(0), c)
    open(p, 'w').write(c)
# order: each mobile board right after the last desktop board of its row
desk = [f for f in lib2.ORDER if f not in mob]
by_row = {}
for f in lib2.ORDER:
    if f in mob: by_row.setdefault((lib2.REG[f]['page'], lib2.REG[f]['row']), []).append(f)
last = {}
for i, f in enumerate(desk): last[(lib2.REG[f]['page'], lib2.REG[f]['row'])] = i
new = []
for i, f in enumerate(desk):
    new.append(f)
    k = (lib2.REG[f]['page'], lib2.REG[f]['row'])
    if last.get(k) == i: new += by_row.pop(k, [])
for k, v in by_row.items(): new += v
lib2.ORDER[:] = new
