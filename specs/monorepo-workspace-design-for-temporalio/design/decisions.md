# Decision records

Verified at commit: `051de464a`

Decision records 1 (the app moves to `apps/ui`) and 2 (the catalog split) are in [target-layout.md](target-layout.md). This file has the records for the five open decisions of the meeting.

## Decision record 3: go or no-go

- **Question:** does the team start the split?
- **Options:**
  1. **Go in two gates (recommended).** Start Stage 0 after the code freeze. Start Stage 1 only when Stage 0 meets its exit criteria (migration-plan.md).
  2. **Go now, all of it.** Stage 0 and Stage 1 run together.
  3. **No-go.** Keep the single package and do only the Stage 0 items that help on their own: CI path gating, pnpm 12, Dependabot for Go, the Io i18n fix and the alias map.
- **Recommendation:** option 1.
  - Each Stage 0 PR is useful without Stage 1. A later no-go then wastes nothing.
  - Stage 0.1 and 0.2 remove the two largest risks before any file moves: a "Pending" required check, and a pnpm 12 failure in the `ui-server` sync.
- **Evidence:** spike-results.md, and the Stage 0 table in migration-plan.md.

## Decision record 4: publish Io as `@temporalio/io`

- **Question:** does Io become its own published package?
- **Options:**
  1. **Publish `@temporalio/io`. `@temporalio/ui` keeps `./io/*` as re-exports for all of 2.x (recommended).** A removal of the re-exports is a 3.0 change with a one-line codemod (`@temporalio/ui/io/` to `@temporalio/io/`).
  2. **A private `packages/io`.** Only `@temporalio/ui` is published, and Io is inside it. The workspace boundary still holds in the repo.
  3. **No Io package.** Io stays in `src/lib/io`, and an eslint zone enforces its boundary.
- **Recommendation:** option 1.
  - Io is the only part that is cleanly carvable today: 3 app imports, all of i18n (claims ledger, row 7).
  - A consumer who needs only the design system then installs a small package that does not depend on SvelteKit.
  - The re-exports keep every 2.x import path working. A removal of an `exports` path is a semver-major change.
- **Cost:**
  - A second package to publish, with its own first-publish risk (risks-and-open-questions.md, Q5).
  - The `cloud-ui` pack flow must handle two tarballs (decision record 6).
- **Evidence:** target-layout.md (the `packages/io` shape), and spike check 1.

## Decision record 5: one fixed version

- **Question:** do `@temporalio/ui`, `@temporalio/io` and the Go server share one version?
- **Options:**
  1. **One fixed version, 2.x continues, `UIVersion` stays the source of truth (recommended).** `version-bump.yml` writes N files.
  2. **Independent versions** (the Radix, Primer and SvelteKit pattern) with Changesets.
  3. **Fixed for the packages, independent for the Go server.**
- **Recommendation:** option 1.
  - The release flow, the tags (`vX.Y.Z` in `ui` and `ui-server`) and the version checks already assume one version.
  - Chakra, Mantine and Docusaurus use a fixed group for the same reason: their packages ship together.
  - Independent versions need Changesets and a new tag scheme, and they would break the parity check (`scripts/validate-versions.sh:6-7`).
- **Cost:** `@temporalio/io` gets a new version when only the app changes. That is acceptable for a package whose consumers already take `@temporalio/ui` at the same version.
- **Evidence:** ci-and-release.md, "One fixed version".

## Decision record 6: how `cloud-ui` gets Io in 2.x

- **Question:** the `cloud-ui` pack flow builds `@temporalio/ui` from a SHA at the repo root. After the split, it cannot. Which fix?
- **Options:**
  1. **`cloud-ui` packs every public workspace package and overrides `@temporalio/io` with its tarball (recommended).** About 10 lines in `generate-ui-pr.yml` in `cloud-ui`, in the same window as the move PR.
  2. **`@temporalio/ui` bundles `@temporalio/io`** (`bundleDependencies`). `cloud-ui` changes only its build path.
  3. **Keep the app at the root** (decision record 1, option 2). Then `pnpm package` at the root still builds `@temporalio/ui`, but the Io dependency problem stays.
- **Recommendation:** option 1. The `cloud-ui` flow then matches the npm publish flow. Option 2 can give npm consumers two copies of Io.
- **This is a disagreement with the brief.** The brief said that the `cloud-ui` dispatch keeps working unchanged. The dispatch does, but the workflow that receives it does not.
- **Evidence:** ci-and-release.md, "`cloud-ui` dispatch", and risks-and-open-questions.md, Q1.

## Decision record 7: CI shape and the task runner

- **Question:** how does CI run only what a PR changed?
- **Options:**
  1. **One `ci.yml` with `dorny/paths-filter`, job-level `if:`, one `ci-gate` required check and a nightly full run. pnpm `--filter "...[origin/main]"` selects packages. No task runner now (recommended).**
  2. **Turborepo now,** with `turbo run --affected` and a remote cache.
  3. **Nx.**
- **Recommendation:** option 1.
  - The largest savings come from affected-only runs. pnpm 12.7 gives these without a new tool.
  - Independent data shows modest cache gains (Sentry: a median of 20 to 18 minutes).
  - The design stays compatible with Turborepo. The `changes` job and `ci-gate` stay, and `turbo run --affected` can replace the pnpm filters later.
  - Nx 24 adds a paid cloud tier and more config than this repo needs.
- **Evidence:** ci-and-release.md.
