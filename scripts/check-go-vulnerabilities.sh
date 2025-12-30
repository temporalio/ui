#!/bin/bash
set -e

# Check Go vulnerabilities using govulncheck
# Requires govulncheck: go install golang.org/x/vuln/cmd/govulncheck@latest

GO_MOD_PATH="${1:-server}"

if [[ ! -d "$GO_MOD_PATH" ]]; then
  echo "Error: directory not found at $GO_MOD_PATH"
  exit 1
fi

if ! command -v govulncheck &> /dev/null; then
  echo "Installing govulncheck..."
  go install golang.org/x/vuln/cmd/govulncheck@latest
fi

echo "Checking Go vulnerabilities in $GO_MOD_PATH"
echo "================================================================"

cd "$GO_MOD_PATH"

GO_VERSION=$(grep "^go " go.mod | awk '{print $2}')
echo "Go version: $GO_VERSION"
echo ""

govulncheck -json ./... 2>&1 || true
