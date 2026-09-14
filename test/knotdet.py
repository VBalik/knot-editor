"""Независимый инвариант: определитель узла |Δ(−1)| (Александер) по 3D-ломаной.
Проекция вдоль случайного направления, пересечения отрезков (numpy), дуги
Виртингера, точный целочисленный определитель (Барейс)."""
import json, sys, glob, random
import numpy as np
from multiprocessing import Pool

def bareiss(M):
    n=len(M)
    if n==0: return 1
    M=[row[:] for row in M]; prev=1; sign=1
    for k in range(n-1):
        if M[k][k]==0:
            sw=next((r for r in range(k+1,n) if M[r][k]!=0), None)
            if sw is None: return 0
            M[k],M[sw]=M[sw],M[k]; sign=-sign
        for i in range(k+1,n):
            for j in range(k+1,n):
                M[i][j]=(M[i][j]*M[k][k]-M[i][k]*M[k][j])//prev
        prev=M[k][k]
    return sign*M[n-1][n-1]

def crossings(V, d):
    V=np.asarray(V,float); N=len(V)
    d=d/np.linalg.norm(d)
    a=np.array([1.0,0,0]) if abs(d[0])<0.9 else np.array([0,1.0,0])
    e1=np.cross(d,a); e1/=np.linalg.norm(e1); e2=np.cross(d,e1)
    P=np.stack([V@e1, V@e2],1); z=V@d
    I,J=np.triu_indices(N,k=2)
    m=~((I==0)&(J==N-1)); I=I[m]; J=J[m]
    A=P[I]; B=P[(I+1)%N]; C=P[J]; D=P[(J+1)%N]
    r=B-A; q=D-C; ca=C-A
    den=r[:,0]*q[:,1]-r[:,1]*q[:,0]
    ok=np.abs(den)>1e-12*(np.linalg.norm(r,axis=1)*np.linalg.norm(q,axis=1)+1e-30)
    s=np.zeros(len(I)); t=np.zeros(len(I))
    s[ok]=(ca[ok,0]*q[ok,1]-ca[ok,1]*q[ok,0])/den[ok]
    t[ok]=(ca[ok,0]*r[ok,1]-ca[ok,1]*r[ok,0])/den[ok]
    hit=ok&(s>1e-9)&(s<1-1e-9)&(t>1e-9)&(t<1-1e-9)
    out=[]
    for i,j,si,ti in zip(I[hit],J[hit],s[hit],t[hit]):
        zi=z[i]+si*(z[(i+1)%N]-z[i]); zj=z[j]+ti*(z[(j+1)%N]-z[j])
        pi=i+si; pj=j+ti
        if zi>zj: out.append((pi,pj))   # (over_pos, under_pos)
        else: out.append((pj,pi))
    return out

def det_from_crossings(cr):
    n=len(cr)
    if n==0: return 1
    under=sorted((u,c) for c,(o,u) in enumerate(cr))
    upos=[u for u,c in under]; idx_of={c:m for m,(u,c) in enumerate(under)}
    import bisect
    def arc_of(p):
        k=bisect.bisect_right(upos,p)  # число событий <= p
        return (k-1)%n
    M=[[0]*n for _ in range(n)]
    for c,(o,u) in enumerate(cr):
        m=idx_of[c]; over=arc_of(o); inn=(m-1)%n; out=m
        M[c][over]+=2; M[c][inn]-=1; M[c][out]-=1
    sub=[row[:n-1] for row in M[:n-1]]
    return abs(bareiss(sub))

def robust_det(V, ndir=7, seed=1):
    rng=random.Random(seed); vals=[]
    for k in range(ndir):
        d=np.array([rng.gauss(0,1) for _ in range(3)])
        try: vals.append(det_from_crossings(crossings(V,d)))
        except Exception as e: vals.append(None)
    ok=[v for v in vals if v is not None]
    if not ok: return {'mode':None,'agree':0,'valid':0,'vals':vals}
    mode=max(set(ok), key=ok.count)
    return {'mode':mode,'agree':ok.count(mode),'valid':len(ok),'vals':vals}

def work(args):
    i,rec,final=args
    out={'i':i,'nc':rec['nc'],'N':rec['N'],'det2d':rec['det2d'],'runDet':rec['runDet'],'runUnknot':rec['runUnknot']}
    # проекция лифта строго вдоль z (диаграмма редактора) с крошечным наклоном
    try: out['liftZ']=det_from_crossings(crossings(rec['lift'], np.array([1e-3,2e-3,1.0])))
    except Exception as e: out['liftZ']=None
    out['lift']=robust_det(rec['lift'],7,100+i)
    out['feas']=robust_det(rec['feas'],7,200+i)
    out['final']=robust_det(final,7,300+i) if final is not None else None
    return out

if __name__=='__main__':
    S=sys.argv[1]
    dumps={}
    for f in glob.glob(S+'/dump_w?.jsonl'):
        for l in open(f):
            if l.strip(): r=json.loads(l); dumps[r['i']]=r
    finals={}
    for f in glob.glob(S+'/rk_w?.verts.jsonl'):
        for l in open(f):
            if l.strip(): r=json.loads(l); finals[r['i']]=r['verts']
    jobs=[(i,dumps[i],finals.get(i)) for i in sorted(dumps)]
    with Pool(8) as p: res=p.map(work, jobs)
    json.dump(res, open(S+'/exactdet.json','w'))
    lf=sum(1 for r in res if r['lift']['mode']==r['det2d'])
    lz=sum(1 for r in res if r['liftZ']==r['det2d'])
    fp=sum(1 for r in res if r['lift']['mode'] is not None and r['feas']['mode']==r['lift']['mode'])
    dp=sum(1 for r in res if r['feas']['mode'] is not None and r['final'] and r['final']['mode']==r['feas']['mode'])
    tp=sum(1 for r in res if r['lift']['mode'] is not None and r['final'] and r['final']['mode']==r['lift']['mode'])
    ag=lambda k: sorted(r[k]['agree'] for r in res if r[k])[len(res)//2]
    print(f"n={len(res)} liftZ==det2d: {lz}  lift(robust)==det2d: {lf}  feas==lift: {fp}  final==feas: {dp}  final==lift: {tp}")
    print('agree p50: lift',ag('lift'),'feas',ag('feas'),'final',ag('final'))
    print('editor runDet == exact lift mode:', sum(1 for r in res if r['runDet']==r['lift']['mode']))
    for r in res:
        L,F,Z=r['lift'],r['feas'],r['final']
        flag=('' if L['mode']==r['det2d'] else 'LIFT≠2D ')+('' if F['mode']==L['mode'] else 'FEAS≠LIFT ')+('' if Z['mode']==F['mode'] else 'FINAL≠FEAS ')
        if flag or L['agree']<7 or F['agree']<7 or Z['agree']<7:
            print(f"  i={r['i']:2d} nc={r['nc']:2d} det2d={r['det2d']} runDet={r['runDet']} liftZ={r['liftZ']} lift={L['mode']}({L['agree']}/{L['valid']}) feas={F['mode']}({F['agree']}/{F['valid']}) final={Z['mode']}({Z['agree']}/{Z['valid']}) {flag}")
