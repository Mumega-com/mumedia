# Other agent-video tools we looked at (read 2026-09-28 unless stated; stars and prices approximate, *unverified* where marked)

Where we stood then: our pipeline (Remotion, real-site captures, voice-timed captions, ffmpeg QC) was already the approach the stronger tools use. Gaps: motion that reads as a template (the same spring pop everywhere); QC that is an agent looking at stills (nothing could fail a render automatically); no b-roll beyond screenshots; ad hoc planning (no typed scene plan with approval gates).

| Tool | What it is | Licence | Verdict |
|---|---|---|---|
| motion.so (+ MCP) | prompt-to-video SaaS: pulls brand colours and fonts from a site, storyboards, builds editable scenes with voice, music, captions | proprietary; pricing reportedly from $5 *(unverified)* | take the idea: brand extraction to a design file, an approved storyboard before rendering, targeted follow-ups. Optional paid benchmark; its MCP can charge a card |
| motion.dev (ex Framer Motion) | animation library with a docs MCP and skill | MIT | take the idea: spring presets as "visual duration" + "bounce". Skip the library (real-time vs frame-by-frame rendering) |
| Motion Canvas | TypeScript generator animations timed to named events | MIT | dormant since early 2025; take named time events (cue labels, not frame numbers) |
| a motion-graphics music-video skill for Claude Code | greenscreen characters, p5 effects, beat detection | MIT | ideas: beat detection on the bed, a plan with cost estimate before generating, generation in widening waves |
| OpenMontage | full agent production system (research -> script -> scene plan -> assets -> edit -> render), approval gates, cost caps, a pre-render "slideshow risk" check | **AGPL-3.0** | ideas only, no code: approval gates, per-asset cost tracking, anti-slideshow check |
| OpenShorts | long video -> 9:16 clips: Gemini picks moments, word timestamps, scene detection, reframing, captions, dubbing, MCP | MIT except `cloud/` (commercial) | worth trying self-hosted for webinar -> shorts; stay out of `cloud/` |
| HyperFrames | deterministic HTML/GSAP -> MP4, agent skills, `lint`/`check`/`snapshot`, golden-MP4 regression tests | Apache-2.0 | do not switch engines; adopt a lint/check step and golden-frame regression stills |
| Remotion agent skills | official skills (12); the official MCP is deprecated | *unverified* | refresh vendored copies; skip the MCP |
| no-slop-motion | launch-film skill: 10 gates, a banned list of motion clichés, slop-check and contact-sheet scripts | MIT | use: lift the banned list and scripts into QC |
| onetake | launch-film skill with about 38 camera moves and a scorer | PolyForm Noncommercial | ideas only: vary shot length at least 4x, deliberate stills, name what carries across a cut, nothing leaves frame by accident |
| video-talkcraft | word-synced talk videos, anti-slideshow rules, 108 motion cards | PolyForm Noncommercial | ideas only |
| Gemini agentic video understanding | Flash models that watch a video and pick frames/audio to inspect | paid API | use as a cheap critic of rendered MP4s (one team reports about $0.013 per critique, *unverified*) |
| Seedance 2.0 / Veo 3.1 first-and-last-frame (via fal) | clips pinned to a start and an end image | paid, about $0.20 to $0.68 per second | b-roll that starts and ends on our own screenshots; about $1 per 4 s clip |
Skipped: stock-footage slideshow generators (below our bar, some stale), ClipsAI (unmaintained), Revideo (moved into a commercial product), editly (declarative slideshows).

## Roadmap items that came out of it
1. Anti-template kit: a named move library, spring presets, a banned-cliché list, a pre-render check of the scene plan (camera move per scene, varied motion, no long holds).
2. Pexels b-roll fetcher and a branded clip component.
3. Render-critique loop: a greyscale frame-diff flags frozen stretches, then a Gemini Flash rubric (legibility, sync, template feel, safe areas) for 2 to 3 fix rounds.
4. Typed scene plan with approval gates (script, storyboard, assets) and an up-front cost estimate: intent, footage source, move, word anchor, what carries across.
5. Pinned-frame b-roll trial (2 to 3 clips).
6. Golden-frame regression stills per component.
