"""The quiet code-made music bed (G major, harp-like plucks and a pad), shared by the landscape and reel builds."""
import numpy as np
SR = 48000; rng = np.random.default_rng(15)
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

def tiled(N):
    B = bed(); X = 2 * SR; Lp = len(B) - X; mus = np.zeros(N); pos = 0
    while pos < N:
        s = B.copy(); s[:X] *= np.sin(np.linspace(0, np.pi / 2, X)); s[-X:] *= np.cos(np.linspace(0, np.pi / 2, X)); e = min(N, pos + len(s)); mus[pos:e] += s[:e - pos]; pos += Lp
    return mus
