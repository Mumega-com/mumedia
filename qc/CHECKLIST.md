# QC checklist (before anyone sees a file)

Measured
- [ ] Loudness about -14 LUFS, true peak below -1.5 dBTP (`ffmpeg -i f -af ebur128=peak=true -f null -`); music about 18 to 19 dB under speech.
- [ ] Duration within the platform limit (Reel <= 90 s, Short < 180 s, Story card <= 60 s); no black frames; no hold over 0.6 s except the planned ending hold.
- [ ] Captions start with the words (within 0.3 s) and do not hang over pauses; each cue <= 2 lines.
Seen (extract real frames and read them)
- [ ] Title card, a mid frame, a two-line caption, the end card, frame 0 (usable cover).
- [ ] Text inside 80 px of the sides; nothing important in the bottom 480 px or top 270 px; no parentheses beside titles/chips; end-card facts equal what the client gave.
Heard (use a transcript of the clip)
- [ ] First word whole (no clipped syllable); every join clean; **the last sentence is complete and nothing follows it**; no word from outside the approved audio.
Process
- [ ] Independent review with files + brief only; findings verified, fixed, re-measured.
- [ ] Doubtful caption words listed for the native reader; AI-content label reminder; client facts (dates) re-confirmed.
