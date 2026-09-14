// синтаксис исходника воркера: собрать _workerSource() и проверить new Function (без запуска)
(async ()=>{ let src=''; try{ src=_workerSource(); }catch(e){ return {err:'workerSource threw: '+e.message}; }
  const out={len:src.length};
  try{ new Function(src); out.syntax='OK'; }catch(e){ out.syntax='ERROR: '+e.message; }
  out.hasKey=/key:constsKey\(\)/.test(src); out.hasYieldTime=/performance\.now\(\)-tY>=100/.test(src); out.hasSetGuard=/if\(running && verts && verts\.length\)\{ thickCoef=m\.thick/.test(src);
  // в стенде document.currentScript нет → __PAGE_SRC пуст; собираем полный исходник (shim+страница+main) как в браузере и проверяем хелперы ядра
  try{ const fs=process.mainModule.require('fs'), path=process.mainModule.require('path');
    const page=fs.readFileSync(path.resolve(path.dirname(process.mainModule.filename),'..',process.env.KNOT_PAGE||'index.html'),'utf8');
    const m=page.match(/<script>\n([\s\S]*?)<\/script>/); const body=m?m[1]:'';
    const k=src.indexOf('self.onmessage'); const full=src.slice(0,k)+body+src.slice(k);
    out.fullLen=full.length; out.pageLen=body.length;
    try{ new Function(full); out.fullSyntax='OK'; }catch(e){ out.fullSyntax='ERROR: '+e.message; }
    const helpers=['_vlEnsure','_vlBuild','_cellKeys','_segDist','_flatCoords','_gridAssign','_gapScan','_sbKey','_ctFwdBack','jacobiEig','_waInit','_waLayout','_waViews','_waB64','_waMemInit'];
    out.helpers={}; for(const h of helpers) out.helpers[h]=new RegExp('function '+h+'\\(').test(full);
    out.hasWasmB64=/const WASM_B64='[A-Za-z0-9+\/=]{500,}';/.test(full); out.hasPairPass=/_waPair=r\.instance\.exports\.pairPass/.test(full) && /E=_waPair\(n, needGrad\?1:0, hasKR,/.test(full);   // 3.2: модуль и его вызов — внутри исходника воркера
    out.hasWaAwait=/self\.__noWasm=!!m\.noWasm; await _waInit\(\);/.test(src);
    out.helpersOk=helpers.every(h=>out.helpers[h]) && out.hasWasmB64 && out.hasPairPass && out.hasWaAwait;
  }catch(e){ out.fullErr=e.message; }
  return out; })()
