# CI and release

Verified at commit: `051de464a`

This document gives the CI workflow graph after the split, the gate job, the release flow with one fixed version, npm trusted publishing, and the effect on the two downstream consumers: `ui-server` and `cloud-ui`. Facts from other repos cite the file, the lines and the commit on GitHub, because the citation checker reads only this repo.

## CI today

| Workflow                   | Jobs                                                                                                               | Required check on `main`                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `lint-and-test.yml`        | `lint`, `check-types`, `unit-tests` (`.github/workflows/lint-and-test.yml:22,30,38`)                               | `unit-tests`                                 |
| `playwright.yml`           | `integration-tests`, `e2e-tests`, each with `timeout-minutes: 60` (`.github/workflows/playwright.yml:18-19,37-38`) | `integration-tests`, `e2e-tests`             |
| `test.yml` ("Server Test") | `test`: `pnpm build:server`, then `make build` and `make test` in `server/` (`.github/workflows/test.yml:13-36`)   | `test`                                       |
| `chromatic.yml`            | `chromatic` on `pull_request_target` (`.github/workflows/chromatic.yml:6,15`)                                      | `UI Tests` (the status that Chromatic posts) |

- Source: the `main` ruleset (`gh api repos/temporalio/ui/rules/branches/main`) requires `unit-tests`, `integration-tests`, `e2e-tests`, `test` and `UI Tests`.
- Branch protection also requires `UI Tests`. No job in this repo has that name. It is the commit status that Chromatic posts for the app Storybook project. On `051de464a`, the `UI Tests` status links to a `chromatic.com` build and says "370 tests unchanged" (GitHub statuses API). The `chromatic` job starts the build (`.github/workflows/chromatic.yml:25-33`).
- `lint` and `check-types` are not required today.
- No test workflow has `paths:`, so every PR runs every job. The PR triggers also run on `codefreeze-*` branches (`.github/workflows/test.yml:6-7`).

## CI after the split

### Graph

```text
pull_request / push to main / merge_group
            │
        ┌───▼────┐
        │changes │  dorny/paths-filter@v4 → outputs: io, app, catalog, dev_tools, config, server, ci, root
        └───┬────┘
   ┌────────┼──────────┬───────────┬────────────┬──────────────┬─────────────┐
   ▼        ▼          ▼           ▼            ▼              ▼             ▼
 lint   check-types unit-tests  package   integration-tests e2e-tests   server-test
 (if)     (if)        (if)       (if)          (if)           (if)          (if)
   └────────┴──────────┴───────────┴────────────┴──────────────┴─────────────┘
                                   │ needs: all, if: always()
                              ┌────▼────┐
                              │ ci-gate │  the only required check
                              └─────────┘

chromatic.yml (pull_request_target): changes → chromatic-io (if io) ; chromatic-app (always, with skip when neither app nor io)
nightly.yml (schedule + workflow_dispatch): every job with every filter set to true
```

- One workflow, `ci.yml`, replaces `lint-and-test.yml`, `playwright.yml` and `test.yml`. All gated jobs and the gate job are in one workflow, so `needs:` can join them. The job names stay the same.
- **No workflow-level `paths:`.** A workflow that `paths:` skips leaves its required checks "Pending", and the PR cannot merge. A job that `if:` skips reports "Success". So each gate is a job-level `if:` on an output of the `changes` job.
- **Do not interpolate the `*_files` outputs of `paths-filter` into `run:`.** File names come from the PR, and interpolation is a script injection path. The jobs read only the boolean outputs.
- `chromatic.yml` stays a separate workflow, because it runs on `pull_request_target` with `statuses: write` (`.github/workflows/chromatic.yml:6-12`). It has its own small `changes` job.
- **`UI Tests` stays a second required check** (decision record 9 in decisions.md). `ci-gate` cannot need it: it is a status from the Chromatic service, from a separate workflow. So `chromatic-app` runs on every PR. When the filters do not need a visual test, it passes `skip: true` to `chromaui/action`. Chromatic then marks the commit as passing, and `UI Tests` never stays "Pending". The workflow already uses this input for Dependabot branches (`.github/workflows/chromatic.yml:33`).

### The filters

| Output      | Paths                                                                                                 | Also true when                                          |
| ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `root`      | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `.github/actions/**`, `scripts/**` | —                                                       |
| `ci`        | `.github/workflows/ci.yml`                                                                            | —                                                       |
| `config`    | `packages/config/**`, `eslint.config.js`, `.prettierrc`, `.stylelintrc`, `knip.config.ts`             | —                                                       |
| `io`        | `packages/io/**`                                                                                      | `root`, `ci`                                            |
| `catalog`   | `packages/catalog/**`                                                                                 | `root`, `ci`                                            |
| `dev_tools` | `packages/dev-tools/**`                                                                               | `root`, `ci`                                            |
| `app`       | `apps/ui/**`                                                                                          | `root`, `ci`, `io`, `catalog` (the app depends on them) |
| `server`    | `server/**`                                                                                           | `root`, `ci`                                            |

`root` and `ci` turn on every filter, and the job commands then run every package (below). A change to the lockfile or to the CI itself then runs everything, so a dependency bump never skips a test.

**The filters change with each move.** Stage 0.1 starts with filters for today's layout. There, `app` is every path except `server/**`, `docs/**`, `specs/**`, `examples/**`, `agent-plugins/**` and the Markdown files at the root. A negative filter cannot miss an app input such as `tests/**`, `static/**`, `plugins/**`, `utilities/**`, `temporal/**` or a root config file. Each Stage 1 PR that moves files changes the filters in the same PR (migration-plan.md). Between two steps, no app PR skips a test.

### Which jobs run

| Job                          | Runs when                                                              | Command                                                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint`                       | always (it is fast and covers all packages)                            | `pnpm lint:ci` (prettier, eslint with the boundary rules, stylelint, knip)                                                                                                        |
| `check-types`                | any of `io`, `catalog`, `dev_tools`, `app`, `config`                   | `pnpm -r $SELECT check` (see `SELECT` below)                                                                                                                                      |
| `unit-tests`                 | any of `io`, `catalog`, `dev_tools`, `app`                             | `pnpm -r $SELECT test -- --run`                                                                                                                                                   |
| `package`                    | `io` or `app`                                                          | `pnpm --filter "./packages/io" --filter "./apps/ui" pack`, then the import scan of the packed `dist` files and the manifest check of the packed `package.json` (boundary rule B6) |
| `integration-tests`          | `app` or `dev_tools`                                                   | `pnpm --filter @temporalio/ui test:integration`                                                                                                                                   |
| `e2e-tests`                  | `app`, `dev_tools` or `server` (the job builds and runs the Go server) | `pnpm build:server`, `make build` in `server/`, then `pnpm --filter @temporalio/ui test:e2e` against that server                                                                  |
| `server-test` (today `test`) | `server` or `app` (the Go build embeds the app build)                  | `pnpm build:server`, then `make build` and `make test` in `server/`                                                                                                               |
| `chromatic-io`               | `io`                                                                   | Chromatic in `packages/io`                                                                                                                                                        |
| `chromatic-app`              | every PR. `skip: true` when neither `app` nor `io`                     | Chromatic in `apps/ui`. It posts the required `UI Tests` status.                                                                                                                  |

In these cases, `SELECT` is empty, and the command runs every package:

- the `full` input is `true` (the nightly run)
- the event is `push` (to `main`)
- the `root` or the `ci` filter is `true` (for example, a catalog version bump that changes only `pnpm-workspace.yaml` and `pnpm-lock.yaml`)

In all other cases, `SELECT` is `--filter "...[$BASE]"` (pnpm 12.7 and later use the merge base). It selects the changed packages and the packages that depend on them. A change in `packages/io` then also checks and tests `apps/ui`. Without this rule, the diff on `main` is empty, the filter selects no package, and pnpm exits with 0 and tests nothing.

`BASE` and the checkout:

- For `pull_request`, `BASE` is `origin/<base branch>` from `github.base_ref`. For `merge_group`, `BASE` is `github.event.merge_group.base_sha`, the commit that the queue merges into. The job passes the value through `env:`, not by interpolation in `run:`.
- `check-types` and `unit-tests` check out with `fetch-depth: 0`. Today each job checks out with no `fetch-depth` (`.github/workflows/lint-and-test.yml:25,33,41`). That clone has a depth of 1 and no `origin/main` ref, so pnpm cannot find the merge base. A full clone has the base branch and the merge base.
- A step before the command runs `git rev-parse --verify "$BASE^{commit}"`, but only when `SELECT` uses `BASE`. In the three cases above, `SELECT` is `-r`, the job sets no `BASE`, and the step does not run. If `SELECT` uses `BASE` and the ref is missing, the job fails. It does not continue with an empty selection.
- Only these two jobs need the full history. The other jobs keep the clone with a depth of 1.

### Example: a PR that changes only `packages/io` (R3.S1)

The filters give `io = true` and `app = true` (the app depends on Io). All others are `false`.

| Job                 | Result                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `changes`           | runs                                                                                                                                                              |
| `lint`              | runs                                                                                                                                                              |
| `check-types`       | runs for `@temporalio/io` and `@temporalio/ui`                                                                                                                    |
| `unit-tests`        | runs for `@temporalio/io` and `@temporalio/ui`                                                                                                                    |
| `package`           | runs                                                                                                                                                              |
| `integration-tests` | runs (the app changed through Io)                                                                                                                                 |
| `e2e-tests`         | runs                                                                                                                                                              |
| `server-test`       | runs (`app` is true, and the Go build embeds the app build)                                                                                                       |
| `chromatic-io`      | runs                                                                                                                                                              |
| `chromatic-app`     | runs, with no skip (Holocene stories render Io components)                                                                                                        |
| `ci-gate`           | runs, with `if: always()`. It fails if any job in `needs` has the result `failure` or `cancelled`. It passes when each job has the result `success` or `skipped`. |

No job skips for a change only in `packages/io`. Io is the base of the app, so the app tests and the Go build must run. Savings come from other changes:

- `server/` only: `check-types`, `unit-tests`, `package` and `integration-tests` skip, and `chromatic-app` passes with `skip`. `e2e-tests` runs, because it is the only browser test of the Go server (`.github/workflows/playwright.yml:46-60`).
- `packages/dev-tools` only: `package`, `server-test` and the Chromatic builds skip.
- `specs/**` or `docs/**` only: `changes`, `lint`, `ci-gate` and a skipped `chromatic-app` run.

### The gate job

```yaml
ci-gate:
  if: always()
  needs:
    [
      changes,
      lint,
      check-types,
      unit-tests,
      package,
      integration-tests,
      e2e-tests,
      server-test,
    ]
  runs-on: ubuntu-latest
  steps:
    - name: Fail if a needed job failed or was cancelled
      if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')
      run: exit 1
```

- The `main` ruleset then requires `ci-gate`, in place of `unit-tests`, `integration-tests`, `e2e-tests` and `test`.
- The ruleset change goes in the same PR window as the new workflow (see migration-plan.md, Stage 0).
- `UI Tests` (Chromatic) stays required. This is a deviation from "one required check" (decision record 9).
- `ci-gate` reports a result in all cases. `if: always()` makes it run when a dependency failed or skipped.

### Nightly full run

`nightly.yml` runs at 06:00 UTC on `main` (`schedule`) and on `workflow_dispatch`. It calls `ci.yml` as a reusable workflow with the input `full: true`. The input sets every filter output to `true`, and it makes `SELECT` empty, so each command runs every package. A failure posts to the team's CI channel. The nightly run catches a missed dependency between packages that the filters did not see.

## Release

### One fixed version

`@temporalio/ui`, `@temporalio/io` and the Go server have one version, and 2.x continues.

- `UIVersion` in `server/server/version/version.go:31` stays the source of truth.
- `version-bump.yml` (manual dispatch) uses `.github/actions/update-version-files`. Today the action writes the root `package.json` (`.github/actions/update-version-files/action.yml:50-54`). After the split, it writes `apps/ui/package.json` and `packages/io/package.json`. The private packages keep `0.0.0`.
- `scripts/validate-versions.sh` and `.github/actions/validate-version-sync` check both published files against `UIVersion` (config-strategy.md, site 16).
- `.github/actions/validate-published-release` reads the version from the root `package.json` today (`.github/actions/validate-published-release/action.yml:38`). The private root has no version, so `jq` gives `null` and every release stops at its first step. The action reads `apps/ui/package.json` from step 1.2, and both published files from step 1.3 (migration-plan.md).
- No Changesets. A fixed group needs no per-package bump files, and `version-bump.yml` already computes the bump from commits. The team adds Changesets or pnpm `versioning` only if it wants per-package changelogs or snapshot publishing (Stage 3).

### Publish flow

```text
version-bump.yml (dispatch) → version PR → merge → release-draft.yml (push to main)
   → a person publishes the GitHub release → release-published.yml:
       job create_release (today, one job, release-published.yml:14-59):
         1. validate-published-release (reads apps/ui/package.json, see above)
         2. build-and-package → release asset temporal-ui-package.tar.gz (name unchanged)
         3. dispatch sync-from-ui-release to ui-server (unchanged)
       job publish-npm (new, needs: create_release):
         4. pnpm pack @temporalio/io, then @temporalio/ui → two npm tarballs
         5. attest both tarballs, and attach them to the release
         6. npm publish of the @temporalio/io tarball, then of the @temporalio/ui tarball
```

- `publish-npm` is a separate job. The `ui-server` dispatch is in `create_release` and does not wait for npm. An npm failure (an expired trusted-publisher entry, or the first-publish case below) does not stop the `ui-server` release.
- `publish-npm` is new. Today no workflow publishes to npm, and npm has `@temporalio/ui` 2.38.0 while the repo has 2.58.1 (claims ledger, row 14).
- The first release after step 1.3 publishes both packages at the same version. `@temporalio/io` is published first, because `@temporalio/ui` depends on it.
- `pnpm pack` writes the real version in place of `workspace:*`. `npm publish` then publishes that exact tarball.
- Step 5 uses `actions/attest-build-provenance` on the two `.tgz` files. The job summary also prints the `sha512` of each file. The fallback below uses this.

### npm trusted publishing

| Item            | Value                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Job permissions | `id-token: write`, `attestations: write` and `contents: write` (to attach the tarballs) on the `publish-npm` job only. The workflow-level permissions (`.github/workflows/release-published.yml:7-11`) do not give `id-token`. |
| Registration    | One trusted-publisher entry per package on npmjs.com: repo `temporalio/ui`, workflow file `release-published.yml` (the exact file name). A rename of the file breaks publishing.                                               |
| Tools           | npm CLI 11.5.1 or later, Node 22.14 or later (the repo has `^22.23.4`), a GitHub-hosted runner                                                                                                                                 |
| Provenance      | npm makes it automatically under trusted publishing for a public source repo                                                                                                                                                   |
| Tokens          | None. npm revoked classic tokens on 2025-12-09.                                                                                                                                                                                |

#### The first publish of `@temporalio/io` (R3.S3)

`@temporalio/io` does not exist on npm (`npm view @temporalio/io` returns 404).

1. An owner of the `@temporalio` npm org makes sure that the scope lets the release team publish a new package.
2. On npmjs.com, the owner adds a trusted-publisher entry for `@temporalio/io` with the repo `temporalio/ui` and the workflow `release-published.yml`.
3. **The 2-day rule:** a new trusted-publisher entry expires if no publish uses it within 2 days. So the owner adds the entry only when a release is ready, not before.
4. The release runs. The `publish-npm` job publishes `@temporalio/io` through OIDC.
5. If step 4 fails because OIDC cannot publish a package that does not exist yet (reported in late 2025, and not confirmed as fixed), use the fallback.

**Fallback:**

1. An org owner downloads the `@temporalio/io` `.tgz` that `publish-npm` attached to the release (step 5 of the publish flow). It is an `npm pack` tarball, not the `dist` archive that `build-and-package` makes (`.github/actions/build-and-package/action.yml:24-25`).
2. The owner runs `gh attestation verify <file> --repo temporalio/ui`, and compares the `sha512` with the job summary. A release asset can change after the upload, so the owner does not skip this check.
3. The owner publishes that file one time by hand: `npm publish <file> --access public`, with 2FA.
4. The owner adds the trusted-publisher entry.
5. The next release publishes through OIDC.

The manual publish has no npm provenance. The GitHub attestation shows that CI built the file. The risks document lists this case until someone confirms the OIDC behavior.

`@temporalio/ui` already exists on npm. It needs only its trusted-publisher entry. It is not known if the entry exists today (see risks-and-open-questions.md).

## Downstream consumers

### `ui-server` sync (R3.S2)

How it works today:

- `ui-server` receives `sync-from-ui-commit` from `.github/workflows/release-draft.yml:28-37` and `sync-from-ui-release` from `.github/workflows/release-published.yml:48-58`.
- Its action `.github/actions/download-and-build-ui/action.yaml` (lines 31-38 at `ui-server` commit 155f6a6036) checks out `temporalio/ui` at the ref and runs `pnpm install` and `pnpm build:server` **in the repo root**. It then copies `ui-release/server/` with `rsync`.
- Its `setup-node` action reads `packageManager` and the Node version from the ui root `package.json`.

What keeps it unchanged:

1. The root `package.json` keeps a `build:server` script: `pnpm --filter @temporalio/ui build:server`.
2. `apps/ui` sets `BUILD_PATH=../../server/ui/assets/local`, so the output stays at `server/ui/assets/local`. Spike check 5 tests this.
3. `server/` stays at the root, so the `rsync` source does not change.
4. The root `package.json` keeps `packageManager` and `engines.node`.

**One condition:** `ui-server` uses `pnpm/action-setup@v4`. It must install pnpm 12 from the `packageManager` field. pnpm 12 is a Rust rewrite with a new distribution. If `action-setup@v4` cannot install it, the sync breaks on the first commit after the pnpm 12 change. Stage 0 tests this before the change merges (migration-plan.md).

### `cloud-ui` dispatch (R3.S2)

How it works today:

- `.github/workflows/trigger-downstream-updates.yml:53-55` sends `{ui_commit_sha, mode}`, and `.github/workflows/trigger-downstream-updates.yml:62-66` sends it to `cloud-ui`.
- In `cloud-ui`, `.github/workflows/generate-ui-pr.yml` (lines 94-102 at `cloud-ui` commit 084835064) downloads `temporalio/ui` at that SHA and runs `pnpm svelte-kit sync`, `pnpm package` and `pnpm pack` **in the repo root**. It installs the tarball as `@temporalio/ui: file:./packs/temporalio-ui-<sha>.tgz`.

**This is a disagreement with the brief.** The brief says that the `cloud-ui` dispatch keeps working unchanged. The dispatch does, but the receiving workflow does not:

1. In the `apps/ui` layout, the root is a private workspace root. `pnpm package` and `pnpm pack` at the root no longer build `@temporalio/ui`.
2. The packed `@temporalio/ui` depends on `@temporalio/io` at the same version. That version is not on npm for an unreleased SHA, so the install in `cloud-ui` fails.

What stays the same: the event, the payload (`ui_commit_sha`, `mode`) and the trigger. The trigger paths change only to the new folders (config-strategy.md, site 15).

What changes in `cloud-ui`, with step 1.2 (`generate-ui-pr.yml`, about 10 lines, in the same week as the move PR):

1. Set `source-path: source/apps/ui` for the build and pack step, or set the build command to `pnpm --filter @temporalio/ui... package`.
2. Pack every public workspace package: a loop over the `package.json` files of `apps/*` and `packages/*` whose `private` is not `true`. From step 1.3, this also packs `@temporalio/io`, so step 1.3 needs no change to this workflow.
3. Install the tarballs, and add a `pnpm.overrides` entry `"@temporalio/io": "file:./packs/temporalio-io-<sha>.tgz"` when that tarball exists, so the `@temporalio/ui` tarball resolves its Io dependency.

What changes in `cloud-ui` with step 1.3 (`tailwind.config.ts` and `package.json`, about 5 lines):

4. Add `@temporalio/io` as a direct dependency, from the same tarball. Under pnpm, only a direct dependency gets a folder at `node_modules/@temporalio/io`.
5. Add `./node_modules/@temporalio/io/dist/**/*.{html,js,svelte,ts}` to the Tailwind `content`. Today `cloud-ui` scans only `./node_modules/@temporalio/ui/dist/**` (`tailwind.config.ts` lines 7-12 at `cloud-ui` commit 2e61fe9e1). After step 1.3, the Io recipes, for example `badge/recipe.ts`, are only in `@temporalio/io`. Without this glob, Io components render without their classes, and no build fails. Spike check 3 showed this loss in the app. The local-UI branch of the same config (`CLOUD_UI_LOCAL_UI_TAILWIND_CONTENT`) also needs the `packages/io/src` path.

#### `cloud-ui` imports that must keep working

`cloud-ui` imports these `@temporalio/ui` paths (a search of `cloud-ui` at commit 2e61fe9e1). Each one stays in the 2.x export map of `@temporalio/ui`. The step 1.3 and 1.4 exit criteria import each path from the packed tarball.

| Path                                                                                                                                                    | References                  | After the split                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `io/icon`, `io/badge`, `io/badge-count`, `io/tag`, `io/chip`                                                                                            | 334 (269 of them `io/icon`) | A folder re-export to `@temporalio/io` (target-layout.md, `packages/io`)                           |
| `io/badge/badge.svelte`, `io/icon/icon-svg-wrapper.svelte`, `io/segmented-control/segmented-control.svelte`, `io/segmented-control/segment-link.svelte` | 7                           | A file re-export with the same key                                                                 |
| `theme/io/themes`                                                                                                                                       | 10                          | A re-export of the Io theme file                                                                   |
| `theme/preset`                                                                                                                                          | 1 (`tailwind.config.ts`)    | A re-export that keeps the old `content` glob (config-strategy.md, site 6)                         |
| `catalog/worker/*`, `catalog/authoring`, `catalog/browser/*`, `catalog/host/ui-services`                                                                | 52 in 26 files              | The compiled copy of the catalog modules, and the catalog UI (target-layout.md, decision record 2) |
| `holocene/*`, `components/*`, `utilities/*`, `stores/*`, `services/*`, `pages/*`, `i18n/*`                                                              | many                        | No change: the app files stay in `apps/ui`                                                         |

The other option is to keep `@temporalio/io` inside the `@temporalio/ui` tarball in 2.x (`bundleDependencies`). Then `cloud-ui` needs only change 1, but a consumer can get two copies of Io. The meeting summary has this choice as a vote. The recommendation is the change to `cloud-ui`, because the `cloud-ui` pack flow is then the same as the npm publish flow.

## Compatibility with Turborepo

`ci.yml` runs pnpm filters, not a task runner. Turborepo can replace the `--filter "...[$BASE]"` calls later with `turbo run <task> --affected`, which reads `GITHUB_BASE_REF`. The `changes` job and `ci-gate` stay. A remote cache would save time mostly in `check-types` and `unit-tests`. Independent data shows modest gains from the cache, with a median of 20 to 18 minutes at Sentry, and larger gains from affected-only runs. This design gets the affected-only runs without Turborepo.
