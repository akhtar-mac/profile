// Bundles dist/ into a single Cloudflare Worker (static files embedded as base64) with SPA fallback for /admin.
import fs from 'fs'; import path from 'path'
const root = 'dist', files = {}
const types = { html:'text/html; charset=utf-8', js:'text/javascript', css:'text/css', json:'application/json', svg:'image/svg+xml', png:'image/png', webp:'image/webp', avif:'image/avif', woff2:'font/woff2', pdf:'application/pdf', txt:'text/plain; charset=utf-8' }
const walk = d => fs.readdirSync(d).forEach(f => { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files['/' + path.relative(root, p)] = [types[p.split('.').pop()] || 'application/octet-stream', fs.readFileSync(p).toString('base64')] })
walk(root)
const worker = `const F=${JSON.stringify(files)};const C=new Map();
function get(p){if(!F[p])return null;if(!C.has(p)){const b=atob(F[p][1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);C.set(p,u)}return C.get(p)}
export default{async fetch(req){const url=new URL(req.url);let p=decodeURIComponent(url.pathname);if(p.endsWith('/'))p+='index.html';
let body=get(p),type=body&&F[p][0];
if(!body){if(/\\.[a-z0-9]+$/i.test(p))return new Response('Not found',{status:404});p='/index.html';body=get(p);type=F[p][0]}
const h={'content-type':type,'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'};
h['cache-control']=p.startsWith('/assets/')||p.startsWith('/fonts/')?'public, max-age=31536000, immutable':(p==='/index.html'?'no-cache':'public, max-age=86400');
return new Response(body,{headers:h})}}`
fs.writeFileSync('deploy/worker.js', worker)
const code = `async () => {
  const src = ${JSON.stringify(worker)};
  const b = 'F' + Date.now();
  const meta = { main_module: 'worker.js', compatibility_date: '2026-10-01' };
  const body = ['--' + b, 'Content-Disposition: form-data; name="metadata"', 'Content-Type: application/json', '', JSON.stringify(meta), '--' + b, 'Content-Disposition: form-data; name="worker.js"; filename="worker.js"', 'Content-Type: application/javascript+module', '', src, '--' + b + '--'].join('\\r\\n');
  const up = await cloudflare.request({ method: 'PUT', path: '/accounts/' + accountId + '/workers/scripts/akhtar-portfolio', body, contentType: 'multipart/form-data; boundary=' + b, rawBody: true });
  if (!up.success) return { step: 'upload', errors: up.errors };
  let sd = null; try { sd = await cloudflare.request({ method: 'GET', path: '/accounts/' + accountId + '/workers/subdomain' }) } catch (e) { sd = null }
  if (!sd || !sd.result?.subdomain) sd = await cloudflare.request({ method: 'PUT', path: '/accounts/' + accountId + '/workers/subdomain', body: { subdomain: 'akhtar-shaikh' } });
  const en = await cloudflare.request({ method: 'POST', path: '/accounts/' + accountId + '/workers/scripts/akhtar-portfolio/subdomain', body: { enabled: true, previews_enabled: false } });
  return { uploaded: up.success, subdomain: sd.result?.subdomain, enabled: en.success, errors: en.errors };
}`
fs.writeFileSync('deploy/cf-deploy.js', code)
console.log(Object.keys(files).length, 'files', (worker.length/1e6).toFixed(2), 'MB')
