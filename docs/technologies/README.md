# Technologies we have explored and used

Status: **used** = shipped in a real video; **tried** = built a test with it; **planned** = designed, not built; **ideas only** = we took the idea, not the code; **skipped**. Cost and licence notes were read on the dates given and may have changed; items marked *unverified* could not be confirmed. This catalogue is updated whenever the studio learns something (see `docs/HOW-WE-UPDATE.md`).

| Technology | What for | Status | Page |
|---|---|---|---|
| Chrome canvas pages + our own frame renderer (`studio/scripts/render.mjs`, playwright-core) | draw a film as code, render frame by frame | **used** | `engines.md` |
| Remotion 4 + Puppeteer page capture | product / launch videos from real web pages, word-synced captions | **used** | `engines.md`, `recipes.md` |
| lemo-opuscar (code-drawn film library, 65 styles) | explainers in a named visual style, no stock footage | **used** | `engines.md` |
| Three.js (globe, route line) inside Remotion | one 3D hero object in an ad | **used** | `engines.md` |
| ffmpeg / ffprobe | encode, loudnorm, splice, blackdetect, freezedetect, ebur128, contact sheets | **used** | `../TOOLING.md`, `../PIPELINE.md` |
| Whisper (base.en, large-v3-turbo) | transcripts, word times, QC read-back | **used** | `voice.md` |
| ElevenLabs (TTS with timestamps, premade and library voices, language modes, Music) | narration and music beds | **used** (paid, per-project approval) | `voice.md` |
| Kokoro (local TTS) + espeak-ng | free voice drafts | **tried** | `voice.md` |
| macOS `say` | scratch voice for timing | **used** | `voice.md` |
| numpy synth (music bed, jingle, loudness maths) | music and sonic logo without samples or licences | **used** | `voice.md`, `../../studio/scripts/synth.py` |
| VCSL instrument samples (via lemo sampler) | harp, vibraphone, chimes | **used** | `voice.md` |
| Codex CLI image generation | illustrated panels with a fixed palette | **used** | `generative-art.md` |
| Grok CLI (image-to-video, 6 s clips) | gentle motion on painted stills | **used** | `generative-art.md` |
| Pexels video | free stock b-roll for people and atmosphere | **used** | `generative-art.md` |
| Seedance 2.0 / Veo 3.1 (first-and-last-frame video via fal) | b-roll pinned to our own screenshots | **planned** | `explored.md` |
| Gemini agentic video understanding | cheap critic of rendered MP4s | **planned** | `explored.md` |
| Claude Code skills, subagent critic, worktrees (orca) | repeatable builds, independent review | **used** | `agents-and-process.md` |
| motion.so, OpenMontage, OpenShorts, HyperFrames, no-slop-motion, onetake, video-talkcraft, Motion Canvas, motion.dev, Remotion skills | what other agent-video tools do | **ideas only / tried** | `explored.md` |
| Google Drive / Chrome / Telegram / GitHub for delivery | hand files to clients | **used** | `platform-notes.md` |

Recipes (how each kind of video is made): `recipes.md`.
