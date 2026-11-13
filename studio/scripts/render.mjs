// Minimal frame renderer (replaces the lemo library's video.mjs): serves a film folder over http, loads it in headless Chrome through playwright-core, calls window.render(t) per frame,
// pipes JPEG frames to ffmpeg. Several workers each render a contiguous range into a segment, then the segments are joined.
//   node scripts/render.mjs <film-dir> --size 1920x1080 --fps 24 --workers 3 --q "v=yt&pal=green" --out out.mp4 [--from s --to s]
import fs from 'fs'; import path from 'path'; import http from 'http'; import { spawn, execFileSync } from 'child_process'; import { createRequire } from 'module';
const here = path.dirname(new URL(import.meta.url).pathname); let chromium;
for (const base of [path.join(here, '..', 'package.json'), process.env.PLAYWRIGHT_CORE_FROM]) { if (!base) continue; try { chromium = createRequire(base)('playwright-core').chromium; break; } catch (e) { /* try the next place */ } }
if (!chromium) { console.error('playwright-core not found: run  npm install  in the studio folder (see README)'); process.exit(2); }
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const dir = path.resolve(a[0]), [W, H] = opt('--size', '1920x1080').split('x').map(Number), FPS = +opt('--fps', 24), WK = +opt('--workers', 3), Q = opt('--q', ''), out = path.resolve(opt('--out', 'out.mp4'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => { const p = path.join(dir, decodeURIComponent(req.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); } }); });
await new Promise((r) => server.listen(0, '127.0.0.1', r)); const port = server.address().port, url = `http://127.0.0.1:${port}/index.html${Q ? '?' + Q : ''}`;
const segDir = out + '.segs'; fs.rmSync(segDir, { recursive: true, force: true }); fs.mkdirSync(segDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function openPage() { const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); process.exit(3); }); await page.goto(url); await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 }); return page; }
const probe = await openPage(); const DUR = await probe.evaluate(() => window.DUR);
if (opt('--stills', null)) { const od = path.resolve(opt('--outdir', 'stills')); fs.mkdirSync(od, { recursive: true }); for (const t of opt('--stills').split(',').map(Number)) { await probe.evaluate((x) => window.render(x), t); fs.writeFileSync(path.join(od, `t_${t}.jpg`), await probe.screenshot({ type: 'jpeg', quality: 92 })); console.log('still', t); } await browser.close(); server.close(); process.exit(0); } const from = +opt('--from', 0), to = Math.min(+opt('--to', DUR), DUR);
const N0 = Math.floor(from * FPS), N1 = Math.ceil(to * FPS), per = Math.ceil((N1 - N0) / WK);
async function worker(k, page) {
  const s = N0 + k * per, e = Math.min(N1, s + per); if (s >= e) return null; const seg = path.join(segDir, `s${k}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', 'pipe:0', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r) => ff.on('close', r)); const t0 = Date.now();
  for (let f = s; f < e; f++) {
    await page.evaluate((t) => window.render(t), f / FPS); const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - s) % 600 === 0) console.log(`w${k} ${f - s}/${e - s}  ${Math.round((Date.now() - t0) / 1000)}s`);
  }
  ff.stdin.end(); await done; return seg;
}
const pages = [probe]; for (let k = 1; k < WK; k++) pages.push(await openPage());
const segs = (await Promise.all(pages.map((p, k) => worker(k, p)))).filter(Boolean);
fs.writeFileSync(path.join(segDir, 'list.txt'), segs.map((s) => `file '${s}'`).join('\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(segDir, 'list.txt'), '-c', 'copy', out]);
fs.rmSync(segDir, { recursive: true, force: true }); await browser.close(); server.close(); console.log('done', out, N1 - N0, 'frames');
