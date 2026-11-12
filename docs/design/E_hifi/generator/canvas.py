import json, sys, os, glob
sys.path.insert(0, '/tmp/nb')
PAGES = [('foundations','0 · Foundations'),('public','1 · Public site'),('auth','2 · Sign in & onboarding'),('core','3 · Command Center & AI'),
         ('clipping','4 · Clipping & Content'),('publishing','5 · Calendar, approvals & publishing'),('analytics','6 · Analytics'),
         ('licensing','7 · Licensing & Creator Portal'),('agency','8 · Connections, agency & client portal'),('billing','9 · Billing & credits'),
         ('settings','10 · Settings'),('admin','11 · Platform admin'),('system','12 · System screens'),('states','13 · States'),('mobile','14 · Mobile'),('light','15 · Light theme')]
TITLES = dict(PAGES)

def build(reg, order, out='/home/claude/nelio-design/project/canvas.json'):
    boards, notes = {}, {}
    for pid, ptitle in PAGES:
        files = [f for f in order if reg[f]['page'] == pid]
        if not files: continue
        y0 = 300; x = 0; y = y0; rowh = 0; n = 0
        per = 6 if all(reg[f]['w'] <= 400 for f in files) else 3
        for f in files:
            m = reg[f]
            if n and n % per == 0:
                y += rowh + 160; x = 0; rowh = 0
            b = {"x": x, "y": y, "w": m['w'], "h": m['h'], "title": m['title'], "page": pid}
            if not m.get('fixed'): b["expand"] = "fill"
            if m.get('interactive'): b["is_interactive"] = True
            boards[f] = b
            x += m['w'] + 80; rowh = max(rowh, m['h']); n += 1
        width = (per * (max(reg[f]['w'] for f in files) + 80)) - 80
        notes['t_' + pid] = {"x": 0, "y": 0, "text": ptitle.split(' · ',1)[1], "kind": "title1", "maxW": width, "page": pid}
    pages = [{"id": pid, "name": t} for pid, t in PAGES if any(reg[f]['page'] == pid for f in order)]
    c = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-11-12T08:20:00Z"}, "title": "Nelio — High-fidelity UI",
         "launch": {"view": "canvas", "page": "foundations"}, "pages": pages, "boards": boards, "order": list(order), "notes": notes, "designSystems": []}
    notes["sample"] = {"x": 1520, "y": 300, "text": "All names, numbers and media in these designs are illustrative sample data. Platform availability shows planned honest states: YouTube and Instagram are in development, TikTok and Facebook are coming later.", "w": 520, "fill": "teal", "page": "foundations"}
    with open(out, 'w') as f: json.dump(c, f, indent=1)
    return c
