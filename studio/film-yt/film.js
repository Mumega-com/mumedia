// Landscape YouTube cut (1920x1080) of the FULL approved audio. Stained-glass archetype pane at the centre (hinge flip at every chapter), topic chip, voice waveform,
// chapter list on the right (current chapter lit), chapter progress bar along the bottom, title card and end card. No captions burned in (a long talk: the .srt is a draft to proofread).
// ?pal=green (deep forest greens, copper/cream accents) | red (deep red ground, yellow accents). Reads timeline-yt.json. Deterministic.
(function () {
  const W = 1920, H = 1080, Z = '‌', PAL = new URLSearchParams(location.search).get('pal') || 'green';
  const ACC = PAL === 'red' ? { yellow: '#F6DA3A', mint: '#E4F0E6', sage: '#9DB9A6', green: '#0B5A2A', ink: '#3A0507' } : { yellow: '#C9A27A', mint: '#EBDFD3', sage: '#B0C4B9', green: '#1B4332', ink: '#1B4332' };
  const BG = PAL === 'red' ? { frame: '#9A2620', g0: '#6A0A0C', g1: '#33060A', g2: '#110102', dark: '21,2,3', tint: '62,5,8', ray: '255,224,170', blk: '#150203' } : { frame: '#5E8F7B', g0: '#2F5648', g1: '#183A2B', g2: '#08150F', dark: '5,17,12', tint: '10,34,25', ray: '214,236,206', blk: '#07140F' };
  const C = Object.assign({ white: '#FFFFFF' }, ACC), GL = {}; let logo = null, TL = null;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), inv = (a, b, x) => clamp((x - a) / (b - a)), o3 = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const FA = (px) => `bold ${px}px "Al Bayan"`, LAT = (px) => `bold ${px}px Arial`, ORDER = ['hero', 'sage', 'trickster', 'caregiver', 'shadow', 'innocent'];
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const PAN = { cx: 700, cy: 545, w: 600, h: 632 };
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });
  function txt(ctx, s, x, y, font, fill, align = 'center', dir = 'rtl') { ctx.font = font; ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = fill; ctx.fillText(s, x, y); }
  function pill(ctx, x, y, w, h, fill, stroke, lw, r) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
  function fitPx(ctx, s, px, maxW) { let p = px; ctx.direction = 'rtl'; while (p > 18) { ctx.font = FA(p); if (ctx.measureText(s).width <= maxW) break; p -= 2; } return p; }
  const OC = document.createElement('canvas'); OC.width = 925; OC.height = 975; const octx = OC.getContext('2d');
  function pane(name, ign) { octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, 925, 975); octx.globalCompositeOperation = 'source-over'; octx.drawImage(GL[name], 0, 0, 925, 975); octx.globalCompositeOperation = 'source-atop'; octx.fillStyle = `rgba(${BG.tint},${0.5 * (1 - ign)})`; octx.fillRect(0, 0, 925, 975); octx.globalCompositeOperation = 'source-over'; return OC; }
  function ground(ctx, t, o = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG.g0); g.addColorStop(0.45, BG.g1); g.addColorStop(1, BG.g2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cw = 240, ch = 270, a = o.wall ?? 0.14;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { const im = GL[ORDER[(c + 2 * r) % 6]], dy = 8 * Math.sin(2 * Math.PI * t / 24 + c * 1.7 + r), pulse = 1 + 0.45 * (o.lit ?? 0) * Math.sin(2 * Math.PI * t / 12 + c * 0.9 + r * 0.7); ctx.save(); ctx.globalAlpha = a * pulse; ctx.drawImage(im, c * cw + 12, r * ch + 6 + dy - 20, cw - 24, ch - 20); ctx.restore(); }
    const v = ctx.createRadialGradient(W * 0.36, H / 2, 200, W / 2, H / 2, 1250); v.addColorStop(0, `rgba(${BG.dark},0)`); v.addColorStop(1, `rgba(${BG.dark},0.62)`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  function frame(ctx) { ctx.save(); rr(ctx, 22, 22, W - 44, H - 44, 40); ctx.lineWidth = 14; ctx.strokeStyle = BG.frame; ctx.stroke(); rr(ctx, 42, 42, W - 84, H - 84, 28); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(201,162,122,0.3)'; ctx.stroke(); ctx.restore(); }
  function logoDisc(ctx, cx, cy, d) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 7, 0, 7); ctx.fillStyle = C.yellow; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 3, 0, 7); ctx.fillStyle = C.white; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.clip(); ctx.drawImage(logo, cx - d / 2, cy - d / 2, d, d); ctx.restore(); }
  const META = () => TL.meta || {}, SPK = () => ('speaker' in META() ? META().speaker : ''), EC = () => Object.assign({ chip1: 'برچسب اول', chip2: 'برچسب دوم', dateLabel: 'شروع از', dateTop: 'Start date', dateLine: 'روز و ساعت', handle: '@yourhandle', line2: 'contact: you@example.com', showChips: true, showDate: true }, META().endCard || {}), TITLE = () => META().titleLines || ['عنوان سخنرانی', 'بخش برجسته', 'سطر سوم'], SUB = () => ('subtitle' in META() ? META().subtitle : 'English subtitle');
  function titleBlock(ctx, cx, y, px, ink, hiInk) {
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; const T = TITLE(), l1 = T[0], l2 = T[1] || '', l3 = T[2] || '';
    if (!l2) { txt(ctx, l1, cx, y + px * 0.5, FA(fitPx(ctx, l1, px * 1.15, 1100)), ink); return y + px * 1.0; }
    ctx.font = FA(px * 0.78); const w2 = ctx.measureText(l2).width; ctx.save(); ctx.fillStyle = C.yellow; rr(ctx, cx - w2 / 2 - 44, y + px * 1.02 - px * 0.78 * 0.86, w2 + 88, px * 0.78 * 1.2, 18); ctx.fill(); ctx.restore();
    txt(ctx, l1, cx, y, FA(px), ink); txt(ctx, l2, cx, y + px * 1.02, FA(px * 0.78), hiInk); if (l3) txt(ctx, l3, cx, y + px * 1.02 + px * 0.95, FA(px), ink); return y + (l3 ? px * 1.97 : px * 1.12);
  }
  function datePill(ctx, cx, y, w, h) {
    pill(ctx, cx - w / 2, y, w, h, C.yellow, C.ink, 4, 30);
    ctx.font = FA(38); ctx.direction = 'rtl'; const E = EC(), wA = ctx.measureText(E.dateLabel).width; ctx.font = LAT(38); ctx.direction = 'ltr'; const wB = ctx.measureText(E.dateTop).width, gap = 18, tot = wA + wB + gap;
    let xr = cx + tot / 2; txt(ctx, E.dateLabel, xr, y + h * 0.43, FA(38), C.ink, 'right'); xr -= wA + gap; txt(ctx, E.dateTop, xr, y + h * 0.43, LAT(38), C.ink, 'right', 'ltr');
    const s = E.dateLine; txt(ctx, s, cx, y + h * 0.85, FA(fitPx(ctx, s, 36, w - 50)), C.ink);
  }
  function titleCard(ctx, t) {
    ground(ctx, t, { wall: 0.24, lit: 0.2 }); ctx.fillStyle = `rgba(${BG.dark},0.5)`; ctx.fillRect(0, 0, W, H); frame(ctx);
    const a = o3(inv(0, 0.5, t)); ctx.save(); ctx.translate(0, (1 - a) * 22);
    logoDisc(ctx, W / 2, 150, 140); txt(ctx, (META().clubName || 'نام باشگاه'), W / 2, 270, FA(44), C.white);
    const yb = titleBlock(ctx, W / 2, 400, 104, C.white, C.ink); if (SUB()) txt(ctx, SUB(), W / 2, yb + 60, LAT(40), C.white, 'center', 'ltr');
    const s = 'topic' in META() ? META().topic : '', px = 54; if (s) { ctx.font = FA(px); const tw = ctx.measureText(s).width + 90; pill(ctx, W / 2 - tw / 2, yb + 100, tw, 92, C.mint, C.green, 4, 30); txt(ctx, s, W / 2, yb + 100 + 65, FA(px), C.green); }
    if (SPK()) txt(ctx, SPK(), W / 2, yb + 255, FA(42), C.sage); const ses = 'session' in META() ? META().session : ''; if (ses) txt(ctx, ses, W / 2, yb + 305, LAT(32), C.white, 'center', 'ltr'); ctx.restore();
  }
  function endCard(ctx, t, tt) {
    ground(ctx, t, { wall: 0.30, lit: 0.4 }); ctx.fillStyle = `rgba(${BG.dark},0.58)`; ctx.fillRect(0, 0, W, H); frame(ctx);
    const a = o3(inv(0, 0.5, tt)); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 20);
    logoDisc(ctx, 480, 330, 150); const yb = titleBlock(ctx, 480, 520, 96, C.white, C.ink); if (SUB()) txt(ctx, SUB(), 480, yb + 60, LAT(40), C.white, 'center', 'ltr');
    if (SPK()) txt(ctx, ('facilitatorLabel' in META() ? META().facilitatorLabel : 'تسهیل' + Z + 'گر: ') + SPK(), 480, yb + 128, FA(40), C.yellow);
    const X = 1320, chip = (cx, label, fill, stroke, ink) => { pill(ctx, cx - 130, 250, 260, 90, fill, stroke, 4, 30); txt(ctx, label, cx, 250 + 64, FA(52), ink); };
    const E_ = EC(); if (E_.showChips) { chip(X - 150, E_.chip1, C.mint, C.green, C.green); chip(X + 150, E_.chip2, C.yellow, C.ink, C.ink); } if (E_.showDate) datePill(ctx, X, 380, 760, 140);
    pill(ctx, X - 380, 560, 760, 150, `rgba(${BG.dark},0.78)`, C.yellow, 3, 30); txt(ctx, EC().handle, X, 560 + 62, LAT(44), C.white, 'center', 'ltr'); txt(ctx, EC().line2, X, 560 + 122, LAT(38), C.white, 'center', 'ltr');
    const el = 'endLine' in META() ? META().endLine : ''; if (el) txt(ctx, el, X, 800, FA(36), C.sage); ctx.restore();
  }
  function content(ctx, t) {
    const lt = t - TL.lead, ch = TL.chapters; let k = 0; for (let i = 0; i < ch.length; i++) if (t >= ch[i].t - 1e-6) k = i; const ev = ch[k], pe = ch[Math.max(0, k - 1)], tf = t - ev.t;
    ground(ctx, t, { wall: 0.14 }); frame(ctx); const cx = PAN.cx, cy = PAN.cy;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy); ctx.rotate(t / 60 * (2 * Math.PI / 14)); for (let i = 0; i < 14; i++) { ctx.rotate(2 * Math.PI / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34, -1300); ctx.lineTo(34, -1300); ctx.closePath(); ctx.fillStyle = `rgba(${BG.ray},0.05)`; ctx.fill(); } ctx.restore();
    const gl = ctx.createRadialGradient(cx, cy, 80, cx, cy, 540); gl.addColorStop(0, 'rgba(201,162,122,0.30)'); gl.addColorStop(1, 'rgba(201,162,122,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    const flips = k > 0 && pe.pane !== ev.pane, fl = flips ? inv(0, 0.5, tf) : 1, name = fl < 0.5 ? pe.pane : ev.pane, sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * fl))), ign = fl < 0.5 ? 1 : o3(inv(0.45, 1.3, flips ? tf : 9));
    const br = 1 + 0.012 * Math.sin(2 * Math.PI * t / 12); ctx.save(); ctx.translate(cx, cy); ctx.scale(sx * br, br); ctx.shadowColor = 'rgba(201,162,122,0.45)'; ctx.shadowBlur = 50; ctx.drawImage(pane(name, ign), -PAN.w / 2, -PAN.h / 2, PAN.w, PAN.h); ctx.restore();
    // topic chip (cross-fades on a chapter change)
    const cf = (e, a) => { const s = fitPx(ctx, e.title, 50, 820); ctx.font = FA(s); const w = ctx.measureText(e.title).width + 84; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 12); pill(ctx, cx - w / 2, 96, w, 88, C.mint, C.green, 3, 30); txt(ctx, e.title, cx, 96 + 63, FA(s), C.green); ctx.restore(); };
    if (k > 0 && tf < 0.5) { cf(pe, 1 - o3(inv(0, 0.25, tf))); cf(ev, o3(inv(0.2, 0.5, tf))); } else cf(ev, 1);
    // voice waveform
    const fi = Math.floor(lt * 24), N = 41, E = TL.env; ctx.save(); ctx.fillStyle = C.yellow;
    for (let i = 0; i < N; i++) { const d = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2), j = fi - Math.round(Math.abs(i - (N - 1) / 2) * 1.2), v = (E[clamp(j, 0, E.length - 1)] || 0) * (1 - 0.55 * d), h = 8 + 56 * v; rr(ctx, cx - 14 * N / 2 + i * 14 + 2, 930 - h / 2, 8, h, 4); ctx.fill(); }
    ctx.restore();
    // right column: identity and the chapter list
    logoDisc(ctx, 1790, 120, 84); txt(ctx, (META().clubName || 'نام باشگاه'), 1722, 118, FA(40), C.white, 'right'); if (SPK()) txt(ctx, SPK(), 1722, 166, FA(32), C.sage, 'right');
    const y0 = 204, lh = 42; ch.forEach((c, i) => {
      const y = y0 + i * lh, on = i === k, past = i < k; if (on) pill(ctx, 1390, y - 4, 470, lh - 2, C.mint, C.green, 2, 18);
      const s = fitPx(ctx, c.title, 31, 335); txt(ctx, c.title, 1846, y + 27, FA(s), on ? C.green : past ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.88)', 'right'); txt(ctx, c.label, 1408, y + 27, LAT(26), on ? C.green : 'rgba(255,255,255,0.55)', 'left', 'ltr');
    });
    // chapter progress bar along the bottom
    const x0 = 90, x1 = W - 90, yb = 1010, tot = TL.voiceDur; ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(x0, yb, x1 - x0, 5); ctx.fillStyle = C.yellow; ctx.fillRect(x0, yb, (x1 - x0) * clamp(lt / tot), 5);
    ch.forEach((c, i) => { const x = x0 + (x1 - x0) * ((c.t - TL.lead) / tot); ctx.fillStyle = i <= k ? C.yellow : 'rgba(255,255,255,0.5)'; ctx.fillRect(x - 1.5, yb - 9, 3, 23); });
  }
  function frameAt(ctx, t) {
    if (t < TL.lead) { titleCard(ctx, t); return; }
    if (t >= TL.end0) { const tt = t - TL.end0; if (tt < 0.5) { content(ctx, t); ctx.save(); ctx.globalAlpha = o3(inv(0, 0.5, tt)); endCard(ctx, t, 9); ctx.restore(); } else endCard(ctx, t, tt); return; }
    content(ctx, t); if (t < TL.lead + 0.4) { ctx.save(); ctx.globalAlpha = 1 - inv(TL.lead, TL.lead + 0.4, t); titleCard(ctx, TL.lead); ctx.restore(); }
  }
  window.DUR = 0; window.render = async (t) => { const c = document.getElementById('c').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); frameAt(c, t); };
  Promise.all([fetch('timeline-yt.json').then((r) => r.json()).then((j) => { TL = j; window.DUR = j.total; }), load('assets/logo/logo.png').then((i) => (logo = i)), ...ORDER.map((n) => load(`assets/glass/${n}.png`).then((i) => (GL[n] = i))), document.fonts.load('bold 40px "Al Bayan"'), document.fonts.load('bold 40px Arial')])
    .then(async () => { await window.render(TL.lead + 1); window.READY = true; }).catch((e) => { console.error(e.stack || String(e)); throw e; });
})();
