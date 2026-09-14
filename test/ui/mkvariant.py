#!/usr/bin/env python3
# собрать копию index.html с подменённым блоком <style> из файла CSS: python3 mkvariant.py variant.css out.html
import sys,re
src=open(sys.argv[1] if len(sys.argv)>3 else 'index.html',encoding='utf-8').read() if False else open('../../index.html',encoding='utf-8').read()
css=open(sys.argv[1],encoding='utf-8').read()
i=src.index('<style>'); j=src.index('</style>')+len('</style>')
out=src[:i]+'<style>\n'+css+'\n</style>'+src[j:]
open(sys.argv[2],'w',encoding='utf-8').write(out); print('wrote', sys.argv[2], len(out))
