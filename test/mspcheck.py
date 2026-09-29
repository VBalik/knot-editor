# 7.0: Regina-оракул для сложности формы (proj_pd.js): PD-коды проекций сохранённой 3D-формы (shapepd.js) →
# Regina: число пересечений, упрощение, полином Джонса (у тривиального узла = 1). Запуск: python3 mspcheck.py <shapepd.json>
import json, sys, regina
from reglib import from_pd
D=json.load(open(sys.argv[1]))
print(D['file'], 'N', D['N'])
for k,rec in enumerate(D['dirs']):
    if rec.get('degenerate'): print(k, 'degenerate'); continue
    pd=rec['pd']
    try: L=from_pd(pd)
    except Exception as e: print(k, 'n', rec['n'], 'js valid', rec['valid'], 'comps', rec['comps'], 'js simp', rec['simp'], '| regina: from_pd failed', str(e)[:80]); continue
    M=regina.Link(L); M.simplify()
    small=L.size()<=60
    j=str(L.jones()) if small else None
    print(k, 'n', rec['n'], 'js valid', rec['valid'], 'comps', rec['comps'], 'js simp', rec['simp'], '| regina n', L.size(), 'comps', L.countComponents(), 'simplify→', M.size(), 'jones', j)
