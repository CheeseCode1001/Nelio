import sys,glob,importlib,json,re,os,shutil,filecmp
sys.path.insert(0,'/tmp/nb2')
import lib2, canvas2
for m in sorted(x[:-3].split('/')[-1] for x in glob.glob('/tmp/nb2/s[0-9]*.py')): importlib.import_module(m)
R=lib2.REG; O=lib2.ORDER; SRC=lib2.OUT
P1={'foundations','motion','flows','public','auth','core','clipping','publishing','analytics'}
URL={1:'https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu',2:'https://claude.ai/artifact/BiuxrSL32XBybSnDD4mmd6'}
parts={1:[f for f in O if R[f]['page'] in P1],2:[f for f in O if R[f]['page'] not in P1]}
mobpage={f for f in O if R[f]['page']=='mobile'}
for n,fs in parts.items():
    d=f'/home/claude/p{n}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    S=set(fs); other=URL[3-n]; changed=[]
    for f in fs:
        src = f'/home/claude/m/{f}' if f in mobpage else f'{SRC}/{f}'
        c=open(src).read()
        def fix(m):
            h=m.group(1)+'.dc.html'
            if h in S: return m.group(0)
            if m.group(1)+'-Mobile.dc.html' in S and (R[f].get('mobile') or f in mobpage): return f'href="{m.group(1)}-Mobile.dc.html"'
            return f'href="{other}" target="_blank" rel="noopener"'
        c2=re.sub(r'href="([A-Za-z0-9-]+)\.dc\.html"',fix,c)
        open(f'{d}/{f}','w').write(c2)
    cj=canvas2.build(R,fs,f'{d}/canvas.json')
    cj['title']=f'Nelio — High-fidelity UI · Part {n} of 2'
    cj['launch']={'view':'canvas','page':'public' if n==1 else 'licensing'}
    if n==2: cj['createdOnFiles']={'v':1,'at':'2026-11-12T10:00:00Z'}
    json.dump(cj,open(f'{d}/canvas.json','w'),indent=1)
    json.dump(fs,open(f'/tmp/p{n}.json','w'))
    print(n,len(fs),[p['id'] for p in cj['pages']])
