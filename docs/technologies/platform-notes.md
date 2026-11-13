# Platform notes (delivery and plumbing)

- **Google Drive:** a Claude Drive connector's `create_file` and a Chrome `file_upload` both refuse files over 10 MB. Large files go by hand: reveal in Finder and drag into the Drive folder in the browser, or use Drive for desktop. Downloading from a client's Drive works through the Chrome UI (the Download button), not by direct link. Reading, searching and listing files works fine.
- **Telegram:** 2 GB per file (non-premium). A kit zip of 1.65 GB fits.
- **GitHub (`gh`):** creating repos in an org works when you are admin; a clone right after a visibility change may return "Repository is disabled" for a few seconds and then work. Public history is permanent: sanitize, then rewrite history if anything client-specific was ever committed (keep a private bundle of the old history).
- **Large renders and disk:** a 14-minute 1080p cut at crf 16 is about 555 MB; use crf 22 to share. Keep intermediates out of git and delete them after the archive is verified.
- **macOS shell:** `ls` may be aliased (use `command ls`); the filesystem is case-insensitive (`mumedia` and `MuMedia` collide); zsh does not word-split `$var`.
- **Fonts:** Al Bayan ships with macOS; for other systems use an open font such as Vazirmatn; check font licences before redistributing output.
