# Voice, transcripts, music

## Transcripts: Whisper
`base.en` for quick English timing, `large-v3-turbo` for Persian and anything that matters (about 1.5 GB, CPU 5 to 10 min per 15 min of audio, `--word_timestamps True`). Two cautions from real jobs: **word times are smeared** (a word can start 0.5 s early and include silence) so never cut on them (use measured pauses); and **accents break spelling** (a Mashhadi speaker's merged غ/ق gives «قریزه» for «غریزه»): treat the transcript as a map of times, correct by hand, list doubtful words, have a native reader check. An initial prompt of domain words did not fix it. Use Whisper as a QC read-back (final voice against the approved script) and on short clips to verify a specific join.

## Narration: ElevenLabs (paid: approval per project)
- TTS with timestamps (word timings for captions and cuts). Premade voices (e.g. a default male English voice) and library voices (we chose a Persian female and a Persian male from the library; model `eleven_v3`, language `fa`; the older multilingual v2 read Persian like a different dialect).
- **Pronunciation:** spell hard names out in a `SAY` map (`scripts/spoken.mjs`); captions keep the script's own words. For a foreign name inside English lines, splice the name in from a clip made in that language's mode (our Italian company name worked that way); Whisper cannot judge it, an ear can.
- Cut pauses longer than 0.4 s (`tighten-voiceover`) for ads; leave the speaker's pauses alone in talk edits.
- Music: ElevenLabs Music; ask for full energy to the end with no fade or the end card goes silent. (Our later jingle and beds are made in code instead, no licence needed.)
- Budget: every project carries `budget` (default 0); agents stop when a paid call would exceed it.

## Free drafts
macOS `say` plus Whisper word timings for timing drafts; Kokoro (local, via espeak-ng; the install path must be short) for English drafts. Neither reads Persian properly.

## Code-made music and jingle (`studio/scripts/synth.py`, `jingle.py`)
numpy only: harp-like plucks (decaying harmonics plus a noise transient), bell chimes (inharmonic partials), a detuned pad, a short exponential-noise room; a 48 s bed in G major tiled with 2 s crossfades. About 19 dB under speech, faded out before the end card; the jingle carries the end card (it is thin above 4 kHz: judge by ear). Samples alternative: the lemo sampler on VCSL instruments (harp, bowed vibraphone, chimes).

## Loudness
Two-pass loudnorm to -14 LUFS, true peak -1.5 dBTP, with `alimiter=limit=0.30` in front so loudnorm stays linear (otherwise it silently goes dynamic and lifts quiet music). Early lesson: a 0.2 music volume was "too loud" for a client; start at about 0.11 under the voice and 0.3 on the end card.
