# Tooling notes

| Piece | Choice | Trap |
|---|---|---|
| Frames | `studio/scripts/render.mjs`: playwright-core + installed Chrome (`channel: chrome`), N workers each piping JPEG to its own ffmpeg, segments concatenated | needs `npm install` once; page must expose `window.READY`, `window.DUR`, `window.render(t)` |
| Audio | numpy + ffmpeg only; `synth.py` bed, `jingle.py`, moving averages by cumulative sums (O(n)) | `np.convolve` with long windows on 14 min of audio never finishes |
| Transcript | Whisper large-v3-turbo, Persian, word timestamps (about 1.5 GB model, CPU 5 to 10 min per 15 min of audio) | the full 3-minute file once hung for 15 min: transcribe short clips to verify specific points |
| Fonts | Al Bayan (macOS) and Arial | not on Windows/Linux; open alternative Vazirmatn; licence to confirm |
| Art | bring your own panes and logo (the repo ships generated placeholders); if you use AI-generated art, switch on the platform's AI-content label | |
| Encode | H.264 crf 16 to 18, BT.709 tags, AAC 192k, +faststart | 14 min at crf 16 is 555 MB: use crf 22 for sharing |
| Large files | Drive connector refuses uploads over 10 MB; use the Drive UI or hand over by link | |
| Shell | macOS: `ls` may be aliased (use `command ls`), filesystem is case-insensitive (`mumedia` = `MuMedia`), zsh does not word-split `$var` | |
| The old library | lemo-opuscar (github.com/lemomo-ai/lemo-opuscar): kept for its sampler and Kokoro voice, but a multi-GB install; do not rely on a scratchpad copy | |
