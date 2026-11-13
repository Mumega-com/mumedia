#!/bin/sh
# Checks what is installed; installs nothing. Run from the repo root:  sh 05-studio/check-setup.sh
HERE=$(cd "$(dirname "$0")" && pwd); ok() { printf "  OK       %s\n" "$1"; }; no() { printf "  MISSING  %s\n           -> %s\n" "$1" "$2"; BAD=1; }; BAD=0
echo "mumedia studio: setup check"
command -v node >/dev/null && ok "node $(node -v)" || no node "install Node 20+ (https://nodejs.org)"
command -v ffmpeg >/dev/null && ok "ffmpeg" || no ffmpeg "brew install ffmpeg"
python3 -c "import numpy" 2>/dev/null && ok "python3 + numpy" || no "python3 numpy" "python3 -m pip install numpy"
[ -d "/Applications/Google Chrome.app" ] && ok "Google Chrome" || no "Google Chrome" "install Chrome (the renderer drives it headless)"
[ -d "$HERE/node_modules/playwright-core" ] && ok "playwright-core" || no "playwright-core" "cd 05-studio && npm install   (small; uses your Chrome, downloads no browser)"
command -v whisper >/dev/null && ok "whisper (transcripts)" || no "whisper" "uv tool install openai-whisper   (needed only for step 'transcribe'; first run downloads a model of about 1.5 GB: ask the human before doing it)"
ls /System/Library/Fonts/Supplemental/AlBayan.ttc >/dev/null 2>&1 && ok "font Al Bayan (macOS)" || no "font Al Bayan" "on Windows/Linux install the open font Vazirmatn and replace \"Al Bayan\" with \"Vazirmatn\" in film-yt/film.js and film-vertical/film.js"
[ "$BAD" = 0 ] && echo "All set." || echo "Fix the MISSING items first."
