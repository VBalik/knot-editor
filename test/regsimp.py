# 7.0: Regina simplify() для списка PD-кодов (stdin: JSON [[...],[...]]; stdout: JSON [размеры после упрощения], -1 — PD не принят).
# Используется proj_pd.js как оракул сложности формы вместо rmoves.js (тот на больших диаграммах изредка «упрощает» до 0 ложно).
import json, sys, regina
from reglib import from_pd
out=[]
for pd in json.load(sys.stdin):
    try:
        L=from_pd(pd); L.simplify(); out.append(L.size())
    except Exception:
        out.append(-1)
print(json.dumps(out))
