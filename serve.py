#!/usr/bin/env python3
# Дев-сервер проекта: статика + приём телеметрии релаксации.
# POST /save-telemetry сохраняет JSON в папку telemetry/ проекта —
# браузерное «скачивание» уносило файлы в Downloads/Desktop.
import http.server
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
TDIR = os.path.join(ROOT, 'telemetry')


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0].lstrip('/') == 'last-telemetry':
            try:
                names = sorted(n for n in os.listdir(TDIR) if n.endswith('.json'))
            except OSError:
                names = []
            if not names:
                self.send_error(404)
                return
            with open(os.path.join(TDIR, names[-1]), 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        # запрет кэша: браузер обязан всегда получать свежую сборку страницы
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        # CORS: страница, открытая файлом с диска, тоже должна уметь сохранять
        # и читать телеметрию через локальный сервер
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path.lstrip('/') != 'save-telemetry':
            self.send_error(404)
            return
        try:
            n = int(self.headers.get('Content-Length', 0))
        except ValueError:
            self.send_error(400)
            return
        if not 0 < n <= 200 * 1024 * 1024:
            self.send_error(413)
            return
        data = self.rfile.read(n)
        os.makedirs(TDIR, exist_ok=True)
        stamp = time.strftime('%Y%m%d-%H%M%S')
        ms = int(time.time() * 1000) % 1000
        name = f'knot-telemetry-{stamp}-{ms:03d}.json'
        with open(os.path.join(TDIR, name), 'wb') as f:
            f.write(data)
        body = json.dumps({'saved': f'telemetry/{name}'}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        try:
            with open(os.path.join(ROOT, 'serve.log'), 'a') as f:
                f.write(time.strftime('%H:%M:%S ') + (fmt % args) + '\n')
        except OSError:
            pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8742
    os.chdir(ROOT)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
