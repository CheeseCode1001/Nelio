import sys, glob, importlib, json
sys.path.insert(0, '/tmp/nb2')
import lib2, canvas2
for m in sorted(x[:-3].split('/')[-1] for x in glob.glob('/tmp/nb2/s[0-9]*.py')): importlib.import_module(m)
c = canvas2.build(lib2.REG, lib2.ORDER, lib2.OUT + '/canvas.json')
pages = sys.argv[1:]
fs = [f for f in lib2.ORDER if not pages or lib2.REG[f]['page'] in pages]
print(len(lib2.ORDER), 'boards total;', len(fs), 'selected', file=sys.stderr)
print(json.dumps([{'as':'project/'+f,'path':lib2.OUT+'/'+f} for f in fs] + [{'as':'project/canvas.json','path':lib2.OUT+'/canvas.json'}]))
