# mumedia

**Recipes for making brand videos from a voice recording, in code.** Give it an audio file the speaker has approved and it produces captioned vertical videos (Reel, Short, Story cards) and a full-length landscape YouTube video with chapters. No editing suite: the picture is drawn by a small web page, rendered frame by frame in headless Chrome, and mixed with ffmpeg and numpy.

It is a working studio, kept as a cookbook: every trick that cost us an evening is written down in `docs/LESSONS.md`.

## What is in it
| Folder | What |
|---|---|
| `studio/` | the tools: `make-vertical.sh` (audio + episode file -> Reel / Short / Story cards), `make-landscape.sh` (audio + chapter list -> YouTube video), a Chrome frame renderer, voice cleaning and levelling, a music bed and a jingle made in code, pause-aware cutting, caption snapping, transcript and pause tools, film pages with three colourways, placeholder brand art |
| `docs/` | `PIPELINE.md` (how a voice becomes finished videos), `LESSONS.md` (what went wrong and what fixed it), `TOOLING.md` (the stack and its traps), **`technologies/`** (every technology we have explored or used, with recipes: Chrome renderer, Remotion, lemo, voice stack, generated art, other agent-video tools, agents and process, platform notes), `HOW-WE-UPDATE.md` |
| `qc/` | `CHECKLIST.md` (what to measure and look at before showing a file) and `CRITIC-BRIEF.md` (a brief for an independent reviewer) |
| `templates/client-handover/` | `CLAUDE.md` + a Claude skill you can give a client so their own Claude can continue the work from a voice file alone |

## Quick start
```
cd studio
npm install                                   # playwright-core only; it drives your installed Chrome
sh check-setup.sh                             # tells you what is missing, installs nothing
node tools/make-placeholder-assets.mjs        # (already done) neutral panes + logo; replace them with your own art
cp /path/to/talk.mp3 examples/                # a recording you are allowed to use
sh make-vertical.sh examples/episode.example.json reel green
```
Edit `examples/episode.example.json` (passages, captions, title and end-card text) for your talk. For a full-length video: `sh make-landscape.sh talk.mp3 chapters.txt green`. Requirements: macOS or Linux, Node 20+, Chrome, ffmpeg, python3 with numpy; Whisper if you want transcripts.

## Good to know
- **Persian / right-to-left first.** The pages draw RTL text with caption wrapping rules, ZWNJ handling and a mirrored-parenthesis workaround; adapting to other languages is mostly changing text and the font.
- **The art is placeholder.** The six panes and the logo are simple generated shapes. Bring your own; same file names.
- **Fonts are not included.** The pages ask for Al Bayan (ships with macOS) and Arial. Use an open font such as Vazirmatn if you need to redistribute output; check font licences.
- **No voice cloning, no stock footage, no face video.** Everything is the real recording plus drawn picture.
- **Rules that travel with the technology:** only use audio the speaker has approved; never publish or send for a client; captions are the speaker's own words and a native reader proofreads them; end every cut on a complete sentence; measure, look at real frames, and get an independent review before showing a file.

## We keep it current
This is a living cookbook: whenever the studio uses or tests a new technology it is added to `docs/technologies/` the same day (see `docs/HOW-WE-UPDATE.md`; `tools/precommit-scan.sh` checks that nothing private slips in).

## Contributing
Issues and pull requests are welcome, especially: other languages and scripts, more looks, better caption snapping, more QC checks. Please do not commit client media, recordings you do not own, or personal data.

## Licence
MIT (see `LICENSE`). Third-party tools are used, not included: Playwright (Apache-2.0), ffmpeg, OpenAI Whisper (MIT), numpy.
