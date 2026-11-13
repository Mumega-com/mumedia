"""List the pauses of an audio file, to choose cut points that never clip a word.
  python3 pauses.py talk.mp3                    all pauses of 0.25 s or more
  python3 pauses.py talk.mp3 --near 88.0        pauses within 3 s of 88.0 s  (--window 5 to widen)
A cut should start at the END of a pause (minus about 0.1 s) and finish at the START of one (plus about 0.1 s). make_vertical.py does this snapping for you; use this to understand where the sentence boundaries are."""
import sys, subprocess, numpy as np
a = sys.argv[1]; near = float(sys.argv[sys.argv.index('--near') + 1]) if '--near' in sys.argv else None; win = float(sys.argv[sys.argv.index('--window') + 1]) if '--window' in sys.argv else 3.0
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', a, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
n = len(x) // 160; db = 20 * np.log10(np.sqrt((x[:n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9); thr = min(np.percentile(db, 6) + 14, -45); q = db < thr; i = 0
while i < n:
    if q[i]:
        j = i
        while j < n and q[j]: j += 1
        s, e = i * 0.01, j * 0.01
        if e - s >= (0.08 if near is not None else 0.25) and (near is None or abs((s + e) / 2 - near) <= win): print(f'pause {s:7.2f} - {e:7.2f}  ({e - s:.2f} s)')
        i = j
    else: i += 1
