# Workspace design: index and claims ledger

Verified at commit: `051de464a`

This folder holds the design for the change of `temporalio/ui` from one package into a pnpm workspace. The spec is `../spec.md`, and the plan is `../plan.md`.

## Documents

| Document | What it settles |
|---|---|
| [meeting-summary.md](meeting-summary.md) | One page for the go/no-go meeting: the layout, the decided items, the five votes and the effort |
| [decisions.md](decisions.md) | Decision records 3 to 7: the five open votes, each with its options and the recommendation |
| [target-layout.md](target-layout.md) | The directory tree, the packages, `pnpm-workspace.yaml` and the tool owners |
| [config-strategy.md](config-strategy.md) | How each single-package config site changes |
| [boundaries.md](boundaries.md) | The dependency rules between packages and how CI enforces them |
| [ci-and-release.md](ci-and-release.md) | The path-gated workflow graph, the gate job and the release flow |
| [migration-plan.md](migration-plan.md) | Stage 0, the Stage 1 PR sequence, and what Stage 2 and Stage 3 defer |
| [risks-and-open-questions.md](risks-and-open-questions.md) | What the design could not settle, with an owner for each item |
| [spike-results.md](spike-results.md) | The five spike checks on `spike/workspace-design` |

## Citations

Each claim about the repo cites `path:line` at the commit that the document names on its "Verified at commit" line. To check that each cited file and line exists, run this command from the repo root:

```sh
node specs/monorepo-workspace-design-for-temporalio/design/verify-citations.mjs
```

The script checks that the file exists at that commit and has that line. It does not check that the line says what the claim says. A person does that.

## Why the commit changed

The audit in the brief used `main` at `2031f37`. The design uses `051de464a`, 4 commits later. These commits are #3958, #4144 and the code-freeze revert #4201. The revert removed `scripts/generate-consumer-agents.mjs`, the consumer-agents CI job, `src/package/AGENTS.consumer.md` and the Io `card` component. `git diff --stat 2031f37 051de464a` shows 35 files with 515 insertions and 1149 deletions.

## Claims ledger

Status values:

- **Confirmed:** the claim is true at `051de464a`.
- **Changed:** the claim was true at `2031f37`, and a later commit changed it.
- **Corrected:** the claim was not accurate at either commit. The ledger gives the correct value and the method.

| # | Claim of the brief | Evidence at `051de464a` | Status |
|---|---|---|---|
| 1 | `server/` is the source of truth, and `temporalio/ui-server` is a mirror | `server/README.md:6-8`. The last `ui-server` commit is "Sync from UI commit 051de464…" (GitHub API). | Confirmed |
| 2 | `ui-server` is about 621 MiB | The GitHub API `size` is 625434 KB, which is about 611 MiB. The difference is a unit change and is not material. | Confirmed |
| 3 | `pnpm-workspace.yaml` holds only `minimumReleaseAge: 20160` | `pnpm-workspace.yaml:1` | Confirmed |
| 4 | The aliases are declared three times | `svelte.config.js:28-34`, `vite.config.ts:27-32`, `vitest.config.ts:43-65`. **The three declarations disagree.** `svelte.config.js:31` maps `$types` to `src/lib/types` and `svelte.config.js:33` maps `$components/*` to `src/components/*`. `vite.config.ts:28` and `vitest.config.ts:52` map `$types` to `src/types`, which does not exist. `vite.config.ts:31` adds `$holocene`, which no file imports. | Corrected (the declarations disagree and one alias has no users) |
| 5 | The Tailwind config and the published preset hardcode `./src/**` | `tailwind.config.ts:7`, `src/lib/theme/preset.ts:17` | Confirmed |
| 6 | `src/lib/io` has 313 files, 236 of them icons, in 14 component folders | 309 files, 236 icons, 13 folders. The revert #4201 removed `src/lib/io/card` (4 files). | Changed |
| 7 | Io imports app code in exactly 3 places, all `$lib/i18n` | `src/lib/io/badge-status/badge-status.svelte:2,91`, `src/lib/io/breadcrumbs/breadcrumbs.svelte:31`. `grep` finds no other `$lib`, `$app` or `$components` import in `src/lib/io`. | Confirmed |
| 8 | Holocene imports `$lib/io` 68 times | `grep -rh "\$lib/io" src/lib/holocene` gives 68 | Confirmed |
| 9 | Holocene has about 20 app-coupled imports in 12 files | `grep -rhE "from '\$lib/(stores\|utilities\|components\|services)" src/lib/holocene` gives **53 imports in 39 files**: 36 `$lib/utilities`, 11 `$lib/stores`, 6 `$lib/components`. 17 more files import `$lib/i18n`. | Corrected (the coupling is about 2.5 times larger) |
| 10 | Holocene has 15 `$app/*` imports | `grep -rh "from '\$app/" src/lib/holocene` gives 15 | Confirmed |
| 11 | `components` imports holocene 623 times and io 164 times | 624 and 164 | Confirmed |
| 12 | `prepack` runs `generate-exports.mjs` and `generate-consumer-agents.mjs` | `package.json:75` is `svelte-package && node scripts/generate-exports.mjs`. The revert #4201 removed `generate-consumer-agents.mjs`. | Changed |
| 13 | `generate-exports.mjs` walks `dist/` | `scripts/generate-exports.mjs:12` hardcodes `new URL('../dist', import.meta.url)`. The script has no package-root argument. | Confirmed |
| 14 | No workflow publishes to npm. npm latest is 2.38.0, and the repo is 2.58.1. | `grep -rn "npm publish\|pnpm publish" .github` finds nothing. `npm view @temporalio/ui version` gives 2.38.0. `npm view @temporalio/io` gives 404. | Confirmed |
| 15 | `UIVersion` in Go is the source of truth for the version | `server/server/version/version.go:31`, checked by `scripts/validate-versions.sh:6-7` | Confirmed |
| 16 | `ui-server` gets built assets through `pnpm build:server` | `package.json:44` sets `BUILD_PATH=server/ui/assets/local`. `.gitignore:16` ignores `server/ui/assets`. | Confirmed |
| 17 | `cloud-ui` gets a git SHA from `trigger-downstream-updates.yml` on `src/**`, `package.json` and `pnpm-lock.yaml` | `.github/workflows/trigger-downstream-updates.yml:7-11` sets the paths. `.github/workflows/trigger-downstream-updates.yml:53-55` builds the `ui_commit_sha` payload, and `.github/workflows/trigger-downstream-updates.yml:62-66` sends it. | Confirmed |
| 18 | `temporalio/cli` imports `ui-server/v2` at v2.56.4 | `go.mod` line 19 of `temporalio/cli` on GitHub | Confirmed |
| 19 | Every PR runs all test workflows, with no path filter | `.github/workflows/lint-and-test.yml:4-7`, `.github/workflows/test.yml:3-7`, `.github/workflows/playwright.yml:4-7` and `.github/workflows/chromatic.yml:3-6` have no `paths:`. The consumer-agents job is gone (#4201). | Changed (one job fewer) |
| 20 | Playwright has 60-minute timeouts and `workers: 1` | `.github/workflows/playwright.yml:19,38`, `playwright.config.ts:15` | Confirmed |
| 21 | Toolchain versions | `package.json`: vitest 4.1.11 (brief: 4.1.12), storybook `^10.6.1` (brief: `^10.6.8`). The other versions match. The revert #4201 changed `package.json`. | Changed |
| 22 | The tool folders import `$lib` about 7 times in total | One `$lib` import (`tests/integration/environment-banner.spec.ts:3`), but **70 relative imports into `src/` from 28 files**. 40 of them go to `src/lib/demo` and 29 go to `src/lib/catalog`. `utilities/` has 19 of these files, `scripts/` has 8 and `plugins/` has 1. | Corrected (the coupling is real, but it uses relative paths) |
| 23 | `scripts/catalog` and `src/lib/catalog` have 174 files | 194 files | Corrected |

## Findings that the brief did not have

- **`src/lib/demo` is dev tooling inside the app source.** Its 18 files have no importer in `src/routes` or in the rest of `src/lib`. Its only users are `utilities/demo/*`. The design moves it to the dev-tools package with `utilities/`.
- **The test config already works around two Svelte runtimes.** `vitest.config.ts:20-34` resolves `svelte` against `node_modules/svelte`. Without this, pnpm gives two path strings for one file and so two runtime instances. This is the same failure that the brief calls the top migration risk. The design must keep the workaround in `apps/ui`, or replace it.
- **`ui-server` has a second Go module importer.** The local `temporal-serverless-worker` repo declares the module `github.com/temporalio/ui-server/lambda-worker`. Its remote is a personal fork. This goes to the open questions, under "who else imports `ui-server`".
- **CI runs on `codefreeze-*` branches.** `.github/workflows/test.yml:6-7` adds `codefreeze-*` to the `pull_request` branches. The gate job design must keep this.
