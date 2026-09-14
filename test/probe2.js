(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('fixtures/telemetry/knot-telemetry-20260727-122902-734.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  const d=H.dbg();
  return { N:d.N, nc:(d.crossings||[]).length, L0:d.L0, status:d.status.slice(0,60) };
})()
