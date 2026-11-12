import json
PAGES = [('foundations','0 · Foundations & illustrations'),('motion','0b · Motion (GSAP)'),('flows','0c · Flows'),('public','1 · Public site'),('auth','2 · Sign in & onboarding'),('core','3 · Command Center & AI'),
         ('clipping','4 · Clipping & Content'),('publishing','5 · Calendar, approvals & publishing'),('analytics','6 · Analytics'),('licensing','7 · Licensing'),('creator','8 · Creator Portal'),
         ('agency','9 · Connections, agency & client portal'),('billing','10 · Billing & credits'),('settings','11 · Settings'),('admin','12 · Platform admin'),('system','13 · System & overlays'),
         ('mobile','14 · Mobile'),('dark','15 · Dark theme')]
KEEP_POS = {}
def build(reg, order, out):
    boards, notes, pages = {}, {}, []
    for pid, ptitle in PAGES:
        files = [f for f in order if reg[f]['page'] == pid]
        if not files: continue
        pages.append({"id": pid, "name": ptitle})
        rows = []
        for f in files:
            r = reg[f]['row']
            if rows and rows[-1][0] == r: rows[-1][1].append(f)
            else: rows.append((r, [f]))
        LEG = {'foundations':'Colour, type, components, stickers, skeletons and the 32 illustrations. Everything else on this canvas is built from these parts.',
               'motion':'Motion tokens and patterns. Implement with GSAP (useGSAP); respect prefers-reduced-motion.',
               'flows':'User journeys J-01 to J-15. Each card links to the real screens in order.',
               'mobile':'Native-style mobile app screens (future Expo app and PWA quick actions). Responsive mobile views of every web screen sit beside their desktop rows on the other pages.',
               'dark':'Dark theme reference screens. Every screen supports Light (default), Dark and System via tokens.'}
        txt = LEG.get(pid, 'Each row is one screen. Left: its desktop states (1440 px) in order: filled, empty, loading, then edge states. Right: one mobile board (390 px) showing the same states; modals open as bottom sheets on mobile.')
        notes['legend_' + pid] = {"x": 0, "y": 0, "text": ptitle + ' — ' + txt, "w": 720, "size": "m", "fill": "yellow" if False else "blue", "page": pid}
        y = 520; pack = []
        def place_line(fs, y, note=None):
            x = 0; mh = 0
            ny = y + (300 if note else 0)
            for f in fs:
                m = reg[f]
                b = {"x": x, "y": ny, "w": m['w'], "h": m['h'], "title": m['title'], "page": pid}
                if not m.get('fixed'): b["expand"] = "fill"
                if m.get('interactive'): b["is_interactive"] = True
                b.update(KEEP_POS.get(f, {}))
                boards[f] = b; x += m['w'] + 80; mh = max(mh, m['h'])
            if note:
                notes['n_' + note[0].replace(' ','_').replace('-','_')] = {"x": 0, "y": y, "text": note[1], "kind": "title1", "maxW": max(x - 80, 1200), "page": pid, "w": 240}
            return ny + mh + 160
        for r, fs in rows:
            if len(fs) == 1:
                pack.append(fs[0])
                per = 6 if reg[fs[0]]['w'] <= 400 else 3
                if len(pack) >= per: y = place_line(pack, y); pack = []
            else:
                if pack: y = place_line(pack, y); pack = []
                y = place_line(fs, y, (r, reg[fs[0]]['title'].split(' · ')[0]))
        if pack: y = place_line(pack, y)
    c = {"v": 3, "attachments": {}, "createdOnFiles": {"v": 1, "at": "2026-11-12T08:20:00Z"}, "title": "Nelio — High-fidelity UI", "launch": {"view": "canvas", "page": "foundations"},
         "pages": pages, "boards": boards, "order": list(order), "notes": notes, "designSystems": []}
    json.dump(c, open(out, 'w'), indent=1)
    return c
