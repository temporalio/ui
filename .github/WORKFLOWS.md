# GitHub Workflows Documentation

This document explains the automated workflows and custom actions used for version management and release processes in the Temporal UI repository.

## 🎯 Overview

The release management system enforces version bump PRs before any release can be published, maintains dual version sync between `package.json` and `version.go`, and leverages intelligent version increments with clear, automated workflows.

**Version Source of Truth**: The Go `UIVersion` constant in `server/server/version/version.go` is the authoritative source of truth for the application version. All validation and comparison logic is based on this value, and `package.json` must be kept in sync with it.

## 🧩 Custom Actions

The workflow system uses 8 custom GitHub Actions for modular, reusable functionality:

### Version Management Actions

#### `.github/actions/validate-version-sync`

- **Purpose**: Validates that package.json and version.go have matching versions
- **Inputs**: `force` (override validation failures)
- **Outputs**: `package-version`, `go-version`, `versions-match`, `current-version`
- **Source of Truth**: Uses Go UIVersion as authoritative version

#### `.github/actions/calculate-version-bump`

- **Purpose**: Calculates new semantic version based on bump type or specific version
- **Inputs**: `current-version`, `bump-type`, `specific-version`, `mode`
- **Outputs**: `new-version`, `version-changed`, `major`, `minor`, `patch`
- **Features**: Supports manual version override and semantic version validation

#### `.github/actions/analyze-version-bump-type`

- **Purpose**: Analyzes commits since last tag to determine version bump type
- **Inputs**: `last-tag`, `max-commits`
- **Outputs**: `bump-type`, `changelog`, `commit-count`
- **Logic**: Scans commit messages for breaking changes (major), features (minor), or fixes (patch)

#### `.github/actions/update-version-files`

- **Purpose**: Updates both package.json and version.go with new version atomically
- **Inputs**: `new-version`, `dry-run`
- **Outputs**: `files-updated`, `package-updated`, `go-updated`
- **Safety**: Validates successful updates and ensures files remain in sync

### Release Validation Actions

#### `.github/actions/validate-release-readiness`

- **Purpose**: Validates that current version is ready for release (sync + version increase)
- **Outputs**: `version-ready`, `current-version`, `previous-version`
- **Validation**: Uses validation script to check sync and compares against last git tag

#### `.github/actions/validate-published-release`

- **Purpose**: Validates that published release version matches current codebase versions
- **Inputs**: `release-tag`
- **Outputs**: `release-version`, `validation-passed`
- **Checks**: Version format, file sync, and tag-to-code consistency

### Build and Deployment Actions

#### `.github/actions/build-and-package`

- **Purpose**: Builds the UI package and creates tarball for release
- **Outputs**: `package-path`, `package-size`
- **Process**: Runs `pnpm package` and creates compressed tarball

#### `.github/actions/update-version-from-release`

- **Purpose**: Updates version.go to match published release tag
- **Inputs**: `release-tag`
- **Outputs**: `updated-version`
- **Use Case**: Post-release version synchronization

## 📋 Workflow Architecture

### 1. Version Bump Workflow (`.github/workflows/version-bump.yml`)

**Purpose**: Creates PRs with updated versions based on merged changes or manual input.

**Triggers**:

- Manual dispatch via GitHub Actions UI

**Inputs**:

- `mode`: `auto` (analyze commits) | `manual` (specify type) | `dry-run` (preview only)
- `version_type`: `major` | `minor` | `patch` (used in manual mode)
- `specific_version`: Exact version to set (e.g., "2.38.0") - overrides version_type
- `force_update`: Override validation checks (admin only)

**Custom Actions Used**:

1. `validate-version-sync` - Ensures current versions match
2. `analyze-version-bump-type` - Analyzes commits for bump type (auto/dry-run modes)
3. `calculate-version-bump` - Calculates new version with override support
4. `update-version-files` - Updates both version files atomically

**Process**:

1. **Validation**: Ensures current versions are in sync using Go UIVersion as source of truth
2. **Analysis** (auto mode): Scans commit messages since last tag for version bump indicators
3. **Calculation**: Determines new version using semantic versioning or specific override
4. **Updates**: Modifies both `package.json` and `server/server/version/version.go`
5. **PR Creation**: Uses Peter Evans action to create pull request with changes and changelog

**Example Usage**:

```bash
# Auto mode - analyze recent commits
Actions → Version Bump → Run workflow → Mode: auto

# Manual mode - specify version type
Actions → Version Bump → Run workflow → Mode: manual → Version Type: minor

# Specific version - override with exact version
Actions → Version Bump → Run workflow → Mode: manual → Specific Version: 2.38.0

# Dry run - preview changes
Actions → Version Bump → Run workflow → Mode: dry-run
```

### 2. Release Draft Workflow (`.github/workflows/release-draft.yml`)

**Purpose**: Automatically creates draft releases when version changes are detected.

**Triggers**:

- Push to `main` branch

**Custom Actions Used**:

1. `validate-release-readiness` - Validates version sync and increase

**Process**:

1. **Version Detection**: Uses custom action to compare current Go UIVersion with last git tag
2. **Validation**: Ensures package.json matches Go UIVersion (Go version is source of truth)
3. **Version Increase Check**: Verifies new version is higher than last released version
4. **Conditional Execution**: Only creates draft if validation passes
5. **Release Draft**: Uses Release Drafter with current version from UIVersion constant
6. **Downstream Trigger**: Notifies downstream repositories

**Skip Conditions**:

- No version increase detected (same or lower version than last tag)
- Version files are out of sync

### 3. Release Published Workflow (`.github/workflows/release-published.yml`)

**Purpose**: Validates release and builds packages when a draft release is published.

**Triggers**:

- Release published event

**Custom Actions Used**:

1. `validate-published-release` - Validates release tag matches code versions
2. `build-and-package` - Creates distributable package

**Process**:

1. **Version Validation**: Ensures release tag matches current version files using custom action
2. **Package Building**: Uses custom action to create distributable package
3. **Asset Upload**: Attaches package to release using custom action output
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
   • Auto: Analyze merged commits since last tag
   • Manual: Specify major/minor/patch explicitly
   • Specific: Set exact version (e.g., 2.38.0)
   • Dry Run: Preview what version would be calculated
4. Review the workflow output
5. If successful, a PR will be created automatically using Peter Evans action
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
3. Custom action validates version readiness
4. Creates draft release with version from UIVersion constant
5. Draft includes auto-generated release notes
```

##### Step 4: Publish Release

```bash
1. Go to Releases → Draft release
2. Review auto-generated content
3. Edit release notes if needed
4. Click "Publish release"
5. Release Published workflow validates and handles packaging
```

## 🛠️ Local Development Tools

### Version Validation Script

**Location**: `scripts/validate-versions.sh`

**Usage**:

```bash
# Validate versions match and increased
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
- Verifies current version has increased compared to last git tag (not last commit)
- Acts as gate-keeper for draft release creation
- Used by `validate-release-readiness` custom action

## 🚨 Error Scenarios & Recovery

### No Draft Release Created

**Symptoms**: Version bump PR merged but no draft release appears

**Diagnosis**:

1. Check if both version files were updated in the PR
2. Verify versions in both files match exactly
3. Check Release Draft workflow logs and custom action outputs

**Resolution**:

```bash
1. If versions don't match:
   → Run Version Bump workflow again
   → Or manually sync versions and push to main

2. If workflow failed:
   → Check workflow logs for custom action failures
   → Re-run failed jobs if applicable
```

### Version Mismatch Detected

**Symptoms**: Workflows fail with version sync errors from custom actions

**Diagnosis**: `package.json` and `version.go` have different versions

**Resolution**:

```bash
1. Immediate fix:
   → Run: pnpm validate:versions
   → Check which file is incorrect (Go UIVersion is source of truth)
   → Manually update mismatched file
   → Commit and push changes

2. Proper fix:
   → Use Version Bump workflow with force_update: true
   → This will sync both files to correct version using custom actions
```

### Release Publication Fails

**Symptoms**: Published release fails validation from custom action

**Diagnosis**: Release tag doesn't match current version files

**Resolution**:

```bash
1. Check release tag format (should be vX.Y.Z or X.Y.Z)
2. Verify tag matches package.json and version.go versions
3. If mismatch:
   → Delete the release
   → Fix version sync issues using custom actions
   → Re-run Version Bump workflow
   → Create new release
```

## 🔧 Maintenance & Troubleshooting

### Common Issues

#### Custom Action Failures

- Check individual custom action logs in workflow runs
- Verify inputs are correctly passed between actions
- Ensure repository permissions allow custom action execution

#### Workflow Permissions

- Ensure `GITHUB_TOKEN` has write permissions for contents and PRs
- Verify `TEMPORAL_CICD_APP_ID` and `TEMPORAL_CICD_PRIVATE_KEY` secrets exist
- Custom actions require same permissions as parent workflows

#### Version Format Issues

- All versions must follow semantic versioning (X.Y.Z)
- No prefixes like 'v' in version files (only in git tags)
- Custom actions validate semantic version format

#### Branch Protection

- Ensure main branch allows admin overrides for automated PRs
- Version bump PRs should be exempt from certain checks
- Peter Evans action requires appropriate permissions

### Debugging Workflows

1. **Check Workflow Logs**: Actions tab → Select workflow run → View detailed logs including custom action steps
2. **Validate Locally**: Run `pnpm validate:versions` before debugging
3. **Test Version Bump**: Use dry-run mode to preview changes without custom action modifications
4. **Manual Intervention**: Force update option available for emergencies

### Emergency Procedures

#### Bypass Version Workflow

```bash
# Only in emergencies - manually sync versions
1. Update package.json version
2. Update version.go UIVersion (must match package.json)
3. Commit both changes
4. Create release manually
```

#### Rollback Version

```bash
# If wrong version was released
1. Revert version bump PR
2. Delete incorrect release and tag
3. Re-run Version Bump workflow (custom actions will recalculate)
4. Create new release
```

## 📊 Technical Implementation Details

### Custom Action Architecture

- **Modular Design**: Each action has single responsibility
- **Reusable Components**: Actions used across multiple workflows
- **Error Handling**: Individual actions provide detailed error messages
- **Output Chaining**: Actions pass data between workflow steps

### Version Comparison Logic

- **Git Tag Based**: Compares against last released version, not last commit
- **Semantic Versioning**: Uses proper semver comparison algorithms
- **Go Source of Truth**: Always uses UIVersion constant as authoritative source

### Peter Evans Integration

- **Reliable PR Creation**: Uses battle-tested create-pull-request action
- **Rich PR Content**: Includes changelog and detailed commit information
- **Branch Management**: Automatic branch creation and cleanup

## 📚 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Custom Actions Documentation](https://docs.github.com/en/actions/creating-actions)
- [Peter Evans Actions](https://github.com/peter-evans)
- [Release Drafter Configuration](https://github.com/release-drafter/release-drafter)

## Weekly Frontend On-Call Review

`weekly-oncall-review.yml` creates one Slack thread in `#oncall-frontend` and
fans out to small, independently callable review modules. Scheduling is
intentionally disabled pending enablement; start it from **Actions → Weekly
On-Call Review** when needed. Manual runs default to `dry-run`; choose `apply`
only when the generated dependency remediation draft PR may be updated. Manual
notifications default to `C0BPXR260DA`
(`#other-ross-tests-stuff`) so test runs do not post to the on-call channel.
The `slack_channel` input accepts another Slack channel ID when needed.
If scheduling is reintroduced, the dormant schedule fallback remains
fail-safe: it uses `dry-run` mode and `ONCALL_FRONTEND_SLACK_CHANNEL`.
`notify: false` runs the audits without posting to Slack.

A separate `weekly-oncall-review-pr-test.yml` workflow validates internal pull
requests that change the on-call workflows or the scripts and tests they use. It
does not run for a change to `package.json` or `pnpm-lock.yaml`, because
`lint-and-test.yml` and `playwright.yml` already validate a dependency change on
every pull request. It checks out the PR head SHA and runs the dependency module
in `dry-run` mode plus the VLN and external-review audits. Fork and Dependabot
pull requests are skipped. The PR workflow passes no stored repository secrets
and disables every notification path, so it validates the audit and remediation
logic without posting to Slack or publishing changes.

The same workflow also holds a manual rehearsal. A `workflow_dispatch` run
starts the dependency module in the mode you choose, including `apply`, and sets
the `publish` input to false. The job that holds the GitHub App token therefore
does not run, and no pull request is touched. The publish job also refuses a
`pull_request` event, so the rehearsal has two independent guards.

After merging, use a manual `dry-run` dispatch to the default test channel
`C0BPXR260DA` when Slack delivery itself needs validation.

The coordinator owns the root Slack post and a final status reply. Modules add
their own replies in the same thread:

- `weekly-dependency-security-review.yml` audits Dependabot alerts, applies a
  minimal dependency remediation in `apply` mode, and reports its evidence.
- `weekly-vln-review.yml` reports open VLN remediation PRs.
- `weekly-external-contributor-review.yml` reports active, non-bot PRs from
  external forks. It groups the top five review-ready, triage, and
  author-follow-up candidates and includes a stale-count summary.

The module boundary is intentional: a future on-call concern can be added as a
new `workflow_call` workflow and one more coordinator job without modifying the
existing reviewers.

### Dependency-security safety model

The dependency module is a two-stage workflow. Its audit/remediation job has a
read-only `GITHUB_TOKEN`; it has no Slack token and no Temporal CI/CD App
credential. That job is the only one that runs `pnpm` or project code. It:

1. tests the automation scripts;
2. reads Dependabot alerts using the narrow `vulnerability-alerts: read`
   permission and writes JSON evidence;
3. in `apply` mode, writes the authorized actions of the deterministic plan to
   `package.json`, and records `deterministic-planner` as the resolver. No model
   reads or writes any file. Manual and ambiguous findings stay reported rather
   than changed;
4. proves that the planner created no unexpected file and changed nothing except
   the existing `package.json`;
5. applies any authorized Go module action with `go get` and `go mod tidy`, so
   the Go toolchain owns that change;
6. resolves `pnpm-lock.yaml` in the trusted workflow and performs a fresh frozen
   install, with lifecycle scripts and Husky disabled;
7. permits only `package.json` and `pnpm-lock.yaml` changes;
8. records the audited source revision SHA and SHA-256 hashes for both
   candidate files in the remediation report and a separate attestation before
   package executables run;
9. runs `svelte-kit sync` explicitly to generate the ignored `.svelte-kit`
   metadata normally produced by the disabled lifecycle hook, then runs the unit
   tests, `pnpm run check`, `lint:ci`, and `pnpm build:server` the way the pull
   request checks run them;
10. verifies that none of that package execution changed either candidate file
    or the audit and final remediation evidence, and only then exports all four
    trusted hashes as verified job outputs.

The VLN and external-contributor modules pass narrower audit scopes. They do
not request vulnerability-alert permissions and do not query Dependabot.

Only a successful `apply` candidate is passed as an artifact to the publishing
job. That job does **not** run a package manager or repository package code. It
validates the candidate artifact and its hashes against the audit job's
out-of-band verified outputs, and requires both its checkout and the current
remote `main` to exactly match the audited base SHA. The artifact cannot vouch
for its own integrity. The publisher verifies the audit and final remediation
report hashes before trusting report fields, and the notifier likewise refuses
to digest evidence that does not match those verified outputs. A newer `main`
aborts the publish step so the next run
can regenerate and retest the candidate. The publisher then uses the existing
`TEMPORAL_CICD_APP_ID` and
`TEMPORAL_CICD_PRIVATE_KEY` GitHub App credentials with only contents and pull
request write permissions, and creates or force-with-lease updates the single
draft branch `automation/weekly-dependency-security`.

Premerge PR runs cannot reach the publishing path: they call the dependency
module with `mode: dry-run`, and its publishing job is additionally blocked
for every `pull_request` event. Dry runs require no Slack or GitHub App
secret.

The draft PR is therefore idempotent: one open PR accumulates the current
week's minimal safe fixes. The workflow never dismisses Dependabot alerts;
alerts resolve when a reviewed PR reaches `main`. If an alert needs a major
upgrade, an unsupported manifest/ecosystem, or another manual decision, the
Slack report calls it out instead of changing dependencies.

Artifacts contain the audit, remediation plan, and any approved candidate for
14 days. A Slack reply is still posted when the audit fails or no PR is needed,
so on-call has a durable run link and failure signal. The dependency reply also
receives the publish job's explicit `success`, `failure`, or `skipped` outcome;
it only reports a published remediation when a successful job returned a PR
URL.

### Required configuration

Repository secrets:

- `SLACK_BOT_TOKEN` — used only by the root and module notification jobs.
- `TEMPORAL_CICD_APP_ID` and `TEMPORAL_CICD_PRIVATE_KEY` — used only by the
  dependency publishing job to update the draft PR.

Repository variables:

- `ONCALL_FRONTEND_SLACK_CHANNEL` — Slack channel ID for `#oncall-frontend`.

The automation reports are covered by:

```bash
pnpm test:github-automation
```

This runs the shared audit, remediation planner, and digest tests without
installing or executing the application dependency graph.

## 🔄 File Locations

### Workflows

- Version Bump: `.github/workflows/version-bump.yml`
- Release Draft: `.github/workflows/release-draft.yml`
- Release Published: `.github/workflows/release-published.yml`

### Custom Actions

- Validate Version Sync: `.github/actions/validate-version-sync/action.yml`
- Calculate Version Bump: `.github/actions/calculate-version-bump/action.yml`
- Analyze Version Bump Type: `.github/actions/analyze-version-bump-type/action.yml`
- Update Version Files: `.github/actions/update-version-files/action.yml`
- Validate Release Readiness: `.github/actions/validate-release-readiness/action.yml`
- Validate Published Release: `.github/actions/validate-published-release/action.yml`
- Build and Package: `.github/actions/build-and-package/action.yml`
- Update Version from Release: `.github/actions/update-version-from-release/action.yml`

### Configuration

- Release Drafter Config: `.github/release-drafter.yml`
- Version Validation Script: `scripts/validate-versions.sh`
