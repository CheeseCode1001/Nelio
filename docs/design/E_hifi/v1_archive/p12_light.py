import lib
from lib import CUR
MAP = {'p03_core.py': {'CommandCenter.dc.html': 'LightCommandCenter.dc.html', 'Strategist.dc.html': 'LightStrategist.dc.html'},
       'p04_clipping.py': {'ClippingStudio.dc.html': 'LightClippingStudio.dc.html'},
       'p05_publish.py': {'PostDetail.dc.html': 'LightPostDetail.dc.html'},
       'p07_agency.py': {'ClientApproval.dc.html': 'LightClientApproval.dc.html'},
       'p01_public.py': {'Pricing.dc.html': 'LightPricing.dc.html'},
       'p02_auth.py': {'OnbAutomation.dc.html': 'LightOnboarding.dc.html'},
       'p11_mobile.py': {'MobileHome.dc.html': 'LightMobileHome.dc.html', 'MobileClientApproval.dc.html': 'LightMobileClientApproval.dc.html'}}
orig_write, orig_theme = lib.write, lib.theme
saved = dict(CUR)
for mod, allow in MAP.items():
    def w(fname, content, allow=allow):
        if fname in allow:
            CUR['page'] = 'light'
            orig_write(allow[fname], content.replace('<title>', '<title>Light · ', 1))
    lib.write = w
    orig_theme('light'); lib.theme = lambda n: None
    src = open('/tmp/nb/' + mod).read()
    g = {'__name__': 'light_' + mod}
    exec(compile(src, mod, 'exec'), g)
    for k in allow.values():
        lib.REG[k]['title'] = 'Light · ' + lib.REG[k]['title']
lib.write, lib.theme = orig_write, orig_theme
orig_theme('dark'); CUR.update(saved)
