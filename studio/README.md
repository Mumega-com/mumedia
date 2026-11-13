# mumedia studio: make videos from any approved talk (landscape YouTube, Reel, Short, Story cards)

```
sh make-landscape.sh talk.mp3 chapters.txt green            # or red
sh make-landscape.sh talk.mp3 chapters.txt red my-name meta.json
```
Result: `builds/<name>/<name>-landscape-<green|red>.mp4` (1920x1080, loudness -14 LUFS, whole audio uncut, stained-glass pane that flips at each chapter, chapter list and progress bar, waveform, quiet music bed, jingle on the end card) and `builds/<name>/youtube-chapters.txt` (paste into the YouTube description: times already include the 3.2 s title card).

## Vertical videos (Reel, Short, Story cards)
```
sh make-vertical.sh episode.json reel yellow        # looks: yellow, red, green
```
`episode.json` lists the passages (times in the audio), the topic chip and pane of each, the speaker's caption lines (cue times relative to the passage start), the `meta` (title lines, speaker, end card) and the `cuts` (which passages make a `reel`, a `short`, `story1`, `story2`; title card, end card, lead and gap seconds). Cut points snap into the nearest pause; captions snap onto the real speech (`"fixed": true` keeps hand-set times). `examples/episode.example.json` is the November 2026 episode and rebuilds that Reel exactly. Output: the mp4 (-14 LUFS, quiet music, jingle on the end card) and the captions as `.srt` (a draft: a Persian speaker must proofread).

## Tools (`tools/`)
`transcribe.sh talk.mp3` (Persian Whisper transcript with word times; first run downloads a model of about 1.5 GB), `show_transcript.py` (readable transcript with times), `pauses.py` (where the pauses are, to choose cut points), `vocab-fa.txt` (terms that help the transcript). `check-setup.sh` tells you what is missing.

## One-time setup (macOS)
1. Google Chrome installed. 2. `node` 20 or newer. 3. `ffmpeg`. 4. `python3` with numpy: `python3 -m pip install numpy`. 5. In this folder: `npm install` (fetches `playwright-core`; it uses your installed Chrome, no big downloads). 6. Persian font **Al Bayan** comes with macOS; on another system install Vazirmatn and replace `"Al Bayan"` with `"Vazirmatn"` in `film-yt/film.js`.

## Files
- `chapters.txt`: one line per chapter, time in the AUDIO (`0:00 Title`), optional `| pane` (shadow, sage, hero, innocent, caregiver, trickster); panes cycle automatically if omitted. Examples in `examples/`.
- `meta.json` (optional): `titleLines` (1 to 3 lines; the 2nd sits on the coloured plate), `subtitle` (English line), `topic` (pill on the title card, empty to hide), `session`, `speaker`, `endLine`, `endCard` (chips, date, contact; `showChips`/`showDate` false to hide).
- `scripts/`: `make_audio.py` (clean + level the voice, music bed, jingle, timeline), `render.mjs` (renders the page frame by frame in headless Chrome), `jingle.py` and `synth.py` (the sound, made in code, no samples).
- `film-yt/`: the film page (`film.js`): every look and layout is plain JavaScript canvas code. `?pal=green|red` picks the colourway.

## What it does not do
No captions are burned in (a long talk needs a human-checked transcript). The vertical Short/Reel/Story builds of the first episode were made from episode-specific cut lists and hand-corrected captions: their sources are kept in the project archive, not in this folder.
