import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const built = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status ?? 1);
const root = join(process.cwd(), 'dist');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css'};
createServer((req,res)=>{ const url = req.url === '/' ? '/index.html' : req.url || '/index.html'; const path = join(root, url.slice(1)); if(!existsSync(path)){res.writeHead(404); res.end('Not found'); return;} res.writeHead(200, {'content-type': types[extname(path)] ?? 'text/plain'}); res.end(readFileSync(path)); }).listen(5173, '0.0.0.0', ()=>console.log('Business OS MVP running at http://localhost:5173'));
