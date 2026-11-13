"""Sonic logo, made in code (numpy only, no samples): a rising harp-like arpeggio in G major that lands on a G5 with two bell chimes, over a warm pad that swells and decays.
Run with any python that has numpy:  python3 scripts/jingle.py [target_rms_dbfs]    -> jingle/jingle.wav (6.5 s), jingle-sting.wav (3.2 s), peak -1 dBFS unless a target RMS is given for the first 3 s.
Deterministic (seeded). Same key (G major) as the music bed under the the client's cuts."""
import sys, os, wave
import numpy as np
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 48000; rng = np.random.default_rng(2026)
L = int(6.6 * SR); out = np.zeros((L, 2))
def tt(d): return np.arange(int(d * SR)) / SR
def add(x, t0, pan=0.0):
    i = int(t0 * SR); n = min(len(x), L - i); g = np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]); out[i:i + n] += x[:n, None] * g[None, :]
def lp(x, k):                                                                        # one-pole low-pass by cumulative smoothing
    a = np.exp(-2 * np.pi * k / SR); y = np.zeros_like(x); s = 0.0
    for i in range(0, len(x)): s = a * s + (1 - a) * x[i]; y[i] = s
    return y
def pluck(f, d=3.2, vel=1.0):                                                        # harp-like: harmonics with faster decay for the upper ones, a short noisy attack
    t = tt(d); y = np.zeros_like(t)
    for h in range(1, 9): y += (1.0 / h ** 1.1) * np.sin(2 * np.pi * h * f * t + rng.uniform(0, 6.28)) * np.exp(-t / (1.9 / h ** 0.75))
    n = rng.standard_normal(len(t)) * np.exp(-t / 0.006) * 0.25
    return (y + n) * np.minimum(1, t / 0.002) * vel
def bell(f, d=3.4, vel=1.0):                                                         # chime: inharmonic partials
    t = tt(d); y = np.zeros_like(t)
    for r, a, tau in [(1, 1.0, 2.4), (2.76, 0.45, 1.4), (5.4, 0.22, 0.8), (8.93, 0.1, 0.45)]: y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau)
    return y * np.minimum(1, t / 0.003) * vel
def pad(notes, d, att, rel):
    t = tt(d); y = np.zeros_like(t)
    for f in notes:
        for c in (-6, 0, 6):
            fc = f * 2 ** (c / 1200); y += (np.sin(2 * np.pi * fc * t) + 0.5 * np.sin(4 * np.pi * fc * t) + 0.25 * np.sin(6 * np.pi * fc * t))
    env = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1); return y / (3 * len(notes)) * env
G3, D4, G4, B4, D5, G5, D6, G6 = 196.00, 293.66, 392.00, 493.88, 587.33, 783.99, 1174.66, 1567.98
for k, (f, t0) in enumerate([(G3, 0.0), (D4, 0.13), (G4, 0.26), (B4, 0.39), (D5, 0.52)]): add(pluck(f, vel=0.85 + 0.03 * k), t0, pan=-0.3 + 0.15 * k)
add(pluck(G5, 4.2, 1.0), 0.78, 0.1); add(pluck(G4, 4.2, 0.6), 0.78, -0.1)
add(bell(G6, vel=0.32), 0.80, 0.2); add(bell(D6, vel=0.26), 1.08, -0.2); add(bell(G6 * 0.5, 4.0, 0.2), 0.8, 0.0)
add(pad([98.0, 196.0, 246.94, 293.66, 392.0], 6.2, 0.9, 3.4) * 0.55, 0.30, 0.0)
# a small room: exponential-noise impulse response, 25 % wet
ir = rng.standard_normal((int(1.7 * SR), 2)) * np.exp(-np.arange(int(1.7 * SR)) / (0.42 * SR))[:, None]; ir[0] = 0
n = L + len(ir); wet = np.stack([np.fft.irfft(np.fft.rfft(out[:, c], n) * np.fft.rfft(ir[:, c], n), n)[:L] for c in (0, 1)], 1); wet *= np.abs(out).max() / (np.abs(wet).max() + 1e-9)
mix = 0.8 * out + 0.25 * wet; mix *= np.clip((L - np.arange(L)) / (0.9 * SR), 0, 1)[:, None]
def fin(x):
    x = x.copy()
    if len(sys.argv) > 1:                                                              # target RMS (dBFS) of the first 3 s, for mixing under a film
        r = np.sqrt((x[:3 * SR] ** 2).mean()); x *= 10 ** (float(sys.argv[1]) / 20) / r
    else: x *= 0.89 / np.abs(x).max()
    return x
def save(path, x):
    pk = np.abs(x).max()
    if pk > 0.98: x = x * 0.98 / pk
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
os.makedirs(f'{HERE}/jingle', exist_ok=True); full = fin(mix); suf = '' if len(sys.argv) == 1 else '-mix'
save(f'{HERE}/jingle/jingle{suf}.wav', full)
st = full[:int(3.2 * SR)].copy(); st *= np.clip((len(st) - np.arange(len(st))) / (0.7 * SR), 0, 1)[:, None]; save(f'{HERE}/jingle/jingle-sting{suf}.wav', st)
print('jingle', round(L / SR, 2), 's; peak', round(float(np.abs(full).max()), 3), '; first-3s RMS dBFS', round(float(20 * np.log10(np.sqrt((full[:3 * SR] ** 2).mean()))), 1))
