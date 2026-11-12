# Responsive pass: for every screen, ONE board that shows its mobile (390 px) view in every state, side by side.
# Modals become bottom sheets. Boards sit in the same canvas row as the screen's desktop states.
from frame import *
import frame, lib2, re, os
import s01_public
SKIP = {'mobile', 'dark', 'flows', 'foundations', 'motion'}
GAP, PADX = 56, 48

def strip(cols, desk_first, title, extra=()):
    cols = list(cols) + list(extra)
    out = ''
    for i, c in enumerate(cols):
        body = c['body'].replace('position: sticky', 'position: relative')
        lab = c['title'].split(' · ')[-2] if c['title'].endswith('· Mobile') and c['title'].count(' · ') >= 2 else c.get('label', 'Mobile')
        hh = f'height: {c["h"]}px;' if c['fixed'] else 'min-height: 844px;'
        out += (f'<div style="flex: none; width: 390px; display: flex; flex-direction: column; gap: 14px">'
                f'<div style="display: flex; align-items: center; gap: 8px">{chip(lab, "ink" if i == 0 else "neutral", "phone" if "phone" in IC else None)}<span style="font-size: 12px; color: {T["mu"]}">390 × 844</span></div>'
                f'<div style="position: relative; width: 390px; {hh} overflow: hidden; border-radius: 36px; border: 1px solid {T["bd"]}; box-shadow: 0 1px 2px rgba(11,11,20,.04), 0 18px 40px rgba(11,11,20,.08); background: {T["bg"]}; color: {T["tx"]}; font-family: {BF}; display: flex; flex-direction: column">{body}</div></div>')
    n = len(cols); w = n * 390 + (n - 1) * GAP + 2 * PADX
    h = max(c['h'] for c in cols) + 140
    head = f'<header style="display: flex; align-items: center; gap: 12px; padding: 0 0 22px">{logo(18)}{H(title, 22)}{chip(str(n) + (" state" if n == 1 else " states"), "lime")}{grow()}{small("Mobile · modals open as bottom sheets")}</header>'
    lib2.MOB['on'] = False
    write(mname(desk_first), doc(title + ' · Mobile', f'<div style="padding: 36px {PADX}px 48px">{head}<div style="display: flex; gap: {GAP}px; align-items: flex-start">{out}</div></div>', w, h))
    lib2.REG[mname(desk_first)].update(mobile=True, desk=desk_first)
    lib2.MOB['on'] = True

lib2.MOB['on'] = True
for s in frame.SC:
    if s['page'] in SKIP: continue
    CUR['page'] = s['page']; CUR['row'] = s['id']
    lib2.MOB['collect'] = []
    for st in s['states']:
        key, lab = (st if isinstance(st, tuple) else (st, frame.LABELS.get(st, st.title())))
        f = fname(s['base'], key); CUR['modal'] = False
        s['fn'](key, f, f"{s['id']} {s['title']} · {lab} · Mobile")
    got = lib2.MOB['collect']; lib2.MOB['collect'] = None
    scripted = [c for c in got if 'class Component' in (c['script'] or '') and 'renderVals() { return {}; }' not in (c['script'] or '')]
    if scripted:  # interactive boards keep their logic: one standalone board each
        for c in got:
            lib2.MOB['on'] = False
            write(mname(c['desk']), doc(c['title'], c['body'], 390, c['h'], fixed=c['fixed'], script=c['script']))
            lib2.REG[mname(c['desk'])].update(mobile=True, desk=c['desk']); lib2.MOB['on'] = True
    else:
        strip(got, got[0]['desk'], f"{s['id']} {s['title']}")
# public site: one strip per page; the Home strip also shows the open menu sheet
lib2.MOB['collect'] = []
CUR['page'] = 'public'
s01_public.home()
got = lib2.MOB['collect']; lib2.MOB['collect'] = None
links = ''.join(f'<a href="{h}" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 4px; border-bottom: 1px solid {T["bd"]}; color: {T["tx"]}; text-decoration: none; font-family: {HF}; font-weight: 800; font-size: 22px; min-height: 44px">{l}{icon("chev",20)}</a>' for l, h in [('Product','Product-Mobile.dc.html'),('Use cases','UseCases-Mobile.dc.html'),('Pricing','Pricing-Mobile.dc.html'),('Licensing','Licensing-Mobile.dc.html'),('FAQ','FAQ-Mobile.dc.html'),('Status','Status-Mobile.dc.html')])
sheet = f'<header style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}">{logo(22)}</header><main style="padding: 24px 20px">{big("Turn one long video into a week of shorts.", 40)}</main><div style="position: absolute; inset: 0; z-index: 20; background: rgba(11,11,20,0.55); display: flex; flex-direction: column; justify-content: flex-end"><div role="dialog" aria-modal="true" aria-label="Site menu" style="background: {T["s1"]}; border-radius: 28px 28px 0 0; padding: 10px 20px 28px; display: flex; flex-direction: column; gap: 8px; {A("up",.05,.45)}"><span aria-hidden="true" style="align-self: center; width: 44px; height: 5px; border-radius: 999px; background: {T["s3"]}; margin-bottom: 8px"></span>{row(logo(22), grow(), ibtn("x","Close menu"))}{links}<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px">{btn("Start free","cta",None,"SignUp-Mobile.dc.html","lg",True,arrow=True)}{btn("Log in","secondary",None,"LogIn-Mobile.dc.html","lg",True)}</div></div></div>'
for c in got:
    lib2.MOB['on'] = True
    c['title'] = c['title'].replace(' · Mobile', '')
    extra = [dict(title='Menu open', label='Menu open', body=sheet, h=844, fixed=True)] if c['desk'] == 'Home.dc.html' else []
    c['label'] = 'Page'
    strip([c], c['desk'], c['title'], extra)
lib2.MOB['on'] = False
# links inside mobile strips point to mobile strips
mob = {f for f in lib2.REG if lib2.REG[f].get('mobile')}
for f in mob:
    p = os.path.join(lib2.OUT, f); c = open(p).read()
    c = re.sub(r'href="([A-Za-z0-9-]+)\.dc\.html"', lambda m: (lambda base: f'href="{base}-Mobile.dc.html"' if base + '-Mobile.dc.html' in mob else m.group(0))(re.sub(r'-(Empty|Loading|[A-Z][a-z]+)$', '', m.group(1)) if m.group(1) + '-Mobile.dc.html' not in mob else m.group(1)), c)
    open(p, 'w').write(c)
# order: each strip right after the last desktop board of its row
desk = [f for f in lib2.ORDER if f not in mob]
by_row = {}
for f in lib2.ORDER:
    if f in mob: by_row.setdefault((lib2.REG[f]['page'], lib2.REG[f]['row']), []).append(f)
last = {(lib2.REG[f]['page'], lib2.REG[f]['row']): i for i, f in enumerate(desk)}
new = []
for i, f in enumerate(desk):
    new.append(f); k = (lib2.REG[f]['page'], lib2.REG[f]['row'])
    if last.get(k) == i: new += by_row.pop(k, [])
for v in by_row.values(): new += v
lib2.ORDER[:] = new
