# GitHub Workflows Documentation

This document explains the automated workflows used for version management and release processes in the Temporal UI repository.

## 🎯 Overview

The release management system enforces version bump PRs before any release can be published, maintains dual version sync between `package.json` and `version.go`, and leverages intelligent version increments with clear, automated workflows.

**Version Source of Truth**: The Go `UIVersion` constant in `server/server/version/version.go` is the authoritative source of truth for the application version. All validation and comparison logic is based on this value, and `package.json` must be kept in sync with it.

## 📋 Workflow Architecture

### 1. Version Bump Workflow (`.github/workflows/version-bump.yml`)

**Purpose**: Creates PRs with updated versions based on merged changes or manual input.

**Triggers**:

- Manual dispatch via GitHub Actions UI

**Inputs**:

- `mode`: `auto` (analyze PRs) | `manual` (specify type) | `dry-run` (preview only)
- `version_type`: `major` | `minor` | `patch` (used in manual mode)
- `force_update`: Override validation checks (admin only)

**Process**:

1. **Validation**: Ensures current versions are in sync
2. **Analysis** (auto mode): Scans commit messages for version bump indicators
3. **Calculation**: Determines new version using semantic versioning
4. **Updates**: Modifies both `package.json` and `server/server/version/version.go`
5. **PR Creation**: Creates pull request with changes and changelog

**Example Usage**:

```bash
# Auto mode - analyze recent commits
Actions → Version Bump → Run workflow → Mode: auto

# Manual mode - specify version type
Actions → Version Bump → Run workflow → Mode: manual → Version Type: minor

# Dry run - preview changes
Actions → Version Bump → Run workflow → Mode: dry-run
```

### 2. Release Draft Workflow (`.github/workflows/release-draft.yml`)

**Purpose**: Automatically creates draft releases when version changes are detected.

**Triggers**:

- Push to `main` branch

**Process**:

1. **Version Detection**: Compares current Go UIVersion with previous commit using semantic version comparison
2. **Validation**: Ensures package.json matches Go UIVersion (Go version is source of truth)
3. **Version Increase Check**: Verifies that the new Go version is actually higher than the previous version
4. **Conditional Execution**: Only creates draft if version increased AND versions match
5. **Release Draft**: Uses Release Drafter to generate draft release
6. **Downstream Trigger**: Notifies downstream repositories

**Skip Conditions**:

- No version increase detected (same version or version decreased)
- Version files are out of sync

### 3. Release Published Workflow (`.github/workflows/release-published.yml`)

**Purpose**: Builds and packages the release when a draft release is published.

**Triggers**:

- Release published event

**Process**:

1. **Version Validation**: Ensures release tag matches current version files
2. **Package Building**: Creates distributable package
3. **Asset Upload**: Attaches package to release
4. **Downstream Trigger**: Notifies downstream repositories

## 🔄 Complete Release Process

### For Repository Administrators

#### Normal Development (No Changes Required)

```
Developer workflow remains unchanged:
✓ Create feature branches
✓ Submit PRs with appropriate labels (major/minor/patch)
✓ Merge PRs to main
✓ No version changes needed in regular PRs
```

#### Release Process

##### Step 1: Version Bump

```bash
1. Go to Actions → "Version Bump"
2. Click "Run workflow"
3. Choose mode:
   • Auto: Analyze merged PRs since last version
   • Manual: Specify major/minor/patch explicitly
   • Dry Run: Preview what version would be calculated
4. Review the workflow output
5. If successful, a PR will be created automatically
```

##### Step 2: Review and Merge Version Bump PR

```bash
1. Review the auto-generated PR
   • Check version changes in package.json and version.go
   • Review changelog of changes included
   • Verify version increment is correct
2. Merge the PR to main
```

##### Step 3: Draft Release Auto-Creation

```bash
1. After version bump PR merges to main
2. Release Draft workflow automatically triggers
3. Detects version change and creates draft release
4. Draft includes auto-generated release notes
```

##### Step 4: Publish Release

```bash
1. Go to Releases → Draft release
2. Review auto-generated content
3. Edit release notes if needed
4. Click "Publish release"
5. Release Published workflow handles packaging and distribution
```

## 🛠️ Local Development Tools

### Version Validation Script

**Location**: `scripts/validate-versions.sh`

**Usage**:

```bash
# Validate versions match
pnpm validate:versions
# or directly:
./scripts/validate-versions.sh

# Quiet output (CI-friendly)
./scripts/validate-versions.sh --quiet

# Help
./scripts/validate-versions.sh --help
```

**Purpose**:

- Ensures `package.json` matches `version.go` UIVersion (Go version is source of truth)
- Verifies that the current version has increased compared to the previous commit
- Acts as a gate-keeper for draft release creation

## 🚨 Error Scenarios & Recovery

### No Draft Release Created

**Symptoms**: Version bump PR merged but no draft release appears

**Diagnosis**:

1. Check if both version files were updated in the PR
2. Verify versions in both files match exactly
3. Check Release Draft workflow logs

**Resolution**:

```bash
1. If versions don't match:
   → Run Version Bump workflow again
   → Or manually sync versions and push to main

2. If workflow failed:
   → Check workflow logs for specific errors
   → Re-run failed jobs if applicable
```

### Version Mismatch Detected

**Symptoms**: Workflows fail with version sync errors

**Diagnosis**: `package.json` and `version.go` have different versions

**Resolution**:

```bash
1. Immediate fix:
   → Run: pnpm validate:versions
   → Manually update mismatched file
   → Commit and push changes

2. Proper fix:
   → Use Version Bump workflow with force_update: true
   → This will sync both files to correct version
```

### Release Publication Fails

**Symptoms**: Published release fails validation

**Diagnosis**: Release tag doesn't match current version files

**Resolution**:

```bash
1. Check release tag format (should be vX.Y.Z or X.Y.Z)
2. Verify tag matches package.json and version.go versions
3. If mismatch:
   → Delete the release
   → Fix version sync issues
   → Re-run Version Bump workflow
   → Create new release
```

## 🔧 Maintenance & Troubleshooting

### Common Issues

#### Workflow Permissions

- Ensure `GITHUB_TOKEN` has write permissions for contents and PRs
- Verify `TEMPORAL_CICD_APP_ID` and `TEMPORAL_CICD_PRIVATE_KEY` secrets exist

#### Version Format Issues

- All versions must follow semantic versioning (X.Y.Z)
- No prefixes like 'v' in version files (only in git tags)
- No suffixes like '-beta' or '-alpha'

#### Branch Protection

- Ensure main branch allows admin overrides for automated PRs
- Version bump PRs should be exempt from certain checks

### Debugging Workflows

1. **Check Workflow Logs**: Actions tab → Select workflow run → View logs
2. **Validate Locally**: Run `pnpm validate:versions` before debugging
3. **Test Version Bump**: Use dry-run mode to preview changes
4. **Manual Intervention**: Force update option available for emergencies

### Emergency Procedures

#### Bypass Version Workflow

```bash
# Only in emergencies - manually sync versions
1. Update package.json version
2. Update version.go UIVersion
3. Commit both changes
4. Create release manually
```

#### Rollback Version

```bash
# If wrong version was released
1. Revert version bump PR
2. Delete incorrect release and tag
3. Re-run Version Bump workflow
4. Create new release
```

## 📚 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Release Drafter Configuration](https://github.com/release-drafter/release-drafter)

## 🔄 Workflow File Locations

- Version Bump: `.github/workflows/version-bump.yml`
- Release Draft: `.github/workflows/release-draft.yml`
- Release Published: `.github/workflows/release-published.yml`
- Release Drafter Config: `.github/release-drafter.yml`
- Version Validation: `scripts/validate-versions.sh`
