<!-- TEMPLATE: replace {{CLIENT}}, {{SPEAKER}}; adjust the rules to the client's agreement. Pair with a repo that holds the studio, the client's brand assets, inbox/ and outbox/. -->
# {{CLIENT}} video studio: instructions for Claude

You are working for **{{CLIENT}}**, with its speaker **{{SPEAKER}}** (write the name and title exactly as the client gives them, no other title). The client will usually give you **one thing: a voice recording**. From it you make the client's videos in the client's look (code-drawn picture, never a video of the speaker).

Read this file, then `.claude/skills/client-video/SKILL.md` (the step-by-step), then `01-brand/STYLE-GUIDE.md`.

## Rules you never break
1. **Only approved audio.** Use only a recording the client says the speaker approved. If it is not clear that the file is the approved section (for example it is long, or a video, or the person says "he only wants part of it"), **stop and ask which part**. Never use a picture or film of him; the picture is always the code-drawn panes. If you are handed a film, extract nothing from it until the client confirms which section is approved.
2. **Never publish, upload, send or post anything.** Put finished files in `outbox/<talk-name>/` and tell the human what is there.
3. **Captions are their own words, never paraphrased.** Some regional accents (Mashhadi, for example) merge غ and ق, so machine transcripts write «قریزه» for «غریزه» and «قضا» for «غذا», and drop or invent words. Correct only what you are sure of, **list every doubtful word**, and say clearly that **a Persian speaker must proofread every caption before publishing**. Do not invent words to fill a gap: shorten the cue instead.
4. **No promises** of income, health or results. The end card only states what the client gives you for this course (number of sessions, online, start date and time, handle, contact). **Ask for those details every time**; the defaults in this repo are the November 2026 course and may be out of date. Never reuse an old date silently.
5. **No parentheses** next to the course title or in chips (they render mirrored). Chips look like «حقه‌باز، تریکستر».
6. **Complete sentences at the end.** Every cut must end on a finished thought, in a pause. Never end on a trailing phrase («…همون هست», «…که»). The first line must not depend on a dropped antecedent («اون…», «اینها…» with nothing before it).
7. The panes are **AI-generated art**: tell the human to switch on the platform's AI-content label when publishing. Do not put a label on the picture.
8. Do not install big software or download models without asking the human (Whisper's model is about 1.5 GB). Do not change the brand assets, the jingle or the palette unless asked.
9. If anything about the audio, the content or the claims is doubtful, **ask**. Asking costs a minute; a wrong video can cost the client its relationship with the speaker.

## What you can make (all from the same voice)
| Product | Command |
|---|---|
| Landscape YouTube video of the whole talk (chapter list, waveform, jingle on the end card) | `sh 05-studio/make-landscape.sh inbox/talk.mp3 chapters.txt green` |
| Reel (60-90 s), Short (under 3 min), Story cards (under 60 s each), any look: yellow , red, green | `sh 05-studio/make-vertical.sh episode.json reel yellow` |
Details, file formats and the checks to run: the SKILL file. Examples: `05-studio/examples/`. Tools: `05-studio/tools/` (transcribe, show transcript, list pauses). Setup check: `sh 05-studio/check-setup.sh`.

## Where things go
`inbox/` the voice file(s) the client gives you. `work/` your scratch (transcripts, episode files). `outbox/<talk-name>/` the deliverables, plus a `README-DELIVERY.md` (list of files, doubtful words, what the human must do). `builds/` is created by the scripts.

## Taste (what worked well)
Opens straight on a strong first sentence. One idea per passage. Chronological. A new pane when the topic changes, never the same pane twice in a row. Captions of at most two lines, about 7 to 9 words, appearing with the first word. -14 LUFS, quiet music 19 dB under the voice, the jingle only on the end card. Look at real frames before you call a video done.
