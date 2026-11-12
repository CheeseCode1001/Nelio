import sys, glob, importlib
sys.path.insert(0,'/tmp/nb')
import lib, canvas
mods = sorted(m[:-3].split('/')[-1] for m in glob.glob('/tmp/nb/p[0-9]*.py'))
for m in mods: importlib.import_module(m)
c = canvas.build(lib.REG, lib.ORDER)
print(len(lib.ORDER), 'boards;', 'pages:', [p['id'] for p in c['pages']])
