# Generated art and stock

## Codex CLI: still images
ChatGPT login, `image_generation` feature. About 1 to 2 minutes and 28k to 46k tokens per image. `codex exec --skip-git-repo-check -s workspace-write "$(cat prompt.txt)" -i style-ref.png > x.log 2>&1` (prompt before `-i`; end it with "Reply with the saved path only."). Run each image as its own background command: one background `for ... &` loop never started the jobs. It follows an exact hex palette and "same style as the reference" well; it will not draw reliable text (put all text in code); output arrives on an ivory ground: cut out by flood-filling from the border, then animate the cut-outs as sprites (flips, light, ignition), never one big image.

## Grok CLI: image-to-video
`grok --always-approve --cwd "$PWD" -p "Use your GenerateVideo tool in image-to-video mode with the image x.png as the first frame. Make a 6 second clip with a locked-off camera and gentle motion only: <motion per element>. Keep the flat 2D painting style exactly (no 3D, no photorealism, no camera move, no text). Save the resulting video as clips/x.mp4 and reply with the saved path and duration only."` Output 672x448, 24 fps, 6.04 s, low resolution (softer than the still when upscaled). The style holds for about 2 to 4 seconds and may then drift (a second character appears, the grade goes grey): check frame strips, trim to the clean frames, or retry once with "EXACTLY these characters stay in the frame and nothing new ever enters". Describe motion per element and say "completely still" for anything that must not move. About 2 minutes per clip; five in parallel are fine.

## Still + clip + composite (story films)
Story beats first (one caption line per scene, checked against the source: a critic once found invented beats) -> one still per scene with a shared style reference -> one 6 s clip per still -> extract frames (`fps=24,scale=960:-2`) -> a composite page that slows each clip to fill its scene with blended frames, scrolls between scenes, reveals captions word by word (about 0.30 s per word) and gives the last scene a slow push-in -> measure that the fixed character is pixel-identical on every raw frame -> critic -> encode.

## Pexels stock b-roll
Free for commercial use under the Pexels licence, no attribution required (the API asks for a link back and creator credit; it needs a free key); it rules out implying a pictured person endorses the product. Use for people and atmosphere, one or two clips per video, colour-graded to the brand, then back to the real product; never as a stand-in for the product, and audit every clip frame by frame for logos, plates and signs. A fetch script takes per-scene search terms, downloads the right orientation and writes a credits file.

## Pinned-frame video (planned)
Seedance 2.0 / Veo 3.1 first-and-last-frame video (via fal; reported about $0.20 to $0.68 per second, *unverified*): b-roll that starts and ends on our own screenshots so it cannot drift from the real product.

## Disclosure
No on-screen "AI" or "illustration" label. Keep generated clips to generic atmosphere, never a shot that claims to be the client's own people, vehicles or premises. At publish use the platform's own setting (YouTube "altered or synthetic content", Meta "AI info"). Paid generation needs approval first.
