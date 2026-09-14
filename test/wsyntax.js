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
    const helpers=['_vlEnsure','_vlBuild','_cellKeys','_segDist','_flatCoords','_gridAssign','_gapScan','_sbKey','_ctFwdBack','jacobiEig'];
    out.helpers={}; for(const h of helpers) out.helpers[h]=new RegExp('function '+h+'\\(').test(full);
    out.helpersOk=helpers.every(h=>out.helpers[h]);
  }catch(e){ out.fullErr=e.message; }
  return out; })()
