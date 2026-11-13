# Lessons (from a Persian-language client job, November 2026)

## Content and trust
- **A client sent a longer recording than the speaker had approved.** The speaker noticed. Rule: derive everything from the audio the client marks as approved; if in doubt ask; keep unapproved material out of archives (the archive script refuses if it finds any) and ask the owner before deleting anything you did not create.
- **Never end on a trailing sentence.** The client's admin noticed a last line that trailed off mid-thought. Check the last 12 s with a transcript. Never start on an antecedent that was cut («اون...»).
- A cut that drops a clause can change the speaker's point (a passage about a trickster archetype). Flag such cuts to the client.

## Persian speech and text
- A speaker's Mashhadi accent merges غ and ق: machine transcripts write «قریزه», «قضا». Whisper large-v3-turbo with an initial prompt did not fix it. Treat the transcript as a map of times, hand-correct, list doubtful words, require a Persian reader.
- Whisper **word times are smeared** (words can start 0.5 s early, include silence). Do not cut on them. Cut in **measured pauses** (10 ms RMS, floor + 14 dB, >= 80 ms) with an energy-minimum fallback; a cut inside a word clips its first syllable («آر»).
- Caption cues taken from segment starts were 0.4 to 1.0 s early. Fix: snap each cue to the first speech frame after a pause and to the speech offset (+0.12 s) from the voice envelope; allow `"fixed": true` for hand-timed cues.
- **Canvas RTL mirrors parentheses**; clients see them reversed. Avoid brackets in titles and chips. Use ZWNJ (U+200C) in می‌ / نمی‌ / compounds. Wrap captions into two balanced lines, never ending a line on a preposition, prefer breaking after a comma.
- Persian on-screen wording we chose (chips, chapter titles) is ours: have it read.

## Audio and video
- Make `loudnorm` run in **linear** mode: put a limiter (`alimiter=limit=0.30`) in front; otherwise it falls back to dynamic mode and lifts the quiet music (intro music became as loud as the voice).
- Music about 19 dB under the voice; fade it out before the end card and let the jingle carry it. A code-made jingle (harp-like plucks, bell partials, pad, small room) needs no licence but is thin above 4 kHz on phone speakers: judge by ear.
- Hold frames longer than about 0.6 s read as dead; a held frame + dissolve of 0.35 + 0.5 s into the end card was accepted.
- Frame 0 should be usable as a cover: do not start on black or on an empty background.
- Landscape chapter labels must be in **video time** (audio time + title card), and the first chapter must be 0:00 for YouTube.

## Process
- **Independent critic every round** found real defects that my own frame checks missed (clipped syllables, stray words after a splice, captions early/late, a 3.2 s chapter offset). Give it files + brief only; verify its findings; fix; re-measure.
- Measure, then look: loudness, durations, black frames, last sentence, frames at the title, a two-line caption, the end card.
- Keep outputs in versions (`v2`, `v3`) and move superseded files away so the wrong one is not sent.
- Waiting loops: do not `pgrep -f` for your own command line (it matches itself); do not grep for `rror` (matches "No errors detected"); write explicit sentinels (`DONE`) to logs.
