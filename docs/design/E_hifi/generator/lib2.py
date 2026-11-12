# Nelio v2 design generator — light-first, flat, sticker-fun. Tokens, components, shells, motion, skeletons.
import html, json, os, re
exec(open('/tmp/nb2/icons.py').read())

OUT = '/home/claude/nelio-design2/project'
os.makedirs(OUT, exist_ok=True)

LIGHT = dict(bg='#F4F6FB', s1='#FFFFFF', s2='#F1F3F9', s3='#E4E8F1', bd='#E3E6EF', tx='#0B0B14', mu='#5B6175',
    acc='#2F5BFF', onacc='#FFFFFF', accT='#E8EEFF', accTx='#1E40D8', ink='#0B0B14', onink='#FFFFFF',
    lime='#B6F24A', limeT='#EEFCD6', limeTx='#3B6300', ai='#FF4FB8', aiT='#FFE6F4', aiTx='#B5176F',
    ok='#22C55E', okT='#DDF7E6', okTx='#0E6F38', warn='#FF9F1C', warnT='#FFF1DC', warnTx='#9A4A06', err='#EF4444', errT='#FDE3E3', errTx='#C81E1E',
    yellow='#FFD43B', cyan='#59D8FF', orange='#FF7A2F', pink='#FF4FB8', shadow='0 1px 2px rgba(11,11,20,0.04), 0 10px 30px rgba(11,11,20,0.06)', name='light')
DARK = dict(bg='#0B0B14', s1='#15151F', s2='#1D1D29', s3='#272735', bd='#2A2A38', tx='#F5F6FA', mu='#A7AABD',
    acc='#3D63FF', onacc='#FFFFFF', accT='#172447', accTx='#9DB4FF', ink='#F5F6FA', onink='#0B0B14',
    lime='#B6F24A', limeT='#1E2A0C', limeTx='#B6F24A', ai='#FF4FB8', aiT='#2E1426', aiTx='#FF7CCB',
    ok='#22C55E', okT='#0F2A1B', okTx='#4ADE80', warn='#FF9F1C', warnT='#33210E', warnTx='#FDBA74', err='#EF4444', errT='#351515', errTx='#FCA5A5',
    yellow='#FFD43B', cyan='#59D8FF', orange='#FF7A2F', pink='#FF4FB8', shadow='none', name='dark')
T = dict(LIGHT)
MOB = {'on': False}
def ms(s, f=0.55): return s if not MOB['on'] or s <= 20 else round(20 + (s - 20) * f)
def theme(n): T.clear(); T.update(LIGHT if n == 'light' else DARK)
OL = '#0B0B14'  # illustration outline, both themes

HF = "'Plus Jakarta Sans', Inter, system-ui, sans-serif"
BF = "Inter, system-ui, sans-serif"
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'
MOTION_CSS = '''@keyframes nUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes nFade{from{opacity:0}to{opacity:1}}
@keyframes nPop{0%{opacity:0;transform:scale(.6) rotate(-8deg)}70%{opacity:1;transform:scale(1.06) rotate(2deg)}100%{transform:scale(1) rotate(var(--r,0deg))}}
@keyframes nFloat{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-10px) rotate(var(--r,0deg))}}
@keyframes nPulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes nWiggle{0%,100%{transform:rotate(var(--r,-4deg))}50%{transform:rotate(calc(var(--r,-4deg) * -1))}}
@keyframes nSpin{to{transform:rotate(360deg)}}
@keyframes nBlink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes nMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes nStamp{0%{opacity:0;transform:scale(2.2) rotate(-14deg)}60%{opacity:1;transform:scale(.92) rotate(-8deg)}100%{transform:scale(1) rotate(-8deg)}}
@keyframes nGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes nBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes nDash{to{stroke-dashoffset:0}}
@keyframes nCycle{0%{opacity:0}4%{opacity:1}25%{opacity:1}29%{opacity:0}100%{opacity:0}}
@keyframes nDot{0%{width:10px;background:rgba(11,11,20,.25)}4%,25%{width:28px;background:#0B0B14}29%,100%{width:10px;background:rgba(11,11,20,.25)}}
@media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important}}
:focus-visible{outline:3px solid #2F5BFF;outline-offset:2px}
*{scrollbar-width:none !important;-ms-overflow-style:none}*::-webkit-scrollbar{display:none;width:0;height:0}'''
def A(kind='up', d=0.0, dur=None):
    m = {'up':('nUp',.7,'cubic-bezier(.16,1,.3,1)','both'),'fade':('nFade',.6,'ease-out','both'),'pop':('nPop',.7,'cubic-bezier(.34,1.56,.64,1)','both'),
         'float':('nFloat',4,'ease-in-out','infinite'),'pulse':('nPulse',1.6,'ease-in-out','infinite'),'wiggle':('nWiggle',2.6,'ease-in-out','infinite'),
         'spin':('nSpin',1.2,'linear','infinite'),'blink':('nBlink',4,'ease-in-out','infinite'),'stamp':('nStamp',.6,'cubic-bezier(.34,1.56,.64,1)','both'),
         'grow':('nGrow',.9,'cubic-bezier(.16,1,.3,1)','both'),'bar':('nBar',.8,'cubic-bezier(.16,1,.3,1)','both')}[kind]
    du = dur or m[1]
    return f'animation: {m[0]} {du}s {m[2]} {d:.2f}s {m[3]};'

def e(s): return html.escape(str(s), quote=True)
def icon(name, size=18, color=None, sw=2):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color or "currentColor"}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none"><path d="{IC[name]}"></path></svg>'

def TONES():
    return {'blue':(T['accT'],T['accTx']),'acc':(T['accT'],T['accTx']),'lime':(T['limeT'],T['limeTx']),'ai':(T['aiT'],T['aiTx']),'grape':(T['aiT'],T['aiTx']),
            'ok':(T['okT'],T['okTx']),'teal':(T['okT'],T['okTx']),'warn':(T['warnT'],T['warnTx']),'orange':(T['warnT'],T['warnTx']),'err':(T['errT'],T['errTx']),'red':(T['errT'],T['errTx']),
            'neutral':(T['s2'],T['mu']),'ink':(T['ink'],T['onink']),'solid':(T['acc'],T['onacc']),
            'yellow':('#FFD43B',OL),'cyan':('#59D8FF',OL),'pinkf':('#FF4FB8',OL),'limef':('#B6F24A',OL),'orangef':('#FF7A2F',OL)}

# ---------- type & layout ----------
def H(t, size=32, color=None, mb=0, w=800, anim=''):
    size = ms(size)
    return f'<h2 style="margin: 0 0 {mb}px; font-family: {HF}; font-weight: {w}; font-size: {size}px; line-height: 1.08; letter-spacing: -0.03em; color: {color or T["tx"]}; {anim}">{e(t)}</h2>'
def h3(t, size=17, color=None): return f'<h3 style="margin: 0; font-family: {HF}; font-weight: 700; font-size: {size}px; line-height: 1.25; color: {color or T["tx"]}">{e(t)}</h3>'
def P(t, color=None, size=14, mb=0, w=400, anim=''): return f'<p style="margin: 0 0 {mb}px; font-size: {size}px; line-height: 1.55; color: {color or T["mu"]}; font-weight: {w}; {anim}">{e(t)}</p>'
def small(t, color=None, w=500): return f'<span style="font-size: 12.5px; color: {color or T["mu"]}; font-weight: {w}">{e(t)}</span>'
def eyebrow(t, color=None): return f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: {color or T["accTx"]}">{e(t)}</span>'
def row(*items, gap=12, align='center', wrap=True, justify='flex-start', style=''):
    return f'<div style="display: flex; flex-direction: row; gap: {gap}px; align-items: {align}; justify-content: {justify}; {"flex-wrap: wrap;" if wrap else ""} min-width: 0; {style}">{"".join(items)}</div>'
def col(*items, gap=12, style=''): return f'<div style="display: flex; flex-direction: column; gap: {gap}px; min-width: 0; {style}">{"".join(items)}</div>'
def grid(items, cols=3, gap=16, minw=None, style=''):
    gap = SP['gap_m'] if MOB['on'] else SP['gap_d']
    if MOB['on']:
        if minw: minw = min(minw, 300)
        else: minw = 150 if cols >= 4 else 400
        return f'<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, {minw}px), 1fr)); gap: {gap}px; {style}">{"".join(items)}</div>'
    tpl = f'repeat(auto-fit, minmax({minw}px, 1fr))' if minw else f'repeat({cols}, minmax(0, 1fr))'
    return f'<div style="display: grid; grid-template-columns: {tpl}; gap: {gap}px; {style}">{"".join(items)}</div>'
def grow(): return '<div style="flex-grow: 1"></div>'
def spacer(h=8): return f'<div style="height: {h}px"></div>'

# ---------- atoms ----------
def chip(label, tone='neutral', ic=None, size=12.5):
    bg, fg = TONES()[tone]
    i = icon(ic, 13, fg, 2.4) if ic else ''
    return f'<span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; background: {bg}; color: {fg}; font-size: {size}px; font-weight: 700; white-space: nowrap; font-family: {BF}">{i}{e(label)}</span>'
def sticker(label, fill='#FFD43B', rot=-4, ic=None, size=14, anim=True, d=0.3):
    i = icon(ic, 15, OL, 2.4) if ic else ''
    a = A('pop', d) if anim else ''
    return f'<span style="--r: {rot}deg; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; background: {fill}; color: {OL}; border: 2px solid {OL}; font-family: {HF}; font-size: {size}px; font-weight: 800; white-space: nowrap; transform: rotate({rot}deg); box-shadow: 3px 3px 0 {OL}; {a}">{i}{e(label)}</span>'
def arrow_circle(bg, fg, s=30):
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 50%; background: {bg}; color: {fg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon("arrowr", int(s*0.55), fg, 2.6)}</span>'

def btn(label, kind='primary', ic=None, href=None, size='md', full=False, arrow=False):
    pad = {'sm':'7px 14px','md':'10px 18px','lg':'14px 24px'}[size]; fs = {'sm':13,'md':14,'lg':16}[size]
    if kind == 'primary': st = f'background: {T["acc"]}; color: {T["onacc"]}; border: 2px solid {T["acc"]}'
    elif kind == 'cta': st = f'background: {T["ink"]}; color: {T["onink"]}; border: 2px solid {T["ink"]}'
    elif kind == 'lime': st = f'background: {T["lime"]}; color: {OL}; border: 2px solid {T["lime"]}'
    elif kind == 'ai' or kind == 'grape': st = f'background: {T["aiT"]}; color: {T["aiTx"]}; border: 2px solid {T["aiT"]}'
    elif kind == 'secondary': st = f'background: {T["s1"]}; color: {T["tx"]}; border: 2px solid {T["bd"]}'
    elif kind == 'danger': st = f'background: {T["errT"]}; color: {T["errTx"]}; border: 2px solid {T["errT"]}'
    else: st = f'background: transparent; color: {T["tx"]}; border: 2px solid transparent'
    w = 'width: 100%; justify-content: center;' if full else ''
    i = icon(ic, 16, None, 2.2) if ic else ''
    ar = ''
    if arrow:
        ar = arrow_circle(T['lime'] if kind == 'cta' else T['onacc'], OL if kind == 'cta' else T['acc'], 26 if size != 'lg' else 32)
        pad = pad.split(' ')[0] + ' 6px ' + pad.split(' ')[0] + ' ' + pad.split(' ')[1]
    inner = f'{i}{e(label)}{ar}' if label else i
    base = f'display: inline-flex; align-items: center; gap: 8px; padding: {pad}; border-radius: 999px; font-family: {BF}; font-size: {fs}px; font-weight: 700; cursor: pointer; text-decoration: none; white-space: nowrap; min-height: 44px; box-sizing: border-box; {w} {st}'
    al = '' if label else f' aria-label="{e(ic)}"'
    if href: return f'<a href="{href}"{al} style="{base}">{inner}</a>'
    return f'<button type="button"{al} style="{base}">{inner}</button>'
def ibtn(ic, label, href=None):
    st = f'width: 44px; height: 44px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none; box-sizing: border-box'
    if href: return f'<a href="{href}" aria-label="{e(label)}" style="{st}">{icon(ic,18)}</a>'
    return f'<button type="button" aria-label="{e(label)}" style="{st}">{icon(ic,18)}</button>'
def link(t, href='#', color=None): return f'<a href="{href}" style="font-size: 13.5px; font-weight: 700; color: {color or T["accTx"]}; text-decoration: none">{e(t)}</a>'

SP = dict(page_d=32, page_m=16, card_d=20, card_m=16, gap_d=16, gap_m=12, stack_d=24, stack_m=16)
def card(*inner, pad=22, bg=None, gap=14, bd=True, style='', radius=24, anim=''):
    pad = SP['card_m'] if MOB['on'] else SP['card_d']; gap = min(gap, 12) if MOB['on'] else gap
    b = f'border: 1px solid {T["bd"]};' if bd else ''
    sh = f'box-shadow: {T["shadow"]};' if bd and not bg else ''
    return f'<section style="background: {bg or T["s1"]}; {b} {sh} border-radius: {radius}px; padding: {pad}px; display: flex; flex-direction: column; gap: {gap}px; min-width: 0; box-sizing: border-box; {style} {anim}">{"".join(inner)}</section>'
def card_head(title, right='', sub=None):
    return row(col(h3(title), P(sub, size=13) if sub else '', gap=2), grow(), right, gap=10)
def stat(label, value, sub=None, ic=None, fill=None, fg=None, anim=''):
    bg = fill or T['s1']; tc = fg or (OL if fill else T['tx']); mc = fg or (OL if fill else T['mu'])
    i = icon(ic, 16, mc) if ic else ''
    sb = f'<div style="font-size: 13px; color: {mc}; font-weight: 600">{e(sub)}</div>' if sub else ''
    bd = f'border: 1px solid {T["bd"]}; box-shadow: {T["shadow"]};' if not fill else ''
    return f'<section style="background: {bg}; {bd} border-radius: 24px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; min-width: 0; {anim}"><div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: {mc}">{i}{e(label)}</div><div style="font-family: {HF}; font-size: {28 if MOB['on'] else 36}px; font-weight: 800; letter-spacing: -0.03em; color: {tc}">{e(value)}</div>{sb}</section>'

def table(cols, rows):
    th = ''.join(f'<th scope="col" style="text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: {T["mu"]}; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid {T["bd"]}; white-space: nowrap; background: {T["s2"]}">{e(c)}</th>' for c in cols)
    trs = ''
    for i, r in enumerate(rows):
        tds = ''.join(f'<td style="padding: 14px 16px; font-size: 14px; color: {T["tx"]}; font-weight: {600 if j==0 else 400}; border-bottom: 1px solid {T["bd"]}; vertical-align: middle">{c if (isinstance(c,str) and c.startswith("<")) else e(c)}</td>' for j, c in enumerate(r))
        trs += f'<tr style="{A("up", 0.05*i)}">{tds}</tr>'
    return f'<div style="overflow-x: auto; border: 1px solid {T["bd"]}; border-radius: 20px; background: {T["s1"]}; box-shadow: {T["shadow"]}"><table style="width: 100%; border-collapse: collapse; min-width: 640px"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'
def lrow(title, sub=None, left='', right='', last=False, d=0):
    s = f'<div style="font-size: 13px; color: {T["mu"]}; margin-top: 2px">{e(sub)}</div>' if sub else ''
    b = '' if last else f'border-bottom: 1px solid {T["bd"]};'
    return f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; {b} {A("up", d)}">{left}<div style="flex-grow: 1; min-width: 0"><div style="font-size: 14px; font-weight: 600; color: {T["tx"]}">{e(title)}</div>{s}</div>{right}</div>'
def lst(rows):
    out = ''.join(lrow(*r[:2], left=r[2] if len(r)>2 else '', right=r[3] if len(r)>3 else '', last=(i==len(rows)-1), d=0.06*i) for i, r in enumerate(rows))
    return f'<div style="border: 1px solid {T["bd"]}; border-radius: 20px; background: {T["s1"]}; overflow: hidden; box-shadow: {T["shadow"]}">{out}</div>'

def dot(c, s=10): return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 50%; background: {c}; display: inline-block; flex: none"></span>'
def bubble(ic, tone='blue', s=40):
    bg, fg = TONES()[tone]
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 14px; background: {bg}; color: {fg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(ic, int(s*0.5), fg)}</span>'
def plat(p, s=32):
    m = {'yt':'#FF0033','ig':'#E1306C','tt':'#0B0B14','fb':'#1877F2'}; n = {'yt':'YouTube','ig':'Instagram','tt':'TikTok','fb':'Facebook'}
    return f'<span role="img" aria-label="{n[p]}" style="width: {s}px; height: {s}px; border-radius: {int(s*0.3)}px; background: {m[p]}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(p, int(s*0.56), "#FFFFFF")}</span>'

AVC = {'lime':'#B6F24A','grape':'#FF4FB8','pink':'#FF4FB8','blue':'#59D8FF','orange':'#FF7A2F','teal':'#22C55E','yellow':'#FFD43B'}
def agent(color='lime', shape='circle', s=40, anim=True):
    bg = AVC[color]; r = {'circle':'50%','square':'30%','blob':'42% 58% 55% 45%','pill':'999px'}[shape]
    ey = max(3, s // 9)
    bl = A('blink') if anim else ''
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: {r}; background: {bg}; border: 2px solid {OL}; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: {ey+2}px; flex: none"><span style="width: {ey}px; height: {ey+3}px; border-radius: 4px; background: {OL}; {bl}"></span><span style="width: {ey}px; height: {ey+3}px; border-radius: 4px; background: {OL}; {bl}"></span></span>'
def person(initials, color='#59D8FF', s=32, fg=None):
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 50%; background: {color}; color: {fg or OL}; font-size: {int(s*0.38)}px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex: none; font-family: {HF}">{e(initials)}</span>'

def banner(tone, title, text='', action=None, ic=None, href=None):
    bg, fg = TONES()[tone]
    icn = ic or {'lime':'check','ok':'check','teal':'check','ai':'spark','grape':'spark','blue':'info','warn':'alert','orange':'alert','err':'alert','red':'alert','neutral':'info'}[tone]
    a = btn(action, 'secondary', size='sm', href=href) if action else ''
    t = f'<div style="font-size: 13.5px; color: {T["tx"]}; margin-top: 1px">{e(text)}</div>' if text else ''
    return f'<div role="status" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 20px; background: {bg}; {A("up")}"><span style="width: 36px; height: 36px; border-radius: 12px; background: {T["s1"]}; display: inline-flex; align-items: center; justify-content: center; flex: none; color: {fg}">{icon(icn, 18, fg, 2.4)}</span><div style="flex-grow: 1; min-width: 0"><div style="font-size: 14px; font-weight: 700; color: {T["tx"]}">{e(title)}</div>{t}</div>{a}</div>'

def meter(label, pct, right='', tone='acc'):
    c = {'acc':T['acc'],'blue':T['acc'],'lime':T['lime'],'warn':T['warn'],'orange':T['warn'],'err':T['err'],'ok':T['ok'],'teal':T['ok'],'ai':T['ai'],'grape':T['ai']}.get(tone, tone)
    lab = f'<div style="display: flex; justify-content: space-between; gap: 8px; font-size: 13px"><span style="color: {T["tx"]}; font-weight: 600">{e(label)}</span><span style="color: {T["mu"]}; font-weight: 600">{e(right)}</span></div>' if (label or right) else ''
    return f'<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0">{lab}<div role="progressbar" aria-label="{e(label or right or "progress")}" aria-valuenow="{pct}" aria-valuemin="0" aria-valuemax="100" style="height: 10px; border-radius: 999px; background: {T["s3"]}; overflow: hidden"><div style="width: {pct}%; height: 100%; border-radius: 999px; background: {c}; transform-origin: left; {A("grow", .2)}"></div></div></div>'

def tabs(items, active=0):
    out = ''
    for i, t in enumerate(items):
        st = f'background: {T["ink"]}; color: {T["onink"]};' if i == active else f'background: transparent; color: {T["mu"]};'
        out += f'<button type="button" role="tab" aria-selected="{"true" if i==active else "false"}" style="padding: 9px 16px; border-radius: 999px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: {BF}; min-height: 40px; {st}">{e(t)}</button>'
    return f'<div role="tablist" style="display: flex; gap: 2px; padding: 4px; border-radius: 999px; background: {T["s1"]}; border: 1px solid {T["bd"]}; flex-wrap: wrap; align-self: flex-start">{out}</div>'

_fid = [0]
def field(label, value='', kind='input', placeholder='', hint=None, err=None):
    _fid[0] += 1; fid = f'f{_fid[0]}'
    base = f'width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 14px; background: {T["s1"]}; border: 2px solid {T["errTx"] if err else T["bd"]}; color: {T["tx"]}; font-size: 14px; font-family: {BF}; min-height: 48px'
    if kind == 'textarea': ctl = f'<textarea id="{fid}" placeholder="{e(placeholder)}" style="{base}; min-height: 100px; resize: vertical">{e(value)}</textarea>'
    elif kind == 'select': ctl = f'<select id="{fid}" style="{base}"><option>{e(value or placeholder)}</option></select>'
    else: ctl = f'<input id="{fid}" type="{ {"password":"password","email":"email"}.get(kind,"text") }" value="{e(value)}" placeholder="{e(placeholder)}" style="{base}">'
    h = f'<div style="font-size: 12.5px; color: {T["errTx"] if err else T["mu"]}; font-weight: {600 if err else 400}">{e(err or hint)}</div>' if (hint or err) else ''
    return f'<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0"><label for="{fid}" style="font-size: 13px; font-weight: 700; color: {T["tx"]}">{e(label)}</label>{ctl}{h}</div>'
def check(label, checked=False, sub=None, radio=False):
    _fid[0] += 1; fid = f'f{_fid[0]}'
    s = f'<span style="display: block; font-size: 13px; color: {T["mu"]}; font-weight: 400">{e(sub)}</span>' if sub else ''
    return f'<div style="display: flex; gap: 10px; align-items: flex-start"><input id="{fid}" type="{"radio" if radio else "checkbox"}"{" checked" if checked else ""} style="width: 20px; height: 20px; margin: 1px 0 0; accent-color: {T["acc"]}; flex: none"><label for="{fid}" style="font-size: 14px; color: {T["tx"]}; font-weight: 600; line-height: 1.4">{e(label)}{s}</label></div>'
def toggle(label, on=True, sub=None):
    bg = T['acc'] if on else T['s3']
    s = f'<div style="font-size: 13px; color: {T["mu"]}">{e(sub)}</div>' if sub else ''
    return f'<div style="display: flex; align-items: center; gap: 12px; justify-content: space-between"><div><div style="font-size: 14px; font-weight: 700; color: {T["tx"]}">{e(label)}</div>{s}</div><button type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{e(label)}" style="width: 52px; height: 30px; border-radius: 999px; border: none; background: {bg}; padding: 4px; display: flex; justify-content: {"flex-end" if on else "flex-start"}; cursor: pointer; flex: none"><span style="width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; display: block"></span></button></div>'
def choice(title, sub, selected=False, ic=None, tone='blue', badge=None, locked=False, art=''):
    bd = T['acc'] if selected else T['bd']; bgc = T['accT'] if selected else T['s1']
    b = chip(badge, 'neutral' if locked else 'ai', 'lock' if locked else None) if badge else ''
    i = art or (bubble(ic, tone, 48) if ic else '')
    tick = f'<span aria-hidden="true" style="width: 26px; height: 26px; border-radius: 50%; background: {T["acc"]}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon("check",15,"#FFFFFF",3)}</span>' if selected else f'<span aria-hidden="true" style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid {T["bd"]}; flex: none; box-sizing: border-box"></span>'
    return f'<button type="button" aria-pressed="{"true" if selected else "false"}" style="text-align: left; display: flex; gap: 14px; align-items: center; padding: 16px 18px; border-radius: 22px; border: 2px solid {bd}; background: {bgc}; cursor: pointer; width: 100%; box-sizing: border-box; font-family: {BF}; {"opacity: 0.6;" if locked else ""}">{i}<span style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px"><span style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"><span style="font-size: 16px; font-weight: 800; font-family: {HF}; color: {T["tx"]}">{e(title)}</span>{b}</span><span style="font-size: 13.5px; color: {T["mu"]}; line-height: 1.4">{e(sub)}</span></span>{tick}</button>'
def kv(pairs):
    return '<div style="display: flex; flex-direction: column">' + ''.join(f'<div style="display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px solid {T["bd"]}"><span style="font-size: 13px; color: {T["mu"]}">{e(k)}</span><span style="font-size: 14px; font-weight: 700; color: {T["tx"]}; text-align: right">{v if str(v).startswith("<") else e(v)}</span></div>' for k, v in pairs) + '</div>'
def steps(n, i):
    segs = ''.join(f'<span style="flex: 1; height: 6px; border-radius: 999px; background: {T["acc"] if k <= i else T["s3"]}"></span>' for k in range(n))
    return f'<div style="display: flex; gap: 6px" role="progressbar" aria-label="Step {i+1} of {n}" aria-valuenow="{i+1}" aria-valuemin="1" aria-valuemax="{n}">{segs}</div>'
def pipeline(items):
    out = ''.join(f'<div style="flex: 1 1 120px; padding: 16px; border-radius: 20px; background: {TONES()[t][0]}; display: flex; flex-direction: column; gap: 2px; {A("up",0.06*i)}"><span style="font-size: 12px; font-weight: 800; color: {TONES()[t][1]}; text-transform: uppercase; letter-spacing: 0.05em">{e(l)}</span><span style="font-family: {HF}; font-size: 30px; font-weight: 800; color: {T["tx"]}">{e(n)}</span></div>' for i, (l, n, t) in enumerate(items))
    return f'<div style="display: flex; gap: 10px; flex-wrap: wrap">{out}</div>'
def stepper_list(items):
    out = ''
    for i, (lbl, st, note) in enumerate(items):
        tone = {'done':'ok','running':'blue','queued':'neutral','blocked':'warn','failed':'err'}[st]; bg, fg = TONES()[tone]
        ic = {'done':'check','running':'refresh','queued':'clock','blocked':'lock','failed':'x'}[st]
        sp = A('spin') if st == 'running' else ''
        line = '' if i == len(items)-1 else f'<span aria-hidden="true" style="position: absolute; left: 16px; top: 36px; bottom: -8px; width: 2px; background: {T["bd"]}"></span>'
        out += f'<div style="position: relative; display: flex; gap: 12px; align-items: flex-start; padding-bottom: 14px">{line}<span style="width: 34px; height: 34px; border-radius: 50%; background: {bg}; display: inline-flex; align-items: center; justify-content: center; flex: none"><span style="display: inline-flex; {sp}">{icon(ic,16,fg,2.4)}</span></span><div style="padding-top: 6px"><div style="font-size: 14px; font-weight: 700; color: {T["tx"]}">{e(lbl)}</div><div style="font-size: 12.5px; color: {T["mu"]}">{e(note)}</div></div></div>'
    return f'<div>{out}</div>'
def section_title(t, right=''): return row(H(t, 22), grow(), right, gap=10)
def page_head(title, sub=None, actions=(), crumbs=None, badge='', eb=None):
    cr = f'<div style="font-size: 13px; color: {T["mu"]}; margin-bottom: 8px; font-weight: 600">{e(crumbs)}</div>' if crumbs else ''
    ebh = f'<div style="margin-bottom: 8px">{eyebrow(eb)}</div>' if eb else ''
    s = P(sub, size=15) if sub else ''
    return f'<header style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; justify-content: space-between; {A("up")}"><div style="min-width: 0">{cr}{ebh}{row(H(title, 36), badge, gap=12)}{spacer(6)}{s}</div><div style="display: flex; gap: 10px; flex-wrap: wrap">{"".join(actions)}</div></header>'
def logo(size=24, color=None):
    c = color or T['tx']
    return f'<span style="display: inline-flex; align-items: center; gap: 8px; font-family: {HF}; font-weight: 800; font-size: {size}px; letter-spacing: -0.04em; color: {c}"><span aria-hidden="true" style="width: {int(size*1.15)}px; height: {int(size*1.15)}px; border-radius: 32%; background: {T["acc"]}; display: inline-flex; align-items: center; justify-content: center">{icon("spark", int(size*0.72), "#FFFFFF", 2.6)}</span>nelio</span>'

# ---------- skeletons ----------
def sk(w='100%', h=14, r=8, d=0): return f'<span aria-hidden="true" style="display: block; width: {w}; height: {h}px; border-radius: {r}px; background: {T["s3"]}; {A("pulse", d)}"></span>'
def sk_lines(n=3): return col(*[sk(w, 12, 6, 0.1*i) for i, w in enumerate(['72%','94%','58%','86%','40%'][:n])], gap=10)
def sk_card(h=120, lines=2): return card(row(sk('44px',44,14), col(sk('60%',14), sk('35%',10), gap=8, style='flex: 1'), gap=12), sk_lines(lines), pad=20)
def sk_stat(): return card(sk('40%',12), sk('55%',30,10), sk('30%',10), pad=20, gap=10)
def sk_rows(n=5):
    out = ''.join(f'<div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid {T["bd"]}">{sk("36px",36,12,0.08*i)}<div style="flex: 1; display: flex; flex-direction: column; gap: 8px">{sk("50%",12,6,0.08*i)}{sk("30%",10,6,0.08*i)}</div>{sk("80px",24,999,0.08*i)}</div>' for i in range(n))
    return f'<div role="status" aria-label="Loading" style="border: 1px solid {T["bd"]}; border-radius: 20px; background: {T["s1"]}; overflow: hidden">{out}</div>'
def sk_table(cols=5, n=5):
    hd = ''.join(f'<div style="flex: 1">{sk("50%",10)}</div>' for _ in range(cols))
    rs = ''.join(f'<div style="display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid {T["bd"]}">' + ''.join(f'<div style="flex: 1">{sk(["70%","50%","60%","40%","55%"][j%5],12,6,0.07*i)}</div>' for j in range(cols)) + '</div>' for i in range(n))
    return f'<div role="status" aria-label="Loading" style="border: 1px solid {T["bd"]}; border-radius: 20px; background: {T["s1"]}; overflow: hidden"><div style="display: flex; gap: 16px; padding: 14px 16px; background: {T["s2"]}">{hd}</div>{rs}</div>'
def sk_head(): return col(sk('120px',10), sk('320px',30,10), sk('220px',12), gap=10)
def sk_media(n=6, ratio='4/5'): return grid([card(f'<span aria-hidden="true" style="display: block; aspect-ratio: {ratio}; border-radius: 16px; background: {T["s3"]}; {A("pulse",0.06*i)}"></span>', sk('70%',12), sk('40%',10), pad=12, gap=10) for i in range(n)], cols=min(n,6), gap=14, minw=170)
def loading_note(t='Loading…'): return row(f'<span style="display: inline-flex; {A("spin")}">{icon("refresh",16,T["accTx"])}</span>', small(t, T['accTx'], 700), gap=8)

# ---------- shells ----------
NAVF = {'home':'CommandCenter','activity':'Activity','strategist':'Strategist','agents':'Agents','media':'MediaLibrary','content':'ContentStudio','exports':'Exports',
        'calendar':'Calendar','drafts':'Drafts','approvals':'Approvals','analytics':'Analytics','licensing':'Marketplace','connections':'Connections','brandkits':'BrandKits',
        'settings':'WorkspaceSettings','agencyhub':'AgencyHub','clients':'Clients','team':'Team','audit':'AuditLog','billing':'Billing'}
NAV = [(None, [('home','home','Command Center'),('activity','activity','Activity')]),
       ('AI', [('strategist','spark','Strategist'),('agents','bot','Agents')]),
       ('Create', [('media','scissors','Clipping Studio'),('content','pen','Content Studio'),('exports','download','Exports')]),
       ('Publish', [('calendar','calendar','Calendar'),('drafts','file','Drafts'),('approvals','check','Approvals')]),
       ('Grow', [('analytics','chart','Analytics'),('licensing','shield','Licensing')]),
       ('Workspace', [('connections','link','Connections'),('brandkits','palette','Brand kits'),('settings','gear','Settings')]),
       ('Agency', [('agencyhub','grid','Agency hub'),('clients','users','Clients'),('team','users','Team'),('audit','list','Audit log')])]
def navitem(ic, label, active, href='#', badge=None):
    st = f'background: {T["acc"]}; color: {T["onacc"]};' if active else f'background: transparent; color: {T["tx"]};'
    b = f'<span style="margin-left: auto; min-width: 22px; height: 22px; padding: 0 7px; box-sizing: border-box; border-radius: 999px; background: {T["onacc"] if active else T["ai"]}; color: {T["acc"] if active else OL}; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">{badge}</span>' if badge else ''
    return f'<a href="{href}"{" aria-current=\"page\"" if active else ""} style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 999px; font-size: 14px; font-weight: 600; text-decoration: none; {st}">{icon(ic,18)}{e(label)}{b}</a>'
def sidebar(active, agency=False):
    out = ''
    for g, items in NAV:
        if g == 'Agency' and not agency: continue
        if g: out += f'<div style="font-size: 11px; font-weight: 800; color: {T["mu"]}; text-transform: uppercase; letter-spacing: 0.09em; padding: 16px 14px 6px">{g}</div>'
        for k, ic, lbl in items: out += navitem(ic, lbl, k == active, NAVF[k] + '.dc.html', '4' if k == 'approvals' else None)
    promo = f'<div style="margin-top: 20px; padding: 16px; border-radius: 22px; background: {T["lime"]}; color: {OL}; display: flex; flex-direction: column; gap: 8px; position: relative"><div style="position: absolute; top: -12px; right: 10px">{sticker("Pro","#FFD43B",6,size=11,anim=False)}</div><div style="display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 800"><span>Credits used</span><span>760 / 2,000</span></div><div style="height: 8px; border-radius: 999px; background: rgba(11,11,20,0.15); overflow: hidden"><div style="width: 38%; height: 100%; background: {OL}"></div></div><a href="Billing.dc.html" style="font-size: 13px; font-weight: 800; color: {OL}; text-decoration: none">Billing &amp; usage →</a></div>'
    return f'<nav aria-label="Main" style="flex: 1 1 250px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 2px">{out}{promo}</nav>'
def topbar(ws='Ada Studio', kind='Creator workspace', role='owner'):
    sw = f'<a href="WorkspaceSwitcher.dc.html" style="display: flex; align-items: center; gap: 10px; padding: 5px 14px 5px 5px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; text-decoration: none; min-height: 44px; box-sizing: border-box">{person(ws[:1], "#FFD43B", 32)}<span style="display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 700">{e(ws)}</span><span style="font-size: 11px; color: {T["mu"]}">{e(kind)}</span></span>{icon("chevd",16)}</a>'
    search = f'<a href="CommandPalette.dc.html" style="flex: 0 1 380px; display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s2"]}; color: {T["mu"]}; font-size: 14px; text-decoration: none; min-height: 44px; box-sizing: border-box">{icon("search",16)}<span style="flex-grow: 1">Search or ask Nelio AI</span><kbd style="font-size: 12px; padding: 2px 8px; border-radius: 8px; background: {T["s1"]}; border: 1px solid {T["bd"]}; color: {T["mu"]}; font-family: {BF}">Ctrl K</kbd></a>'
    credits = f'<a href="Billing.dc.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: {T["limeT"]}; color: {T["limeTx"]}; text-decoration: none; font-size: 14px; font-weight: 800; min-height: 44px; box-sizing: border-box">{icon("zap",16,T["limeTx"])}1,240 left</a>' if role in ('owner','admin','manager') else ''
    pause = f'<a href="PauseConfirm.dc.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; border: 2px solid {T["bd"]}; color: {T["tx"]}; font-size: 14px; font-weight: 700; text-decoration: none; min-height: 44px; box-sizing: border-box">{icon("pause",16)}Pause all</a>' if role != 'viewer' else ''
    bell = f'<a href="Notifications.dc.html" aria-label="Notifications, 3 unread" style="position: relative; width: 44px; height: 44px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box">{icon("bell",18)}<span style="position: absolute; top: 7px; right: 8px; width: 10px; height: 10px; border-radius: 50%; background: {T["ai"]}; border: 2px solid {T["s1"]}"></span></a>'
    me = f'<a href="AccountMenu.dc.html" aria-label="Account menu" style="text-decoration: none">{person("AO", "#FF7A2F", 44)}</a>'
    return f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 20px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}"><a href="CommandCenter.dc.html" style="text-decoration: none">{logo(22)}</a><span style="width: 6px"></span>{sw}{search}{grow()}{credits}{pause}{bell}{me}</header>'
def content_wrap(inner, pad='32px 36px', gap=24, maxw=1260):
    pad, gap = (f"{SP['page_m']}px", SP['stack_m']) if MOB['on'] else (f"{SP['page_d']}px", SP['stack_d'])
    return f'<main style="flex: 999 1 560px; min-width: 0; padding: {pad}; box-sizing: border-box"><div style="max-width: {maxw}px; margin: 0 auto; display: flex; flex-direction: column; gap: {gap}px">{inner}</div></main>'
def overlay(m, top=100, maxw=560):
    if MOB['on']:
        CUR['modal'] = True
        return f'<div style="position: absolute; inset: 0; z-index: 20; background: rgba(11,11,20,0.55); display: flex; flex-direction: column; justify-content: flex-end; box-sizing: border-box; {A("fade",0,.3)}"><div role="dialog" aria-modal="true" style="width: 100%; max-height: 88%; overflow-y: auto; background: {T["s1"]}; border-radius: 28px 28px 0 0; padding: 10px 20px 28px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; {A("up",.05,.45)}"><span aria-hidden="true" style="align-self: center; width: 44px; height: 5px; border-radius: 999px; background: {T["s3"]}; margin-bottom: 4px"></span>{m}</div></div>'
    return f'<div style="position: absolute; inset: 0; background: rgba(11,11,20,0.55); display: flex; justify-content: center; align-items: flex-start; padding: {top}px 20px; box-sizing: border-box; {A("fade",0,.3)}"><div role="dialog" aria-modal="true" style="width: 100%; max-width: {maxw}px; background: {T["s1"]}; border-radius: 32px; padding: 28px; display: flex; flex-direction: column; gap: 18px; box-sizing: border-box; {A("pop",.05,.5)}">{m}</div></div>'

# ---------- document & registry ----------
LAST, REG, ORDER, CUR = {}, {}, [], {'page':'foundations','row':None}
def doc(title, body, w, h, fixed=False, script=None):
    if MOB['on']:
        w = 390
        if CUR.get('modal'): h, fixed = 844, True
        else: h = max(844, int(h * CUR.get('hmul', 1.9)))
    LAST.update(title=title, w=w, h=h, fixed=fixed)
    if MOB['on']: CUR['lastbody'] = (body, script)
    root = f'width: {w}px; height: {h}px; overflow: hidden;' if fixed else ('min-height: 100vh; overflow-x: hidden;' if MOB['on'] else 'min-height: 100vh;')
    sc = script or 'class Component extends DCLogic {\n  renderVals() { return {}; }\n}'
    props = json.dumps({"$preview": {"width": w, "height": h}})
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{e(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0;background:{T["bg"]}}}
a{{color:{T["accTx"]}}}a:hover{{color:{T["tx"]}}}
{MOTION_CSS}
</style>
</helmet>
<div style="{root} position: relative; box-sizing: border-box; background: {T["bg"]}; color: {T["tx"]}; font-family: {BF}; display: flex; flex-direction: column">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
{sc}
</script>
</body>
</html>
'''
def msan(c):
    def w_(m):
        n = int(m.group(1)); return f'width: 100%; max-width: {n}px' if n >= 340 else m.group(0)
    c = re.sub(r'(?<![-\w])width: (\d+)px', w_, c)
    def g_(m):
        v = m.group(1)
        if 'auto-fit' in v or 'auto-fill' in v or ('minmax(0' not in v and 'px' not in v): return m.group(0)
        return 'grid-template-columns: minmax(0, 1fr)'
    c = re.sub(r'grid-template-columns: ([^;"]+)', g_, c)
    c = re.sub(r'font-size: (\d+)px', lambda m: f'font-size: {round(int(m.group(1))*0.6)}px' if int(m.group(1)) >= 44 else m.group(0), c)
    return c
def mname(f): return f[:-8] + '-Mobile.dc.html'
def write(fname, content, row_=None):
    if MOB['on'] and MOB.get('collect') is not None:
        body, script = CUR['lastbody']
        MOB['collect'].append(dict(desk=fname, title=LAST['title'], body=msan(body), h=LAST['h'], fixed=LAST['fixed'], script=script))
        CUR['modal'] = False; return
    if MOB['on']:
        desk = fname; fname = mname(fname); content = msan(content)
        d = REG.get(desk, {})
        CUR['modal'] = False
        with open(os.path.join(OUT, fname), 'w') as f: f.write(content)
        if fname not in REG: ORDER.append(fname)
        REG[fname] = dict(LAST, page=d.get('page', CUR['page']), row=d.get('row', desk), mobile=True, desk=desk)
        return
    with open(os.path.join(OUT, fname), 'w') as f: f.write(content)
    if fname not in REG: ORDER.append(fname)
    REG[fname] = dict(LAST, page=CUR['page'], row=row_ or CUR.get('row') or fname)

def app_page(fname, title, active, inner, h=1100, ws='Ada Studio', kind='Creator workspace', agency=False, w=1440, banner_html='', modal='', role='owner', row_=None):
    if MOB['on']:
        CUR['hmul'] = 1.9
        body = mtopbar(ws) + banner_html + content_wrap(inner) + mtabbar(active) + modal
        write(fname, doc(title, body, w, h), row_); return
    body = topbar(ws, kind, role) + banner_html + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1; align-items: stretch">{sidebar(active, agency)}{content_wrap(inner)}</div>' + modal
    write(fname, doc(title, body, w, h), row_)
def topstrip(tone, ic, text, action=None, href='#'):
    bg, fg = TONES()[tone]
    a = f'<a href="{href}" style="margin-left: auto; font-weight: 800; color: {fg}">{e(action)}</a>' if action else ''
    return f'<div style="padding: 10px 20px; background: {bg}; color: {T["tx"]}; font-size: 14px; font-weight: 600; display: flex; gap: 10px; align-items: center">{icon(ic,18,fg)}{e(text)}{a}</div>'

# ---------- mobile shells ----------
TABIC = {
 'home': ('<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5A1.5 1.5 0 0 1 3.5 19z"/>', None),
 'activity': ('<path d="M13 2.8 4.8 13.4h6.3l-1 7.8 8.1-10.6h-6.3z"/>', None),
 'approvals': ('<circle cx="12" cy="12" r="8.7"/>', '<path d="m8.2 12.2 2.6 2.6 5-5.2"/>'),
 'calendar': ('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/>', '<path d="M3.5 9.6h17M8 3v4M16 3v4"/>'),
 'more': ('<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>', None)}
def tabicon(k, on, s=24):
    shape, detail = TABIC[k]
    if on:
        cut = T['s1']
        det = detail.replace('<path', f'<path stroke="{cut}" stroke-width="2" fill="none"') if detail else ''
        if k == 'calendar': det = f'<path d="M3.5 9.6h17" stroke="{cut}" stroke-width="2"/><path d="M8 3v4M16 3v4" stroke="{T["acc"]}" stroke-width="2"/>'
        return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" aria-hidden="true" style="flex: none" fill="{T["acc"]}" stroke="{T["acc"]}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">{shape}{det}</svg>'
    return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" aria-hidden="true" style="flex: none" fill="none" stroke="{T["mu"]}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">{shape}{detail or ""}</svg>'
def tabbar_html(items, act):
    out = ''
    for k, l, href in items:
        on = k == act
        badge = f'<span style="position: absolute; top: -3px; right: -9px; min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 999px; background: {T["ai"]}; color: {OL}; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; border: 2px solid {T["s1"]}">4</span>' if k == 'approvals' else ''
        bar = f'<span aria-hidden="true" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 28px; height: 3px; border-radius: 0 0 3px 3px; background: {T["acc"] if on else "transparent"}"></span>'
        out += f'<a href="{href}"{" aria-current=\"page\"" if on else ""} style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 10px; min-height: 52px; text-decoration: none; color: {T["accTx"] if on else T["mu"]}; font-size: 11px; font-weight: {800 if on else 600}">{bar}<span style="position: relative; display: inline-flex">{tabicon(k, on)}{badge}</span>{l}</a>'
    return f'<nav aria-label="Main" style="position: sticky; bottom: 0; z-index: 5; margin-top: auto; display: flex; padding: 0 8px 20px; border-top: 1px solid {T["bd"]}; background: {T["s1"]}">{out}</nav>'

MTABS = [('home','home','Home','CommandCenter'),('activity','activity','Activity','Activity'),('approvals','check','Approvals','Approvals'),('calendar','calendar','Calendar','Calendar'),('more','menu','More','MobileMore')]
def mtabbar(active):
    act = active if active in ('home','activity','approvals','calendar') else 'more'
    return tabbar_html([('home','Home','CommandCenter-Mobile.dc.html'),('activity','Activity','Activity-Mobile.dc.html'),('approvals','Approvals','Approvals-Mobile.dc.html'),('calendar','Calendar','Calendar-Mobile.dc.html'),('more','More','MobileMore.dc.html')], act)
def mtopbar(ws='Ada Studio'):
    sw = f'<a href="WorkspaceSwitcher.dc.html" style="display: flex; align-items: center; gap: 8px; padding: 4px 12px 4px 4px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; text-decoration: none; font-weight: 700; font-size: 14px; min-height: 44px; box-sizing: border-box; min-width: 0; max-width: 170px"><span style="flex: none">{person(ws[:1], "#FFD43B", 30)}</span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{e(ws)}</span>{icon("chevd",14)}</a>'
    return f'<header style="position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: {T["s1"]}; border-bottom: 1px solid {T["bd"]}">{sw}{grow()}{ibtn("search","Search","CommandPalette.dc.html")}{ibtn("bell","Notifications","Notifications.dc.html")}<a href="AccountMenu.dc.html" aria-label="Account menu" style="text-decoration: none">{person("AO", "#FF7A2F", 40)}</a></header>'
def hnav(nav):
    nav = nav.replace('flex: 1 1 250px; max-width: 100%; box-sizing: border-box; padding: 18px 14px;', 'flex: 1 1 100%; max-width: 100%; box-sizing: border-box; padding: 10px 12px; overflow-x: auto; flex-wrap: nowrap;')
    nav = nav.replace('border-right: 1px solid', 'border-bottom: 1px solid').replace('flex-direction: column; gap: 2px', 'flex-direction: row; gap: 6px')
    return nav.replace('display: flex; align-items: center; gap: 10px; padding: 10px 14px;', 'display: flex; flex: none; white-space: nowrap; align-items: center; gap: 8px; padding: 10px 14px;')
