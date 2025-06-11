#!/bin/bash

#
# Version Validation Script
# 
# This script validates that package.json and server/server/version/version.go
# have the same version number. It's used by CI/CD workflows and can be run
# locally by developers.
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default options
QUIET=false
HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -q|--quiet)
      QUIET=true
      shift
      ;;
    -h|--help)
      HELP=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Show help if requested
if [[ "$HELP" == "true" ]]; then
  cat << EOF
Version Validation Script

Usage: 
  ./scripts/validate-versions.sh              # Run validation
  ./scripts/validate-versions.sh --quiet      # Run with minimal output
  ./scripts/validate-versions.sh --help       # Show this help

Description:
  Validates that:
  1. package.json matches server/server/version/version.go UIVersion (Go version is source of truth)
  2. The current version has increased compared to the previous commit (based on Go version)
  
  This script is used as a gate-keeper for draft release creation.

Exit codes:
  0  - Versions are in sync AND version has increased
  1  - Validation failed (versions don't match or version didn't increase)
EOF
  exit 0
fi

# Helper function for colored output
log() {
  if [[ "$QUIET" != "true" ]]; then
    echo -e "$1"
  fi
}

error() {
  echo -e "${RED}$1${NC}" >&2
}

success() {
  if [[ "$QUIET" != "true" ]]; then
    echo -e "${GREEN}$1${NC}"
  fi
}

# Find project root by looking for package.json
find_project_root() {
  local current_dir="$(pwd)"
  
  while [[ "$current_dir" != "/" ]]; do
    if [[ -f "$current_dir/package.json" ]]; then
      echo "$current_dir"
      return 0
    fi
    current_dir="$(dirname "$current_dir")"
  done
  
  error "Could not find project root (package.json not found)"
  exit 1
}

# Get version from package.json
get_package_version() {
  local project_root="$1"
  local package_json="$project_root/package.json"
  
  if [[ ! -f "$package_json" ]]; then
    error "package.json not found at: $package_json"
    exit 1
  fi
  
  # Use jq if available, otherwise use grep/sed
  if command -v jq >/dev/null 2>&1; then
    jq -r '.version' "$package_json"
  else
    # Fallback to grep/sed approach
    grep '"version"' "$package_json" | sed 's/.*"version".*:.*"\([^"]*\)".*/\1/' | head -1
  fi
}

# Get version from version.go
get_go_version() {
  local project_root="$1"
  local version_go="$project_root/server/server/version/version.go"
  
  if [[ ! -f "$version_go" ]]; then
    error "version.go not found at: $version_go"
    exit 1
  fi
  
  # Extract version from UIVersion = "x.x.x"
  grep 'UIVersion.*=' "$version_go" | sed 's/.*"\([^"]*\)".*/\1/'
}

# Get previous version from last git tag (more reliable than last commit)
get_previous_version() {
  local project_root="$1"
  
  # Change to project root to get relative path for git
  local original_dir="$(pwd)"
  cd "$project_root" || return 1
  
  # Get last tag and extract version
  local last_tag
  last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  
  # Return to original directory
  cd "$original_dir" || return 1
  
  # Remove 'v' prefix if present and return
  if [[ -n "$last_tag" ]]; then
    echo "${last_tag#v}"
  else
    echo ""
  fi
}

# Compare semantic versions
# Returns: 0 if current > previous, 1 if current < previous, 2 if equal
compare_versions() {
  local current="$1"
  local previous="$2"
  
  # If no previous version, treat as newer
  if [[ -z "$previous" ]]; then
    return 0  # current is newer
  fi
  
  # Parse versions into arrays
  IFS='.' read -ra CURRENT_PARTS <<< "$current"
  IFS='.' read -ra PREVIOUS_PARTS <<< "$previous"
  
  # Compare major version
  if (( ${CURRENT_PARTS[0]} > ${PREVIOUS_PARTS[0]} )); then
    return 0  # current is newer
  elif (( ${CURRENT_PARTS[0]} < ${PREVIOUS_PARTS[0]} )); then
    return 1  # current is older
  fi
  
  # Compare minor version
  if (( ${CURRENT_PARTS[1]} > ${PREVIOUS_PARTS[1]} )); then
    return 0  # current is newer
  elif (( ${CURRENT_PARTS[1]} < ${PREVIOUS_PARTS[1]} )); then
    return 1  # current is older
  fi
  
  # Compare patch version
  if (( ${CURRENT_PARTS[2]} > ${PREVIOUS_PARTS[2]} )); then
    return 0  # current is newer
  elif (( ${CURRENT_PARTS[2]} < ${PREVIOUS_PARTS[2]} )); then
    return 1  # current is older
  fi
  
  # Versions are equal
  return 2
}

# Validate semantic version format (x.y.z)
validate_version_format() {
  local version="$1"
  
  if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    return 1
  fi
  
  return 0
}

# Main validation logic
main() {
  log "${BLUE}🔍 Validating version for release readiness...${NC}"
  
  # Find project root
  local project_root
  project_root="$(find_project_root)"
  log "Project root: $project_root"
  log ""
  
  # Get current version from Go file (source of truth)
  local current_version
  current_version="$(get_go_version "$project_root")"
  if [[ -z "$current_version" ]]; then
    error "Failed to extract version from version.go"
    exit 1
  fi
  
  # Get package.json version to check sync
  local package_version
  package_version="$(get_package_version "$project_root")"
  if [[ -z "$package_version" ]]; then
    error "Failed to extract version from package.json"
    exit 1
  fi
  
  # Get previous version (from Go file)
  local previous_version
  previous_version="$(get_previous_version "$project_root")"
  
  log "${BLUE}🔧 Current version (Go UIVersion): ${NC}$current_version ${YELLOW}[SOURCE OF TRUTH]${NC}"
  log "${BLUE}📦 Current package.json version:  ${NC}$package_version"
  log "${BLUE}📜 Previous version:               ${NC}${previous_version:-"(none)"}"
  log ""
  
  # Validate version formats
  if ! validate_version_format "$current_version"; then
    error "❌ Invalid version format in version.go: $current_version"
    error "Expected format: x.y.z (semantic version)"
    exit 1
  fi
  
  if ! validate_version_format "$package_version"; then
    error "❌ Invalid version format in package.json: $package_version"
    error "Expected format: x.y.z (semantic version)"
    exit 1
  fi
  
  if [[ -n "$previous_version" ]] && ! validate_version_format "$previous_version"; then
    error "❌ Invalid previous version format: $previous_version"
    error "Expected format: x.y.z (semantic version)"
    exit 1
  fi
  
  # Check 1: package.json must match Go version (source of truth)
  if [[ "$package_version" != "$current_version" ]]; then
    error "❌ Version sync validation failed!"
    error ""
    error "package.json version does not match Go UIVersion (source of truth):"
    error "  Go UIVersion:   $current_version  ← SOURCE OF TRUTH"
    error "  package.json:   $package_version"
    error ""
    error "To fix this issue:"
    error "1. Use the Version Bump workflow in GitHub Actions, OR"
    error "2. Manually update package.json to match version.go"
    exit 1
  fi
  
  success "✅ Version sync check passed: $current_version"
  
  # Check 2: Version must have increased (based on Go version)
  if compare_versions "$current_version" "$previous_version"; then
    success "✅ Version increase check passed: ${previous_version:-"(none)"} → $current_version"
    log ""
    success "🎉 All validations passed! Ready for draft release creation."
    exit 0
  else
    compare_result=$?
    if [[ $compare_result -eq 2 ]]; then
      error "❌ Version increase validation failed!"
      error ""
      error "Version has not changed: $current_version"
      error "Draft releases require version increases."
    else
      error "❌ Version increase validation failed!"
      error ""
      error "Version decreased: $previous_version → $current_version"
      error "Draft releases should only be created when version increases."
    fi
    error ""
    error "To fix this issue:"
    error "Use the Version Bump workflow to increment the version:"
    error "Actions → Version Bump → Run workflow"
    exit 1
  fi
}

# Run main function
main "$@"