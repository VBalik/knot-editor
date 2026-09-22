# 5.0: ПРОВЕРКА СНЯТИЯ НУГАТОРНОГО ПЕРЕСЕЧЕНИЯ (Link.nugatory в rmoves.js / index.html) оракулом Regina.
# Из двух узлов K1, K2 строится диаграмма K1 # K2 с одним нугаторным пересечением между ними (не снимается R1/R2),
# движок должен его снять (и, возможно, упростить дальше), а полином Джонса должен остаться прежним.
# Запуск: python3 nugtest.py  (нужны pip regina, node)
import json, subprocess, sys, itertools
import regina
def pd_of(L):
    return [list(x) for x in L.pdData()]
def positions(pd):
    n=len(pd); M=2*n; info={}   # (crossing, pos) -> (label, 'in'|'out')
    for ci,(i,j,k,l) in enumerate(pd):
        lj = (j==l+1) or (l==M and j==1)
        info[(ci,0)]=(i,'in'); info[(ci,2)]=(k,'out')
        info[(ci,1)]=(j,'out' if lj else 'in'); info[(ci,3)]=(l,'in' if lj else 'out')
    return info
def nug_sum(pd1, pd2, x=1, y=1, twist=0):
    n1,n2=len(pd1),len(pd2); m1,m2=2*n1,2*n2
    # порядок обхода: x_a, y_b, дуги K2 после y (y+1..m2, 1..y-1), y_a, x_b, дуги K1 после x (x+1..m1, 1..x-1)
    seq=['xa','yb']+[('k2',a) for a in list(range(y+1,m2+1))+list(range(1,y))]+['ya','xb']+[('k1',a) for a in list(range(x+1,m1+1))+list(range(1,x))]
    lab={s:i+1 for i,s in enumerate(seq)}
    out=[]
    for tag,pd,ax,xa,xb in (('k1',pd1,x,'xa','xb'),('k2',pd2,y,'ya','yb')):
        info=positions(pd)
        for ci,cr in enumerate(pd):
            row=[]
            for p in range(4):
                a,io=info[(ci,p)]
                if a==ax: row.append(lab[xa] if io=='out' else lab[xb])   # там, где дуга x выходила из пересечения K1, теперь x_a (идёт в c); где входила — x_b (идёт из c)
                else: row.append(lab[(tag,a)])
            out.append(row)
    # новое пересечение: под x_a→y_b, над y_a→x_b; против часовой [x_a, x_b, y_b, y_a] или зеркально [x_a, y_a, y_b, x_b]
    c=[lab['xa'],lab['xb'],lab['yb'],lab['ya']] if twist==0 else [lab['xa'],lab['ya'],lab['yb'],lab['xb']]
    out.append(c); return out
def jones(L):
    try: return str(L.jones())
    except Exception as e: return 'err '+str(e)
E=regina.ExampleLink
base={'trefoil':E.trefoil(),'fig8':E.figureEight(),'t25':E.torus(2,5),'t34':E.torus(3,4),'conway':E.conway(),'kt':E.kinoshitaTerasaka()}
cases=[]
for (a,b) in [('trefoil','trefoil'),('trefoil','fig8'),('fig8','t25'),('t34','trefoil'),('conway','fig8'),('kt','t25'),('t25','t34')]:
    for tw in (0,1):
        for x,y in ((1,1),(2,3)):
            pd=nug_sum(pd_of(base[a]),pd_of(base[b]),x,y,tw); L=regina.Link.fromPD(pd)
            cases.append({'name':f'{a}#{b} tw{tw} x{x}y{y}','pd':pd,'jones':jones(L),'n':L.size(),'comps':L.countComponents()})
res=json.loads(subprocess.run(['node','nugrun.js'],input=json.dumps(cases),capture_output=True,text=True,check=True).stdout)
ok=True
for c,r in zip(cases,res):
    j0=c['jones']; row={'name':c['name'],'n':c['n'],'comps':c['comps'],'valid':r['valid'],'nugFaces':r['nugFaces'],'nugRemoved':r['nugRemoved'],'nAfterNug':r.get('nAfterNug'),'validAfterNug':r.get('validAfterNug'),'nReduce':r['nReduce'],'nSimp':r['nSimp']}
    for key,pdk in (('jNug','pdNug'),('jReduce','pdReduce'),('jSimp','pdSimp')):
        if pdk in r:
            Lx=regina.Link.fromPD(r[pdk]) if r[pdk] else regina.Link(1)
            row[key]= 'same' if jones(Lx)==j0 else 'DIFF '+jones(Lx)+' vs '+j0
        else: row[key]='err '+r.get(pdk+'Err','')
    bad = c['comps']!=1 or not r['valid'] or not r['nugRemoved'] or row['jNug']!='same' or row['jReduce']!='same' or row['jSimp']!='same'
    ok = ok and not bad
    print(('BAD ' if bad else 'ok  ')+json.dumps(row))
print('ALL OK' if ok else 'FAILURES')
