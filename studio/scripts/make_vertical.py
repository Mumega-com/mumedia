"""Vertical cut (Reel / Short / Story card, 1080x1920) from an approved audio file and an episode file. numpy + ffmpeg only.
  python3 scripts/make_vertical.py --episode episode.json --cut reel --out builds/ep/reel --film builds/ep/reel/film
Writes <out>/mix.wav (voice + quiet music bed + jingle on the end card), <out>/<cut>.srt (the burned-in captions as text), <film>/timeline-<cut>.json (what the film page draws).
episode.json: see episode.example.json. Passage times are seconds in the SOURCE audio; cue times are seconds RELATIVE TO THE PASSAGE START (as read from the transcript: source time minus passage start).
Cut points are snapped into the nearest measured pause so a sentence is never clipped; set "exact_start"/"exact_end" to true to cut exactly where you say. A cue with "fixed": true is not snapped to the speech (use it when you timed it by hand)."""
import os, sys, json, subprocess, wave, argparse
import numpy as np
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, f'{HERE}/scripts')
import synth
ap = argparse.ArgumentParser(); ap.add_argument('--episode', required=True); ap.add_argument('--cut', required=True); ap.add_argument('--out', required=True); ap.add_argument('--film', required=True); ap.add_argument('--audio', default=None); A = ap.parse_args()
EP = json.load(open(A.episode, encoding='utf-8')); EPDIR = os.path.dirname(os.path.abspath(A.episode)); AUDIO = os.path.abspath(A.audio) if A.audio else os.path.join(EPDIR, EP['audio'])
SPEC = EP['cuts'][A.cut]; IDS = SPEC['passages']; TITLE_CARD = SPEC.get('title_card', False); END_CARD = SPEC.get('end_card', True); LEAD = SPEC.get('lead', 2.6 if TITLE_CARD else 0.3); GAP = SPEC.get('gap', 0.35); END = SPEC.get('end', 6.6)
PANES = ['shadow', 'sage', 'hero', 'innocent', 'caregiver', 'trickster']; SR = 48000; os.makedirs(A.out, exist_ok=True); os.makedirs(A.film, exist_ok=True)
def ma(x, w):
    c = np.cumsum(np.concatenate([[0], x])); h = w // 2; i = np.arange(len(x)); lo = np.clip(i - h, 0, len(x)); hi = np.clip(i - h + w, 0, len(x)); return (c[hi] - c[lo]) / np.maximum(hi - lo, 1)
# ---- pauses of the source (10 ms frames at 16 kHz)
src16 = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
n = len(src16) // 160; db = 20 * np.log10(np.sqrt((src16[:n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9); thr = min(np.percentile(db, 6) + 14, -45); q = db < thr; P = []; i = 0
while i < n:
    if q[i]:
        j = i
        while j < n and q[j]: j += 1
        if j - i >= 8: P.append((i * 0.01, j * 0.01))
        i = j
    else: i += 1
def snap_start(t):
    c = [p for p in P if t - 0.9 <= p[1] <= t + 0.25]
    if not c: a = max(0, int((t - 0.2) * 100)); return (a + int(np.argmin(db[a:a + 25]))) * 0.01
    p = min(c, key=lambda p: abs(p[1] - t)); return max(p[0], p[1] - 0.10)
def snap_end(t):
    c = [p for p in P if t - 0.25 <= p[0] <= t + 0.9]
    if not c: a = int((t - 0.05) * 100); return (a + int(np.argmin(db[a:a + 25]))) * 0.01
    p = min(c, key=lambda p: abs(p[0] - t)); return min(p[1], p[0] + 0.10)
def clean(a, b):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a}', '-t', f'{b - a}', '-i', AUDIO, '-af', 'highpass=f=70:poles=2,afftdn=nr=8:nf=-52:tn=1,deesser=i=0.25:m=0.5:f=0.5', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64); m = int(round((b - a) * SR)); x = x[:m] if len(x) >= m else np.pad(x, (0, m - len(x))); f = int(0.010 * SR)
    x[:f] *= np.sin(np.linspace(0, np.pi / 2, f)) ** 2; x[-f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2; return x
parts, table, t = [], [], 0.0
for k in IDS:
    p = EP['passages'][k]; a = p['start'] if p.get('exact_start') else snap_start(p['start']); b = p['end'] if p.get('exact_end') else snap_end(p['end']); a, b = round(a, 3), round(b, 3)
    x = clean(a, b); parts.append(x); table.append(dict(id=k, src0=a, req0=p['start'], t0=round(t, 3), t1=round(t + len(x) / SR, 3))); t += len(x) / SR
    print(f'  {k}: asked {p["start"]:.2f}-{p["end"]:.2f}, cut {a:.2f}-{b:.2f} ({b - a:.1f} s)')
v = np.concatenate(parts); edb = 20 * np.log10(np.sqrt(ma(v ** 2, int(0.8 * SR))) + 1e-9); gdb = ma(np.where(edb > -46, np.clip(-28 - edb, -6, 6), 0.0), int(0.6 * SR)); v = v * 10 ** (gdb / 20)      # slow leveller
VD = len(v) / SR; END0 = LEAD + VD + GAP; TOTAL = (END0 + END) if END_CARD else (END0 + 0.3); N = int(TOTAL * SR); print('voice', round(VD, 1), 's; total', round(TOTAL, 1), 's')
vox = np.zeros(N); vox[int(LEAD * SR):int(LEAD * SR) + len(v)] = v; mus = synth.tiled(N)
act = ma(np.abs(vox), int(0.12 * SR)) > 0.006; sp = ma(act.astype(float), int(0.6 * SR)); rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-12); vrms = rms(vox[act]); ts = np.arange(N) / SR
cut_at = END0 - 0.05 if END_CARD else TOTAL                                     # the bed fades out before the end card (the jingle takes over) or at the very end
mus *= vrms * 10 ** (-19.0 / 20) / rms(mus[act]) * (1.0 + 0.8 * (1 - sp)) * np.clip(ts / 0.8, 0, 1) * np.clip((cut_at - ts) / (0.35 if END_CARD else 1.2), 0, 1)
mix = np.stack([vox + mus, vox + mus], 1)
if END_CARD:
    JING = next(p for p in (f'{HERE}/sound/jingle.wav', f'{HERE}/../02-sound/jingle.wav') if os.path.exists(p))
    with wave.open(JING) as w: jj = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32768
    jj = jj * (vrms * 10 ** (-7 / 20) / (np.sqrt((jj[:3 * SR] ** 2).mean()) + 1e-9)); i0 = int(END0 * SR); m = min(len(jj), N - i0); mix[i0:i0 + m] += jj[:m]
mix *= min(1, 0.89 / np.abs(mix).max())
with wave.open(f'{A.out}/mix.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
fr = int(SR / 24); m = len(v) // fr; e = np.sqrt((v[:m * fr].reshape(m, fr) ** 2).mean(1)); e = np.convolve(e, np.hanning(5) / np.hanning(5).sum(), mode='same'); env = (e / (np.percentile(e, 97) + 1e-9)).clip(0, 1)
# ---- timeline: captions anchored to the cut and snapped to the measured speech, topic events
w10 = int(0.01 * SR); nf = len(v) // w10; d10 = 20 * np.log10(np.sqrt((v[:nf * w10].reshape(nf, w10) ** 2).mean(1)) + 1e-9); idx = np.flatnonzero(d10 > -46); runs = []; st = prev = idx[0]
for x in idx[1:]:
    if x - prev - 1 >= 12: runs.append((st * 0.01, (prev + 1) * 0.01)); st = x
    prev = x
runs.append((st * 0.01, (prev + 1) * 0.01)); ons = [r[0] for r in runs]; offs = [r[1] for r in runs]; cues, ev = [], []; pi = 0
for cut in table:
    p = EP['passages'][cut['id']]; sh = cut['src0'] - cut['req0']; dur = cut['t1'] - cut['t0']
    for c in p.get('cues', []):
        r0, r1 = max(0.0, c['t0'] - sh), min(dur, c['t1'] - sh)
        if r1 - r0 > 0.2: cues.append(dict(t0=round(LEAD + cut['t0'] + r0, 3), t1=round(LEAD + cut['t0'] + r1, 3), text=c['text'], fixed=bool(c.get('fixed'))))
    evs = [dict(at=0, chip=p.get('chip', ''), pane=p.get('pane') or PANES[pi % len(PANES)])] + [dict(at=e_['at'], chip=e_.get('chip', ''), pane=e_.get('pane') or PANES[(pi + 1) % len(PANES)]) for e_ in p.get('events', [])]; pi += len(evs)
    for e_ in evs:
        tt_ = round(LEAD + cut['t0'] + e_['at'], 3)
        if not ev or (ev[-1]['chip'], ev[-1]['pane']) != (e_['chip'], e_['pane']): ev.append(dict(t=tt_, chip=e_['chip'], pane=e_['pane']))
ev[0]['t'] = LEAD if TITLE_CARD else 0.0
for c in cues:
    if c.get('fixed'): continue                                          # a cue marked "fixed": true keeps exactly the times you gave
    a, b = c['t0'] - LEAD, c['t1'] - LEAD; c0 = [o for o in ons if a - 0.25 <= o <= min(a + 1.2, b - 0.5)]; c1 = [f for f in offs if b - 0.5 <= f <= b + 0.5]
    if c0: c['t0'] = round(LEAD + min(c0, key=lambda o: abs(o - a)) - 0.05, 3)
    if c1: c['t1'] = round(LEAD + min(c1, key=lambda f: abs(f - b)) + 0.12, 3)
    if c['t1'] - c['t0'] < 0.6: c['t1'] = round(c['t0'] + 0.6, 3)
for a_, b_ in zip(cues, cues[1:]):
    if a_['t1'] > b_['t0']: a_['t1'] = round(b_['t0'] - 0.02, 3)
tl = dict(name=A.cut, lead=LEAD, total=round(TOTAL, 3), end0=round(END0, 3) if END_CARD else round(TOTAL + 10, 3), hasTitle=TITLE_CARD, hasEnd=END_CARD, next=SPEC.get('next_pill', False), voiceDur=round(VD, 3), env=[round(float(x), 3) for x in env], cues=cues, events=ev, captions=True, meta=EP.get('meta', {}))
json.dump(tl, open(f'{A.film}/timeline-{A.cut}.json', 'w'), ensure_ascii=False)
def srt(x): h = int(x // 3600); m_ = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m_:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'.replace(',1000', ',999')
open(f'{A.out}/{A.cut}.srt', 'w', encoding='utf-8').write(''.join(f"{i}\n{srt(c['t0'])} --> {srt(c['t1'])}\n{c['text']}\n\n" for i, c in enumerate(cues, 1)))
print('cues', len(cues), '; topic events', len(ev), '; total', tl['total'], 's')
