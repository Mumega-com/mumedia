#!/bin/sh
# Make a landscape (1920x1080) YouTube video from ANY talk: your audio + a chapter list -> video with the stained-glass look, chapter list, waveform, jingle on the end card.
#   sh make-landscape.sh talk.mp3 chapters.txt [green|red] [name] [meta.json]
# chapters.txt: one chapter per line, time in the AUDIO, e.g.   0:00 Introduction      or     12:30 غریزه و رانه      (see examples/)
# meta.json (optional): title lines, speaker, end-card text (see examples/meta-sample.json).  Needs: node, Google Chrome, ffmpeg, python3 with numpy, and `npm install` once in this folder.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); AUDIO=$1; CH=$2; PAL=${3:-green}; NAME=${4:-$(basename "$AUDIO" | sed 's/\.[^.]*$//')}; META=$5
[ -f "$AUDIO" ] && [ -f "$CH" ] || { echo "usage: sh make-landscape.sh talk.mp3 chapters.txt [green|red] [name] [meta.json]"; exit 1; }
B="$HERE/builds/$NAME"; mkdir -p "$B"; rm -rf "$B/film"; cp -R "$HERE/film-yt" "$B/film"; ln -s "$HERE/assets" "$B/film/assets"
python3 "$HERE/scripts/make_audio.py" --audio "$AUDIO" --chapters "$CH" --out "$B" --film "$B/film" ${META:+--meta "$META"}
node "$HERE/scripts/render.mjs" "$B/film" --size 1920x1080 --fps 24 --workers 3 --q "pal=$PAL" --out "$B/video.mp4"
python3 - "$B" "$NAME" "$PAL" <<'PY'
import sys, json, subprocess
B, NAME, PAL = sys.argv[1:4]; tl = json.load(open(f'{B}/film/timeline-yt.json')); A = ['I=-14', 'TP=-1.5', 'LRA=11']; PRE = 'alimiter=limit=0.30:attack=2:release=40:level=0,'
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f'{B}/mix.wav', '-af', PRE + 'loudnorm=' + ':'.join(A) + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(p1[p1.rfind('{'):p1.rfind('}') + 1]); ln = PRE + 'loudnorm=' + ':'.join(A + [f"measured_I={j['input_i']}", f"measured_TP={j['input_tp']}", f"measured_LRA={j['input_lra']}", f"measured_thresh={j['input_thresh']}", f"offset={j['target_offset']}", 'linear=true'])
out = f'{B}/{NAME}-landscape-{PAL}.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{B}/video.mp4', '-i', f'{B}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', ln, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', f"{tl['total']:.3f}", '-movflags', '+faststart', out], check=True)
print('\nDONE:', out); print('YouTube chapters (paste into the description):', f'{B}/youtube-chapters.txt')
PY
