# CI and release

Verified at commit: `051de464a`

This document gives the CI workflow graph after the split, the gate job, the release flow with one fixed version, npm trusted publishing, and the effect on the two downstream consumers: `ui-server` and `cloud-ui`. Facts from other repos cite the file, the lines and the commit on GitHub, because the citation checker reads only this repo.

## CI today

| Workflow                   | Jobs                                                                                                               | Required check on `main`         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `lint-and-test.yml`        | `lint`, `check-types`, `unit-tests` (`.github/workflows/lint-and-test.yml:22,30,38`)                               | `unit-tests`                     |
| `playwright.yml`           | `integration-tests`, `e2e-tests`, each with `timeout-minutes: 60` (`.github/workflows/playwright.yml:18-19,37-38`) | `integration-tests`, `e2e-tests` |
| `test.yml` ("Server Test") | `test`: `pnpm build:server`, then `make build` and `make test` in `server/` (`.github/workflows/test.yml:13-36`)   | `test`                           |
| `chromatic.yml`            | `chromatic` on `pull_request_target` (`.github/workflows/chromatic.yml:6,15`)                                      | none                             |

- Source: the `main` ruleset (`gh api repos/temporalio/ui/rules/branches/main`) requires `unit-tests`, `integration-tests`, `e2e-tests`, `test` and `UI Tests`.
- Branch protection also requires `UI Tests`. No workflow in this repo has a job with that name, so the check comes from outside (see risks-and-open-questions.md).
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

chromatic.yml (pull_request_target): changes → chromatic-io (if io) ; chromatic-app (if app or io)
nightly.yml (schedule + workflow_dispatch): every job with every filter set to true
```

- One workflow, `ci.yml`, replaces `lint-and-test.yml`, `playwright.yml` and `test.yml`. All gated jobs and the gate job are in one workflow, so `needs:` can join them. The job names stay the same.
- **No workflow-level `paths:`.** A workflow that `paths:` skips leaves its required checks "Pending", and the PR cannot merge. A job that `if:` skips reports "Success". So each gate is a job-level `if:` on an output of the `changes` job.
- **Do not interpolate the `*_files` outputs of `paths-filter` into `run:`.** File names come from the PR, and interpolation is a script injection path. The jobs read only the boolean outputs.
- `chromatic.yml` stays a separate workflow, because it runs on `pull_request_target` with `statuses: write` (`.github/workflows/chromatic.yml:6-12`). It has its own small `changes` job. Chromatic is not a required check today, and it does not become one.

### The filters

| Output      | Paths                                                                                     | Also true when                                          |
| ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `root`      | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `.github/actions/**`   | —                                                       |
| `ci`        | `.github/workflows/ci.yml`                                                                | —                                                       |
| `config`    | `packages/config/**`, `eslint.config.js`, `.prettierrc`, `.stylelintrc`, `knip.config.ts` | —                                                       |
| `io`        | `packages/io/**`                                                                          | `root`, `ci`                                            |
| `catalog`   | `packages/catalog/**`                                                                     | `root`, `ci`                                            |
| `dev_tools` | `packages/dev-tools/**`                                                                   | `root`, `ci`                                            |
| `app`       | `apps/ui/**`                                                                              | `root`, `ci`, `io`, `catalog` (the app depends on them) |
| `server`    | `server/**`                                                                               | `root`, `ci`                                            |

`root` and `ci` turn on every filter. A change to the lockfile or to the CI itself then runs everything, so a dependency bump never skips a test.

### Which jobs run

| Job                          | Runs when                                             | Command                                                                                   |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `lint`                       | always (it is fast and covers all packages)           | `pnpm lint:ci` (prettier, eslint with the boundary rules, stylelint, knip)                |
| `check-types`                | any of `io`, `catalog`, `dev_tools`, `app`, `config`  | `pnpm -r --filter "...[origin/main]" check` (pnpm 12.7 and later use the merge base)      |
| `unit-tests`                 | any of `io`, `catalog`, `dev_tools`, `app`            | `pnpm -r --filter "...[origin/main]" test -- --run`                                       |
| `package`                    | `io` or `app`                                         | `pnpm -r --filter "./packages/io" --filter "./apps/ui" pack --dry-run` (boundary rule B6) |
| `integration-tests`          | `app` or `dev_tools`                                  | `pnpm --filter @temporalio/ui test:integration`                                           |
| `e2e-tests`                  | `app` or `dev_tools`                                  | `pnpm --filter @temporalio/ui test:e2e`                                                   |
| `server-test` (today `test`) | `server` or `app` (the Go build embeds the app build) | `pnpm build:server`, then `make build` and `make test` in `server/`                       |
| `chromatic-io`               | `io`                                                  | Chromatic in `packages/io`                                                                |
| `chromatic-app`              | `app` or `io`                                         | Chromatic in `apps/ui`                                                                    |

`...[origin/main]` selects the changed packages and the packages that depend on them. A change in `packages/io` then also checks and tests `apps/ui`.

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
| `server-test`       | **skips** (`if:` is false, and GitHub reports Success)                                                                                                            |
| `chromatic-io`      | runs                                                                                                                                                              |
| `chromatic-app`     | runs (Holocene stories render Io components)                                                                                                                      |
| `ci-gate`           | runs, with `if: always()`. It fails if any job in `needs` has the result `failure` or `cancelled`. It passes when each job has the result `success` or `skipped`. |

A change only in `packages/io` saves only the Go job. Io is the base of the app, so the app tests must run. Large savings come from changes to `server/` only (it skips all browser tests), to `packages/dev-tools` only, and to docs only. A PR that changes only `specs/**` or `docs/**` runs `changes`, `lint` and `ci-gate`.

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
- `UI Tests` stays required until its owner is known.
- `ci-gate` reports a result in all cases. `if: always()` makes it run when a dependency failed or skipped.

### Nightly full run

`nightly.yml` runs at 06:00 UTC on `main` (`schedule`) and on `workflow_dispatch`. It calls `ci.yml` as a reusable workflow with the input `full: true`. The input sets every filter output to `true`. A failure posts to the team's CI channel. The nightly run catches a missed dependency between packages that the filters did not see.

## Release

### One fixed version

`@temporalio/ui`, `@temporalio/io` and the Go server have one version, and 2.x continues.

- `UIVersion` in `server/server/version/version.go:31` stays the source of truth.
- `version-bump.yml` (manual dispatch) uses `.github/actions/update-version-files`. Today the action writes the root `package.json` (`.github/actions/update-version-files/action.yml:50-54`). After the split, it writes `apps/ui/package.json` and `packages/io/package.json`. The private packages keep `0.0.0`.
- `scripts/validate-versions.sh` and `.github/actions/validate-version-sync` check both published files against `UIVersion` (config-strategy.md, site 16).
- No Changesets. A fixed group needs no per-package bump files, and `version-bump.yml` already computes the bump from commits. The team adds Changesets or pnpm `versioning` only if it wants per-package changelogs or snapshot publishing (Stage 3).

### Publish flow

```text
version-bump.yml (dispatch) → version PR → merge → release-draft.yml (push to main)
   → a person publishes the GitHub release → release-published.yml:
       1. validate-published-release (today)
       2. build-and-package: @temporalio/io, then @temporalio/ui → release assets
          (temporal-ui-package.tar.gz keeps its name; temporal-io-package.tar.gz is new)
       3. publish-npm (new): pnpm --filter @temporalio/io publish, then pnpm --filter @temporalio/ui publish
       4. dispatch sync-from-ui-release to ui-server (today, unchanged)
```

- Step 3 is new. Today no workflow publishes to npm, and npm has `@temporalio/ui` 2.38.0 while the repo has 2.58.1 (claims ledger, row 14).
- The first release after the split publishes both packages at the same version. `@temporalio/io` is published first, because `@temporalio/ui` depends on it.
- pnpm writes the real version in place of `workspace:*` when it packs.

### npm trusted publishing

| Item            | Value                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job permissions | `id-token: write` and `contents: read` on the `publish-npm` job only                                                                                                             |
| Registration    | One trusted-publisher entry per package on npmjs.com: repo `temporalio/ui`, workflow file `release-published.yml` (the exact file name). A rename of the file breaks publishing. |
| Tools           | npm CLI 11.5.1 or later, Node 22.14 or later (the repo has `^22.23.4`), a GitHub-hosted runner                                                                                   |
| Provenance      | npm makes it automatically under trusted publishing for a public source repo                                                                                                     |
| Tokens          | None. npm revoked classic tokens on 2025-12-09.                                                                                                                                  |

#### The first publish of `@temporalio/io` (R3.S3)

`@temporalio/io` does not exist on npm (`npm view @temporalio/io` returns 404).

1. An owner of the `@temporalio` npm org makes sure that the scope lets the release team publish a new package.
2. On npmjs.com, the owner adds a trusted-publisher entry for `@temporalio/io` with the repo `temporalio/ui` and the workflow `release-published.yml`.
3. **The 2-day rule:** a new trusted-publisher entry expires if no publish uses it within 2 days. So the owner adds the entry only when a release is ready, not before.
4. The release runs. The `publish-npm` job publishes `@temporalio/io` through OIDC.
5. If step 4 fails because OIDC cannot publish a package that does not exist yet (reported in late 2025, and not confirmed as fixed), use the fallback.

**Fallback:**

1. An org owner publishes the same version of `@temporalio/io` one time by hand, from the release tag, with `npm publish --access public` and 2FA. The owner uses the tarball that the release attached (step 2 of the publish flow), so the published code is exactly the CI-built code.
2. The owner adds the trusted-publisher entry.
3. The next release publishes through OIDC.

The manual publish has no provenance. The risks document lists this case until someone confirms the OIDC behavior.

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

What changes in `cloud-ui` (`generate-ui-pr.yml`, about 10 lines, in the same week as the move PR):

1. Set `source-path: source/apps/ui` for the build and pack step, or set the build command to `pnpm --filter @temporalio/ui... package`.
2. Pack `@temporalio/io` too: `pnpm --filter @temporalio/io pack`.
3. Install both tarballs, and add a `pnpm.overrides` entry `"@temporalio/io": "file:./packs/temporalio-io-<sha>.tgz"`, so the `@temporalio/ui` tarball resolves its Io dependency.

The other option is to keep `@temporalio/io` inside the `@temporalio/ui` tarball in 2.x (`bundleDependencies`). Then `cloud-ui` needs only change 1, but a consumer can get two copies of Io. The meeting summary has this choice as a vote. The recommendation is the change to `cloud-ui`, because the `cloud-ui` pack flow is then the same as the npm publish flow.

## Compatibility with Turborepo

`ci.yml` runs pnpm filters, not a task runner. Turborepo can replace the `--filter "...[origin/main]"` calls later with `turbo run <task> --affected`, which reads `GITHUB_BASE_REF`. The `changes` job and `ci-gate` stay. A remote cache would save time mostly in `check-types` and `unit-tests`. Independent data shows modest gains from the cache, with a median of 20 to 18 minutes at Sentry, and larger gains from affected-only runs. This design gets the affected-only runs without Turborepo.
