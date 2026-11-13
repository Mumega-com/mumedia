#!/bin/sh
# Make a vertical video (Reel, Short or story card, 1080x1920) from an approved audio + an episode file.
#   sh make-vertical.sh episode.json reel [yellow|red|green]
# (episode.json: see episode.example.json; the cut names are defined inside it: "cuts": { "reel": {...}, "short": {...}, "story1": {...} })
set -e
HERE=$(cd "$(dirname "$0")" && pwd); EP=$1; CUT=$2; LOOK=${3:-yellow}; [ -f "$EP" ] && [ -n "$CUT" ] || { echo "usage: sh make-vertical.sh episode.json <cut> [yellow|red|green]"; exit 1; }
NAME=$(basename "$EP" .json); B="$HERE/builds/$NAME/$CUT"; mkdir -p "$B"; rm -rf "$B/film"; cp -R "$HERE/film-vertical" "$B/film"; ln -s "$HERE/assets" "$B/film/assets"
python3 "$HERE/scripts/make_vertical.py" --episode "$EP" --cut "$CUT" --out "$B" --film "$B/film"
node "$HERE/scripts/render.mjs" "$B/film" --size 1080x1920 --fps 24 --workers 3 --q "v=$CUT&pal=$LOOK" --out "$B/video-$LOOK.mp4"
python3 - "$B" "$NAME" "$CUT" "$LOOK" <<'PY'
import sys, json, subprocess
B, NAME, CUT, LOOK = sys.argv[1:5]; tl = json.load(open(f'{B}/film/timeline-{CUT}.json')); A = ['I=-14', 'TP=-1.5', 'LRA=11']; PRE = 'alimiter=limit=0.30:attack=2:release=40:level=0,'
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f'{B}/mix.wav', '-af', PRE + 'loudnorm=' + ':'.join(A) + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(p1[p1.rfind('{'):p1.rfind('}') + 1]); ln = PRE + 'loudnorm=' + ':'.join(A + [f"measured_I={j['input_i']}", f"measured_TP={j['input_tp']}", f"measured_LRA={j['input_lra']}", f"measured_thresh={j['input_thresh']}", f"offset={j['target_offset']}", 'linear=true'])
out = f'{B}/{NAME}-{CUT}-{LOOK}.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{B}/video-{LOOK}.mp4', '-i', f'{B}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', ln, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', f"{tl['total']:.3f}", '-movflags', '+faststart', out], check=True)
print('\nDONE:', out); print('captions as text (DRAFT, a Persian speaker must proofread):', f'{B}/{CUT}.srt')
PY
