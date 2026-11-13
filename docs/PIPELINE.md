# From a voice file to finished videos

```
approved audio (mp3)  ->  transcript (Whisper, Persian)  ->  choose passages / chapters  ->  episode.json | chapters.txt
   ->  voice: cut in measured pauses, clean (highpass, afftdn, de-ess), slow leveller           [make_vertical.py / make_audio.py]
   ->  music bed (-19 dB under voice, faded out before the end card) + jingle on the end card   [synth.py, jingle.py]
   ->  timeline.json: cues snapped to speech, topic events, loudness envelope, meta            [same scripts]
   ->  frames: film page (canvas) rendered in headless Chrome, JPEG to ffmpeg per worker       [render.mjs]
   ->  mux: limiter + two-pass loudnorm (-14 LUFS, TP -1.5), AAC 192k, H.264                    [make-*.sh]
   ->  QC: measure + look at frames + last sentence + independent reviewer                      [qc/]
   ->  deliver to the human (never publish)
```
## Inputs that matter
- **Audio the speaker approved.** Everything else is derived from it. If the client sends a longer file, stop and ask which part.
- **episode.json**: passages (source seconds), per-passage chip/pane, caption cues (seconds relative to the passage start), `meta`, `cuts` (reel / short / story1 / story2: which passages, title card, end card, lead/gap). See `studio/examples/episode.example.json`.
- **chapters.txt** for the landscape cut: `m:ss title` in audio time; the tool adds the title-card offset to the YouTube chapter list.

## Products and limits
Reel 60 to 90 s; Short under 3 min (170 s in practice); Story cards up to 60 s each; landscape = whole audio + 3.2 s title + 8 s end card. Safe zones for 1080x1920: content between y 270 and y 1440, 80 px side margins, caption plate bottom at y 1440.

## Editing a finished render (when only the ending changes)
a small ffmpeg script (see `docs/TOOLING.md`): keep the picture up to the last spoken word, hold, dissolve into the already-rendered end card, rebuild the audio tail from the mix, jingle on the end card. Cheaper and safer than a full re-render. Re-render when anything in the middle changes.

## Handing the work to a client's own Claude
Ship a repo with `CLAUDE.md` (rules) and `.claude/skills/client-video/SKILL.md` (steps) next to `inbox/` and `outbox/`. The client puts the voice in `inbox/` and asks Claude to make the videos; a human proofreads captions and publishes. See `templates/client-handover/`.
