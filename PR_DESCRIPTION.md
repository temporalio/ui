# feat(workflows): add version bump requirement to prevent releases without proper versioning

## Motivation

Previously, releases could be published without proper version increments in the codebase, leading to inconsistencies between release tags and actual code versions. We needed a way to enforce that version bumps happen before releases, ensuring every release reflects an actual version increase in the code.

## Solution

**Enforce Version Bump Workflow**: Added a mandatory version bump step that must happen before any release can be created. The workflow analyzes commits or accepts manual input to properly increment versions in both `package.json` and `server/server/version/version.go`.

**Block Releases Until Version Increases**: Modified release workflows to validate that the current version is actually newer than the last released version (comparing against git tags, not commits). Draft releases and published releases are now blocked until this validation passes.

**Single Source of Truth**: Uses Go's `UIVersion` constant as the authoritative version source, ensuring all validation logic is consistent and `package.json` stays in sync.

## Benefits

- **Prevents version inconsistencies**: No more releases with incorrect or unchanged version numbers
- **Enforces proper workflow**: Version bump → Draft creation → Release publication
- **Allows flexibility**: Supports automatic version calculation, manual specification, or exact version overrides
- **Robust validation**: Compares against actual released versions, handles multiple commits between version bump and release

## Usage

Maintainers now run Actions → "Version Bump" before creating releases, which creates a PR with proper version increments. Only after this PR is merged will the automated release workflows proceed with draft and final release creation.

This ensures every release represents a genuine version progression and maintains consistency between code and release artifacts.
