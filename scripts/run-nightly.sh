#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# 1) generate indices (offline)
npm run gen

# 2) commit + push (requires git remote set)
if git diff --quiet && git diff --cached --quiet; then
  echo "[nightly] no changes"
  exit 0
fi

git add -A

git commit -m "nightly: update content $(date '+%F %T')" || true

git push
