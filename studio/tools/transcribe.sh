#!/bin/sh
# Persian transcript with word times (Whisper large-v3-turbo). Usage: sh 05-studio/tools/transcribe.sh inbox/talk.mp3 [outdir]   -> work/<name>/<name>.json
HERE=$(cd "$(dirname "$0")" && pwd); AUDIO=$1; [ -f "$AUDIO" ] || { echo "usage: sh transcribe.sh talk.mp3 [outdir]"; exit 1; }
NAME=$(basename "$AUDIO" | sed 's/\.[^.]*$//'); OUT=${2:-work/$NAME}; mkdir -p "$OUT"
command -v whisper >/dev/null 2>&1 || { echo "whisper is not installed. Install once:  uv tool install openai-whisper   (or: pip install openai-whisper). Then run this again."; exit 1; }
whisper "$AUDIO" --model large-v3-turbo --language fa --output_format json --output_dir "$OUT" --word_timestamps True --initial_prompt "$(cat "$HERE/vocab-fa.txt")" && echo "transcript: $OUT/$NAME.json"
