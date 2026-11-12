# Nelio illustration kit — flat, sticker style, chunky ink outline. Every illustration is an inline SVG (viewBox 240x180).
from lib2 import OL, A, e
Y, C, PK, LI, OR, BL, WH, PU, GR = '#FFD43B', '#59D8FF', '#FF4FB8', '#B6F24A', '#FF7A2F', '#2F5BFF', '#FFFFFF', '#9B7BFF', '#22C55E'
SK = ['#F2C7A5', '#D99A6C', '#A86B45', '#7A4A2C', '#4E2F1C']
SW = 3

def svg(inner, label, w=240, h=180, vb='0 0 240 180', anim=''):
    return f'<svg role="img" aria-label="{e(label)}" viewBox="{vb}" width="{w}" height="{h}" style="max-width: 100%; height: auto; overflow: visible; flex: none; {anim}">{inner}</svg>'
def rr(x, y, w, h, r=10, f=WH, sw=SW, extra=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{f}" stroke="{OL}" stroke-width="{sw}" {extra}></rect>'
def ci(cx, cy, r, f=WH, sw=SW): return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{f}" stroke="{OL}" stroke-width="{sw}"></circle>'
def pa(d, f='none', sw=SW, extra=''): return f'<path d="{d}" fill="{f}" stroke="{OL}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}></path>'
def blob(cx, cy, s, f=LI):
    d = f'M{cx-s},{cy} C{cx-s},{cy-s*0.9} {cx-s*0.2},{cy-s*1.1} {cx+s*0.3},{cy-s*0.85} C{cx+s*1.05},{cy-s*0.6} {cx+s*1.1},{cy+s*0.3} {cx+s*0.6},{cy+s*0.8} C{cx+s*0.1},{cy+s*1.2} {cx-s*0.9},{cy+s*0.9} {cx-s},{cy}Z'
    return f'<path d="{d}" fill="{f}"></path>'
def spark(x, y, s=10, f=Y): return pa(f'M{x},{y-s} L{x+s*0.28},{y-s*0.28} L{x+s},{y} L{x+s*0.28},{y+s*0.28} L{x},{y+s} L{x-s*0.28},{y+s*0.28} L{x-s},{y} L{x-s*0.28},{y-s*0.28}Z', f, 2.5)
def tg(x, y, children, rot=0, cls=''):
    return f'<g transform="translate({x},{y}) rotate({rot})" {cls}>{children}</g>'
def label(x, y, w, text, f=Y, rot=-6, fs=13):
    return tg(x, y, rr(0, 0, w, 26, 13, f, 2.5) + f'<text x="{w/2}" y="18" text-anchor="middle" font-family="Plus Jakarta Sans, Inter, sans-serif" font-weight="800" font-size="{fs}" fill="{OL}">{e(text)}</text>', rot)
def bot(x, y, s=1, f=LI, wave=True):
    arm = pa(f'M{-26*s},{8*s} q{-14*s},{-10*s} {-12*s},{-26*s}', 'none', SW) if wave else pa(f'M{-26*s},{8*s} q{-10*s},{8*s} {-4*s},{18*s}', 'none', SW)
    body = rr(-26*s, -24*s, 52*s, 50*s, 18*s, f) + ci(-9*s, -2*s, 4*s, OL, 0) + ci(9*s, -2*s, 4*s, OL, 0) + pa(f'M{-7*s},{10*s} q{7*s},{6*s} {14*s},0') + pa(f'M0,{-24*s} v{-10*s}') + ci(0, -36*s, 4*s, PK, 2.5)
    return tg(x, y, arm + pa(f'M{26*s},{8*s} q{12*s},{8*s} {8*s},{20*s}') + body)
def person(x, y, s=1, skin=1, hair='#2B1A10', shirt=BL, style=0, bg=None):
    sk = SK[skin % len(SK)]
    hairs = [f'M{-17*s},{-6*s} q{0},{-22*s} {17*s},{-22*s} q{17*s},0 {17*s},{22*s} q{-6*s},{-10*s} {-17*s},{-10*s} q{-11*s},0 {-17*s},{10*s}Z',
             f'M{-19*s},{4*s} q{-4*s},{-30*s} {19*s},{-30*s} q{23*s},0 {19*s},{30*s} q{-2*s},{-16*s} {-19*s},{-16*s} q{-17*s},0 {-19*s},{16*s}Z',
             f'M{-16*s},{-8*s} q{2*s},{-20*s} {16*s},{-18*s} q{14*s},{-2*s} {16*s},{18*s}Z']
    b = f'<circle cx="0" cy="0" r="{44*s}" fill="{bg}"></circle>' if bg else ''
    return tg(x, y, b + pa(f'M{-34*s},{44*s} q{0},{-34*s} {34*s},{-34*s} q{34*s},0 {34*s},{34*s}Z', shirt) + ci(0, -6*s, 18*s, sk) + pa(hairs[style % 3], hair, SW) +
              ci(-6*s, -5*s, 1.8*s, OL, 0) + ci(6*s, -5*s, 1.8*s, OL, 0) + pa(f'M{-5*s},{3*s} q{5*s},{5*s} {10*s},0', 'none', 2.5))
def phone(x, y, w, h, inner, rot=0, f=OL):
    return tg(x, y, rr(0, 0, w, h, 18, f, SW) + f'<rect x="6" y="6" width="{w-12}" height="{h-12}" rx="13" fill="{WH}"></rect>' + inner + rr(w/2-14, 9, 28, 7, 4, OL, 0), rot)
_cid=[0]
def video_card(x, y, w, h, bg=PU, cap='WAIT FOR IT', rot=0, skin=2, shirt=Y, score=None):
    _cid[0]+=1; cid=f'vc{_cid[0]}'
    sc = (rr(w-38, 8, 32, 22, 11, LI, 2.5) + f'<text x="{w-22}" y="24" text-anchor="middle" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="12" fill="{OL}">{score}</text>') if score else ''
    capw = min(w-16, len(cap)*8+16)
    return tg(x, y, rr(0, 0, w, h, 14, bg) + f'<clipPath id="{cid}"><rect x="2" y="2" width="{w-4}" height="{h-4}" rx="12"></rect></clipPath><g clip-path="url(#{cid})">{person(w/2, h*0.62, w/90, skin, "#2B1A10", shirt, (x+y)%3)}</g>' +
              rr((w-capw)/2, h-34, capw, 22, 6, Y, 2) + f'<text x="{w/2}" y="{h-18}" text-anchor="middle" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="11" fill="{OL}">{e(cap)}</text>' + sc, rot)
def platb(x, y, p, s=26):
    col = {'yt':'#FF0033','ig':'#E1306C','tt':OL,'fb':'#1877F2'}[p]
    glyph = {'yt':f'<path d="M{x-4},{y-6} L{x+6},{y} L{x-4},{y+6}Z" fill="#FFF"></path>','ig':f'<rect x="{x-6}" y="{y-6}" width="12" height="12" rx="4" fill="none" stroke="#FFF" stroke-width="2"></rect><circle cx="{x}" cy="{y}" r="3" fill="none" stroke="#FFF" stroke-width="2"></circle>',
             'tt':f'<path d="M{x+1},{y-7} v10 a3,3 0 1 1 -3,-3 M{x+1},{y-7} q2,4 6,4" fill="none" stroke="#FFF" stroke-width="2"></path>','fb':f'<path d="M{x+2},{y+8} v-9 h3 M{x-2},{y-2} h7 M{x+2},{y-2} v-2 a3,3 0 0 1 3,-3 h2" fill="none" stroke="#FFF" stroke-width="2.4"></path>'}[p]
    return f'<circle cx="{x}" cy="{y}" r="{s/2}" fill="{col}" stroke="{OL}" stroke-width="2.5"></circle>{glyph}'

L = {}
def ill(name, label_):
    def deco(fn):
        L[name] = (fn, label_); return fn
    return deco
def get(name, w=240, anim=True):
    fn, lab = L[name]
    return svg(fn(), lab, w, int(w*0.75), anim=A('pop', 0.1, .8) if anim else '')

@ill('agents', 'A friendly Nelio agent waving, ready to work')
def _(): return blob(120, 100, 70, LI) + bot(120, 98, 1.5, C) + label(150, 30, 92, 'Hire me!', Y, 8) + spark(46, 50, 10, PK) + spark(200, 140, 8, Y)
@ill('media', 'A film strip being cut by scissors')
def _(): return blob(118, 96, 72, C) + tg(52, 60, rr(0, 0, 136, 62, 10, OL) + ''.join(rr(10+i*30, 12, 22, 38, 5, [Y, PK, LI, WH][i], 2.5) for i in range(4)), -8) + tg(150, 118, pa('M0,0 L40,-30 M0,-30 L40,0', 'none', 4) + ci(-6, -34, 9, OR) + ci(-6, 4, 9, OR), 0) + spark(206, 46, 10, Y)
@ill('calendar', 'A calendar page with a paper plane flying out')
def _(): return blob(110, 100, 70, Y) + rr(62, 46, 108, 100, 16, WH) + rr(62, 46, 108, 28, 14, BL) + ci(90, 46, 5, OL, 0) + ci(142, 46, 5, OL, 0) + ''.join(rr(76+(i%4)*22, 86+(i//4)*22, 14, 14, 4, [LI, WH, WH, PK, WH, WH, Y, WH][i], 2) for i in range(8)) + tg(176, 40, pa('M0,20 L44,0 L30,34 L22,22 Z', WH) + pa('M22,22 L44,0'), -10) + pa('M150,72 q20,-20 30,-34', 'none', 2.5, 'stroke-dasharray="5 6"')
@ill('approvals', 'A big approved stamp with confetti')
def _(): return blob(120, 96, 72, LI) + tg(120, 92, ci(0, 0, 50, WH) + ci(0, 0, 38, LI) + pa('M-16,0 L-4,12 L18,-12', 'none', 6), -8) + rr(40, 40, 12, 12, 3, PK, 2.5, 'transform="rotate(20 46 46)"') + rr(186, 120, 12, 12, 3, Y, 2.5, 'transform="rotate(-15 192 126)"') + ci(196, 52, 7, C) + ci(44, 136, 6, OR) + spark(176, 30, 9, Y)
@ill('notifications', 'A sleeping bell, all caught up')
def _(): return blob(118, 100, 70, PU) + tg(118, 100, pa('M-34,24 V-6 a34,34 0 0 1 68,0 V24 l10,10 H-44 Z', Y) + ci(0, 44, 9, OR) + pa('M-12,0 q6,6 12,0 M6,0 q6,6 12,0', 'none', 3)) + f'<text x="168" y="54" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="22" fill="{OL}">z</text><text x="186" y="36" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="16" fill="{OL}">z</text>'
@ill('licenses', 'A shield with a check and a creator card')
def _(): return blob(120, 96, 72, C) + tg(84, 92, pa('M0,-48 L38,-34 V0 c0,28 -18,44 -38,52 c-20,-8 -38,-24 -38,-52 V-34 Z', LI) + pa('M-14,0 L-3,12 L16,-10', 'none', 5)) + tg(132, 60, rr(0, 0, 84, 96, 14, WH) + person(42, 46, 0.7, 3, '#2B1A10', PK, 1) + rr(14, 74, 56, 10, 5, Y, 2), 6) + spark(36, 40, 9, Y)
@ill('analytics', 'A rising bar chart with a magnifying glass')
def _(): return blob(116, 100, 70, Y) + rr(54, 50, 132, 96, 16, WH) + ''.join(rr(70+i*26, 128-hh, 18, hh, 5, [C, PK, LI, BL][i], 2.5) for i, hh in enumerate([24, 40, 56, 72])) + tg(170, 54, ci(0, 0, 20, WH, 4) + pa('M14,14 L32,32', 'none', 6)) + spark(40, 46, 9, PK)
@ill('clients', 'Three client workspace cards with happy faces')
def _(): return blob(120, 100, 72, PK) + ''.join(tg(40+i*58, 52+(i%2)*14, rr(0, 0, 54, 72, 14, [Y, WH, C][i]) + person(27, 40, 0.55, i+1, '#2B1A10', [BL, OR, LI][i], i), [-6, 3, 8][i]) for i in range(3)) + label(78, 140, 84, '+ client', LI, -3)
@ill('search', 'A magnifying glass looking for something that is not there')
def _(): return blob(120, 96, 70, C) + tg(108, 86, ci(0, 0, 40, WH, 5) + pa('M30,30 L60,60', 'none', 10) + f'<text x="0" y="14" text-anchor="middle" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="40" fill="{OL}">?</text>') + spark(196, 40, 10, Y)
@ill('offline', 'A cloud with an unplugged cable')
def _(): return blob(120, 100, 70, Y) + pa('M70,110 a26,26 0 0 1 8,-50 a34,34 0 0 1 64,-6 a24,24 0 0 1 22,56 Z', WH) + pa('M96,110 v24 q0,14 14,14 h18', 'none', 4) + rr(126, 140, 24, 16, 5, OR, 2.5) + rr(160, 140, 24, 16, 5, PK, 2.5) + pa('M150,144 h4 M150,152 h4', 'none', 3) + pa('M104,84 q8,-6 16,0', 'none', 3) + ci(102, 76, 3, OL, 0) + ci(122, 76, 3, OL, 0)
@ill('lost', 'A lost agent holding an upside-down map')
def _(): return blob(120, 100, 72, PU) + bot(100, 102, 1.3, Y, False) + tg(146, 80, rr(0, 0, 64, 50, 6, WH) + pa('M8,12 l14,10 l14,-10 l14,10', 'none', 2.5) + ci(46, 36, 5, PK, 2), 12) + f'<text x="30" y="56" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="36" fill="{OL}">4?4</text>'
@ill('denied', 'A padlock with a sticker saying members only')
def _(): return blob(120, 96, 72, OR) + tg(120, 100, pa('M-22,-14 v-16 a22,22 0 0 1 44,0 v16', 'none', 8) + rr(-40, -16, 80, 64, 16, Y) + ci(0, 12, 8, OL, 0) + pa('M0,16 v12', 'none', 5)) + label(132, 40, 110, 'Members only', WH, 10, 12)
@ill('error', 'A tangled cable and a dizzy agent')
def _(): return blob(120, 100, 72, PK) + bot(120, 100, 1.3, C, False) + pa('M40,150 q30,-40 60,-10 t60,-10 t40,10', 'none', 4) + spark(60, 40, 10, Y) + spark(186, 56, 8, LI) + f'<text x="150" y="58" font-family="Plus Jakarta Sans,Inter,sans-serif" font-weight="800" font-size="20" fill="{OL}">@#!</text>'
@ill('maintenance', 'An agent with a wrench fixing things')
def _(): return blob(120, 100, 72, LI) + bot(110, 100, 1.3, Y) + tg(168, 70, pa('M0,0 l26,26 M-6,-6 a10,10 0 1 1 10,-10 l-4,6 l4,4 l6,-4 a10,10 0 0 1 -10,10', WH, 5), 0) + label(36, 30, 70, 'brb!', WH, -8)
@ill('success', 'A rocket launching with confetti, post published')
def _(): return blob(120, 100, 72, C) + tg(120, 96, pa('M0,-56 c22,14 26,44 18,70 h-36 c-8,-26 -4,-56 18,-70 Z', WH) + ci(0, -14, 9, BL) + pa('M-18,14 l-16,18 l18,-4 Z', PK) + pa('M18,14 l16,18 l-18,-4 Z', PK) + pa('M-10,16 q10,30 20,0', Y), 18) + rr(34, 40, 12, 12, 3, Y, 2.5) + rr(194, 50, 12, 12, 3, LI, 2.5) + ci(52, 140, 7, PK) + spark(196, 136, 10, Y)
@ill('gift', 'A gift box, your free trial')
def _(): return blob(120, 100, 72, PK) + rr(70, 82, 100, 64, 10, Y) + rr(62, 64, 116, 24, 8, LI) + rr(112, 64, 16, 82, 0, PK, 3) + pa('M120,64 c-22,-30 -46,-10 -26,0 M120,64 c22,-30 46,-10 26,0', WH, 3) + spark(46, 52, 9, Y) + label(150, 30, 70, '3 days', WH, 8)
@ill('wallet', 'A wallet with coins and a coming-soon clock')
def _(): return blob(120, 100, 70, Y) + rr(58, 66, 118, 78, 16, BL) + rr(130, 92, 50, 28, 10, LI) + ci(146, 106, 5, OL, 0) + ''.join(ci(70+i*16, 52-i*6, 12, Y) for i in range(3)) + tg(188, 44, ci(0, 0, 20, WH) + pa('M0,-10 v10 l8,6', 'none', 3))
@ill('aivideo', 'A clapperboard with sparkles, coming soon')
def _(): return blob(120, 100, 72, PU) + rr(64, 74, 112, 74, 12, OL) + tg(64, 50, rr(0, 0, 112, 24, 6, WH) + ''.join(pa(f'M{14+i*24},0 l-10,24', 'none', 4) for i in range(5)), -10) + spark(120, 112, 16, Y) + label(130, 140, 92, 'coming soon', LI, -4, 12)
@ill('upload', 'A video file flying into a cloud')
def _(): return blob(120, 100, 72, LI) + pa('M66,118 a26,26 0 0 1 8,-50 a34,34 0 0 1 64,-6 a24,24 0 0 1 22,56 Z', WH) + pa('M114,112 V78 M100,92 l14,-14 l14,14', 'none', 5) + tg(30, 110, rr(0, 0, 40, 52, 8, PK) + pa('M14,18 l14,8 l-14,8 Z', WH, 2.5), -12) + spark(200, 40, 10, Y)
@ill('strategist', 'Chat bubbles and a light bulb, planning with Nelio AI')
def _(): return blob(120, 100, 72, C) + tg(44, 50, rr(0, 0, 96, 44, 18, WH) + rr(14, 14, 60, 8, 4, PK, 0) + rr(14, 26, 40, 8, 4, OL, 0), -4) + tg(100, 104, rr(0, 0, 96, 44, 18, PK) + rr(14, 14, 64, 8, 4, OL, 0) + rr(14, 26, 34, 8, 4, WH, 0), 3) + tg(190, 50, ci(0, 0, 18, Y) + rr(-8, 16, 16, 12, 4, WH, 2.5))
@ill('limit', 'A piggy bank with a stop sign, limit reached')
def _(): return blob(120, 100, 72, OR) + tg(110, 104, pa('M-46,0 a46,36 0 1 1 92,0 a46,36 0 1 1 -92,0', PK) + rr(-6, -38, 20, 6, 3, OL, 0) + ci(24, -8, 3, OL, 0) + rr(-36, 30, 12, 16, 4, PK) + rr(20, 30, 12, 16, 4, PK)) + tg(184, 50, pa('M-14,-24 h28 l10,10 v28 l-10,10 h-28 l-10,-10 v-28 Z', '#EF4444') + rr(-12, -3, 24, 6, 3, WH, 0))
@ill('connect', 'A plug connecting to social platforms')
def _(): return blob(120, 100, 72, Y) + pa('M40,120 h40', 'none', 5) + rr(80, 104, 34, 32, 8, WH) + pa('M114,112 h14 M114,128 h14', 'none', 4) + platb(170, 62, 'yt', 34) + platb(190, 110, 'ig', 34) + platb(160, 148, 'tt', 30) + spark(56, 50, 10, PK)
@ill('verify', 'An ID card with a big verified check')
def _(): return blob(120, 96, 72, LI) + rr(52, 54, 136, 86, 14, WH) + person(92, 96, 0.7, 2, '#2B1A10', C, 2) + rr(122, 76, 52, 8, 4, OL, 0) + rr(122, 92, 38, 8, 4, '#B8BCC8', 0) + tg(176, 128, ci(0, 0, 18, GR) + pa('M-8,0 l5,6 l10,-10', 'none', 4))
@ill('welcome', 'Three Nelio agents cheering')
def _(): return blob(120, 100, 76, LI) + bot(60, 106, 1.05, C) + bot(122, 92, 1.35, Y) + bot(186, 108, 1.05, PK) + spark(30, 40, 9, PK) + spark(214, 46, 9, Y)
@ill('inbox', 'A cup of coffee, nothing waiting for you')
def _(): return blob(120, 100, 72, C) + pa('M74,82 h74 v28 a32,32 0 0 1 -32,32 h-10 a32,32 0 0 1 -32,-32 Z', WH) + pa('M148,90 h10 a12,12 0 0 1 0,24 h-12', 'none', 4) + pa('M96,70 q-8,-12 0,-24 M116,70 q-8,-12 0,-24', 'none', 3) + label(130, 30, 84, 'All clear', LI, 8)
@ill('drafts', 'A stack of draft cards with a pencil')
def _(): return blob(120, 100, 72, Y) + tg(70, 52, rr(0, 0, 90, 100, 14, C), -10) + tg(84, 48, rr(0, 0, 90, 100, 14, WH) + rr(14, 18, 60, 8, 4, OL, 0) + rr(14, 34, 46, 8, 4, '#B8BCC8', 0) + rr(14, 50, 52, 8, 4, '#B8BCC8', 0), 4) + tg(176, 120, pa('M0,0 l30,-50 l10,6 l-30,50 Z', OR) + pa('M0,0 l-2,12 l12,-6', PK, 2.5), 0)
@ill('exports', 'A download box full of finished clips')
def _(): return blob(120, 100, 72, PK) + rr(64, 92, 112, 56, 12, Y) + pa('M64,92 l20,-20 h72 l20,20', WH) + video_card(92, 40, 40, 56, PU, 'WOW', -8, 1, LI) + video_card(130, 44, 40, 56, C, 'OK', 6, 3, OR) + pa('M120,108 v22 M110,120 l10,10 l10,-10', 'none', 4)
@ill('team', 'Two people high-fiving')
def _(): return blob(120, 100, 72, C) + person(80, 110, 1.0, 1, '#2B1A10', PK, 0) + person(162, 110, 1.0, 3, '#1B0F08', Y, 1) + pa('M100,80 l12,-30 M142,80 l-12,-30', 'none', 6) + spark(121, 40, 11, Y)
@ill('audit', 'A clipboard with a checklist and magnifier')
def _(): return blob(120, 100, 72, LI) + rr(70, 40, 92, 116, 14, WH) + rr(96, 32, 40, 16, 6, OR) + ''.join(pa(f'M84,{72+i*22} l5,5 l9,-9', 'none', 3) + rr(106, 68+i*22, 44, 8, 4, '#B8BCC8', 0) for i in range(3)) + tg(176, 120, ci(0, 0, 18, WH, 4) + pa('M12,12 L28,28', 'none', 6))
@ill('payment', 'A credit card with a little warning sign')
def _(): return blob(120, 100, 72, OR) + tg(116, 98, rr(-62, -38, 124, 78, 14, BL) + rr(-62, -22, 124, 14, 0, OL, 0) + rr(-48, 14, 40, 10, 5, WH, 0), -6) + tg(184, 52, pa('M0,-22 L22,18 H-22 Z', Y) + pa('M0,-6 v10 M0,10 v1', 'none', 4))
@ill('brand', 'A palette with brushes and colour swatches')
def _(): return blob(120, 100, 72, C) + pa('M70,100 a50,40 0 1 1 100,0 c0,16 -18,10 -24,20 c-6,10 4,24 -26,24 a50,40 0 0 1 -50,-44 Z', WH) + ci(96, 80, 9, PK) + ci(122, 70, 9, Y) + ci(148, 84, 9, LI) + ci(100, 108, 9, BL) + spark(40, 46, 9, Y)
@ill('notfound_content', 'An empty video frame with a question sticker')
def _(): return blob(120, 100, 72, Y) + rr(66, 48, 108, 96, 16, WH) + pa('M110,82 l22,14 l-22,14 Z', C) + label(140, 32, 54, 'hmm', PK, 10)
