# How we update this repo

We keep this repo as a living cookbook: whenever the studio uses or tests a new technology, learns a trap, or changes a recipe, it is written here the same day.

1. **Add or edit** the right page (`docs/technologies/*`, `docs/LESSONS.md`, `studio/` code) and add a line to `CHANGELOG.md`.
2. **Sanitize first.** Nothing client-specific goes in: no client or speaker names, no recordings, captions or footage that belong to someone else, no phone numbers, emails, handles, API keys, personal paths. Use "a client" and generic examples. Mark prices and star counts you could not verify as *unverified* and say when you read them.
3. **Scan.** Run `sh tools/precommit-scan.sh` (below). It greps the working tree for private strings from a deny list that lives **outside** the repo (`~/.mumedia-deny.txt`, one extended-regex per line) plus generic patterns (phone numbers, emails, `/Users/`, API-key shapes, media files).
4. **Commit and push.** If something sensitive was ever pushed, rewrite the history (the repo is public) and keep a private bundle of the old one.
