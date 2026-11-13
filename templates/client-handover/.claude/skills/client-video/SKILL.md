---
name: client-video
description: Make {{CLIENT}} videos (Reel, Short, Story cards, landscape YouTube cut) from a single approved voice recording in the client's stained-glass look. Use when the client hands you an audio file (or says "make videos from this voice"), asks for a Reel/Short/Story/YouTube version, or asks you to continue the November 2026 set.
---

# {{CLIENT}} video: from a voice file to finished videos

**Before anything:** read `CLAUDE.md` (the rules) and `01-brand/STYLE-GUIDE.md`. Run `sh 05-studio/check-setup.sh` and fix what is missing (ask before large downloads).

## 1. Intake (ask, do not guess)
Ask the human, in one message: (a) is this recording **the section the speaker approved**? (b) talk/course title and speaker; (c) which products: landscape YouTube, Reel, Short, Story cards; (d) the look (default `yellow`, the one the client approved; or `red`, `green`); (e) end-card details: number of sessions, online or not, start date, day and time with time zone, Instagram handle, WhatsApp. Put the audio in `inbox/`. If it is a video file, use only its **audio**, and ask which part is approved.

## 2. Transcribe and understand
```
sh 05-studio/tools/transcribe.sh inbox/talk.mp3        # -> work/talk/talk.json (Persian, word times; first run downloads a model: ask first)
python3 05-studio/tools/show_transcript.py work/talk/talk.json
```
Read the whole transcript. Note the topics, the strongest opening line, complete sentences, and passages that depend on missing context. Remember the accent: do not trust spelling.

## 3. Landscape YouTube cut (the whole talk)
Write `work/talk/chapters.txt`, one line per chapter, **time in the audio**: `0:00 غریزه و رانه`, `1:27 حیات فرهنگی انسان` (titles of up to four words, your own wording describing what they says; optional ` | hero` to force a pane). Optional `work/talk/meta.json` (title lines, topic pill, speaker, end card: see `05-studio/examples/meta-sample.json`). Then:
```
sh 05-studio/make-landscape.sh inbox/talk.mp3 work/talk/chapters.txt green talk work/talk/meta.json
```
Result: `05-studio/builds/talk/talk-landscape-green.mp4` and `youtube-chapters.txt` (times already include the 3.2 s title card; paste into the YouTube description). It has no burned-in captions.

## 4. Reel / Short / Story cards
Choose **passages** from the transcript:
- Reel 60-90 s total; Short up to 175 s (YouTube limit is 3 min including cards); each Story card up to 60 s of picture including cards.
- Start where a sentence starts, end where a thought ends. The tool snaps each cut into the nearest pause, so give times near the boundary. Check with `python3 05-studio/tools/pauses.py inbox/talk.mp3 --near 88.0`.
- Chronological order. First passage = the hook (a question or a striking statement). Remove anything that needs a dropped antecedent. A trailing, unfinished last sentence is the most common complaint: end on a complete one.
- Write the **captions** for each passage in the speaker's own words: up to two lines, about 7 to 9 words per cue; correct spelling; use ZWNJ (U+200C) in «می‌», «نمی‌», «کهن‌الگو», «آرکی‌تایپ‌ها» and compounds; cue `t0`/`t1` are seconds **relative to the passage start** (source time minus passage start); the builder moves each cue onto the real speech.
- Give each passage a `chip` (up to four words, no parentheses) and a `pane` (shadow = instinct and the dark side, sage = the wise elder and wisdom, hero = the journey and effort, innocent = purity and love, caregiver = mother and care, trickster = the rule-breaker; never the same pane twice in a row).
Copy `05-studio/examples/episode.example.json` to `work/talk/episode.json` (put the audio next to it or set `"audio"`), replace the passages, the `meta` and the `cuts` (`reel`, `short`, `story1`, `story2`: which passages, whether there is a title card or end card, lead and gap seconds). Then:
```
sh 05-studio/make-vertical.sh work/talk/episode.json reel yellow
sh 05-studio/make-vertical.sh work/talk/episode.json short yellow
```
Output: `05-studio/builds/episode/<cut>/episode-<cut>-<look>.mp4` and `<cut>.srt` (the burned-in captions as text).

## 5. Check before you hand over (all of these)
1. Loudness about -14 LUFS (`ffmpeg -i f.mp4 -af ebur128 -f null -`), no black frames, duration within the platform limit (Reel <= 90 s, Short < 180 s, Story card <= 60 s).
2. **Last sentence complete:** transcribe the last 12 s of the final file (`ffmpeg -ss <t> ... | whisper`) and confirm the sentence is finished and no stray word follows.
3. **Look at frames** (`ffmpeg -ss T -i f.mp4 -frames:v 1 x.png` and read them): title card, a mid frame, a two-line caption, the end card. Text inside 80 px of the side edges; nothing important in the bottom 480 px or the top 270 px; no parentheses beside the course title; end-card facts equal what the human gave you.
4. Captions against speech: they must start with the words (within 0.3 s) and not hang over pauses.
5. An independent review: start a separate Claude session or subagent with **only the files and the brief** (no reasoning from you) and ask it to find defects; fix what it verifies.

## 6. Deliver
Copy the final videos and the `.srt` files to `outbox/<talk>/` and write `README-DELIVERY.md` with: the files, **a list of doubtful caption words**, your chapter/chip wording, and the human to-do: *a Persian speaker proofreads the captions; switch on the AI-content label when publishing; check the start date on the end card.* Do not publish or send anything yourself.
