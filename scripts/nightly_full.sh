#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

DATE="${1:-$(date +%F)}"

# 1) collect (Tavily search outputs + URLs) into content/_raw
node scripts/collect.mjs "$DATE"

# 2) NOTE: composition step (LLM summarization) is done by OpenClaw agent.
# The agent will read content/_raw/${DATE}.index.json and fetched article texts,
# then write content/daily/${DATE}.md, content/insights/index.json, content/handbook.md.

# 3) indices/commit/push is intentionally NOT done here.
# OpenClaw agent will compose content files first, then run `npm run nightly` at the end.
