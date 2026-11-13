// Vertical cuts (1080x1920): ?pal=yellow|red|green and a `meta` block in the timeline (title lines, speaker, end-card text). One page, three films: ?v=short | story1 | story2 | reel (reads timeline-<v>.json).
// One page, three films: ?v=short | story1 | story2 (reads timeline-<v>.json). window.render(t) draws everything: ground, stained-glass wall, featured archetype pane (hinge flip per topic),
// topic chip, voice-driven waveform, captions (the speaker's own words, hand-corrected: a native reader proofreads them), title card and end card.
// Art: six archetype panes (assets/glass; the repo ships neutral placeholders, bring your own art), your logo (assets/logo). Persian type: Al Bayan Bold, Latin and digits: Arial Bold. Deterministic.
(function () {
  const W = 1080, H = 1920, Z = '‌';
  const PAL = new URLSearchParams(location.search).get('pal') || 'yellow';      // yellow = red ground + yellow accents | red = red ground + copper/cream accents | green = forest-green ground + copper/cream accents
  const ACC = PAL === 'yellow' ? { yellow: '#F6DA3A', mint: '#E4F0E6', sage: '#9DB9A6', green: '#0B5A2A', ink: '#3A0507' } : { yellow: '#C9A27A', mint: '#EBDFD3', sage: '#B0C4B9', green: '#1B4332', ink: '#1B4332' };
  const BG = PAL === 'green' ? { frame: '#5E8F7B', g0: '#2F5648', g1: '#183A2B', g2: '#08150F', dark: '5,17,12', tint: '10,34,25', ray: '214,236,206' } : { frame: '#9A2620', g0: '#6A0A0C', g1: '#33060A', g2: '#110102', dark: '21,2,3', tint: '62,5,8', ray: '255,224,170' };
  const C = Object.assign({ white: '#FFFFFF', red: BG.frame }, ACC);
  const META = () => TL.meta || {}, M = (k, d) => (k in META() ? META()[k] : d), CLUB = () => M('clubName', 'نام باشگاه'), SPK = () => M('speaker', ''), TITLE = () => M('titleLines', ['عنوان سخنرانی', 'بخش برجسته', 'سطر سوم']), SUB = () => M('subtitle', 'English subtitle');
  const EC = () => Object.assign({ chip1: 'برچسب اول', chip2: 'برچسب دوم', dateLabel: 'شروع از', dateTop: 'Start date', dateLine: 'روز و ساعت', handle: '@yourhandle', line2: 'contact: you@example.com', showChips: true, showDate: true, facilitatorLabel: 'تسهیل' + Z + 'گر: ' }, META().endCard || {});
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), inv = (a, b, x) => clamp((x - a) / (b - a)), o3 = (t) => 1 - Math.pow(1 - clamp(t), 3), lerp = (a, b, t) => a + (b - a) * t;
  const FA = (px) => `bold ${px}px "Al Bayan"`, LAT = (px) => `bold ${px}px Arial`;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const ORDER = ['hero', 'sage', 'trickster', 'caregiver', 'shadow', 'innocent'], GL = {}; let logo = null, TL = null;
  const PAN = { cx: W / 2, cy: 868, w: 607, h: 640 };
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });
  function txt(ctx, s, x, y, font, fill, align = 'center', dir = 'rtl') { ctx.font = font; ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = fill; ctx.fillText(s, x, y); }
  function pill(ctx, x, y, w, h, fill, stroke, lw, r) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
  const NOEND = new Set(['در', 'با', 'که', 'و', 'به', 'از', 'تا', 'را', 'رو', 'یه', 'این', 'اون', 'مال', 'برای', 'هم', 'یا', 'چه']);
  function wrap(ctx, s, font, maxW) {                                       // one line if it fits, else the most balanced two-line split (never ending a line on a preposition, prefer breaking after a comma)
    ctx.font = font; ctx.direction = 'rtl'; const ws = s.split(' '), m = (x) => ctx.measureText(x).width; if (m(s) <= maxW) return [s];
    let best = null;
    for (let i = 1; i < ws.length; i++) {
      const l1 = ws.slice(0, i).join(' '), l2 = ws.slice(i).join(' '), w1 = m(l1), w2 = m(l2); if (Math.max(w1, w2) > maxW) continue;
      let pen = Math.abs(w1 - w2) / maxW; if (NOEND.has(ws[i - 1])) pen += 1; if (/[،,]$/.test(l1)) pen -= 0.5; if (!best || pen < best.pen) best = { pen, l: [l1, l2] };
    }
    if (best) return best.l;
    const lines = []; let cur = ''; for (const w of ws) { const t = cur ? cur + ' ' + w : w; if (m(t) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines;
  }
  function fitPx(ctx, s, px, maxW) { let p = px; ctx.direction = 'rtl'; while (p > 24) { ctx.font = FA(p); if (ctx.measureText(s).width <= maxW) break; p -= 2; } return p; }
  const OC = document.createElement('canvas'); OC.width = 925; OC.height = 975; const octx = OC.getContext('2d');
  function pane(name, ign) { octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, 925, 975); octx.globalCompositeOperation = 'source-over'; octx.drawImage(GL[name], 0, 0, 925, 975); octx.globalCompositeOperation = 'source-atop'; octx.fillStyle = `rgba(${BG.tint},${0.5 * (1 - ign)})`; octx.fillRect(0, 0, 925, 975); octx.globalCompositeOperation = 'source-over'; return OC; }

  // ───────── ground: the channel's red, a dim wall of panes, a red frame ─────────
  function ground(ctx, t, o = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG.g0); g.addColorStop(0.45, BG.g1); g.addColorStop(1, BG.g2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cw = 270, ch = 292, a = o.wall ?? 0.15;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) {
      const im = GL[ORDER[(c + 2 * r) % 6]], dy = 9 * Math.sin(2 * Math.PI * t / 12 + c * 1.7 + r), pulse = 1 + 0.45 * (o.lit ?? 0) * Math.sin(2 * Math.PI * t / 12 + c * 0.9 + r * 0.7);
      ctx.save(); ctx.globalAlpha = a * pulse; ctx.drawImage(im, c * cw + 14, r * ch + 10 + dy - 40, cw - 28, ch - 24); ctx.restore();
    }
    const v = ctx.createRadialGradient(W / 2, 860, 260, W / 2, 900, 1250); v.addColorStop(0, `rgba(${BG.dark},0)`); v.addColorStop(1, `rgba(${BG.dark},0.62)`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  function frame(ctx) { ctx.save(); rr(ctx, 30, 30, W - 60, H - 60, 44); ctx.lineWidth = 16; ctx.strokeStyle = C.red; ctx.stroke(); rr(ctx, 52, 52, W - 104, H - 104, 30); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(201,162,122,0.28)'; ctx.stroke(); ctx.restore(); }
  function logoDisc(ctx, cx, cy, d) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 7, 0, 7); ctx.fillStyle = C.yellow; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 3, 0, 7); ctx.fillStyle = C.white; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.clip(); ctx.drawImage(logo, cx - d / 2, cy - d / 2, d, d); ctx.restore(); }
  function titleBlock(ctx, cx, y, px, ink, hiInk) {                           // «آرکه‌تایپ‌ها / (کهن‌الگوهای) / درون من» stacked, yellow marker on the middle line
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; const T = TITLE(), l1 = T[0], l2 = T[1] || '', l3 = T[2] || '';
    if (!l2) { txt(ctx, l1, cx, y + px * 0.5, FA(fitPx(ctx, l1, px * 1.15, 900)), ink); return y + px * 1.0; }
    ctx.font = FA(px * 0.78); const w2 = ctx.measureText(l2).width; ctx.save(); ctx.fillStyle = C.yellow; rr(ctx, cx - w2 / 2 - 44, y + px * 1.02 - px * 0.78 * 0.86, w2 + 88, px * 0.78 * 1.2, 18); ctx.fill(); ctx.restore();
    txt(ctx, l1, cx, y, FA(px), ink); txt(ctx, l2, cx, y + px * 1.02, FA(px * 0.78), hiInk); if (l3) txt(ctx, l3, cx, y + px * 1.02 + px * 0.95, FA(px), ink); return y + (l3 ? px * 1.97 : px * 1.12);
  }
  function datePill(ctx, cx, y, w, h) {
    pill(ctx, cx - w / 2, y, w, h, C.yellow, C.ink, 4, 34);
    ctx.font = FA(40); ctx.direction = 'rtl'; const E = EC(), wA = ctx.measureText(E.dateLabel).width; ctx.font = LAT(40); ctx.direction = 'ltr'; const wB = ctx.measureText(E.dateTop).width, gap = 18, tot = wA + wB + gap;
    let xr = cx + tot / 2; txt(ctx, E.dateLabel, xr, y + h * 0.42, FA(40), C.ink, 'right'); xr -= wA + gap; txt(ctx, E.dateTop, xr, y + h * 0.42, LAT(40), C.ink, 'right', 'ltr');
    const s = E.dateLine; txt(ctx, s, cx, y + h * 0.84, FA(fitPx(ctx, s, 38, w - 50)), C.ink);
  }
  // ───────── cards ─────────
  function titleCard(ctx, t) {
    ground(ctx, t, { wall: 0.24, lit: 0.2 }); ctx.fillStyle = `rgba(${BG.dark},0.5)`; ctx.fillRect(0, 0, W, H); frame(ctx);
    const a = o3(inv(0.0, 0.5, t)); ctx.save(); ctx.translate(0, (1 - a) * 24);
    logoDisc(ctx, W / 2, 380, 150); txt(ctx, CLUB(), W / 2, 520, FA(48), C.white);
    const yb = titleBlock(ctx, W / 2, 680, 124, C.white, C.ink); if (SUB()) txt(ctx, SUB(), W / 2, yb + 90, LAT(44), C.white, 'center', 'ltr');
    const s = M('topic', ''), px = 60; if (s) { ctx.font = FA(px); const tw = ctx.measureText(s).width + 90; pill(ctx, W / 2 - tw / 2, yb + 150, tw, 100, C.mint, C.green, 4, 32); txt(ctx, s, W / 2, yb + 150 + 71, FA(px), C.green); }
    if (SPK()) txt(ctx, SPK(), W / 2, yb + 370, FA(46), C.sage); const ses = M('session', ''); if (ses) txt(ctx, ses, W / 2, yb + 430, LAT(36), C.white, 'center', 'ltr'); ctx.restore();
  }
  function endCard(ctx, t, tt) {
    ground(ctx, t, { wall: 0.30, lit: 0.4 }); ctx.fillStyle = `rgba(${BG.dark},0.58)`; ctx.fillRect(0, 0, W, H); frame(ctx);
    const a = o3(inv(0, 0.5, tt)); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 22);
    logoDisc(ctx, W / 2, 360, 130); const yb = titleBlock(ctx, W / 2, 520, 108, C.white, C.ink); if (SUB()) txt(ctx, SUB(), W / 2, yb + 84, LAT(42), C.white, 'center', 'ltr');
    if (SPK()) txt(ctx, EC().facilitatorLabel + SPK(), W / 2, yb + 166, FA(42), C.yellow);
    const chip = (cx, label, fill, stroke, ink) => { pill(ctx, cx - 130, yb + 200, 260, 90, fill, stroke, 4, 30); txt(ctx, label, cx, yb + 200 + 64, FA(52), ink); };
    const E_ = EC(); if (E_.showChips) { chip(W / 2 - 150, E_.chip1, C.mint, C.green, C.green); chip(W / 2 + 150, E_.chip2, C.yellow, C.ink, C.ink); }
    if (E_.showDate) datePill(ctx, W / 2, yb + 332, 900, 140);
    const y2 = yb + (EC().showDate ? 510 : 330); pill(ctx, W / 2 - 450, y2, 900, 150, `rgba(${BG.dark},0.78)`, C.yellow, 3, 30);
    txt(ctx, EC().handle, W / 2, y2 + 62, LAT(44), C.white, 'center', 'ltr'); txt(ctx, EC().line2, W / 2, y2 + 122, LAT(38), C.white, 'center', 'ltr');
    ctx.restore();
  }
  // ───────── content frame ─────────
  function content(ctx, t) {
    const lt = t - TL.lead, ps = TL.events;                                  // topic events: {t, chip, pane}
    let k = 0; for (let i = 0; i < ps.length; i++) if (t >= ps[i].t - 1e-6) k = i;
    const ev = ps[k], prevEv = ps[Math.max(0, k - 1)], tf = t - ev.t;
    ground(ctx, t, { wall: 0.15, lit: 0 }); frame(ctx);
    const cx = PAN.cx, cy = PAN.cy;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy); ctx.rotate(t / 60 * (2 * Math.PI / 14)); for (let i = 0; i < 14; i++) { ctx.rotate(2 * Math.PI / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34, -1100); ctx.lineTo(34, -1100); ctx.closePath(); ctx.fillStyle = `rgba(${BG.ray},0.05)`; ctx.fill(); } ctx.restore();
    const gl = ctx.createRadialGradient(cx, cy, 80, cx, cy, 560); gl.addColorStop(0, 'rgba(201,162,122,0.30)'); gl.addColorStop(1, 'rgba(201,162,122,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    const flips = k > 0 && prevEv.pane !== ev.pane, fl = flips ? inv(0, 0.5, tf) : 1, name = fl < 0.5 ? prevEv.pane : ev.pane, sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * fl))), ign = fl < 0.5 ? 1 : o3(inv(0.45, 1.3, flips ? tf : 9));
    const br = 1 + 0.012 * Math.sin(2 * Math.PI * t / 12); ctx.save(); ctx.translate(cx, cy); ctx.scale(sx * br, br); ctx.shadowColor = 'rgba(201,162,122,0.45)'; ctx.shadowBlur = 50; ctx.drawImage(pane(name, ign), -PAN.w / 2, -PAN.h / 2, PAN.w, PAN.h); ctx.restore();
    // identity (top): club name + logo, speaker name
    logoDisc(ctx, 936, 336, 76); txt(ctx, CLUB(), 874, 336, FA(40), C.white, 'right'); if (SPK()) txt(ctx, SPK(), 874, 384, FA(32), C.sage, 'right');
    // topic chip: cross-fades when the topic changes
    const cf = (e, a) => { if (!e.chip) return; const s = fitPx(ctx, e.chip, 52, 840); ctx.font = FA(s); const w = ctx.measureText(e.chip).width + 84; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 14); pill(ctx, W / 2 - w / 2, 436, w, 92, C.mint, C.green, 3, 30); txt(ctx, e.chip, W / 2, 436 + 66, FA(s), C.green); ctx.restore(); };
    if (k > 0 && prevEv.chip !== ev.chip && tf < 0.5) { cf(prevEv, 1 - o3(inv(0, 0.25, tf))); cf(ev, o3(inv(0.2, 0.5, tf))); } else cf(ev, k === 0 && TL.hasTitle ? o3(inv(0, 0.5, tf)) : 1);
    // voice waveform (24 bars) driven by the real loudness
    const fi = Math.floor(lt * 24), N = 29, e = TL.env; ctx.save(); ctx.fillStyle = C.yellow;
    for (let i = 0; i < N; i++) { const d = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2), j = fi - Math.round(Math.abs(i - (N - 1) / 2) * 1.2), v = (e[clamp(j, 0, e.length - 1)] || 0) * (1 - 0.55 * d), h = 8 + 52 * v; rr(ctx, W / 2 - 14 * N / 2 + i * 14 + 2, 1222 - h / 2, 8, h, 4); ctx.fill(); }
    ctx.restore();
    // progress line (decoration, y 268)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(90, 266, W - 180, 4); ctx.fillStyle = C.yellow; ctx.fillRect(90, 266, (W - 180) * clamp(lt / TL.voiceDur), 4);
    // caption
    const cue = TL.cues.find((c) => t >= c.t0 && t < c.t1);
    if (cue && TL.captions !== false) {
      const a = Math.min(o3(inv(cue.t0, cue.t0 + 0.12, t)), 1 - inv(cue.t1 - 0.1, cue.t1, t)), px = 52, lines = wrap(ctx, cue.text, FA(px), 830), lh = 76, hh = lines.length * lh + 40, y0 = 1440 - hh;
      ctx.save(); ctx.globalAlpha = a; pill(ctx, 90, y0, W - 220, hh, `rgba(${BG.dark},0.80)`, 'rgba(201,162,122,0.55)', 3, 34); lines.forEach((ln, i) => txt(ctx, ln, (90 + W - 130) / 2, y0 + 20 + 56 + i * lh, FA(px), C.white)); ctx.restore();
    }
  }
  function frameAt(ctx, t) {
    if (TL.hasTitle && t < TL.lead) { titleCard(ctx, t); return; }
    if (TL.hasEnd && t >= TL.end0) { const tt = t - TL.end0; if (tt < 0.5) { content(ctx, t); ctx.save(); ctx.globalAlpha = o3(inv(0, 0.5, tt)); endCard(ctx, t, 9); ctx.restore(); } else endCard(ctx, t, tt); return; }
    content(ctx, t);
    if (TL.hasTitle && t < TL.lead + 0.4) { const a = 1 - inv(TL.lead, TL.lead + 0.4, t); ctx.save(); ctx.globalAlpha = a; titleCard(ctx, TL.lead); ctx.restore(); }          // title dissolves into the first frame
    if (TL.next && t > TL.total - 1.6) { const a = o3(inv(TL.total - 1.6, TL.total - 1.2, t)); ctx.save(); ctx.globalAlpha = a; const s = M('nextLabel', 'ادامه در استوری بعدی'); ctx.font = FA(40); const w = ctx.measureText(s).width + 110; pill(ctx, W / 2 - w / 2, 1470, w, 84, C.yellow, C.ink, 3, 30); txt(ctx, s, W / 2 + 26, 1470 + 58, FA(40), C.ink); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const ax = W / 2 - w / 2 + 38; ctx.beginPath(); ctx.moveTo(ax + 14, 1470 + 28); ctx.lineTo(ax, 1470 + 42); ctx.lineTo(ax + 14, 1470 + 56); ctx.stroke(); ctx.restore(); }
  }
  window.DUR = 0; window.render = async (t) => { const c = document.getElementById('c').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); frameAt(c, t); };
  window.cardPNG = (kind, o) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); if (kind === 'title') titleCard(x, o.t ?? 1); else endCard(x, o.t ?? 8, 2); return c.toDataURL('image/png'); };
  const v = new URLSearchParams(location.search).get('v') || 'short';
  Promise.all([fetch(`timeline-${v}.json`).then((r) => r.json()).then((j) => { TL = j; window.DUR = j.total; }), load('assets/logo/logo.png').then((i) => (logo = i)), ...ORDER.map((n) => load(`assets/glass/${n}.png`).then((i) => (GL[n] = i))), document.fonts.load('bold 40px "Al Bayan"'), document.fonts.load('bold 40px Arial')])
    .then(async () => { await window.render(TL.lead + 1); window.READY = true; }).catch((e) => { console.error(e.stack || String(e)); throw e; });
})();
