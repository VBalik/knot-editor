// Ядро пар energyGrad (index.html, v3.2) на AssemblyScript: обход списка Верле с сортировкой вставкой по ключу ячейки сетки 2.11,
// pairEval (арк-фильтр с клином 15 %, жёсткое ядро, профиль kR, хвост tailU/tailF, раздача сил весами 1−s,s,1−t,t) и _segDist —
// ТЕ ЖЕ операции в ТОМ ЖЕ порядке, что в JS (траектория бит-в-бит). Память импортирована (env.memory), массивы — смещения в ней.
// Возвращает E, продолжая сумму от E0 (E+=sw·U пара за парой, как в JS); offRes → f64×4: gmin, gminRep, gmin3, inf (0/1).
export function pairPass(n: i32, needGrad: i32, hasKR: i32,
  offVx: usize, offVy: usize, offVz: usize, offMx: usize, offMy: usize, offMz: usize, offFx: usize, offFy: usize, offFz: usize,
  offGcX: usize, offGcY: usize, offGcZ: usize, offVlStart: usize, offVlJ: usize, offOrdK: usize, offKR: usize, offRes: usize,
  S: f64, DC: f64, R: f64, L0: f64, kR: f64, u4: f64, tailU: f64, tailF: f64, E0: f64): f64 {
  const R2: f64 = R*R;                                   // как в JS: R2=R*R
  let E: f64 = E0, gmin: f64 = R, gminRep: f64 = R, gmin3: f64 = R; let inf: bool = false;
  const EPS: f64 = 1e-12;
  for (let i: i32 = 0; i < n; i++) {
    let q: i32 = load<i32>(offVlStart + (i << 2)); const qe: i32 = load<i32>(offVlStart + ((i + 1) << 2)); if (q == qe) continue;
    const ip: i32 = i + 1 == n ? 0 : i + 1;
    const mxi: f64 = load<f64>(offMx + (i << 3)), myi: f64 = load<f64>(offMy + (i << 3)), mzi: f64 = load<f64>(offMz + (i << 3));
    const cxi: i32 = load<i32>(offGcX + (i << 2)) - 1, cyi: i32 = load<i32>(offGcY + (i << 2)) - 1, czi: i32 = load<i32>(offGcZ + (i << 2)) - 1;
    let k: i32 = 0;
    for (; q < qe; q++) { const j: i32 = load<i32>(offVlJ + (q << 2));
      const mdx: f64 = load<f64>(offMx + (j << 3)) - mxi, mdy: f64 = load<f64>(offMy + (j << 3)) - myi, mdz: f64 = load<f64>(offMz + (j << 3)) - mzi;
      if (mdx*mdx + mdy*mdy + mdz*mdz > R2) continue;
      const dx: i32 = load<i32>(offGcX + (j << 2)) - cxi, dy: i32 = load<i32>(offGcY + (j << 2)) - cyi, dz: i32 = load<i32>(offGcZ + (j << 2)) - czi;   // 0..2 — сосед по сетке
      if (dx < 0 || dx > 2 || dy < 0 || dy > 2 || dz < 0 || dz > 2) continue;
      const key: i32 = ((dz*3 + dy)*3 + dx)*1048576 + j; let p: i32 = k++;   // вставкой: ранг ячейки, затем j
      while (p > 0 && load<i32>(offOrdK + ((p - 1) << 2)) > key) { store<i32>(offOrdK + (p << 2), load<i32>(offOrdK + ((p - 1) << 2))); p--; }
      store<i32>(offOrdK + (p << 2), key); }
    for (let p: i32 = 0; p < k; p++) { const j: i32 = load<i32>(offOrdK + (p << 2)) & 1048575; const jp: i32 = j + 1 == n ? 0 : j + 1;
      // ---- pairEval(i,ip,j,jp) ----
      const cd: i32 = min<i32>(j - i, n - (j - i));
      // ---- _segDist(i,ip,j,jp) (порт segdist.ts, бит-в-бит) ----
      const p1x: f64 = load<f64>(offVx + (i << 3)), p1y: f64 = load<f64>(offVy + (i << 3)), p1z: f64 = load<f64>(offVz + (i << 3));
      const p2x: f64 = load<f64>(offVx + (j << 3)), p2y: f64 = load<f64>(offVy + (j << 3)), p2z: f64 = load<f64>(offVz + (j << 3));
      const d1x: f64 = load<f64>(offVx + (ip << 3)) - p1x, d1y: f64 = load<f64>(offVy + (ip << 3)) - p1y, d1z: f64 = load<f64>(offVz + (ip << 3)) - p1z;
      const d2x: f64 = load<f64>(offVx + (jp << 3)) - p2x, d2y: f64 = load<f64>(offVy + (jp << 3)) - p2y, d2z: f64 = load<f64>(offVz + (jp << 3)) - p2z;
      const rx: f64 = p1x - p2x, ry: f64 = p1y - p2y, rz: f64 = p1z - p2z;
      const a: f64 = d1x*d1x + d1y*d1y + d1z*d1z, e: f64 = d2x*d2x + d2y*d2y + d2z*d2z, f: f64 = d2x*rx + d2y*ry + d2z*rz;
      let s: f64 = 0, t: f64 = 0;
      if (a <= EPS && e <= EPS) { s = 0; t = 0; }
      else if (a <= EPS) { s = 0; t = f / e; t = t < 0 ? 0 : (t > 1 ? 1 : t); }
      else { const c: f64 = d1x*rx + d1y*ry + d1z*rz;
        if (e <= EPS) { t = 0; s = -c / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); }
        else { const b: f64 = d1x*d2x + d1y*d2y + d1z*d2z, dn: f64 = a*e - b*b;
          if (dn > EPS) { s = (b*f - c*e) / dn; s = s < 0 ? 0 : (s > 1 ? 1 : s); } else s = 0;
          t = (b*s + f) / e;
          if (t < 0) { t = 0; s = -c / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); } else if (t > 1) { t = 1; s = (b - c) / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); } } }
      const sdx: f64 = (p1x + d1x*s) - (p2x + d2x*t), sdy: f64 = (p1y + d1y*s) - (p2y + d2y*t), sdz: f64 = (p1z + d1z*s) - (p2z + d2z*t);
      const x: f64 = Math.sqrt(sdx*sdx + sdy*sdy + sdz*sdz);
      // ---- конец _segDist ----
      if (x < gmin) gmin = x;
      if (cd > 3 && x < gmin3) gmin3 = x;
      const wArg: f64 = (<f64>cd*L0/(2*Math.max(x, 1e-12)) - 1)/0.15;   // арк-фильтр: cd·L0 > 2x, гладкий клин 15 %
      if (wArg <= 0) continue;
      if (x < gminRep) gminRep = x;
      const w: f64 = wArg >= 1 ? 1 : wArg, sw: f64 = w*w*(3 - 2*w);
      const dl: f64 = x - S;
      if (dl <= 1e-9*L0) { inf = true; continue; }                       // жёсткое ядро: состояние недопустимо
      if (dl >= DC) continue;
      const kRij: f64 = hasKR ? kR*Math.sqrt(load<f64>(offKR + (i << 3))*load<f64>(offKR + (j << 3))) : kR;   // профиль отталкивания
      const U: f64 = kRij*(u4/(dl*dl*dl*dl) - tailU + tailF*(dl - DC));
      E += sw*U;
      if (needGrad) {
        let dEdx: f64 = sw*kRij*(-4*u4/(dl*dl*dl*dl*dl) + tailF);
        if (wArg < 1) dEdx += 6*w*(1 - w)*U*(-(<f64>cd*L0)/(2*x*x*0.15));
        const fr: f64 = -dEdx/x;
        const ox: f64 = sdx*fr, oy: f64 = sdy*fr, oz: f64 = sdz*fr;
        const wa0: f64 = 1 - s, wa1: f64 = s, wb0: f64 = 1 - t, wb1: f64 = t;
        const ai: usize = i << 3, aip: usize = ip << 3, aj: usize = j << 3, ajp: usize = jp << 3;
        store<f64>(offFx + ai, load<f64>(offFx + ai) + ox*wa0); store<f64>(offFy + ai, load<f64>(offFy + ai) + oy*wa0); store<f64>(offFz + ai, load<f64>(offFz + ai) + oz*wa0);
        store<f64>(offFx + aip, load<f64>(offFx + aip) + ox*wa1); store<f64>(offFy + aip, load<f64>(offFy + aip) + oy*wa1); store<f64>(offFz + aip, load<f64>(offFz + aip) + oz*wa1);
        store<f64>(offFx + aj, load<f64>(offFx + aj) - ox*wb0); store<f64>(offFy + aj, load<f64>(offFy + aj) - oy*wb0); store<f64>(offFz + aj, load<f64>(offFz + aj) - oz*wb0);
        store<f64>(offFx + ajp, load<f64>(offFx + ajp) - ox*wb1); store<f64>(offFy + ajp, load<f64>(offFy + ajp) - oy*wb1); store<f64>(offFz + ajp, load<f64>(offFz + ajp) - oz*wb1);
      }
    }
  }
  store<f64>(offRes, gmin); store<f64>(offRes + 8, gminRep); store<f64>(offRes + 16, gmin3); store<f64>(offRes + 24, inf ? 1 : 0);
  return E;
}
