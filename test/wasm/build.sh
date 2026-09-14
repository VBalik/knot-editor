#!/bin/sh
# Сборка ядра пар (v3.2): pairs.ts → pairs.wasm (+ pairs.wat для чтения), затем base64 модуля вписывается в index.html
# (единственная строка const WASM_B64='…';). Компилятор — dev-зависимость test/node_modules (asc 0.28); без SIMD, память импортируется.
set -e
cd "$(dirname "$0")"
../node_modules/.bin/asc pairs.ts -o pairs.wasm -t pairs.wat --runtime stub --importMemory --initialMemory 1 --noAssert -O3 --converge
node - <<'EOF'
const fs=require('fs'), path=require('path');
const wasm=fs.readFileSync('pairs.wasm'), b64=wasm.toString('base64');
const page=path.join('..','..','index.html'); let src=fs.readFileSync(page,'utf8');
const re=/^const WASM_B64='[A-Za-z0-9+\/=]*';/mg; const hits=src.match(re)||[];
if(hits.length!==1){ console.error('WASM_B64 line: expected exactly 1 occurrence, found '+hits.length); process.exit(1); }
src=src.replace(re, "const WASM_B64='"+b64+"';");
fs.writeFileSync(page, src);
console.log('pairs.wasm '+wasm.length+' bytes, base64 '+b64.length+' chars → index.html');
EOF
