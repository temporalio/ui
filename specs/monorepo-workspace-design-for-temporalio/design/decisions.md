# Decision records

Verified at commit: `051de464a`

Decision records 1 (the app moves to `apps/ui`) and 2 (the catalog split) are in [target-layout.md](target-layout.md). This file has the records for the five open decisions of the meeting (3 to 7), and the records for the places where the design departs from the brief or the spec (8 to 10).

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
  2. **A private `packages/io`.** Only `@temporalio/ui` is published, and Io is inside it. The workspace boundary still holds in the repo. The spike showed that the `@temporalio/ui/io/*` re-exports then need `bundleDependencies`, because they import `@temporalio/io` (spike-results.md, check 1).
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
  1. **`cloud-ui` packs every public workspace package and overrides `@temporalio/io` with its tarball (recommended).** About 10 lines in `generate-ui-pr.yml` in `cloud-ui`, in the same window as the move PR, and about 5 lines (the Io dependency and the Tailwind glob) with step 1.3.
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

## Decision record 8: Io takes the theme

- **Item of the brief:** the published Tailwind preset is `@temporalio/ui/theme/preset` (`src/lib/theme/preset.ts:17`), in the app package.
- **Evidence:**
  - `src/lib/theme` imports only `tailwindcss` (`src/lib/theme/plugin.ts:1`, `src/lib/theme/preset.ts:1`). It imports no app code.
  - Io components need the preset and the plugin to render. In the spike, the Io Storybook still got its styles from the app CSS (spike-results.md, check 2).
  - `cloud-ui` imports `@temporalio/ui/theme/io/themes` 10 times and `@temporalio/ui/theme/preset` one time (ci-and-release.md).
- **Options:**
  1. **Io takes `src/lib/theme` and the base CSS layers. `@temporalio/ui` re-exports each theme path for all of 2.x (recommended).**
  2. **The theme stays in `apps/ui`.** Io then needs the theme from `@temporalio/ui`, so the published Io package depends on the app. That breaks rule B1 and makes a cycle.
  3. **A third published package for the theme.** It adds a package, a trusted publisher and a first publish for 13 files.
- **Recommendation:** option 1. The published surface keeps every 2.x path. The preset in `@temporalio/io` drops its `content` glob (config-strategy.md, site 6).
- **Cost:** `cloud-ui` adds the Io `content` glob (ci-and-release.md, `cloud-ui` change 5).

## Decision record 9: `UI Tests` stays a second required check

- **Item of the spec:** R3.S1 asks that the gate job is the only required check.
- **Evidence:**
  - The `main` ruleset requires `UI Tests` (ci-and-release.md, "CI today").
  - `UI Tests` is the commit status that Chromatic posts for the app Storybook project. On `051de464a`, the status links to a `chromatic.com` build (GitHub statuses API).
  - `chromatic.yml` runs on `pull_request_target`, and the job ends when the upload ends (`.github/workflows/chromatic.yml:6,31`). The visual result comes later, from the Chromatic service. A job in `ci.yml` cannot wait for it, so `ci-gate` cannot need it.
- **Options:**
  1. **Keep `UI Tests` required. `chromatic-app` runs on every PR and passes `skip: true` when no visual test is necessary (recommended).** The status then never stays "Pending".
  2. **Remove `UI Tests` from the ruleset in Stage 0.1.** Then `ci-gate` is the only required check, but a visual change no longer blocks a merge. That is a policy change that the brief did not ask for.
  3. **Move Chromatic into `ci.yml`, and make the job wait for the build result.** The job then needs the project token on `pull_request`, which a PR from a fork does not get.
- **Recommendation:** option 1. `ci-gate` is the only required check that this repo's CI makes. `UI Tests` stays as the visual-review gate.
- **Open item:** the name of the status that the second (Io) Chromatic project posts is not known. Only the app project's `UI Tests` is required (risks-and-open-questions.md, Q4).

## Decision record 10: two Storybooks and two Chromatic projects

- **Item of the spec:** R1.S2 asks that Storybook and Chromatic each have exactly one owner package.
- **Evidence:**
  - The Io stories (13 today) document the published Io package, and they must build without the app. The spike built them in `packages/io` (spike-results.md, check 2).
  - The Holocene, component and catalog UI stories (59 today) import app code, so they cannot build in `packages/io`.
  - Chromatic builds one Storybook per project.
- **Options:**
  1. **`apps/ui` owns Storybook and Chromatic (the version, the addons, the required project). `packages/io` runs a second Storybook and a second Chromatic project (recommended).**
  2. **One Storybook in `apps/ui` that also loads the Io stories through a `refs` entry.** One owner and one project, but the Io stories then build only with the app.
  3. **One Storybook in `packages/io` only.** Not possible: the app stories import app code.
- **Recommendation:** option 1. If the team does not want a second Chromatic project, option 2 is the fallback (risks-and-open-questions.md, S2).
- **Cost:** a second Chromatic project (risks-and-open-questions.md, K8).

## Disagreements that change no design choice

These items of the brief were not accurate. The design records them as facts. They change no option and need no record.

- **The coupling is larger than the brief counted:** 53 Holocene imports, not about 20, and 70 relative tool imports into `src/`, not about 7 (README.md, claims ledger, rows 9 and 22). Holocene stays in the app either way, and the dev-tools package takes the tool imports.
- **A change only in Io saves no CI job.** The app depends on Io, so every app job runs (ci-and-release.md, the Io-only example). The savings come from other changes. The CI shape of decision record 7 does not change.
