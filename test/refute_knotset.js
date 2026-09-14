(function(){
  const out={};
  const tryc=(name,f)=>{ try{ out[name]=f(); }catch(e){ out[name]='THROWS: '+e.message; } };
  tryc('set_empty',()=>window.__knotSet({}));
  tryc('set_thick',()=>window.__knotSet({thick:5}));
  tryc('set_rep',()=>window.__knotSet({rep:3}));
  tryc('set_kr',()=>window.__knotSet({kr:1}));
  tryc('H_set',()=>global.__H.set({thick:5}));
  out.typeof_KR_PER = typeof KR_PER; out.typeof_KR_BASE=typeof KR_BASE; out.KR_CONST=KR_CONST;
  return out;
})()
