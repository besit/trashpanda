// M4.9: annotate art in the browser (the idea is pxl's annotate mode). Paint over a picture, pin numbered notes, send;
// Claude reads the notes with exact pixel positions instead of a description.
// usage: node tools/annotate/serve.mjs [folder of PNGs] [port]
//   default folder tools/scratch/annotate, port 4330; open http://127.0.0.1:4330/
// Feedback is written next to the pictures: <name>.feedback.json and <name>.annotated.png.
// Local only: it listens on 127.0.0.1 and serves nothing outside the folder.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2] || 'tools/scratch/annotate'), port = Number(process.argv[3] || 4330);
fs.mkdirSync(dir, { recursive: true });
const safe = (name) => /^[\w.-]+$/.test(name) && !name.startsWith('.') ? path.join(dir, name) : null;
const send = (res, code, body, type = 'text/plain; charset=utf-8') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(body); };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, fs.readFileSync(path.join(here, 'index.html')), 'text/html; charset=utf-8');
  if (req.method === 'GET' && url.pathname === '/list') {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !f.endsWith('.annotated.png')).sort();
    return send(res, 200, JSON.stringify(files.map((f) => ({ name: f, feedback: fs.existsSync(path.join(dir, f.replace(/\.png$/, '.feedback.json'))) }))), 'application/json');
  }
  if (req.method === 'GET' && url.pathname.startsWith('/img/')) {
    const p = safe(decodeURIComponent(url.pathname.slice(5))); if (!p || !fs.existsSync(p)) return send(res, 404, 'not found');
    return send(res, 200, fs.readFileSync(p), 'image/png');
  }
  if (req.method === 'GET' && url.pathname.startsWith('/feedback/')) {
    const p = safe(decodeURIComponent(url.pathname.slice(10)).replace(/\.png$/, '.feedback.json'));
    return p && fs.existsSync(p) ? send(res, 200, fs.readFileSync(p), 'application/json') : send(res, 200, 'null', 'application/json');
  }
  if (req.method === 'POST' && url.pathname.startsWith('/feedback/')) {
    const name = decodeURIComponent(url.pathname.slice(10)), base = safe(name);
    if (!base || !name.endsWith('.png')) return send(res, 400, 'bad name');
    let body = ''; req.on('data', (d) => { body += d; if (body.length > 20e6) req.destroy(); });
    req.on('end', () => {
      try {
        const fb = JSON.parse(body), png = String(fb.annotated || '');
        delete fb.annotated; fb.time = new Date().toISOString();
        fs.writeFileSync(base.replace(/\.png$/, '.feedback.json'), JSON.stringify(fb, null, 1));
        if (png.startsWith('data:image/png;base64,')) fs.writeFileSync(base.replace(/\.png$/, '.annotated.png'), Buffer.from(png.slice(22), 'base64'));
        console.log(`feedback: ${name} (${(fb.notes || []).length} notes, ${(fb.marks || []).length} marked pixels)`);
        send(res, 200, 'ok');
      } catch (e) { send(res, 400, 'bad json'); }
    });
    return;
  }
  send(res, 404, 'not found');
}).listen(port, '127.0.0.1', () => console.log(`annotate: http://127.0.0.1:${port}/  (pictures in ${dir})`));
