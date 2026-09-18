// 4.2: перетаскивание картинки в поле 2D — подсветка зоны и передача файла в ikLoadFile.
// Оконные обработчики (защита от открытия файла браузером мимо зоны) стендом не проверяются: window.addEventListener в моках — заглушка.
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const left=H.el('left'), dt=(types, files)=>({ types, files, dropEffect:'', preventDefault(){ this.prevented=true; }, prevented:false });
  const ev=(o)=>{ const e={ dataTransfer:o, preventDefault(){ e.prevented=true; }, prevented:false }; return e; };
  const out={};
  // тянем файл над панелью — зона подсвечивается
  let e1=ev(dt(['Files'], [])); left.dispatch('dragenter', e1); out.enterLit=left.classList.contains('imgDrop'); out.enterPrevented=!!e1.prevented;
  let e2=ev(dt(['Files'], [])); left.dispatch('dragover', e2); out.overLit=left.classList.contains('imgDrop'); out.overPrevented=!!e2.prevented; out.dropEffect=e2.dataTransfer.dropEffect;
  // тянем текст, а не файл — зона не реагирует
  left.dispatch('dragleave', ev(dt(['Files'], [])));
  out.leaveClear=!left.classList.contains('imgDrop');
  let e3=ev(dt(['text/plain'], [])); left.dispatch('dragover', e3); out.textIgnored=!left.classList.contains('imgDrop') && !e3.prevented;
  // бросаем файл: среди нескольких выбирается картинка, вызывается ikLoadFile
  const orig=ikLoadFile; let got=null; ikLoadFile=async(f)=>{ got=f; };
  const png={name:'knot.png', type:'image/png'}, txt={name:'notes.txt', type:'text/plain'};
  left.dispatch('dragenter', ev(dt(['Files'], [])));
  const e4=ev(dt(['Files'], [txt, png])); left.dispatch('drop', e4);
  out.dropPrevented=!!e4.prevented; out.dropClear=!left.classList.contains('imgDrop'); out.picked=got && got.name;
  // файл без типа картинки всё равно отдаётся распознаванию (оно само скажет, что это не картинка)
  got=null; const e5=ev(dt(['Files'], [txt])); left.dispatch('drop', e5); out.pickedFallback=got && got.name;
  ikLoadFile=orig;
  out.ok=!!(out.enterLit && out.overLit && out.enterPrevented && out.overPrevented && out.dropEffect==='copy' && out.leaveClear
    && out.textIgnored && out.dropPrevented && out.dropClear && out.picked==='knot.png' && out.pickedFallback==='notes.txt');
  return out; })()
