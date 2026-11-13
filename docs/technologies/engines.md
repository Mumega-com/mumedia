# Engines: how pictures get made

## 1. A page that draws itself, rendered in Chrome (our default now)
A film is a folder with an `index.html` that exposes `window.render(t)` (may be async), `window.READY` and `window.DUR`. Everything on screen is a function of `t`: canvas or SVG, a seeded RNG instead of `Math.random()` / `Date.now()`, so a re-render matches. `studio/scripts/render.mjs` serves the folder, opens N pages in headless Chrome through playwright-core, screenshots JPEGs at each frame and pipes them to one ffmpeg per worker; the segments are concatenated losslessly. About 36 frames per second with 3 workers at 1080x1920 on a laptop. No library to install, no scratch copy to lose.
Traps: the page background must be the true corner colour of any image used (a downscaled sample plus multiply showed a visible square); check a seamless loop against normal frame steps; keep renders at 2 at a time.
Encode with colours right: `ffmpeg -i raw.mp4 -vf "format=rgb24,scale=out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -crf 16 -preset slow -g 48 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart out.mp4` (crf 22 for sharing).

## 2. Remotion + live-site capture
For launch/product videos from real pages. `npm run capture` screenshots the live pages with Puppeteer and local Chrome, hides cookie banners and writes a `manifest.json` of heading positions for scroll keyframes. Scenes (a caption plus a floating 3D browser, side by side in landscape, stacked in portrait) are React components; word timings from the voice turn into scene cuts and cue times, so a new take re-times itself. Render both 16:9 and 9:16 from one composition (H.264, CRF 18). Remotion's skills can be vendored per project; its MCP server is deprecated. Rule: every on-screen claim must match the live page on the capture date; record source and date in the project README.
Licence: free for teams up to 3 (check the current terms).

## 3. lemo-opuscar: code-drawn films in named styles
Public library (`github.com/lemomo-ai/lemo-opuscar`, licence listed as "Other": clone it, do not copy its code). About 65 styles (stained glass, shadow puppet, paper-cut, ink wash, ukiyo-e, risograph, woodcut, ...), a directing method (`DIRECTOR.md`: treatment first, hook within 3 seconds, one native move per scene) and a sampler on CC0 VCSL instruments, a local Kokoro voice, a mux script. Strong for explainers without footage. Cost of ownership: a multi-GB install (venv, Kokoro, VCSL); keep one permanent copy, never a scratchpad copy; a stale render lock can be left by a failed command (check nothing renders, then remove it). We now render our own pages with the Chrome renderer above and keep lemo for its styles and sampler.

## 4. Three.js inside a video
One 3D hero object (a globe with a route line) inside a Remotion scene: keep the camera path slow, render at fixed frame times, check the first frame after a seek.

## Picking one
Real web pages and product claims -> Remotion + capture. A look in a named style with no footage -> lemo. Anything with captions on a voice, vertical or landscape, no 3D -> the Chrome page renderer (fastest to iterate, no dependencies).
