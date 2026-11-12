# Nelio hi-fi design generator: tokens + components. Writes .dc.html artboards.
import html, json, os

OUT = '/home/claude/nelio-design/project'
os.makedirs(OUT, exist_ok=True)

DARK = dict(bg='#0D0D12', s1='#16161E', s2='#1F1F2A', s3='#292936', bd='#2E2E3C', tx='#F5F5F7', mu='#A9A9BC',
            lime='#D4FF3F', onlime='#0D0D12', grape='#B7A4FF', ongrape='#0D0D12', blue='#6CB4FF', orange='#FFB547',
            red='#FF7A7A', teal='#3DDBA0',
            limeT='#252D0E', grapeT='#231D3B', blueT='#12253A', orangeT='#382910', redT='#3A1818', tealT='#0F3026',
            link='#D4FF3F', video='#2A2240', video2='#163A33')
LIGHT = dict(bg='#F6F6F1', s1='#FFFFFF', s2='#EFEFE8', s3='#E4E4DC', bd='#DCDCD2', tx='#121218', mu='#55556A',
             lime='#D4FF3F', onlime='#0D0D12', grape='#5333D6', ongrape='#FFFFFF', blue='#1F66C2', orange='#A35A00',
             red='#C53030', teal='#0E7A55',
             limeT='#EEFFB8', grapeT='#ECE7FF', blueT='#E2EEFC', orangeT='#FFF0D9', redT='#FDE4E4', tealT='#DDF5EC',
             link='#5A3DE6', video='#2A2240', video2='#163A33')
T = dict(DARK)
def theme(name):
    T.clear(); T.update(DARK if name == 'dark' else LIGHT)

HF = "'Bricolage Grotesque', Inter, system-ui, sans-serif"
BF = "Inter, system-ui, sans-serif"
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'

def e(s): return html.escape(str(s), quote=True)

# ---------------- icons (stroke, 24 grid) ----------------
IC = {
 'home':'M3 11l9-8 9 8M5 10v10h14V10', 'activity':'M3 12h4l3-8 4 16 3-8h4', 'spark':'M12 3l2.2 6.3L20 12l-5.8 2.7L12 21l-2.2-6.3L4 12l5.8-2.7z',
 'bot':'M5 9h14v10H5zM12 5v4M9 13h.01M15 13h.01M8 19v2M16 19v2', 'scissors':'M6 6a3 3 0 1 0 0 .01M6 18a3 3 0 1 0 0 .01M8.5 7.5L20 19M8.5 16.5L20 5',
 'pen':'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', 'download':'M12 4v11M7 10l5 5 5-5M5 20h14', 'calendar':'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
 'file':'M6 3h8l4 4v14H6zM14 3v4h4', 'check':'M5 12l5 5L20 7', 'chart':'M4 20V10M10 20V4M16 20v-7M22 20H2', 'shield':'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
 'link':'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1', 'palette':'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5S13.5 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7h.01M15 7.5h.01',
 'gear':'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 7.5 4 7 3 10l2 1v2l-2 1 1 3 2-.5 1.5 1.5L7 20l3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z',
 'grid':'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', 'users':'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 3a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.7',
 'list':'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', 'card':'M3 6h18v12H3zM3 10h18', 'bell':'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
 'search':'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5', 'pause':'M8 5v14M16 5v14', 'play':'M7 4l13 8-13 8z', 'plus':'M12 5v14M5 12h14',
 'upload':'M12 20V9M7 14l5-5 5 5M5 4h14', 'x':'M6 6l12 12M18 6L6 18', 'alert':'M12 3l10 18H2zM12 10v5M12 18h.01', 'info':'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5h.01',
 'clock':'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', 'lock':'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3', 'chev':'M9 6l6 6-6 6', 'chevd':'M6 9l6 6 6-6',
 'more':'M5 12h.01M12 12h.01M19 12h.01', 'eye':'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'msg':'M4 5h16v11H9l-5 4z',
 'refresh':'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4', 'zap':'M13 2L4 14h7l-1 8 9-12h-7z', 'globe':'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
 'wallet':'M3 7h16v12H3zM3 7l12-3v3M16 13h.01', 'flag':'M5 21V4h12l-2 4 2 4H5', 'trash':'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', 'tag':'M3 12V3h9l9 9-9 9zM7.5 7.5h.01',
 'film':'M4 4h16v16H4zM8 4v16M16 4v16M4 8h4M4 16h4M16 8h4M16 16h4', 'music':'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
 'wand':'M4 20L16 8M14 4v3M18 8h3M17 3l1.5 1.5M19.5 5.5L21 7', 'image':'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01', 'type':'M5 6V4h14v2M12 4v16M9 20h6',
 'phone':'M7 2h10v20H7zM11 18h2', 'key':'M15 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM10 12L3 19v2h3v-2h2v-2h2', 'mail':'M3 5h18v14H3zM3 6l9 7 9-7',
 'yt':'M3 7c0-1.5 1-2.5 2.5-2.6C8 4.2 10 4 12 4s4 .2 6.5.4C20 4.5 21 5.5 21 7v10c0 1.5-1 2.5-2.5 2.6-2.5.2-4.5.4-6.5.4s-4-.2-6.5-.4C4 19.5 3 18.5 3 17zM10 9v6l5-3z',
 'ig':'M4 4h16v16H4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17 7h.01', 'tt':'M14 3v11a4 4 0 1 1-4-4M14 3c.5 2.5 2.5 4.5 5 5', 'fb':'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z',
 'arrowr':'M5 12h14M13 6l6 6-6 6', 'sun':'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
 'moon':'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z', 'monitor':'M3 4h18v12H3zM8 20h8M12 16v4', 'wifioff':'M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.4M12 20h.01M16 10.5a10 10 0 0 1 3 2',
 'trophy':'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8', 'smile':'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
}
def icon(name, size=18, color=None, sw=2):
    c = color or 'currentColor'
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none"><path d="{IC[name]}"></path></svg>'

TONES = lambda: {'lime':(T['limeT'],T['lime'] if T is not None and T['bg']=='#0D0D12' else '#3D4D00'),'grape':(T['grapeT'],T['grape']),'blue':(T['blueT'],T['blue']),
                 'orange':(T['orangeT'],T['orange']),'red':(T['redT'],T['red']),'teal':(T['tealT'],T['teal']),'neutral':(T['s2'],T['mu']),
                 'solid':(T['lime'],T['onlime']),'ink':(T['tx'],T['bg'])}

def chip(label, tone='neutral', ic=None, size=12):
    bg, fg = TONES()[tone]
    i = icon(ic, 13, fg) if ic else ''
    return f'<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; background: {bg}; color: {fg}; font-size: {size}px; font-weight: 600; white-space: nowrap; font-family: {BF}">{i}{e(label)}</span>'

def btn(label, kind='primary', ic=None, href=None, size='md', full=False):
    pad = '10px 16px' if size == 'md' else ('7px 12px' if size == 'sm' else '14px 22px')
    fs = 14 if size != 'sm' else 13
    if kind == 'primary': st = f'background: {T["lime"]}; color: {T["onlime"]}; border: 2px solid {T["lime"]}'
    elif kind == 'grape': st = f'background: {T["grape"]}; color: {T["ongrape"]}; border: 2px solid {T["grape"]}'
    elif kind == 'secondary': st = f'background: {T["s2"]}; color: {T["tx"]}; border: 2px solid {T["bd"]}'
    elif kind == 'danger': st = f'background: {T["redT"]}; color: {T["red"]}; border: 2px solid {T["redT"]}'
    else: st = f'background: transparent; color: {T["tx"]}; border: 2px solid transparent'
    w = 'width: 100%; justify-content: center; box-sizing: border-box;' if full else ''
    i = icon(ic, 16) if ic else ''
    inner = f'{i}{e(label)}' if label else i
    base = f'display: inline-flex; align-items: center; gap: 8px; padding: {pad}; border-radius: 12px; font-family: {BF}; font-size: {fs}px; font-weight: 700; cursor: pointer; text-decoration: none; white-space: nowrap; min-height: 44px; box-sizing: border-box; {w} {st}'
    al = '' if label else f' aria-label="{e(ic)}"'
    if href: return f'<a href="{href}" style="{base}">{inner}</a>'
    return f'<button type="button"{al} style="{base}">{inner}</button>'

def ibtn(ic, label, tone=None):
    return f'<button type="button" aria-label="{e(label)}" style="width: 40px; height: 40px; border-radius: 12px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none">{icon(ic,18)}</button>'

def H(text, size=28, color=None, mb=0, w=800):
    return f'<h2 style="margin: 0 0 {mb}px; font-family: {HF}; font-weight: {w}; font-size: {size}px; line-height: 1.1; letter-spacing: -0.02em; color: {color or T["tx"]}">{e(text)}</h2>'
def h3(text, size=17):
    return f'<h3 style="margin: 0; font-family: {HF}; font-weight: 700; font-size: {size}px; line-height: 1.2; color: {T["tx"]}">{e(text)}</h3>'
def P(text, color=None, size=14, mb=0, w=400):
    return f'<p style="margin: 0 0 {mb}px; font-size: {size}px; line-height: 1.5; color: {color or T["mu"]}; font-weight: {w}">{e(text)}</p>'
def small(text, color=None): return f'<span style="font-size: 12px; color: {color or T["mu"]}">{e(text)}</span>'
def mono(text, color=None, size=13): return f'<span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: {size}px; color: {color or T["tx"]}">{e(text)}</span>'

def row(*items, gap=12, align='center', wrap=True, justify='flex-start', style=''):
    return f'<div style="display: flex; flex-direction: row; gap: {gap}px; align-items: {align}; justify-content: {justify}; {"flex-wrap: wrap;" if wrap else ""} {style}">{"".join(items)}</div>'
def col(*items, gap=12, style=''):
    return f'<div style="display: flex; flex-direction: column; gap: {gap}px; min-width: 0; {style}">{"".join(items)}</div>'
def grid(items, cols=3, gap=16, minw=None, style=''):
    tpl = f'repeat(auto-fit, minmax({minw}px, 1fr))' if minw else f'repeat({cols}, minmax(0, 1fr))'
    return f'<div style="display: grid; grid-template-columns: {tpl}; gap: {gap}px; {style}">{"".join(items)}</div>'
def spacer(h=8): return f'<div style="height: {h}px"></div>'
def grow(): return '<div style="flex-grow: 1"></div>'

def card(*inner, pad=20, bg=None, gap=14, bd=True, style='', radius=20):
    b = f'border: 1px solid {T["bd"]};' if bd else ''
    return f'<section style="background: {bg or T["s1"]}; {b} border-radius: {radius}px; padding: {pad}px; display: flex; flex-direction: column; gap: {gap}px; min-width: 0; box-sizing: border-box; {style}">{"".join(inner)}</section>'

def card_head(title, right='', sub=None):
    s = P(sub, size=13) if sub else ''
    return row(col(h3(title), s, gap=2), grow(), right, gap=10)

def stat(label, value, sub=None, tone=None, ic=None, fill=None):
    bg = fill or T['s1']
    fg = T['onlime'] if fill == T['lime'] else (T['ongrape'] if fill == T['grape'] else T['tx'])
    mu = fg if fill else T['mu']
    i = icon(ic, 18, mu) if ic else ''
    sb = f'<div style="font-size: 13px; color: {mu}; font-weight: 500">{e(sub)}</div>' if sub else ''
    return f'<section style="background: {bg}; border: 1px solid {T["bd"] if not fill else fill}; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 6px; min-width: 0"><div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: {mu}">{i}{e(label)}</div><div style="font-family: {HF}; font-size: 34px; font-weight: 800; letter-spacing: -0.03em; color: {fg}">{e(value)}</div>{sb}</section>'

def table(cols, rows, widths=None):
    th = ''.join(f'<th scope="col" style="text-align: left; padding: 12px 14px; font-size: 12px; font-weight: 600; color: {T["mu"]}; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid {T["bd"]}; white-space: nowrap">{e(c)}</th>' for c in cols)
    trs = ''
    for r in rows:
        tds = ''
        for j, c in enumerate(r):
            v = c if (isinstance(c, str) and c.startswith('<')) else e(c)
            fw = 600 if j == 0 else 400
            tds += f'<td style="padding: 13px 14px; font-size: 14px; color: {T["tx"]}; font-weight: {fw}; border-bottom: 1px solid {T["bd"]}; vertical-align: middle">{v}</td>'
        trs += f'<tr>{tds}</tr>'
    return f'<div style="overflow-x: auto; border: 1px solid {T["bd"]}; border-radius: 16px; background: {T["s1"]}"><table style="width: 100%; border-collapse: collapse; min-width: 640px"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'

def lrow(title, sub=None, left='', right='', pad='12px 14px', last=False):
    s = f'<div style="font-size: 13px; color: {T["mu"]}; margin-top: 2px">{e(sub)}</div>' if sub else ''
    b = '' if last else f'border-bottom: 1px solid {T["bd"]};'
    return f'<div style="display: flex; align-items: center; gap: 12px; padding: {pad}; {b}">{left}<div style="flex-grow: 1; min-width: 0"><div style="font-size: 14px; font-weight: 600; color: {T["tx"]}">{e(title)}</div>{s}</div>{right}</div>'
def lst(rows):
    out = ''.join(lrow(*r[:2], left=r[2] if len(r)>2 else '', right=r[3] if len(r)>3 else '', last=(i==len(rows)-1)) for i, r in enumerate(rows))
    return f'<div style="border: 1px solid {T["bd"]}; border-radius: 16px; background: {T["s1"]}; overflow: hidden">{out}</div>'

def dot(c, s=10): return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 50%; background: {c}; display: inline-block; flex: none"></span>'
def bubble(ic, tone='grape', s=40):
    bg, fg = TONES()[tone]
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 12px; background: {bg}; color: {fg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(ic, int(s*0.5), fg)}</span>'
def plat(p, s=32):
    m = {'yt':('#FF3B3B','#FFFFFF'),'ig':('#E1306C','#FFFFFF'),'tt':('#111111','#FFFFFF'),'fb':('#1877F2','#FFFFFF')}
    bg, fg = m[p]
    names = {'yt':'YouTube','ig':'Instagram','tt':'TikTok','fb':'Facebook'}
    return f'<span role="img" aria-label="{names[p]}" style="width: {s}px; height: {s}px; border-radius: 10px; background: {bg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(p, int(s*0.56), fg)}</span>'

AV = {'lime':('#D4FF3F','#0D0D12'),'grape':('#B7A4FF','#0D0D12'),'blue':('#6CB4FF','#0D0D12'),'orange':('#FFB547','#0D0D12'),'teal':('#3DDBA0','#0D0D12'),'pink':('#FF8AC8','#0D0D12')}
def agent(color='lime', shape='circle', s=40):
    bg, fg = AV[color]
    r = {'circle':'50%','square':'12px','blob':'40% 60% 55% 45%','pill':'999px'}[shape]
    eye = s // 9
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: {r}; background: {bg}; display: inline-flex; align-items: center; justify-content: center; gap: {eye+2}px; flex: none"><span style="width: {eye}px; height: {eye+3}px; border-radius: 4px; background: {fg}"></span><span style="width: {eye}px; height: {eye+3}px; border-radius: 4px; background: {fg}"></span></span>'
def person(initials, color='#3A3A4A', s=32, fg='#F5F5F7'):
    return f'<span aria-hidden="true" style="width: {s}px; height: {s}px; border-radius: 50%; background: {color}; color: {fg}; font-size: {int(s*0.38)}px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex: none; font-family: {BF}">{e(initials)}</span>'

def banner(tone, title, text='', action=None, ic=None):
    bg, fg = TONES()[tone]
    icn = ic or {'lime':'check','teal':'check','grape':'spark','blue':'info','orange':'alert','red':'alert','neutral':'info'}[tone]
    a = btn(action, 'secondary', size='sm') if action else ''
    t = f'<div style="font-size: 14px; color: {T["tx"]}">{e(text)}</div>' if text else ''
    return f'<div role="status" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; background: {bg}; border: 1px solid {fg}"><span style="color: {fg}; display: inline-flex">{icon(icn, 20, fg)}</span><div style="flex-grow: 1; min-width: 0"><div style="font-size: 14px; font-weight: 700; color: {T["tx"]}">{e(title)}</div>{t}</div>{a}</div>'

def empty(ic, title, text, action=None, tone='lime', second=None):
    a = btn(action, 'primary', 'plus' if action and action.startswith(('Add','New','Create','Upload')) else None) if action else ''
    s = btn(second, 'secondary') if second else ''
    return f'<div style="border: 2px dashed {T["bd"]}; border-radius: 24px; padding: 40px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; background: {T["s1"]}">{bubble(ic, tone, 56)}{H(title, 22)}<p style="margin: 0; max-width: 440px; font-size: 14px; line-height: 1.5; color: {T["mu"]}">{e(text)}</p><div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center">{a}{s}</div></div>'

def meter(label, pct, right='', tone='lime'):
    c = T[tone] if tone in T else tone
    return f'<div style="display: flex; flex-direction: column; gap: 6px"><div style="display: flex; justify-content: space-between; font-size: 13px"><span style="color: {T["tx"]}; font-weight: 600">{e(label)}</span><span style="color: {T["mu"]}">{e(right)}</span></div><div role="progressbar" aria-label="{e(label)}" aria-valuenow="{pct}" aria-valuemin="0" aria-valuemax="100" style="height: 10px; border-radius: 999px; background: {T["s3"]}; overflow: hidden"><div style="width: {pct}%; height: 100%; border-radius: 999px; background: {c}"></div></div></div>'

def tabs(items, active=0):
    out = ''
    for i, t in enumerate(items):
        if i == active: st = f'background: {T["tx"]}; color: {T["bg"]};'
        else: st = f'background: transparent; color: {T["mu"]};'
        out += f'<button type="button" style="padding: 8px 14px; border-radius: 999px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: {BF}; {st}">{e(t)}</button>'
    return f'<div role="tablist" style="display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: {T["s1"]}; border: 1px solid {T["bd"]}; flex-wrap: wrap; align-self: flex-start">{out}</div>'

_fid = [0]
def field(label, value='', kind='input', placeholder='', hint=None, err=None):
    _fid[0] += 1; fid = f'f{_fid[0]}'
    base = f'width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; background: {T["s2"]}; border: 2px solid {T["red"] if err else T["bd"]}; color: {T["tx"]}; font-size: 14px; font-family: {BF}; min-height: 46px'
    if kind == 'textarea': ctl = f'<textarea id="{fid}" placeholder="{e(placeholder)}" style="{base}; min-height: 96px; resize: vertical">{e(value)}</textarea>'
    elif kind == 'select': ctl = f'<select id="{fid}" style="{base}"><option>{e(value or placeholder)}</option></select>'
    else: ctl = f'<input id="{fid}" type="{"password" if kind=="password" else ("email" if kind=="email" else "text")}" value="{e(value)}" placeholder="{e(placeholder)}" style="{base}">'
    h = f'<div style="font-size: 12px; color: {T["red"] if err else T["mu"]}">{e(err or hint)}</div>' if (hint or err) else ''
    return f'<div style="display: flex; flex-direction: column; gap: 6px"><label for="{fid}" style="font-size: 13px; font-weight: 600; color: {T["tx"]}">{e(label)}</label>{ctl}{h}</div>'

def check(label, checked=False, sub=None, radio=False):
    _fid[0] += 1; fid = f'f{_fid[0]}'
    t = 'radio' if radio else 'checkbox'
    s = f'<div style="font-size: 13px; color: {T["mu"]}">{e(sub)}</div>' if sub else ''
    c = ' checked' if checked else ''
    return f'<div style="display: flex; gap: 10px; align-items: flex-start"><input id="{fid}" type="{t}"{c} style="width: 20px; height: 20px; margin: 1px 0 0; accent-color: {T["lime"]}; flex: none"><label for="{fid}" style="font-size: 14px; color: {T["tx"]}; font-weight: 500; line-height: 1.4">{e(label)}{s}</label></div>'

def toggle(label, on=True, sub=None):
    bg = T['lime'] if on else T['s3']; knob = T['onlime'] if on else T['mu']
    jc = 'flex-end' if on else 'flex-start'
    s = f'<div style="font-size: 13px; color: {T["mu"]}">{e(sub)}</div>' if sub else ''
    return f'<div style="display: flex; align-items: center; gap: 12px; justify-content: space-between"><div><div style="font-size: 14px; font-weight: 600; color: {T["tx"]}">{e(label)}</div>{s}</div><button type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{e(label)}" style="width: 48px; height: 28px; border-radius: 999px; border: none; background: {bg}; padding: 4px; display: flex; justify-content: {jc}; cursor: pointer; flex: none"><span style="width: 20px; height: 20px; border-radius: 50%; background: {knob}; display: block"></span></button></div>'

def choice(title, sub, selected=False, ic=None, tone='lime', badge=None, locked=False):
    bd = T['lime'] if selected else T['bd']
    bgc = T['limeT'] if selected else T['s1']
    b = chip(badge, 'grape' if not locked else 'neutral', 'lock' if locked else None) if badge else ''
    i = bubble(ic, tone, 44) if ic else ''
    tick = f'<span aria-hidden="true" style="width: 24px; height: 24px; border-radius: 50%; background: {T["lime"]}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon("check",14,T["onlime"],3)}</span>' if selected else f'<span aria-hidden="true" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid {T["bd"]}; flex: none; box-sizing: border-box"></span>'
    op = 'opacity: 0.6;' if locked else ''
    return f'<button type="button" aria-pressed="{"true" if selected else "false"}" style="text-align: left; display: flex; gap: 14px; align-items: center; padding: 16px; border-radius: 18px; border: 2px solid {bd}; background: {bgc}; cursor: pointer; width: 100%; box-sizing: border-box; font-family: {BF}; {op}">{i}<span style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px"><span style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"><span style="font-size: 16px; font-weight: 700; color: {T["tx"]}">{e(title)}</span>{b}</span><span style="font-size: 13px; color: {T["mu"]}; line-height: 1.4">{e(sub)}</span></span>{tick}</button>'

def kv(pairs):
    out = ''.join(f'<div style="display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid {T["bd"]}"><span style="font-size: 13px; color: {T["mu"]}">{e(k)}</span><span style="font-size: 14px; font-weight: 600; color: {T["tx"]}; text-align: right">{v if str(v).startswith("<") else e(v)}</span></div>' for k, v in pairs)
    return f'<div style="display: flex; flex-direction: column">{out}</div>'

def video(caption='STOP BUDGETING LIKE THIS', ratio='9/16', w='100%', maxw=280, bg=None, sub='Ada Studio', tag=None, play=True):
    t = f'<div style="position: absolute; top: 12px; left: 12px">{tag}</div>' if tag else ''
    pl = f'<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 56px; height: 56px; border-radius: 50%; background: rgba(13,13,18,0.7); display: flex; align-items: center; justify-content: center">{icon("play",24,"#FFFFFF")}</div>' if play else ''
    return f'<div role="img" aria-label="Video preview: {e(caption)}" style="position: relative; width: {w}; max-width: {maxw}px; aspect-ratio: {ratio}; border-radius: 20px; background: {bg or T["video"]}; overflow: hidden; margin: 0 auto; flex: none"><div style="position: absolute; left: 18%; top: 14%; width: 64%; height: 46%; border-radius: 45% 45% 40% 40%; background: #3B3157"></div><div style="position: absolute; left: 30%; top: 22%; width: 40%; height: 26%; border-radius: 50%; background: #4A3F6B"></div>{t}{pl}<div style="position: absolute; left: 10px; right: 10px; bottom: 18%; text-align: center"><span style="display: inline; background: #D4FF3F; color: #0D0D12; font-family: {HF}; font-weight: 800; font-size: 17px; line-height: 1.5; padding: 2px 8px; border-radius: 6px; box-decoration-break: clone; -webkit-box-decoration-break: clone">{e(caption)}</span></div><div style="position: absolute; left: 12px; bottom: 12px; font-size: 11px; font-weight: 600; color: #FFFFFF">{e(sub)}</div></div>'

def wide_video(label='podcast_ep12.mp4', h=240):
    return f'<div role="img" aria-label="Source video {e(label)}" style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 18px; background: {T["video2"]}; overflow: hidden"><div style="position: absolute; left: 12%; bottom: 0; width: 28%; height: 70%; border-radius: 50% 50% 0 0; background: #1F5248"></div><div style="position: absolute; right: 14%; bottom: 0; width: 26%; height: 62%; border-radius: 50% 50% 0 0; background: #24604F"></div><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 56px; height: 56px; border-radius: 50%; background: rgba(13,13,18,0.7); display: flex; align-items: center; justify-content: center">{icon("play",24,"#FFFFFF")}</div><div style="position: absolute; left: 12px; bottom: 12px; font-size: 12px; font-weight: 600; color: #FFFFFF">{e(label)}</div></div>'

def spark(points=(30,42,38,55,50,68,62,80), color=None, h=120, label='Trend', bars=False):
    c = color or T['lime']; n = len(points); mx = max(points) * 1.15
    if bars:
        bw = 300 / n
        rects = ''.join(f'<rect x="{i*bw+bw*0.2:.1f}" y="{100-p/mx*100:.1f}" width="{bw*0.6:.1f}" height="{p/mx*100:.1f}" rx="4" fill="{c}"></rect>' for i, p in enumerate(points))
        body = rects
    else:
        pts = ' '.join(f'{i*300/(n-1):.1f},{100-p/mx*100:.1f}' for i, p in enumerate(points))
        body = f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"></polyline>'
    grid_ = ''.join(f'<line x1="0" x2="300" y1="{y}" y2="{y}" stroke="{T["bd"]}" stroke-width="1" vector-effect="non-scaling-stroke"></line>' for y in (25, 50, 75))
    return f'<svg role="img" aria-label="{e(label)}" viewBox="0 0 300 100" preserveAspectRatio="none" style="width: 100%; height: {h}px; display: block">{grid_}{body}</svg>'

def steps(n, i, labels=None):
    segs = ''.join(f'<span style="flex: 1; height: 6px; border-radius: 999px; background: {T["lime"] if k <= i else T["s3"]}"></span>' for k in range(n))
    return f'<div style="display: flex; gap: 6px" role="progressbar" aria-label="Step {i+1} of {n}" aria-valuenow="{i+1}" aria-valuemin="1" aria-valuemax="{n}">{segs}</div>'

def pipeline(items):
    out = ''
    for lbl, n, tone in items:
        bg, fg = TONES()[tone]
        out += f'<div style="flex: 1 1 120px; padding: 14px; border-radius: 16px; background: {bg}; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; font-weight: 700; color: {fg}; text-transform: uppercase; letter-spacing: 0.04em">{e(lbl)}</span><span style="font-family: {HF}; font-size: 28px; font-weight: 800; color: {T["tx"]}">{e(n)}</span></div>'
    return f'<div style="display: flex; gap: 10px; flex-wrap: wrap">{out}</div>'

def stepper_list(items):
    out = ''
    for i, (lbl, st, note) in enumerate(items):
        tone = {'done':'teal','running':'lime','queued':'neutral','blocked':'orange','failed':'red'}[st]
        bg, fg = TONES()[tone]
        ic = {'done':'check','running':'refresh','queued':'clock','blocked':'lock','failed':'x'}[st]
        line = '' if i == len(items)-1 else f'<span aria-hidden="true" style="position: absolute; left: 15px; top: 34px; bottom: -10px; width: 2px; background: {T["bd"]}"></span>'
        out += f'<div style="position: relative; display: flex; gap: 12px; align-items: flex-start; padding-bottom: 14px">{line}<span style="width: 32px; height: 32px; border-radius: 50%; background: {bg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(ic,16,fg)}</span><div style="padding-top: 5px"><div style="font-size: 14px; font-weight: 600; color: {T["tx"]}">{e(lbl)}</div><div style="font-size: 12px; color: {T["mu"]}">{e(note)}</div></div></div>'
    return f'<div>{out}</div>'

def section_title(t, right=''):
    return row(H(t, 20), grow(), right, gap=10)

def page_head(title, sub=None, actions=(), crumbs=None, badge=''):
    cr = f'<div style="font-size: 13px; color: {T["mu"]}; margin-bottom: 6px">{e(crumbs)}</div>' if crumbs else ''
    s = P(sub, size=15) if sub else ''
    acts = ''.join(actions)
    return f'<header style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; justify-content: space-between">{"<div>"+cr+row(H(title, 34), badge, gap=12)+spacer(6)+s+"</div>"}<div style="display: flex; gap: 10px; flex-wrap: wrap">{acts}</div></header>'

def logo(size=24, color=None):
    c = color or T['tx']
    return f'<span style="display: inline-flex; align-items: center; gap: 8px; font-family: {HF}; font-weight: 800; font-size: {size}px; letter-spacing: -0.04em; color: {c}"><span aria-hidden="true" style="width: {int(size*1.05)}px; height: {int(size*1.05)}px; border-radius: 30%; background: {T["lime"]}; display: inline-flex; align-items: center; justify-content: center">{icon("spark", int(size*0.7), T["onlime"], 2.5)}</span>nelio</span>'

# ---------------- shells ----------------
NAV = [(None, [('home','home','Command Center'),('activity','activity','Activity')]),
       ('AI', [('strategist','spark','Strategist'),('agents','bot','Agents')]),
       ('Create', [('media','scissors','Clipping Studio'),('content','pen','Content Studio'),('exports','download','Exports')]),
       ('Publish', [('calendar','calendar','Calendar'),('drafts','file','Drafts'),('approvals','check','Approvals')]),
       ('Grow', [('analytics','chart','Analytics'),('licensing','shield','Licensing')]),
       ('Workspace', [('connections','link','Connections'),('brandkits','palette','Brand kits'),('settings','gear','Settings')]),
       ('Agency', [('agencyhub','grid','Agency hub'),('clients','users','Clients'),('team','users','Team'),('audit','list','Audit log')])]

def navitem(ic, label, active, badge=None):
    if active: st = f'background: {T["lime"]}; color: {T["onlime"]};'
    else: st = f'background: transparent; color: {T["tx"]};'
    b = f'<span style="margin-left: auto; min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; border-radius: 999px; background: {T["onlime"] if active else T["grape"]}; color: {T["lime"] if active else T["ongrape"]}; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">{badge}</span>' if badge else ''
    cur = ' aria-current="page"' if active else ''
    return f'<a href="#"{cur} style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; {st}">{icon(ic,18)}{e(label)}{b}</a>'

def sidebar(active, agency=False):
    out = ''
    for g, items in NAV:
        if g == 'Agency' and not agency: continue
        if g: out += f'<div style="font-size: 11px; font-weight: 700; color: {T["mu"]}; text-transform: uppercase; letter-spacing: 0.08em; padding: 14px 12px 6px">{g}</div>'
        for k, ic, lbl in items:
            out += navitem(ic, lbl, k == active, '4' if k == 'approvals' else None)
    usage = f'<div style="margin-top: 18px; padding: 14px; border-radius: 16px; background: {T["s2"]}; display: flex; flex-direction: column; gap: 8px"><div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: {T["mu"]}"><span>Credits used</span><span>760 / 2,000</span></div><div style="height: 8px; border-radius: 999px; background: {T["s3"]}; overflow: hidden"><div style="width: 38%; height: 100%; background: {T["lime"]}"></div></div><a href="#" style="font-size: 13px; font-weight: 700; color: {T["tx"]}; text-decoration: none">Billing &amp; usage →</a></div>'
    return f'<nav aria-label="Main" style="flex: 1 1 248px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column">{out}{usage}</nav>'

def topbar(ws='Ada Studio', kind='Creator workspace'):
    sw = f'<button type="button" style="display: flex; align-items: center; gap: 10px; padding: 6px 12px 6px 6px; border-radius: 14px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; cursor: pointer; font-family: {BF}; min-height: 44px">{person(ws[:1], T["grape"], 30, T["ongrape"])}<span style="display: flex; flex-direction: column; text-align: left"><span style="font-size: 14px; font-weight: 700">{e(ws)}</span><span style="font-size: 11px; color: {T["mu"]}">{e(kind)}</span></span>{icon("chevd",16)}</button>'
    search = f'<button type="button" style="flex: 0 1 360px; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 14px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["mu"]}; font-size: 14px; cursor: pointer; font-family: {BF}; min-height: 44px">{icon("search",16)}<span style="flex-grow: 1; text-align: left">Search or run a command</span><kbd style="font-size: 12px; padding: 2px 6px; border-radius: 6px; background: {T["s2"]}; color: {T["mu"]}; font-family: {BF}">Ctrl K</kbd></button>'
    credits = f'<a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 14px; background: {T["limeT"]}; color: {T["tx"]}; text-decoration: none; font-size: 14px; font-weight: 700; min-height: 44px; box-sizing: border-box">{icon("zap",16,T["lime"] if T["bg"]=="#0D0D12" else "#3D4D00")}1,240 left</a>'
    pause = f'<button type="button" style="display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 14px; border: 2px solid {T["bd"]}; background: transparent; color: {T["tx"]}; font-size: 14px; font-weight: 700; cursor: pointer; font-family: {BF}; min-height: 44px">{icon("pause",16)}Pause all</button>'
    bell = f'<button type="button" aria-label="Notifications, 3 unread" style="position: relative; width: 44px; height: 44px; border-radius: 14px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer">{icon("bell",18)}<span style="position: absolute; top: 8px; right: 9px; width: 9px; height: 9px; border-radius: 50%; background: {T["lime"]}"></span></button>'
    me = f'<button type="button" aria-label="Account menu" style="border: none; background: none; padding: 0; cursor: pointer">{person("AO", T["orange"], 40, "#0D0D12")}</button>'
    return f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 20px; background: {T["bg"]}; border-bottom: 1px solid {T["bd"]}">{logo(22)}<span style="width: 8px"></span>{sw}{search}{grow()}{credits}{pause}{bell}{me}</header>'

def pubnav():
    links = ''.join(f'<a href="#" style="color: {T["tx"]}; text-decoration: none; font-size: 15px; font-weight: 600">{l}</a>' for l in ['Product','Use cases','Pricing','Licensing','FAQ'])
    return f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding: 18px 48px; border-bottom: 1px solid {T["bd"]}">{logo(26)}<nav aria-label="Site" style="display: flex; gap: 24px; flex-wrap: wrap; margin-left: 24px">{links}</nav>{grow()}{btn("Log in","ghost")}{btn("Start free","primary")}</header>'
def pubfoot():
    cols_ = [('Product',['Features','Pricing','Status']),('Company',['Licensing','Creator partners','FAQ']),('Legal',['Terms','Privacy','Acceptable use','Takedown requests'])]
    cs = ''.join(f'<div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 13px; font-weight: 700; color: {T["tx"]}">{t}</span>' + ''.join(f'<a href="#" style="font-size: 14px; color: {T["mu"]}; text-decoration: none">{l}</a>' for l in ls) + '</div>' for t, ls in cols_)
    return f'<footer style="display: flex; flex-wrap: wrap; gap: 48px; padding: 48px; border-top: 1px solid {T["bd"]}; background: {T["s1"]}"><div style="display: flex; flex-direction: column; gap: 10px; flex: 1 1 260px">{logo(24)}{P("Your AI content team, under your control.")}{P("© 2026 Nelio", size=12)}</div>{cs}</footer>'

def creator_nav(active):
    items = [('c-over','home','Overview'),('c-verify','shield','Verification'),('c-terms','file','Licensing terms'),('c-usage','eye','Usage'),('c-rev','x','Revocations'),('c-pay','wallet','Payouts')]
    out = ''.join(navitem(ic, l, k == active, None) for k, ic, l in items)
    return f'<nav aria-label="Creator portal" style="flex: 1 1 248px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 2px">{out}</nav>'
def admin_nav(active):
    items = [('a-ops','activity','Ops overview'),('a-jobs','list','Jobs & dead-letter'),('a-audit','search','Audit search'),('a-lic','shield','License review'),('a-sup','key','Support access'),('a-abuse','flag','Abuse & moderation'),('a-diag','zap','Diagnostics'),('a-flags','gear','Feature flags')]
    out = ''.join(navitem(ic, l, k == active, None) for k, ic, l in items)
    return f'<nav aria-label="Admin" style="flex: 1 1 248px; max-width: 100%; box-sizing: border-box; padding: 18px 14px; background: {T["s1"]}; border-right: 1px solid {T["bd"]}; display: flex; flex-direction: column; gap: 2px">{out}</nav>'

def content_wrap(inner, pad='32px 36px', gap=24, maxw=1240):
    return f'<main style="flex: 999 1 560px; min-width: 0; padding: {pad}; box-sizing: border-box"><div style="max-width: {maxw}px; margin: 0 auto; display: flex; flex-direction: column; gap: {gap}px">{inner}</div></main>'

LAST={}
REG={}
ORDER=[]
CUR={'page':'foundations'}
def doc(title, body, w, h, fixed=False, script=None):
    LAST.update(title=title, w=w, h=h, fixed=fixed)
    root = f'width: {w}px; height: {h}px; overflow: hidden;' if fixed else 'min-height: 100vh;'
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
a{{color:{T["link"]}}}a:hover{{color:{T["tx"]}}}
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

def write(fname, content):
    with open(os.path.join(OUT, fname), 'w') as f: f.write(content)
    if fname not in REG: ORDER.append(fname)
    REG[fname] = dict(LAST, page=CUR['page'])

# shell page builders ----------------------------------------------------------
def overlay(m, top=110, maxw=560):
    return f'<div style="position: absolute; inset: 0; background: rgba(5,5,8,0.74); display: flex; justify-content: center; align-items: flex-start; padding: {top}px 20px; box-sizing: border-box"><div role="dialog" aria-modal="true" style="width: 100%; max-width: {maxw}px; background: {T["s1"]}; border: 1px solid {T["bd"]}; border-radius: 28px; padding: 28px; display: flex; flex-direction: column; gap: 18px; box-sizing: border-box">{m}</div></div>'

def app_page(fname, title, active, inner, h=1100, ws='Ada Studio', kind='Creator workspace', agency=False, w=1440, banner_html='', modal=''):
    body = topbar(ws, kind) + banner_html + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1; align-items: stretch">{sidebar(active, agency)}{content_wrap(inner)}</div>' + modal
    write(fname, doc(title, body, w, h))
def pub_page(fname, title, inner, h=1600, w=1440):
    body = pubnav() + f'<main style="display: flex; flex-direction: column">{inner}</main>' + pubfoot()
    write(fname, doc(title, body, w, h))
def center_page(fname, title, inner, h=900, w=1440, top='', width=480):
    tb = top or f'<header style="display: flex; align-items: center; padding: 20px 32px">{logo(24)}</header>'
    body = tb + f'<main style="flex-grow: 1; display: flex; justify-content: center; align-items: flex-start; padding: 48px 20px"><div style="width: 100%; max-width: {width}px; display: flex; flex-direction: column; gap: 20px">{inner}</div></main>'
    write(fname, doc(title, body, w, h))
def portal_page(fname, title, inner, h=1000, w=1440):
    hd = f'<header style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 14px 28px; border-bottom: 1px solid {T["bd"]}; background: {T["s1"]}"><span aria-hidden="true" style="width: 40px; height: 40px; border-radius: 12px; background: {T["orange"]}; color: #0D0D12; font-family: {HF}; font-weight: 800; font-size: 18px; display: inline-flex; align-items: center; justify-content: center">B</span><div><div style="font-size: 15px; font-weight: 700">BrightReach Agency</div><div style="font-size: 12px; color: {T["mu"]}">Client portal · Acme Foods</div></div>{grow()}<span style="font-size: 12px; color: {T["mu"]}">Powered by</span>{logo(16)}{ibtn("bell","Notifications")}{person("CN","#3DDBA0",40,"#0D0D12")}</header>'
    write(fname, doc(title, hd + content_wrap(inner, maxw=1080), w, h))
def creator_page(fname, title, active, inner, h=1000, w=1440, modal=''):
    hd = f'<header style="display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid {T["bd"]}">{logo(22)}{chip("Creator Portal","grape","shield")}{grow()}{ibtn("bell","Notifications")}{person("CK","#FF8AC8",40,"#0D0D12")}</header>'
    body = hd + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1">{creator_nav(active)}{content_wrap(inner)}</div>' + modal
    write(fname, doc(title, body, w, h))
def admin_page(fname, title, active, inner, h=1000, w=1440, modal=''):
    strip = f'<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 8px 20px; background: {T["orange"]}; color: #0D0D12; font-size: 13px; font-weight: 700"><span>NELIO ADMIN</span><span>Every action here is audited · session A-2291</span></div>'
    hd = f'<header style="display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-bottom: 1px solid {T["bd"]}">{logo(22)}{chip("Platform admin","orange","key")}{grow()}{btn("Global pause","danger","pause","#","sm")}{person("PA","#6CB4FF",40,"#0D0D12")}</header>'
    body = strip + hd + f'<div style="display: flex; flex-wrap: wrap; flex-grow: 1">{admin_nav(active)}{content_wrap(inner)}</div>' + modal
    write(fname, doc(title, body, w, h))

# mobile -------------------------------------------------------------------------
def tabbar(active):
    items = [('home','home','Home'),('activity','activity','Activity'),('approvals','check','Approvals'),('calendar','calendar','Calendar'),('more','more','More')]
    out = ''
    for k, ic, l in items:
        on = k == active
        c = T['tx'] if on else T['mu']
        pill = f'background: {T["lime"]}; color: {T["onlime"]};' if on else f'color: {c};'
        badge = f'<span style="position: absolute; top: -4px; right: -10px; min-width: 18px; height: 18px; border-radius: 999px; background: {T["grape"]}; color: {T["ongrape"]}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">4</span>' if k == 'approvals' else ''
        out += f'<a href="#" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; color: {c}; font-size: 11px; font-weight: 600"><span style="position: relative; width: 52px; height: 30px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; {pill}">{icon(ic,20)}{badge}</span>{l}</a>'
    return f'<nav aria-label="Main" style="display: flex; padding: 10px 6px 18px; border-top: 1px solid {T["bd"]}; background: {T["s1"]}">{out}</nav>'
def mobile_page(fname, title, inner, tab='home', top=None, h=844, w=390, bar=True):
    tp = top if top is not None else f'<header style="display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid {T["bd"]}"><button type="button" style="display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 12px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; font-family: {BF}; font-weight: 700; font-size: 14px; min-height: 44px">{person("A",T["grape"],28,T["ongrape"])}Ada Studio{icon("chevd",14)}</button>{grow()}{ibtn("search","Search")}{ibtn("bell","Notifications")}</header>'
    body = tp + f'<main style="flex-grow: 1; overflow: hidden; padding: 16px; display: flex; flex-direction: column; gap: 14px">{inner}</main>' + (tabbar(tab) if bar else '')
    write(fname, doc(title, body, w, h, fixed=True))
