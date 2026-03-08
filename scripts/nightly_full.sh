#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

DATE="${1:-$(date +%F)}"
TRADING_DATE="${2:-$(node scripts/tradingDate.mjs)}"

# 1) collect (Tavily search outputs + URLs) into content/_raw, stored under TRADING_DATE
node scripts/collect.mjs "$DATE" "$TRADING_DATE"

echo "[nightly_full] date=$DATE tradingDate=$TRADING_DATE"

# 2) compose (offline-ish): fetch article texts via fetcher-router and write content files.
node scripts/compose.mjs "$DATE" "$TRADING_DATE"

# 3) indices/commit/push
npm run nightly
