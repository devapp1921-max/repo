#!/usr/bin/env bash
set -euo pipefail

# Auto-rebuild SCSS to CSS on changes.
# Requires Node.js and sass (via npx) installed.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npx sass --watch src/scss/styles.scss public/assets/css/styles.css
