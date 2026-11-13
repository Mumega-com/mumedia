# Recipes: the methods we have used to make videos

Pick one per project; copy its steps; record the choice in the project README.

| # | Recipe | Good for |
|---|---|---|
| 1 | Remotion + live-site capture | product / launch videos from real web pages, word-synced voice |
| 2 | lemo-opuscar code-drawn film | explainers in a named visual style, no stock footage |
| 3 | Codex art + canvas animation | illustrated ads with a fixed palette |
| 4 | Codex still + Grok clip + canvas composite | story films where painted scenes need gentle motion |
| 5 | Talk-footage / talk-audio cut | ads and YouTube cuts from a real recording, using the speaker's own voice |
| 6 | Pure generative motion | a concept piece drawn only by code |
| 7 | **Voice-first vertical and landscape set** (the current studio) | Reels, Shorts, Story cards and a chaptered full-length cut from one approved recording |

Details of the tools: `engines.md`, `voice.md`, `generative-art.md`.

## 1. Remotion + live-site capture
Capture the live pages (Puppeteer + Chrome, hide cookie banners, heading `manifest.json`) -> write the voiceover (about 60 words per 30 s; spell acronyms for the voice in `spoken.mjs`, captions keep the script's words) -> free draft voice (`say` + Whisper timings), paid final (ElevenLabs) -> render 16:9 and 9:16 from one composition. Every claim matches the live page on the capture date.

## 2. lemo-opuscar code-drawn film
Choose a style (`styles/<slug>/STYLE.md`), read `DIRECTOR.md` first (treatment, hook within 3 s, one native move per scene) -> treatment and facts file -> draw everything in the page driven only by `t` (seeded RNG) -> local Kokoro voice for drafts, mux to -14 LUFS.

## 3. Codex art + canvas animation
Fix the palette as hex codes and generate one style reference first -> one Codex image per panel with the reference as `-i` -> flood-fill the ivory ground away -> animate the cut-outs in a canvas page. No on-screen AI label; use the platform's AI disclosure at publish.

## 4. Codex still + Grok clip + composite
Story and beats first -> stills -> one 6 s Grok clip per still -> check every clip on a frame strip and trim or retry -> frames on disk -> composite page (clips slowed to fill the scene, blended frames, word-by-word captions, slow push-in on the last scene) -> measure (fixed character identical on every raw frame) -> critic -> encode. See `generative-art.md`.

## 5. Talk-audio cut
Use the client's own recording for the voice; cut only inside measured pauses with 10 to 12 ms fades and the speaker's own room tone between; never stretch or re-order speech; music about 19 dB under the voice; keep a `FACTS` file with the source and time of every phrase; recordings stay out of git. Captions in another script or on a sensitive topic need a native reader and the client's approval before publishing.

## 6. Pure generative motion
One page, one idea, drawn by code with a seamless loop (check the loop seam). For concept pieces when no art assets exist.

## 7. Voice-first set (this repo's `studio/`)
Approved audio -> Whisper transcript -> choose passages and chapters -> `episode.json` / `chapters.txt` -> pause-snapped cuts, cleaning, slow leveller, quiet bed, jingle on the end card -> caption cues snapped to the real speech -> frames in Chrome -> limiter + two-pass loudnorm -> measure, look at frames, check the last sentence, independent review -> deliver (never publish). `docs/PIPELINE.md`, `qc/CHECKLIST.md`. A finished render whose ending must change is spliced (held frame, dissolve into the already-rendered end card, rebuilt audio tail) instead of re-rendered.

## Not done yet (animator-workshop steps)
Audio-first timing with an animatic reviewed before final art, character model sheets, a colour script, a dailies round with notes and retakes, a sound-design cue sheet. Recipe 4 should gain these before its next use.
