#!/usr/bin/env bash
# Phase 4 — install Chainlink CRE CLI (macOS/Linux)
# Docs: https://docs.chain.link/cre/getting-started/cli-installation/macos-linux
set -euo pipefail

if command -v cre >/dev/null 2>&1; then
  echo "CRE CLI already installed:"
  cre version
  exit 0
fi

echo "Installing CRE CLI via official Chainlink script..."
curl -sSL https://app.chain.link/cre/install.sh | bash

export PATH="$HOME/.cre/bin:$PATH"
if ! command -v cre >/dev/null 2>&1 && [[ -x "$HOME/.cre/cre" ]]; then
  export PATH="$HOME/.cre:$PATH"
fi

echo ""
echo "Installed:"
cre version
echo ""
echo "Add to your shell profile if needed:"
echo '  export PATH="$HOME/.cre/bin:$PATH"'
