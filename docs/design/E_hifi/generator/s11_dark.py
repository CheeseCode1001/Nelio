from frame import *
import frame
PAIRS = [('APP-01','filled'),('APP-01','empty'),('APP-01','loading'),('APP-03','filled'),('CL-03','filled'),('PB-03','filled'),('PB-05','filled'),('AN-01','filled'),('LI-01','filled'),('BI-01','filled'),('AG-01','filled'),('ON-01','filled'),('CP-02','filled'),('MB-01','filled'),('MB-08','filled'),('MB-03','empty')]
by = {s['id']: s for s in frame.SC}
theme('dark')
for sid, st in PAIRS:
    s = by[sid]
    lab = dict((x if isinstance(x, tuple) else (x, frame.LABELS.get(x, x.title()))) for x in s['states'])[st]
    CUR['page'] = 'dark'; CUR['row'] = 'DARK-' + sid + st
    s['fn'](st, 'Dark-' + fname(s['base'], st), f"Dark · {sid} {s['title']} · {lab}")
theme('light')
