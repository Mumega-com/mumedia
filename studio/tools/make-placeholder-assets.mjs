// Draws neutral placeholder brand assets (six arch-window "panes" + a logo disc) so the studio runs without any client art.
//   node tools/make-placeholder-assets.mjs        (needs playwright-core and Chrome; see README)  ->  assets/glass/<name>.png, assets/logo/logo.png
// Replace these files with your own art (same names, panes 925x975 with transparent corners, logo 300x300) to rebrand.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const here = path.dirname(new URL(import.meta.url).pathname); let chromium;
for (const base of [path.join(here, '..', 'package.json'), process.env.PLAYWRIGHT_CORE_FROM]) { if (!base) continue; try { chromium = createRequire(base)('playwright-core').chromium; break; } catch (e) { /* next */ } }
if (!chromium) { console.error('playwright-core not found: run npm install in studio/'); process.exit(2); }
const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 1000, height: 1100 } });
await page.setContent('<html><body style="margin:0;background:transparent"><canvas id="c" width="925" height="975"></canvas></body></html>');
const draw = (name) => page.evaluate((name) => {
  const c = document.getElementById('c'), x = c.getContext('2d'); x.clearRect(0, 0, 925, 975); const K = { cream: '#F6F1E4', gold: '#F2C14E', teal: '#4C9A8B', navy: '#2D4A6B', coral: '#E07A5F', green: '#7BA05B', plum: '#6D3F6B', ink: '#1D2B3A' };
  const arch = () => { x.beginPath(); x.moveTo(70, 930); x.lineTo(70, 470); x.arc(462.5, 470, 392.5, Math.PI, 0); x.lineTo(855, 930); x.closePath(); };
  const lead = (w = 8) => { x.lineWidth = w; x.strokeStyle = K.ink; x.lineJoin = 'round'; x.stroke(); };
  const poly = (pts, fill) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = fill; x.fill(); lead(); };
  const circ = (cx, cy, r, fill) => { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fillStyle = fill; x.fill(); lead(); };
  const rays = (cx, cy, r0, r1, n, fill) => { for (let i = 0; i < n; i++) { const a = Math.PI + (i + 0.5) * Math.PI / n, d = Math.PI / n * 0.42; poly([[cx + r0 * Math.cos(a - d), cy + r0 * Math.sin(a - d)], [cx + r1 * Math.cos(a - d), cy + r1 * Math.sin(a - d)], [cx + r1 * Math.cos(a + d), cy + r1 * Math.sin(a + d)], [cx + r0 * Math.cos(a + d), cy + r0 * Math.sin(a + d)]], fill); } };
  const hill = (y, fill, amp = 60) => { x.beginPath(); x.moveTo(60, 940); x.lineTo(60, y); x.bezierCurveTo(300, y - amp, 600, y + amp, 870, y); x.lineTo(870, 940); x.closePath(); x.fillStyle = fill; x.fill(); lead(); };
  x.save(); arch(); x.clip(); x.fillStyle = K.cream; x.fillRect(0, 0, 925, 975);
  if (name === 'shadow') { x.fillStyle = K.gold; x.fillRect(0, 0, 462, 700); x.fillStyle = K.navy; x.fillRect(462, 0, 463, 700); circ(250, 420, 110, '#F8D98B'); circ(680, 420, 110, K.cream); circ(720, 400, 95, K.navy); hill(700, K.ink, 40); }
  if (name === 'sage') { circ(462, 480, 260, K.gold); rays(462, 480, 270, 460, 11, K.cream); circ(462, 480, 150, K.cream); poly([[430, 800], [494, 800], [480, 520], [444, 520]], K.green); hill(820, K.teal, 50); }
  if (name === 'hero') { circ(462, 380, 130, K.gold); rays(462, 380, 140, 400, 9, K.cream); poly([[70, 800], [330, 430], [560, 800]], K.teal); poly([[330, 800], [620, 360], [860, 800]], K.navy); poly([[420, 940], [500, 940], [480, 800], [440, 800]], K.coral); }
  if (name === 'innocent') { circ(462, 420, 210, K.gold); rays(462, 420, 220, 420, 9, K.cream); hill(760, K.green, 70); x.beginPath(); x.ellipse(400, 640, 90, 40, -0.5, 0, 7); x.fillStyle = K.teal; x.fill(); lead(); x.beginPath(); x.ellipse(525, 630, 90, 40, 0.5, 0, 7); x.fillStyle = K.teal; x.fill(); lead(); poly([[455, 800], [470, 800], [470, 640], [455, 640]], K.green); }
  if (name === 'caregiver') { circ(462, 470, 230, K.coral); circ(462, 470, 120, K.gold); x.beginPath(); x.arc(462, 640, 330, Math.PI * 1.1, Math.PI * 1.9); x.lineWidth = 60; x.strokeStyle = K.cream; x.stroke(); lead(8); hill(840, K.teal, 40); }
  if (name === 'trickster') { for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) { const cx = 100 + q * 140, cy = 170 + r * 140; poly([[cx, cy - 70], [cx + 70, cy], [cx, cy + 70], [cx - 70, cy]], [K.coral, K.gold, K.teal, K.plum][(q + r) % 4]); } circ(462, 520, 90, K.cream); }
  x.restore(); arch(); lead(16); arch(); x.save(); x.translate(462, 480); x.scale(0.93, 0.93); x.translate(-462, -480); arch(); x.lineWidth = 6; x.strokeStyle = K.ink; x.stroke(); x.restore();
  return c.toDataURL('image/png');
}, name);
for (const n of ['shadow', 'sage', 'hero', 'innocent', 'caregiver', 'trickster']) fs.writeFileSync(path.join(here, '..', 'assets', 'glass', n + '.png'), Buffer.from((await draw(n)).split(',')[1], 'base64'));
const logo = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 300; c.height = 300; const x = c.getContext('2d'); x.beginPath(); x.arc(150, 150, 146, 0, 7); x.fillStyle = '#F6F1E4'; x.fill(); x.beginPath(); x.arc(150, 150, 130, 0, 7); x.fillStyle = '#2D4A6B'; x.fill(); x.fillStyle = '#F6F1E4'; x.font = 'bold 56px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LOGO', 150, 150); return c.toDataURL('image/png'); });
fs.writeFileSync(path.join(here, '..', 'assets', 'logo', 'logo.png'), Buffer.from(logo.split(',')[1], 'base64')); await browser.close(); console.log('placeholder assets written');
