#!/bin/sh
# Scan the working tree for private or client-specific material before committing. Exits 1 if anything is found.
#   sh tools/precommit-scan.sh
# Private strings (client names, personal numbers, ...) live in ~/.mumedia-deny.txt, one extended regex per line, NEVER in this repo.
cd "$(dirname "$0")/.." || exit 2; BAD=0
scan() { # label, regex, [pattern to ignore]
  OUT=$(grep -rInE "$2" . --exclude-dir=.git --exclude-dir=node_modules --exclude=precommit-scan.sh 2>/dev/null); [ -n "$3" ] && OUT=$(printf '%s\n' "$OUT" | grep -vE "$3"); OUT=$(printf '%s\n' "$OUT" | cut -c1-160 | grep -v '^$')
  [ -n "$OUT" ] && { echo "== $1"; echo "$OUT"; BAD=1; }
}
scan "phone numbers" '(\+?[0-9]{1,2}[ .-])?\(?[0-9]{3}\)?[ .-][0-9]{3}[ .-][0-9]{4}'
scan "email addresses (other than placeholders)" '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' 'example\.com|noreply@users.noreply.github.com'
scan "absolute personal paths" '/Users/[a-z]+|/home/[a-z]+'
scan "API-key shapes" 'sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|xox[bp]-|ghp_[A-Za-z0-9]{20,}|BEGIN (RSA|OPENSSH) PRIVATE KEY'
MEDIA=$(find . -path ./.git -prune -o -type f \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4a' -o -iname '*.mkv' \) -print); [ -n "$MEDIA" ] && { echo "== media files"; echo "$MEDIA"; BAD=1; }
if [ -f "$HOME/.mumedia-deny.txt" ]; then while IFS= read -r p; do [ -n "$p" ] && scan "deny list: $p" "$p"; done < "$HOME/.mumedia-deny.txt"; else echo "note: no ~/.mumedia-deny.txt (private name list); only generic patterns were checked"; fi
[ "$BAD" = 0 ] && echo "scan clean" || { echo "FOUND SOMETHING: fix before committing"; exit 1; }
