"""GENERIC VERSION (kit): full-length audio + timeline for the landscape YouTube cut of ANY talk.
  python3 scripts/make_audio.py --audio talk.mp3 --chapters chapters.txt --out builds/talk --film builds/talk/film [--lead 3.2 --end 8 --meta meta.json]
Original docstring: Full-length audio for the landscape YouTube cut: the WHOLE approved mp3 (no cuts), cleaned and slow-levelled, a quiet code-made music bed about 19 dB under the voice, the jingle on the end card.
Writes out/yt/mix.wav, film-yt/timeline-yt.json (chapters, loudness, timing), out/yt/chapters.txt (YouTube chapter list). Run with any python that has numpy:  python3 scripts/long_audio.py"""
import os, sys, json, subprocess, wave
import argparse
import numpy as np
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, f'{HERE}/scripts')
ap = argparse.ArgumentParser(); ap.add_argument('--audio', required=True); ap.add_argument('--chapters', required=True); ap.add_argument('--out', required=True); ap.add_argument('--film', required=True)
ap.add_argument('--lead', type=float, default=3.2); ap.add_argument('--end', type=float, default=8.0); ap.add_argument('--meta', default=None); A = ap.parse_args()
PANES = ['shadow', 'sage', 'hero', 'innocent', 'caregiver', 'trickster']
def parse_chapters(path):                                           # lines like "0:00 Title" or "12:34 Title" (times in the AUDIO); optional "| pane" at the end
    out = []
    for ln in open(path, encoding='utf-8'):
        ln = ln.strip()
        if not ln or ln.startswith('#'): continue
        t, _, rest = ln.partition(' '); parts = [float(x) for x in t.split(':')]; sec = sum(p * 60 ** i for i, p in enumerate(reversed(parts))); title, _, pane = rest.partition('|')
        out.append((sec, title.strip(), pane.strip() or PANES[len(out) % len(PANES)]))
    return out
CHAPTERS = parse_chapters(A.chapters); os.makedirs(A.out, exist_ok=True); os.makedirs(A.film, exist_ok=True)
META = json.load(open(A.meta, encoding='utf-8')) if A.meta else {}
SR = 48000; LEAD, GAP, END = A.lead, 0.5, A.end; rng = np.random.default_rng(15)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', A.audio, '-af', 'highpass=f=70:poles=2,afftdn=nr=8:nf=-52:tn=1,deesser=i=0.25:m=0.5:f=0.5', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.float32).astype(np.float64); print('voice', round(len(v) / SR, 2), 's')
def ma(x, w):                                                                       # centred moving average in O(n)
    c = np.cumsum(np.concatenate([[0], x])); h = w // 2; i = np.arange(len(x)); lo = np.clip(i - h, 0, len(x)); hi = np.clip(i - h + w, 0, len(x)); return (c[hi] - c[lo]) / np.maximum(hi - lo, 1)
env = np.sqrt(ma(v ** 2, int(0.8 * SR))) + 1e-9; edb = 20 * np.log10(env); gdb = np.where(edb > -46, np.clip(-28 - edb, -6, 6), 0.0); gdb = ma(gdb, int(0.6 * SR)); v = v * 10 ** (gdb / 20)          # slow leveller, as in the short cuts
fade = int(0.010 * SR); v[:fade] *= np.sin(np.linspace(0, np.pi / 2, fade)) ** 2; v[-fade:] *= np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
VD = len(v) / SR; END0 = LEAD + VD + GAP; TOTAL = END0 + END; N = int(TOTAL * SR)
# ---- music bed (G major; harp-like plucks and a pad), 48 s tiled with 2 s crossfades
def tt(d): return np.arange(int(d * SR)) / SR
def pluck(f, d=2.6, vel=1.0):
    t = tt(d); y = np.zeros_like(t)
    for h in range(1, 7): y += (1.0 / h ** 1.1) * np.sin(2 * np.pi * h * f * t + rng.uniform(0, 6.28)) * np.exp(-t / (1.7 / h ** 0.75))
    return y * np.minimum(1, t / 0.003) * vel
def padn(notes, d, att=1.2, rel=1.6):
    t = tt(d); y = np.zeros_like(t)
    for f in notes:
        for c in (-7, 0, 6): fc = f * 2 ** (c / 1200); y += np.sin(2 * np.pi * fc * t) + 0.4 * np.sin(4 * np.pi * fc * t)
    return y / (2 * len(notes)) * np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
NOTE = dict(G2=98.0, A2=110.0, C3=130.81, D3=146.83, E3=164.81, G3=196.0, A3=220.0, B3=246.94, C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.0, A4=440.0, B4=493.88, D5=587.33, E5=659.25, G5=783.99)
PROG = [('G2 D3 B3 D4', 'G3 B3 D4 G4 B4 D5'), ('D3 A3 D4 F4', 'D3 A3 D4 A4 D5'), ('E3 B3 E4 G4', 'E3 B3 E4 G4 B4 E5'), ('C3 G3 C4 E4', 'C3 G3 C4 E4 G4'), ('G2 D3 B3 D4', 'G3 B3 D4 G4 D5'), ('A2 E3 A3 C4', 'A3 C4 E4 A4'), ('D3 A3 C4 F4', 'D3 A3 D4 A4'), ('C3 G3 C4 E4', 'C3 G3 E4 G4 C4')]
NOTE['F4'] = 369.99
def bed(L=48.0):
    out = np.zeros(int((L + 3) * SR)); seg = L / len(PROG)
    for i, (pn, hr) in enumerate(PROG):
        t0 = i * seg; p = padn([NOTE[n] for n in pn.split()], seg + 1.6); out[int(t0 * SR):int(t0 * SR) + len(p)] += p * 0.8
        for k, n in enumerate(hr.split()):
            x = pluck(NOTE[n], vel=0.5 * (0.85 + 0.15 * (k % 2))); j = int((t0 + 0.02 + k * 0.45 + rng.uniform(0, 0.05)) * SR); out[j:j + len(x)] += x[:len(out) - j] * 0.35
        for k, tx in enumerate(np.arange(t0 + 3.2, t0 + seg - 0.6, 1.1)): x = pluck(NOTE[hr.split()[(k * 2 + 1) % len(hr.split())]], 1.8, 0.28); j = int(tx * SR); out[j:j + len(x)] += x[:len(out) - j] * 0.3
    d0 = tt(L + 3); out += 0.06 * (np.sin(2 * np.pi * 98 * d0) + 0.4 * np.sin(2 * np.pi * 196 * d0 + 0.3)) * (1 + 0.08 * np.sin(2 * np.pi * 0.25 * d0))
    return out[:int(L * SR) + 2 * SR]
B = bed(); X = 2 * SR; Lp = len(B) - X; mus = np.zeros(N); pos = 0
while pos < N:
    s = B.copy(); s[:X] *= np.sin(np.linspace(0, np.pi / 2, X)); s[-X:] *= np.cos(np.linspace(0, np.pi / 2, X)); e = min(N, pos + len(s)); mus[pos:e] += s[:e - pos]; pos += Lp
vox = np.zeros(N); vox[int(LEAD * SR):int(LEAD * SR) + len(v)] = v
act = ma(np.abs(vox), int(0.12 * SR)) > 0.006; sp = ma(act.astype(float), int(0.6 * SR)); vrms = float(np.sqrt(np.mean(vox[act] ** 2))); rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-12)
g = vrms * 10 ** (-19.0 / 20) / rms(mus[act]); free = 1.0 + 0.8 * (1 - sp); tsec = np.arange(N) / SR
fin = np.clip(tsec / 1.2, 0, 1) * np.where(tsec > END0 + 1.0, np.clip(1 - (tsec - END0 - 1.0) / 2.0, 0, 1), 1.0); mus *= g * free * fin       # the bed gives way to the jingle on the end card
# ---- the jingle, placed on the end card (rendered by scripts/jingle.py, level set against this voice)
subprocess.run([sys.executable, f'{HERE}/scripts/jingle.py', str(round(20 * np.log10(vrms) - 7, 1))], check=True)
with wave.open(f'{HERE}/jingle/jingle-mix.wav') as w: jj = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32768
mix = np.stack([vox + mus, vox + mus], 1); i0 = int(END0 * SR); n = min(len(jj), N - i0); mix[i0:i0 + n] += jj[:n]
pk = np.abs(mix).max(); mix *= min(1, 0.89 / pk)
with wave.open(f'{A.out}/mix.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
fr = int(SR / 24); m = len(v) // fr; e = np.sqrt((v[:m * fr].reshape(m, fr) ** 2).mean(1)); e = np.convolve(e, np.hanning(5) / np.hanning(5).sum(), mode='same'); e = (e / (np.percentile(e, 97) + 1e-9)).clip(0, 1)
chs = [dict(t=round(LEAD + s, 3), title=t, pane=p, label=('0:00' if s == 0 else f'{int((s + LEAD) // 60)}:{int((s + LEAD) % 60):02d}')) for s, t, p in CHAPTERS]
json.dump(dict(name='yt', lead=LEAD, total=round(TOTAL, 3), end0=round(END0, 3), hasTitle=True, hasEnd=True, voiceDur=round(VD, 3), env=[round(float(x), 3) for x in e], chapters=chs, meta=META), open(f'{A.film}/timeline-yt.json', 'w'), ensure_ascii=False)
open(f'{A.out}/youtube-chapters.txt', 'w', encoding='utf-8').write('\n'.join(f"{c['label']} {c['title']}" for c in chs) + '\n')
print('total', round(TOTAL, 2), 's; end card at', round(END0, 2), '; music/voice', round(20 * np.log10(rms(mus[act]) / vrms), 1), 'dB; peak', round(float(np.abs(mix).max()), 2))
