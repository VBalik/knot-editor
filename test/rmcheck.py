# 5.0: Regina-оракул для rmoves.js: тип узла после серии R3 и после упрощения должен совпасть с исходным
import json, os, regina
from reglib import from_pd
D=json.load(open('out/ann/rm_test.json'))
for nm,rec in D.items():
    src='out/hard/%s.json'%nm
    if not os.path.exists(src): src='out/hard/pd_%s.json'%nm
    pd0=json.load(open(src))['pd']; L0=from_pd(pd0)
    small=L0.size()<=50
    inv=lambda L: (str(L.jones()) if small else None)
    j0=inv(L0); res=[]
    if rec['r3']['pdAfter'] is not None:
        L1=from_pd(rec['r3']['pdAfter']); same=(inv(L1)==j0) if small else None
        res.append('R3 x%d: n %d valid jones-same %s'%(rec['r3']['moves'], L1.size(), same))
    pd2=rec['simp']['pd']
    if pd2:
        L2=from_pd(pd2); same=(inv(L2)==j0) if small else None; st=''
        if not small: M=regina.Link(L2); M.simplify(); st='regina simplify→%d'%M.size()
        res.append('simplified: n %d jones-same %s %s'%(L2.size(), same, st))
    else: res.append('simplified to 0 crossings')
    print(nm, '|', ' | '.join(res))
