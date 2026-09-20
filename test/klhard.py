# 4.14 (стенд): ТРУДНЫЕ ТРИВИАЛЬНЫЕ УЗЛЫ ПО КОНСТРУКЦИИ КАУФМАНА–ЛАМБРОПУЛУ («Hard unknots and collapsing tangles»):
# N([p/q]+[r/s]) — числительное замыкание суммы двух рациональных сплетений; при |ps+qr|=1 это тривиальный узел.
# Перебираем дроби, строим диаграмму (spherogram), сертифицируем тривиальность в Regina (дополнение — полноторие),
# оставляем диаграммы без упрощающих ходов R1/R2 и меряем орбиту R3 (есть ли упрощаемая диаграмма без роста пересечений).
# Пишет out/hard/kl_summary.json и out/hard/kl_<p>_<q>_<r>_<s>.json (укладки для pdknot.js; минус = m).
# KL_MAX=<макс. |p|,|q|,|r|,|s|> (8), KL_MAXC=<макс. пересечений> (14), KL_ORBIT=<предел BFS по R3> (3000), KL_KEEP=<сколько экспортировать> (12)
import os, json, time, math, sys
import regina, spherogram
from spherogram import RationalTangle
from pd2plink import export

MAXF=int(os.environ.get('KL_MAX',8)); MAXC=int(os.environ.get('KL_MAXC',14)); ORB=int(os.environ.get('KL_ORBIT',3000)); KEEP=int(os.environ.get('KL_KEEP',12))

from reglib import noR12, r3orbit

fr=[(p,q) for q in range(1,MAXF+1) for p in range(-MAXF,MAXF+1) if math.gcd(abs(p),q)==1]
t0=time.time(); tested=0; unknots=0; hard=[]; seenSig=set(); notcert=0
for i,(p,q) in enumerate(fr):
    for (r,s) in fr[i:]:
        if abs(p*s+q*r)!=1: continue
        try:
            K=(RationalTangle(p,q)+RationalTangle(r,s)).numerator_closure()
        except Exception as e: continue
        if len(K.link_components)!=1: continue
        pd=[tuple(t) for t in K.PD_code()]
        n=len(pd)
        if n<6 or n>MAXC: continue
        L=regina.Link.fromPD([tuple(x+1 for x in t) for t in pd])   # Regina нумерует пряди с 1 (spherogram — с 0)
        if L.size()!=n or L.countComponents()!=1: continue
        tested+=1
        if not noR12(L): continue
        sig=L.sig()
        if sig in seenSig: continue
        seenSig.add(sig)
        if not L.complement().isSolidTorus(): notcert+=1; continue
        unknots+=1
        size,red,trunc=r3orbit(L, ORB)
        hard.append({'p':p,'q':q,'r':r,'s':s,'crossings':n,'pd':[list(t) for t in pd],'sig':sig,'orbit':size,'orbitReducible':red,'orbitTruncated':trunc})
        print(f'hard {n}c  N([{p}/{q}]+[{r}/{s}])  orbit {size}{"+" if trunc else ""} reducible={red}', file=sys.stderr)
hard.sort(key=lambda h:(h['orbitReducible'], h['crossings'], h['orbit']))
strong=[h for h in hard if not h['orbitReducible']]
print(f'fractions {len(fr)} tested {tested} certified-hard {unknots} (strong {len(strong)}) not-certified {notcert} {time.time()-t0:.1f}s', file=sys.stderr)
os.makedirs('out/hard', exist_ok=True)
exported=[]
for h in hard[:KEEP]:
    nm=f"kl_{h['p']}_{h['q']}_{h['r']}_{h['s']}".replace('-','m')
    export(nm, h['pd'], {'fractions':[h['p'],h['q'],h['r'],h['s']], 'orbit':h['orbit'], 'orbitReducible':h['orbitReducible'], 'orbitTruncated':h['orbitTruncated']})
    h['name']=nm; exported.append(nm)
json.dump({'params':{'max':MAXF,'maxc':MAXC,'orbit':ORB},'tested':tested,'hard':hard,'exported':exported}, open('out/hard/kl_summary.json','w'))
print(json.dumps({'tested':tested,'hard':len(hard),'strong':len(strong),'exported':exported}))
