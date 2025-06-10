## 🎯 Project Goals

- **Enforce version bump PRs** before any release can be published
- **Maintain dual version sync** between package.json and version.go
- **Leverage Release Drafter logic** for intelligent version increments
- **Streamline release management** with clear, automated workflows

## 📋 Complete Implementation Plan

### Phase 1: Fix Current Version Sync Issue

**Goal**: Align currently mismatched versions

- **Current State**: package.json (2.37.0) vs version.go (2.37.2)
- **Action**: Create immediate PR to sync both files to 2.37.2
- **Validation**: Ensure both versions match before proceeding

### Phase 2: Create Smart Version Bump Workflow

**File**: `.github/workflows/version-bump.yml`**Features**:

- **PR Analysis**: Scans merged PRs since last version for labels (major/minor/patch)
- **Release Drafter Logic**: Applies same precedence rules as release-drafter.yml
- **Dual File Updates**: Updates both package.json and server/server/version/version.go
- **Manual Override**: Workflow dispatch with version type selection
- **Dry Run Mode**: Preview version calculation without changes
- **Changelog Generation**: Lists PRs that triggered the version bump

### Phase 3: Modify Release Draft Workflow

**File**: `.github/workflows/release-draft.yml`**Changes**:

- **Version Change Detection**: Only run Release Drafter if version was bumped
- **Dual Version Validation**: Ensure package.json and version.go match
- **Skip Logic**: No draft release creation without version bump
- **Clear Messaging**: Add comments explaining why draft wasn't created

### Phase 4: Simplify Release Published Workflow

**File**: `.github/workflows/release-published.yml`**Changes**:

- **Remove version update logic** (lines 65-92)
- **Remove post-release PR creation**
- **Add version validation**: Ensure release tag matches current versions
- **Keep existing**: Package creation and downstream dispatch

### Phase 5: Enhanced Documentation & Validation

**Actions**:

- **Add workflow documentation** explaining the new process
- **Create validation scripts** for version consistency
- **Add error handling** with clear messages
- **Update any existing documentation**

## 🔄 New Release Management Process

### For Repository Administrators

### 1. **Normal Development** (No changes)

```
Developer workflow remains unchanged:
- Create feature branches
- Submit PRs with appropriate labels (major/minor/patch)
- Merge PRs to main
- No version changes needed in regular PRs
```

### 2. **When Ready to Release**

```
Step 1: Run Version Bump Workflow
- Go to Actions → "Version Bump Workflow"
- Choose mode:
  • Auto: Analyze merged PRs and calculate version bump
  • Manual: Specify major/minor/patch explicitly
  • Dry Run: Preview what version would be calculated
- Workflow creates PR with version updates

Step 2: Review Version Bump PR
- PR updates both package.json and version.go
- Includes changelog of PRs that triggered the bump
- Review and merge the PR

Step 3: Draft Release Auto-Created
- After version bump PR merges
- Release Draft workflow detects version change
- Automatically creates draft release

Step 4: Publish Release
- Review the auto-generated draft release
- Edit release notes if needed
- Publish the release
- Existing automation handles package creation and downstream dispatch
```

### 3. **Error Scenarios & Recovery**

```
No Draft Release Created?
→ Check if version bump PR was merged
→ Verify both version files match
→ Check workflow logs for validation errors

Version Mismatch Detected?
→ Fix version sync with immediate PR
→ Re-run version bump workflow

Release Publication Fails?
→ Verify release tag matches current versions
→ Check validation logs
```

## 🎛️ Workflow Controls

### Version Bump Workflow Inputs

- **Mode**: Auto (analyze PRs) | Manual (specify type) | Dry Run
- **Version Type** (manual mode): major | minor | patch
- **Force Update**: Override validation checks (admin only)

### Release Draft Behavior

- **Triggers**: Only on version changes to main branch
- **Validation**: Both version files must match
- **Output**: Draft release with calculated version

### Release Publication

- **Validation**: Release tag must match current versions
- **Actions**: Package creation, downstream dispatch
- **No More**: Post-release version updates or PRs

## 📊 Benefits Summary

### ✅ **Enforced Version Control**

- No releases possible without version bump PR
- Clear workflow: Version bump → Draft → Publish

### ✅ **Intelligent Automation**

- Version calculation based on PR labels
- Consistent with existing Release Drafter rules
- Dual file synchronization

### ✅ **Streamlined Process**

- Fewer manual steps
- No post-release cleanup PRs
- Clear error messages and recovery paths

### ✅ **Maintained Flexibility**

- Manual override capabilities
- Dry run for validation
- Emergency procedures for edge cases

## 🚀 Implementation Timeline

1. **Phase 1** (30 min): Fix current version sync
2. **Phase 2** (2 hours): Create version bump workflow
3. **Phase 3** (1 hour): Modify release draft workflow
4. **Phase 4** (30 min): Simplify release published workflow
5. **Phase 5** (1 hour): Documentation and validation

**Total Estimated Time**: ~5 hours

## 🔧 Technical Implementation Details

### Version Detection Algorithm

```bash
# Pseudo-code for version change detection
current_version=$(jq -r '.version' package.json)
previous_commit_version=$(git show HEAD~1:package.json | jq -r '.version')

if [[ "$current_version" != "$previous_commit_version" ]]; then
  # Version was bumped, proceed with release draft creation
  create_draft_release
else
  # No version change, skip release draft
  echo "No version change detected, skipping draft release creation"
fi
```

### PR Analysis Logic

```bash
# Pseudo-code for analyzing merged PRs
last_version_tag=$(git describe --tags --abbrev=0)
merged_prs=$(gh pr list --state merged --base main --since $last_version_tag)

# Extract labels and determine version bump type
for pr in $merged_prs; do
  labels=$(gh pr view $pr --json labels)
  # Apply precedence: major > minor > patch
done
```

### Dual Version Update

```bash
# Update package.json
jq ".version = \"$new_version\"" package.json > tmp.json && mv tmp.json package.json

# Update version.go
sed -i "s/UIVersion.*=.*\".*\"/UIVersion               = \"$new_version\"/" server/server/version/version.go
```

## 🛡️ Error Handling & Validation

### Pre-flight Checks

- Validate current versions are in sync
- Ensure git working directory is clean
- Verify GitHub token permissions

### Runtime Validation

- Semantic version format validation
- File permission checks
- Network connectivity to GitHub API

### Recovery Procedures

- Rollback mechanisms for failed updates
- Manual intervention workflows
- Emergency release procedures

## ✅ Implementation Validation Plan

### Phase 1: File Existence & Content Validation

- [ ] **Check that all new files exist**:

  - [ ] `scripts/validate-versions.sh` (executable)
  - [ ] `.github/workflows/version-bump.yml`
  - [ ] `.github/WORKFLOWS.md`
  - [ ] `RELEASE_STRATEGY.md`

- [ ] **Verify core files have correct content**:
  - [ ] `package.json` has `validate:versions` script
  - [ ] `version.go` and `package.json` versions are in sync
  - [ ] Updated workflows have proper Go UIVersion source-of-truth logic

### Phase 2: Script Functionality Testing

- [ ] **Test validation script**:

  - [ ] Run `./scripts/validate-versions.sh` (should pass or fail appropriately)
  - [ ] Test `--quiet` mode
  - [ ] Test `--help` output
  - [ ] Verify it uses Go UIVersion as source of truth

- [ ] **Test package.json script**:
  - [ ] Run `pnpm validate:versions`

### Phase 3: Workflow Syntax Validation

- [ ] **Check GitHub Actions syntax**:
  - [ ] Validate `version-bump.yml`
  - [ ] Validate `release-draft.yml`
  - [ ] Validate `release-published.yml`

### Phase 4: Version Logic Testing

- [ ] **Test version comparison logic**:
  - [ ] Verify current vs previous version detection
  - [ ] Test semantic version comparison scenarios
  - [ ] Confirm Go version is being used as source of truth

### Phase 5: Documentation Consistency

- [ ] **Check documentation accuracy**:
  - [ ] Verify workflow documentation matches implementation
  - [ ] Ensure README reflects new process
  - [ ] Confirm help text is accurate

### Validation Commands:

```bash
# File existence checks
ls -la scripts/validate-versions.sh
ls -la .github/workflows/version-bump.yml
ls -la .github/WORKFLOWS.md

# Script functionality tests
./scripts/validate-versions.sh
./scripts/validate-versions.sh --quiet
./scripts/validate-versions.sh --help
pnpm validate:versions

# Version sync validation
grep 'UIVersion.*=' server/server/version/version.go
jq -r '.version' package.json

# Workflow syntax validation (requires GitHub CLI)
gh workflow list
```
