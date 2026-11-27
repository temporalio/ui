# Plan: Monorepo workspace design for temporalio/ui

## Approach

The product of this spec is documents, not code. All work happens in the `ui` repo on two branches:

- **The spec branch** `spec/monorepo-workspace-design-for-temporalio` holds the design documents in `specs/monorepo-workspace-design-for-temporalio/design/`. The Build stage pushes it and opens one **draft PR, docs only, titled and labelled do-not-merge**. The PR is a review place for the team. It never merges to `main`.
- **The spike branch** `spike/workspace-design` is a throwaway copy of `main` at the build commit. It does the minimum workspace split that the five spike checks need: `packages/io`, `apps/ui`, `pnpm-workspace.yaml`, pnpm 12. Each check is one commit. The branch is pushed to `origin` so that the citations of its commits resolve, but it never gets a PR. Its `README.md` starts with a "disposable, never merge" banner.

The order is: re-verify the facts, run the spike, then write the documents. The spike runs before the documents so that a failed check changes the design (R8.S2) and is not only an appendix. The meeting summary comes last, because it selects its five votes from what the other documents leave open (R7.S2).

**Verified commit.** The audit used `main` at `2031f37`. The worktree starts at `051de464a`, 4 commits later (#3958, #4144 and the revert #4201). The planning pass already found one drifted claim: `prepack` is `svelte-package && node scripts/generate-exports.mjs` (`package.json`), and no `scripts/generate-consumer-agents.mjs` exists in this history. The first step re-verifies every claim of the brief at the build commit and records corrections (R9.S2).

**Citations.** Each repo claim uses the form `path:line @ <sha>`. A small script, `design/verify-citations.mjs`, reads every design document, finds each citation and checks that the file exists at that commit and has that line. It is the automatic part of R9.S1. People still check that the line says what the claim says.

## Repos

| Repo | Why it changes                                                                                                     | Merge order |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| ui   | The design documents on the spec branch (draft PR, never merged) and the spike on `spike/workspace-design` (no PR) | 1           |

No other repo changes. `ui-server`, `cloud-ui` and `cli` are read for facts only.

## Steps

1. ui (spec branch): Add `design/README.md`, the index of the design documents. It names the verified commit and holds the claims ledger: each repo claim of the brief, its citation at the build commit, and "confirmed" or "corrected". Add `design/verify-citations.mjs` and run it in this step. Covers R9.
2. ui (`spike/workspace-design`): Make the spike branch from the build commit. Add the disposable banner to `README.md`. Switch to pnpm 12.23.0 (`packageManager`, `pnpm-workspace.yaml` with `packages`, `catalog` and `catalogMode: strict`). `git mv` the app to `apps/ui` and `src/lib/io` to `packages/io/src`. One commit per change. Covers R8.
3. ui (`spike/workspace-design`): Run spike check 1, Io extraction. Replace the two `$lib/i18n` imports in `src/lib/io/badge-status/badge-status.svelte:2,91` and `src/lib/io/breadcrumbs/breadcrumbs.svelte:31` with a prop or a context. Run `svelte-package` in `packages/io`. Make `@temporalio/ui` re-export `./io/*` from `@temporalio/io`. Run `scripts/generate-exports.mjs` with a package-root argument. Covers R8.
4. ui (`spike/workspace-design`): Run spike checks 2 to 5, one commit each: (2) `storybook build` in `packages/io` with `@storybook/sveltekit`, and Chromatic with `workingDir` and `onlyChanged` (only with a project token, else recorded as partial); (3) the app's Tailwind 3 `content` glob with `../../packages/io/src/**`, proved by a class that only Io uses in the built CSS; (4) `pnpm peers check`, plus a Vitest test in `apps/ui` where an Io component reads a context that the app sets; (5) `pnpm --filter @temporalio/ui build:server`, proved by `server/ui/assets/local` at the repo root. Push the branch, no PR. Covers R8.
5. ui (spec branch): Write `design/spike-results.md`: per check the result (pass, fail or partial), the command, the output and the spike commit. Covers R8.
6. ui (spec branch): Write `design/target-layout.md`: the `apps/ui` tree, `pnpm-workspace.yaml`, a `package.json` shape per package (`@temporalio/ui`, `@temporalio/io`, private `packages/config`, `packages/catalog` and the dev-tools packages for `utilities/`, `plugins/`, `temporal/`), the tool-owner table, the app-at-root variant with its phantom-dependency trade-off, and a decision record for `apps/ui` and for the catalog. Covers R1, R4, R9.
7. ui (spec branch): Write `design/config-strategy.md`: a table of the 18 config sites, each with its current citation, target state and owner package, and the rule for a shared base config against a per-package copy. Sites include `svelte.config.js:28-34`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.ts:7`, `src/lib/theme/preset.ts:17`, `.storybook/main.ts`, `eslint.config.js`, `knip.config.ts`, `.husky/pre-commit`, `.github/actions/setup-node`, `.github/actions/build-and-package`, `.github/workflows/trigger-downstream-updates.yml:7`, `scripts/validate-versions.sh`, `.github/actions/validate-version-sync`, `.github/dependabot.yml` and the `plugins/` relative imports. Covers R2, R1.
8. ui (spec branch): Write `design/boundaries.md`: the dependency rules, the tool that enforces each rule (workspace `dependencies`, dependency-cruiser or Sheriff, knip `workspaces`), the CI job that runs it, and the `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY` rule for published packages. Covers R4.
9. ui (spec branch): Write `design/ci-and-release.md`: the workflow graph after the change of `lint-and-test.yml`, `test.yml`, `playwright.yml` and `chromatic.yml` to a `dorny/paths-filter` changes job, job-level `if:` and one `always()` gate job; a table of which jobs run for a change only in `packages/io`; the nightly full run; the release flow through `version-bump.yml`, `release-draft.yml` and `release-published.yml` with one fixed version from `server/server/version/version.go:31`; trusted publishing with the first publish of `@temporalio/io` and a fallback; and the unchanged inputs of the `ui-server` sync and the `cloud-ui` dispatch. Covers R3.
10. ui (spec branch): Write `design/migration-plan.md`: Stage 0 prerequisites, Stage 1 as a numbered list of PRs, each with its scope, exit criteria, rollback point and its `git mv` moves, the step where the app moves to `apps/ui`, and the items deferred to Stage 2 and Stage 3. Covers R5, R1.
11. ui (spec branch): Write `design/risks-and-open-questions.md`: each open question with an owner and the effect of each answer, including the `cloud-ui` consumption form, other importers of `ui-server/v2`, the four toolchain upgrades, the OIDC first-publish case and each spike failure the design cannot settle. Covers R6, R8, R3.
12. ui (spec branch): Write `design/meeting-summary.md`: one page with the layout diagram, the decided items (layout, catalog), the five open decisions with options, the recommendation and a link to each decision record, any disagreement with the brief, and an effort estimate per stage. Covers R7, R9.
13. ui (spec branch): Run `node design/verify-citations.mjs`, fix each failure, push the spec branch and open the draft PR with the title prefix `[do-not-merge]` and the label `do-not-merge` if it exists. Covers R9.

## Tests

The documents are the product, so most tests are checks on documents. The Check stage runs each check below and records the result.

- R1.S1: For each package in the tree of `design/target-layout.md`, the document shows `name`, `exports`, `peerDependencies`, `files`, `scripts` and published or private. Check by a read of the package table.
- R1.S2: The tool-owner table lists Storybook, Chromatic, Playwright, the catalog, the Io docs generator and the Tailwind preset, each with exactly one owner.
- R1.S3: `design/target-layout.md` has an "App at root" section that states the phantom-dependency trade-off and the reason for the `apps/ui` recommendation.
- R1.S4: `grep -n "src/lib\|\./src/" design/config-strategy.md design/ci-and-release.md design/migration-plan.md` shows target paths only under `apps/ui/` or `packages/`, and the migration plan names the PR that moves the app.
- R1.S5: `packages/catalog` is private in the package table, the plugins and the app list it as `workspace:*`, and no publish step in `design/ci-and-release.md` includes it.
- R2.S1: The table in `design/config-strategy.md` has 18 rows, and each row has a citation, a target state and an owner. `verify-citations.mjs` passes for this file.
- R3.S1: `design/ci-and-release.md` has a table for a change only in `packages/io` with each job marked "runs" or "skips", and shows that the gate job is the only required check and reports a result with `always()`.
- R3.S2: The release section shows that `pnpm build:server` still writes `server/ui/assets/local` and that `trigger-downstream-updates.yml` still sends a git SHA, with the new path filters. Spike check 5 is the evidence for the first part.
- R3.S3: The release section gives the first-publish steps, the registration per workflow file, the 2-day rule and the fallback, and `design/risks-and-open-questions.md` lists the OIDC first-publish case.
- R4.S1: `design/boundaries.md` names the check that fails for an import from `packages/io` into app code, and the CI job that runs it. If the spike adds the check, the spike commit shows the failure.
- R4.S2: No published package in `design/target-layout.md` lists a private workspace package in `dependencies`, and `design/boundaries.md` names `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY`.
- R5.S1: Each Stage 1 PR in `design/migration-plan.md` has the headings scope, exit criteria and rollback point, and its moves use `git mv`.
- R6.S1: `design/risks-and-open-questions.md` has the four known questions, each with an owner and the effect of each answer.
- R7.S1: `design/meeting-summary.md` fits on one page (about 600 words or fewer, plus the diagram) and shows five decisions with options, a recommendation and a working link to a decision record.
- R7.S2: The five votes do not include the layout or the catalog, and the summary shows these two as decided.
- R8.S1: `design/spike-results.md` has five sections, each with a result, a command, its output and a commit SHA that exists on `origin/spike/workspace-design`.
- R8.S2: For each failed or partial check, the affected design document states the failure and the changed design or mitigation, or `design/risks-and-open-questions.md` lists it.
- R8.S3: `git branch -r --contains <each spike commit>` does not list `origin/main`, `gh pr list --head spike/workspace-design` is empty, and the spike `README.md` starts with the disposable banner.
- R9.S1: `node design/verify-citations.mjs` passes for all documents, and a person checks a sample of 10 citations by hand.
- R9.S2: `design/README.md` names the verified commit, and each claim of the brief in the ledger is "confirmed" or "corrected". The `generate-consumer-agents.mjs` claim is "corrected".
- R9.S3: Each disagreement with the recommended direction has a decision record, and `design/meeting-summary.md` shows it. If there is none, the summary says so.

## Risks

- **The repo moves under the design.** `main` is in a code freeze (#4201) and can change during the work. The plan pins one build commit and records it in each document (R9.S2).
- **The brief has drifted claims.** One is already known (`generate-consumer-agents.mjs`). The claims ledger in step 1 catches the others before the documents use them.
- **Chromatic needs a project token.** Without it, spike check 2 records `onlyChanged` with `workingDir` as partial, and the open question goes to the risks document.
- **pnpm 12 changes the lockfile.** The spike accepts a lockfile diff. The size of the diff goes into the migration plan as a Stage 0 cost.
- **The spike branch is public.** A push to `origin` puts throwaway code in the public `temporalio/ui` repo. The banner, the branch name and the absence of a PR mark it as disposable. The branch is deleted after the meeting.
- **The draft PR is merged by mistake.** The title prefix `[do-not-merge]`, the label and the draft state guard against it. The PR changes only files in `specs/`.
- **The husky hook needs `node_modules`.** A new worktree must run `pnpm install` before its first commit. This happened in planning and is fixed for this worktree.
