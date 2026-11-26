# Risks and open questions

Verified at commit: `051de464a`

This document lists what the design could not settle. Each item has an owner (a role, not a person) and the effect of each answer on the design. The items from the brief come first, then the items that the design and the spike found.

## Open questions

### Q1. In what form does `cloud-ui` take the UI?

- **Owner:** the `cloud-ui` maintainers.
- **What the design found:** `cloud-ui` takes the **library tarball**. Its `generate-ui-pr.yml` builds `@temporalio/ui` from a SHA with `pnpm package` and `pnpm pack`, and installs it as `file:./packs/temporalio-ui-<sha>.tgz` (lines 94-125 at `cloud-ui` commit 084835064). It does not take the built app or an image. The question is now narrower: which change to that workflow does the team accept?
- **Answers and their effect:**
  1. **`cloud-ui` packs every public workspace package and overrides `@temporalio/io` with its tarball** (recommended). About 10 lines change in `generate-ui-pr.yml`, in the same window as the move PR (migration-plan.md, step 1.2). About 5 more lines add the Io dependency and the Tailwind glob with step 1.3. Nothing changes in this design.
  2. **`@temporalio/ui` bundles `@temporalio/io` in 2.x** (`bundleDependencies`). `cloud-ui` changes only its build path. The npm consumers of both packages can get two copies of Io. `target-layout.md` would change the `@temporalio/ui` dependencies.
  3. **`cloud-ui` moves to snapshot versions from npm** (Stage 3). This needs snapshot publishing first, so it cannot be ready for Stage 1.

### Q2. Who else imports `github.com/temporalio/ui-server/v2`?

- **Owner:** the Go server maintainers, with the Temporal CLI team.
- **What the design found:**
  - `temporalio/cli` imports `ui-server/v2` at `v2.56.4` (its `go.mod`, line 19). It ignores `ui-server` in Dependabot ("managed manually").
  - A local fork, `temporal-serverless-worker`, declares the module `github.com/temporalio/ui-server/lambda-worker`.
  - The design did not search all public Go code. pkg.go.dev "Imported by" and a GitHub code search for `temporalio/ui-server` give the full list.
- **Effect:** none on Stage 1. `server/`, the module path and the tags do not change. The answer decides the Stage 2 plan: a new module path with a vanity redirect, or the mirror kept.

### Q3. How do the four pending toolchain upgrades interact with the split?

- **Owner:** the Frontend Engineering team.

| Upgrade                                                                        | Interaction                                                                                                                                                                  | Recommended order                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SvelteKit 3 (`$lib` to `#lib`, config in `vite.config`, Node 22, Vite 8, TS 6) | One alias map (Stage 0.5) makes the rename one change. `svelte-package` 3 rewrites `#lib` in the Io package.                                                                 | After Stage 1. The upgrade then changes `apps/ui` and `packages/io` separately, in two smaller PRs.                                                                 |
| Vitest 5 (no workspace file, `test.projects`)                                  | A root `vitest.config.ts` with `projects` can run all package tests in one process. The `svelte` client-entry alias in `vitest.config.ts:20-34` must work from each project. | After Stage 1. It is not needed for the split.                                                                                                                      |
| Tailwind 4 (`@source` per package in place of `content`)                       | Replaces the `content` glob of config-strategy.md sites 5 and 6. The Io preset then needs a CSS entry.                                                                       | After Stage 1. The Io package is then the single place for the theme.                                                                                               |
| Storybook 11                                                                   | One Storybook per package (Io and app). Each upgrades separately.                                                                                                            | Any time. Run Storybook from the package (`pnpm --filter … storybook`), not through `pnpx`, because of the pnpm triple-install issue (storybookjs/storybook#32459). |

- **TypeScript 7** (Go-native) is also out. The Svelte ecosystem pins TypeScript 6.0, and `svelte-check` support for TypeScript 7 is not confirmed. It is not part of this design.

### Q4. What status does the second Chromatic project post?

- **Owner:** an owner of the Chromatic account.
- **Fact:** branch protection and the `main` ruleset require `UI Tests`. The design found its source: it is the status that Chromatic posts for the app Storybook project (ci-and-release.md, "CI today"). It stays required (decisions.md, decision record 9).
- **Open part:** the Io Storybook gets a second Chromatic project in step 1.3. The design does not know the name of the status that the second project posts.
- **Effect:** if the second project also posts `UI Tests`, the two projects report on one status, and `chromatic-io` must also run on every PR with `skip`. If it posts a different name, nothing changes: only the app project's status is required.

### Q5. Can OIDC publish a package that does not exist yet?

- **Owner:** an owner of the `@temporalio` npm org.
- **Fact:** reports from late 2025 said that trusted publishing could not make the first publish of a new package. Nobody has confirmed if npm fixed this.
- **Effect:** if OIDC can make the first publish, the release flow is fully automatic. If it cannot, an org owner publishes the first version of `@temporalio/io` by hand from the attested npm tarball of the release (ci-and-release.md, fallback). That first version has no npm provenance.

### Q6. Does `@temporalio/ui` already have a trusted publisher on npm?

- **Owner:** an owner of the `@temporalio` npm org.
- **Fact:** the last npm version is 2.38.0. No workflow in this repo publishes. The design cannot see the npm package settings.
- **Effect:** if a publisher entry exists for another repo or another workflow file, it must change to `temporalio/ui` and `release-published.yml`. This is part of Stage 0.6.

### Q7. Does the `ui-server` sync install pnpm 12?

- **Owner:** the `ui-server` maintainers.
- **Fact:** the `ui-server` `setup-node` action uses `pnpm/action-setup@v4` with `package_json_file: ui-release/package.json`. pnpm 12 is a Rust rewrite with a new distribution.
- **Effect:** if `action-setup@v4` installs pnpm 12, nothing changes. If it cannot, `ui-server` upgrades its action before Stage 0.2 merges. Stage 0.2 has a test dispatch as an exit criterion for this reason.

## Risks

| #   | Risk                                                                                                                                         | Likelihood                                                           | Effect                                                                                                                                              | What the design does                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | **Two Svelte runtimes.** A package lists `svelte` in `dependencies`, or pnpm splits a peer variant. `setContext` then fails across packages. | Medium. The repo already hit it in tests (`vitest.config.ts:20-34`). | Components fail at runtime with no build error.                                                                                                     | `svelte` as a peer only, one catalog entry, the catalog lint script of rule B8 (`catalogMode: strict` does not check a version written by hand), `pnpm peers check` in CI, `resolve.dedupe: ['svelte']` in the app. Spike check 4 tests a context across packages. |
| K2  | **Phantom dependencies** in a published package                                                                                              | Low with `apps/ui`, high with the app at the root                    | A consumer install fails after a publish                                                                                                            | `apps/ui` layout (target-layout.md, decision record 1), per-package `no-extraneous-dependencies`, and the `package` job (`pnpm pack` and the packed-file scan)                                                                                                     |
| K3  | **A required check stays "Pending"** after the path filters                                                                                  | Medium, if someone adds `paths:` to a required workflow later        | PRs cannot merge                                                                                                                                    | One gate job, no workflow-level `paths:`, a review rule in `CONTRIBUTING` or `CLAUDE.md`                                                                                                                                                                           |
| K4  | **The move PR conflicts with open PRs**                                                                                                      | High for the 56 open PRs                                             | Rebase work for each author                                                                                                                         | `git mv` only, a merge at a low-traffic time, a notice one day before                                                                                                                                                                                              |
| K5  | **The `cloud-ui` pack flow breaks**                                                                                                          | Certain without the `cloud-ui` change                                | `cloud-ui` cannot take a new UI commit                                                                                                              | The `cloud-ui` change ships in the same window as the move PR. A `test`-mode run is an exit criterion (migration-plan.md, step 1.2).                                                                                                                               |
| K6  | **A bad first publish of `@temporalio/io`**                                                                                                  | Low                                                                  | A broken package on npm for all consumers                                                                                                           | A clean-consumer install test before the release, and `npm deprecate` with a patch release as the remedy                                                                                                                                                           |
| K7  | **The code freeze runs longer**                                                                                                              | Unknown                                                              | Stage 0 starts later                                                                                                                                | Stage 0 PRs are small and independent. They can merge one at a time after the freeze.                                                                                                                                                                              |
| K8  | **Chromatic costs more with two projects**                                                                                                   | Medium                                                               | Higher snapshot count when Io changes, because both projects run                                                                                    | `onlyChanged` in each project. The Io project has 13 stories today.                                                                                                                                                                                                |
| K9  | **The catalog copy step breaks a 2.x path**                                                                                                  | Medium. The spike did not test the catalog                           | `cloud-ui` or another consumer cannot import a `@temporalio/ui/catalog/*` path, or a packed file still imports the private `@temporalio/ui-catalog` | The packed-file scan (boundaries.md, rule B6), the export-key comparison and the clean-consumer test in step 1.4, and a `cloud-ui` `test`-mode run (target-layout.md, decision record 2)                                                                           |

## Spike failures that the design could not settle

[spike-results.md](spike-results.md) gives the full results. This section lists each failed or partial check that changes the plan or stays open.

### S1. `svelte-check --tsgo` does not type Io files that the app imports

- **Owner:** the Frontend Engineering team.
- **Fact:** in the spike, `pnpm check` (`svelte-check --tsgo`) in `apps/ui` gave 27 errors, all for `.svelte` exports read from `packages/io/src`. Plain `svelte-check` gave 0 errors (spike-results.md, check 1).
- **Answers and their effect:**
  1. **The app reads Io types from the `svelte-package` output** (a `types` condition that points at `dist`). Then `--tsgo` reads `.d.ts` files only. The cost: `packages/io` must build before `apps/ui` runs `check`.
  2. **The app runs `svelte-check` without `--tsgo`** until the tsgo support improves. The cost: a slower type check.
  3. **A fix in `svelte-check`** for `--tsgo` outside the tsconfig folder. The team files an issue and waits.
- **Effect on the design:** step 1.3 cannot merge until one answer passes `pnpm check`. Answer 1 is the most likely. The layout does not change.

### S2. The Io Chromatic project is not tested

- **Owner:** an owner of the Chromatic account.
- **Fact:** a Chromatic dry run also needs a project token. The spike had none. The proposed config is in spike-results.md, check 2.
- **Effect:** step 1.3 creates the Io project and accepts the first baseline. If the team does not want a second project, the app Storybook can keep the Io stories through a `refs` entry, and risk K8 goes away.

### S3. `pnpm peers check` fails on an unrelated peer today

- **Owner:** the Frontend Engineering team.
- **Fact:** `@typescript-eslint/utils@7.18.0` wants `eslint ^8.56.0`, and the repo has `eslint 9.39.4` (spike-results.md, check 4).
- **Effect:** the mitigation for K1 needs this fixed first. Remove or upgrade the package that pulls in `@typescript-eslint/utils@7`. This can go in Stage 0.2.

### S4. Two app test files fail only in the full run

- **Owner:** the Frontend Engineering team.
- **Fact:** in the spike, `catalog-list.test.ts` and `multi-region-wiring.svelte.test.ts` failed in the full app test run and passed alone. The spike did not find the cause (spike-results.md, check 1). `catalog-list.test.ts` starts its own Vite server with its own alias map (config-strategy.md, "Test alias maps").
- **Answers and their effect:**
  1. **The cause is in the move** (for example a path or an alias that the move changed). Steps 1.2 and 1.3 fix it, and the layout does not change.
  2. **The tests also fail on `main` in a full run** (an order or timing fault). The team fixes the tests before step 1.2.
- **Effect on the design:** steps 1.2 and 1.3 have an exit criterion: the full app test suite passes in three CI runs in a row (migration-plan.md).
