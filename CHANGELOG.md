# Changelog

## 2026-11-12 (later): technology catalogue
- `docs/technologies/`: catalogue of everything explored or used so far (engines, voice and transcripts, generated art and stock, other agent-video tools with licence verdicts, agents and process, platform notes) and the seven recipes.
- `docs/HOW-WE-UPDATE.md` and `tools/precommit-scan.sh` (pattern scan plus a private deny list kept outside the repo).

## 2026-11-12: first public version
- Renderer: playwright-core + installed Chrome, parallel workers each piping JPEG frames to ffmpeg, segments joined (`studio/scripts/render.mjs`).
- Voice: pause-snapped cuts, cleaning (high-pass, denoise, de-ess), slow leveller; caption cues snapped to measured speech (`"fixed"` cues for hand timing); a music bed and a jingle made in numpy; two-pass loudnorm to -14 LUFS with a limiter in front so it stays linear.
- Film pages with palettes and a `meta` block (title lines, speaker, end-card text): vertical (yellow / red / green) and landscape with a chapter list and chapter progress bar.
- Builders and tools: `make-vertical.sh`, `make-landscape.sh`, transcript, pauses, setup check; placeholder brand-art generator.
- Docs: pipeline, lessons, tooling, QC checklist, critic brief, client-handover templates.
