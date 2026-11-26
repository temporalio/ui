# Monorepo workspace design for temporalio/ui

The Frontend Engineering team holds a go/no-go meeting on a change of `temporalio/ui` from one package into a pnpm workspace. The team has an audit and a decision brief, but no concrete design to vote on. This spec produces that design as a set of Markdown documents: the target layout, the package boundaries, the config strategy, the CI and release flow, a migration plan with exit criteria, and a one-page meeting summary. It ships no change to `main`.

Decision brief with evidence, pros, cons and mitigations: https://claude.ai/artifact/NogYTZV4GbS2bHJ9uSmoeF

## Scope

### In scope

- Seven design documents in `design/` in this spec's folder.
- A citation of a file path and line number in this repo for each claim about the current state.
- Decision records for each choice that changes the design, with the options that the design considered.
- A source for each external fact (tool version, platform rule, precedent), taken from the evidence appendix or a newer check.
- A spike on the throwaway branch `spike/workspace-design` that runs all five spike checks, with the results in `design/spike-results.md` (R8). The branch is never merged.

### Out of scope

- A restructure of the repo, a move of files, or a change to CI on `main`. No PR against `main`.
- A change to the Go module path, the tags, the `ui-server` sync or the `cloud-ui` dispatch. These are Stage 2 and Stage 3 decisions.
- An upgrade of a toolchain major version (SvelteKit 3, Vitest 5, Tailwind 4, Storybook 11). The design only records where these upgrades interact with it.

## Requirements

### R1 Target layout document

`design/target-layout.md` recommends the `apps/ui` layout: the app moves to `apps/ui`, and the repo root becomes a private workspace root. The document shows the target directory tree, the package names, the `pnpm-workspace.yaml` (packages, catalog, settings) and the `package.json` shape of each package (exports, peers, files, scripts). It names the package that owns Storybook, Chromatic, Playwright, the catalog, the Io docs generator and the Tailwind preset.

#### R1.S1 Each package has a complete shape

- Given the team reads `design/target-layout.md`
- When the team looks up any package in the directory tree
- Then the document shows its name, its `exports`, its `peerDependencies`, its `files` and its `scripts`
- And the document says if the package is published or private

#### R1.S2 Each shared tool has one owner

- Given the list of tools: Storybook, Chromatic, Playwright, the catalog, the Io docs generator and the Tailwind preset
- When the team reads the ownership table in `design/target-layout.md`
- Then each tool has exactly one owner package

#### R1.S3 The lower-churn variant is present

- Given the "app stays at root, extract Io and config first" variant
- When the team reads `design/target-layout.md`
- Then the document describes this variant next to the `apps/ui` layout
- And the document states its phantom-dependency trade-off
- And the document states why it recommends `apps/ui` instead

#### R1.S4 The other documents follow the recommended layout

- Given the recommended layout is `apps/ui`
- When the team reads the config strategy, the CI and release document and the migration plan
- Then each of these documents uses the `apps/ui` paths
- And the migration plan names the step at which the app moves to `apps/ui`

#### R1.S5 The catalog is a private package

- Given `scripts/catalog` and `src/lib/catalog` in the current repo
- When the team reads `design/target-layout.md`
- Then the catalog is the private package `packages/catalog`, with its CLI and its isolated test
- And the Vite plugins and the app depend on it with `workspace:*`
- And no publish step includes it

### R2 Config strategy document

`design/config-strategy.md` says how each of the 18 single-package config sites changes, and when a package extends a shared base config or keeps its own copy.

#### R2.S1 All 18 config sites have a decision

- Given the 18 config sites that the brief lists
- When the team reads `design/config-strategy.md`
- Then each site has a current-state citation (file and line), a target state and an owner package

### R3 CI and release document

`design/ci-and-release.md` shows the new workflow graph with path gating, one required-check gate job, Chromatic per Storybook, Playwright placement and a nightly full run. It shows the release flow with one fixed version and npm trusted publishing.

#### R3.S1 One required check

- Given the new workflow graph
- When a PR changes only files in `packages/io`
- Then the document shows which jobs run and which jobs skip
- And the gate job is the only required check, and it reports a result in all cases

#### R3.S2 Downstream consumers keep working

- Given the release flow in the document
- When a release of a new version occurs
- Then the document shows that the `ui-server` sync and the `cloud-ui` dispatch get the same inputs as now

#### R3.S3 First publish of `@temporalio/io`

- Given `@temporalio/io` does not exist on npm
- When the team reads the release section
- Then the document gives the steps for the first publish, the trusted-publishing registration and the 2-day first-publish rule
- And the document gives a fallback for the case where OIDC cannot publish a never-published package, and lists this case in `design/risks-and-open-questions.md` until someone confirms it

### R4 Boundaries document

`design/boundaries.md` states the dependency rules between packages and the tool that enforces each rule.

#### R4.S1 A forbidden import fails a check

- Given the rule "io never imports app code"
- When the team reads `design/boundaries.md`
- Then the document names the check that fails on that import, and the CI job that runs the check

#### R4.S2 A published package does not depend on a private package

- Given `@temporalio/ui` and `@temporalio/io` are published, and `packages/config`, `packages/catalog` and the dev-tools packages are private
- When the team reads the `package.json` shapes in `design/target-layout.md`
- Then no published package lists a private workspace package in `dependencies`
- And `design/boundaries.md` names the pnpm error (`ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY`) that enforces this rule on publish

### R5 Migration plan document

`design/migration-plan.md` gives ordered steps with exit criteria and rollback points: Stage 0 prerequisites, Stage 1 as a sequence of reviewable PRs, and the items deferred to Stage 2 and Stage 3.

#### R5.S1 Each Stage 1 PR is independently green

- Given the Stage 1 sequence of PRs
- When the team reads one step
- Then the step names its scope, its exit criteria and its rollback point
- And the step keeps file history with plain `git mv`

### R6 Risks and open questions document

`design/risks-and-open-questions.md` lists what the design could not settle, with the person or team that can settle each item.

#### R6.S1 Known open questions are present

- Given the open questions from the brief: the `cloud-ui` consumption form, other importers of `ui-server/v2`, and the four toolchain upgrades
- When the team reads the document
- Then each question has an owner and the effect of each answer on the design

### R7 Meeting summary document

`design/meeting-summary.md` is one page: the proposed layout diagram, the five decisions to vote on, the recommended answer to each, and an effort estimate per stage.

#### R7.S1 The team can vote from one page

- Given the team has only `design/meeting-summary.md` in the meeting
- When the team reads it
- Then the team sees five decisions, each with the options, the recommended answer and a link to the decision record

#### R7.S2 The five decisions are the ones still open

- Given this spec already decided the layout (`apps/ui`) and the catalog (private package)
- When the design selects the five decisions for the vote
- Then it selects the five decisions with the most effect on effort and risk that this spec did not decide
- And the summary shows the layout and the catalog as decided, not as votes

### R8 Spike results document

A spike on `spike/workspace-design` runs the five spike checks. `design/spike-results.md` records the result of each check, with what broke and the commit on the spike branch that shows it.

#### R8.S1 Each check has a result and evidence

- Given the five spike checks in this spec
- When the team reads `design/spike-results.md`
- Then each check shows pass, fail or partial
- And each check shows the command that ran, its output and the spike commit

#### R8.S2 A failure changes the design

- Given a spike check fails
- When the team reads the design documents
- Then the affected document states the failure and the changed design or the mitigation
- And `design/risks-and-open-questions.md` lists the failure if the design cannot settle it

#### R8.S3 The spike branch never reaches main

- Given the spike is complete
- When the team looks at `main` and the open PRs
- Then `main` has no commit from the spike, and no PR from `spike/workspace-design` exists
- And the spike branch README marks the branch as disposable

### R9 Traceable claims and decisions

Each claim about the current repo cites a file path and line number at a named `main` commit. Each choice that changes the design has a short decision record with the options considered. The design may argue against the recommended direction, but only in a decision record.

#### R9.S1 A reader can re-verify a repo claim

- Given a claim about the current repo in any design document
- When a team member opens the cited file and line at the named commit
- Then the file shows what the claim says

#### R9.S2 The repo changed after the audit

- Given the audit verified `main` at 2031f37
- When the design starts at a newer `main` commit
- Then the design re-verifies each claim from the brief at the new commit
- And each document names the commit it verified against, and corrects each claim that is no longer true

#### R9.S3 The design disagrees with the brief

- Given the design finds evidence against an item of the recommended direction
- When the team reads the documents
- Then a decision record states the item, the evidence, the alternative and the recommendation
- And `design/meeting-summary.md` shows the disagreement

## Context from the brief

The original brief follows. The requirements above come from it.

### What the audit established (verified 2026-11-25 at `main` 2031f37)

- The Go server is already here: `server/` is the source of truth (`server/README.md:6-8`). `temporalio/ui-server` is a bot-written mirror (621 MiB, 95% committed build assets, 832 "Sync from UI" commits). `temporalio/holocene` was archived in July 2022; live Holocene code is `src/lib/holocene`.
- The repo is a single package: `pnpm-workspace.yaml` holds only `minimumReleaseAge: 20160`; `$lib`/`$types`/`$components`/`$fixtures` aliases are declared three times (`svelte.config.js:28-34`, `vite.config.ts:26-33`, `vitest.config.ts:42-65`); `tailwind.config.ts:7` and the published `src/lib/theme/preset.ts:17` hardcode `./src/**`.
- Io is cleanly carvable: `src/lib/io` (313 files, 236 are icons, 14 component folders) imports app code in exactly 3 places (`io/breadcrumbs/breadcrumbs.svelte:31`, `io/badge-status/badge-status.svelte:2,91`, all `$lib/i18n`) plus one story-only SVG. Zero imports of holocene, stores, utilities, components, `$app/*`.
- Holocene is not carvable as-is: 68 imports of `$lib/io` (fine), but ~20 app-coupled imports in 12 files (user-menu, toaster, file-input, feature-tag, paginated tables, navigation, live-region, pagination) and 15 `$app/*` imports. `components` imports holocene 623 times vs io 164.
- `@temporalio/ui` is built with `svelte-package`; `prepack` runs `scripts/generate-exports.mjs` (walks `dist/`, writes per-file exports, rewrites relative `.svelte` imports to `@temporalio/ui/...`) and `scripts/generate-consumer-agents.mjs` (reads `src/lib/io/*/index.ts`). No workflow publishes to npm; npm latest is 2.38.0 vs repo 2.58.1.
- Version source of truth is Go `server/server/version/version.go:31 UIVersion`; `scripts/validate-versions.sh` and `.github/actions/validate-version-sync` enforce `package.json` parity. Tags are `vX.Y.Z` in both ui and ui-server.
- Consumers: ui-server consumes built assets via `pnpm build:server` (`BUILD_PATH=server/ui/assets/local`); cloud-ui is dispatched a git SHA by `trigger-downstream-updates.yml` (paths `src/**`, `package.json`, `pnpm-lock.yaml`); `temporalio/cli` imports `github.com/temporalio/ui-server/v2` (pins v2.56.4).
- CI: every PR runs lint, check-types (`svelte-check --tsgo`), unit-tests, consumer-agents (`pnpm package`), Playwright integration and e2e (60-min timeouts, `workers: 1`), Go build+test, Chromatic. No path filters on any test workflow.
- Toolchain: node ^22.23.4, pnpm 10.10.0 (latest 12.23.0), svelte 5.56.3, kit 2.70.2, vite 8.3.4, vitest 4.1.12, storybook ^10.6.8 (`@storybook/sveltekit`), tailwind ^3.4.1, typescript 6.0.3 + tsgo, eslint 9 flat, knip 6, husky 8 + lint-staged. No changesets, turbo or nx.
- Natural workspace candidates besides io: `utilities/` (47 files: temporal-server, ui-server, oidc-server, demo CLI), `plugins/` (4 Vite plugins importing `../utilities` and `../src/lib/catalog/authoring`), `scripts/catalog` + `src/lib/catalog` (174 files, own CLI and isolated `catalog:test-package` test), `temporal/` (e2e workers, codec server), `examples/*`, `agent-plugins/temporal-ui-catalog`, `tests/` (own tsconfig). These import `$lib` about 7 times in total.

### Recommended direction (the design starts here and may argue against it)

- Stay on pnpm; design for pnpm 12 (catalogs with `catalogMode: strict`, `allowBuilds`, `minimumReleaseAge`, `pnpm peers check`). No orchestrator at first; `pnpm -r --filter "...[origin/main]"`. Note what Turborepo would add later and keep the design compatible with it.
- Packages: `packages/io` published as `@temporalio/io`; private `packages/config` (shared tsconfig, eslint, prettier, stylelint); private dev-tools package(s) for `utilities/`, `plugins/`, `temporal/`; a decision on `catalog` (decided: private `packages/catalog`); the app as `apps/ui` (decided: the recommended layout) published as `@temporalio/ui` with Holocene inside it, still exported by file as `@temporalio/ui/holocene/<name>.svelte`. `server/` unchanged.
- One fixed version across `@temporalio/ui`, `@temporalio/io` and the Go server, continuing 2.x; `UIVersion` stays the source of truth; existing Version Bump workflow extended to N `package.json` files. Changesets or pnpm's built-in `versioning` only if per-package changelogs or snapshot publishing are wanted.
- `@temporalio/ui` keeps `./io/*` subpaths as re-exports of `@temporalio/io/*` for all of 2.x; removal is a 3.0 change with a one-line codemod.
- CI: `dorny/paths-filter` changes job, job-level `if:` gating, one `always()` gate job as the only required check, nightly full run. Never workflow-level `paths:` on required workflows.
- Svelte singleton hygiene: `svelte`/`@sveltejs/kit` as `peerDependencies` only in library packages, one catalog entry, `resolve.dedupe: ['svelte']` in the app, `pnpm peers check` in CI.

### Config sites, CI, Stage 2 and Stage 3 detail

- The 18 config sites: aliases x3, tsconfig extends/includes, tailwind content globs and the published preset glob, storybook main/preview, eslint/prettier/knip root paths, husky pre-commit, setup-node and build-and-package actions, consumer-agents job, trigger-downstream-updates paths, validate-versions and version actions, dependabot directories, Vite plugin relative imports, `server/` path references in test.yml/playwright.yml/build:server/.gitignore/knip.
- Trusted publishing: OIDC, `id-token: write`, registration per workflow file, the 2-day first-publish rule, a possible one-time manual first publish of `@temporalio/io`.
- Boundary rules: io never imports app; utilities never import components; holocene may import io. Enforcement options: workspace deps, dependency-cruiser or Sheriff, knip `workspaces`.
- Stage 0 prerequisites: path-gated CI, pnpm 12, trusted publishing, Dependabot gomod, removal of the two Io i18n imports.
- Stage 2: Go module publishing from ui, module path `github.com/temporalio/ui/server/v2`, tags `server/vX.Y.Z`. Stage 3: cloud-ui extension seams, snapshot publishing.

### Spike checks (required, only to de-risk the design)

On `spike/workspace-design`, record results in `design/spike-results.md`. Report what broke, not only what worked.

- Can `packages/io` be extracted and `svelte-package`d on its own, with the two i18n imports replaced by a prop or context, and with `@temporalio/ui` re-exporting `./io/*`? Does `generate-exports.mjs` work with a package-root argument?
- Does the Io Storybook build inside `packages/io` with `@storybook/sveltekit`, and does Chromatic `onlyChanged` work with `workingDir`?
- Does the app's Tailwind 3 `content` glob pick up `../../packages/io/src/**`?
- Does `pnpm peers check` pass, and is there exactly one Svelte instance (`setContext` across packages works)?
- Does `pnpm build:server` still produce `server/ui/assets/local`, so the ui-server sync is unchanged?

## Evidence appendix (external facts, research as of 2026-11-25)

Received from Claude AI. Repo facts are in "Context from the brief". These external facts cannot come from the repo. The full research notes (five files, per-claim citations) are available on request.

### Tool versions (npm registry, 2026-11-25)

- pnpm 12.23.0 (latest-10 10.34.9, latest-11 11.29.0). pnpm 11.0 (2026-04-28): Node 22+, `minimumReleaseAge` default 1440, `blockExoticSubdeps: true`, `strictDepBuilds: true`, `allowBuilds` replaces `onlyBuiltDependencies`, `.npmrc` becomes auth-only, codemod `pnpm-v10-to-v11`. pnpm 12.0 (2026-08-26): Rust rewrite, same commands and lockfile; `--frozen-lockfile false` rejected, unknown workspace keys reported, deterministic peer cycle-breaking (one-time lockfile diff), `pnpm peers check` replaces `--resolution-only`. 12.2: `pnpm deploy` without injected deps. 12.7: merge-base-aware `--filter "...[origin/main]"`. Built-in changesets-compatible `versioning`/`pnpm change`/`pnpm version -r`. Sources: pnpm.io/blog/releases/11.0, pnpm.io/blog/whats-different-in-pnpm-12, pnpm.io/catalogs, pnpm.io/cli/deploy, pnpm.io/versioning.
- Turborepo 2.11.13 (MIT). 2.11 (2026-09-18): experimental Go via root `go.work` + `futureFlags.experimentalGoWorkspaces` (names must be unique across JS+Go packages); free Vercel Remote Cache, HMAC-signable, open self-host API; `--affected` reads `GITHUB_BASE_REF`. turborepo.dev/blog/2-11, turborepo.dev/docs/guides/tools/go.
- Nx 24.0.7: task-based affected default, removed 35 executors; Nx Cloud Hobby free (50k credits), Team from $29/mo. nx.dev/blog/nx-24-release.
- moon 2.6.6: first-class `go` toolchain; remote cache only self-hosted Bazel REAPI; issue #2742 (unresponsive cache stalls tasks 60s).
- Bun 1.4.5: catalogs, isolated linker default for new monorepos, built-in 367-package script allow-list (fail-open). Yarn 4.19.0; Yarn 6 Rust preview not on npm. npm 12.2.3 blocks install scripts by default.
- SvelteKit 3.4.0 (requires Node 22, Vite 8, TS 6; `$lib` -> `#lib`; config moves to vite.config; `svelte-package` rewrites `#lib`). `@sveltejs/package` 3.0.3. Vite 8.3.8. Vitest 5.1.2 (workspace file removed in v4; use `test.projects`). TypeScript 7.0.2 (Go-native); Svelte ecosystem pins 6.0.x; svelte-check TS7 support unconfirmed. Storybook 10.6.9 (11.0.0-rc.0). Tailwind 4.3.5. Changesets CLI 3.0.3. Playwright 1.65.1. Chromatic CLI 18.15.3.

### Svelte ecosystem monorepos (root files read 2026-11-25)

All pnpm. sveltejs/kit pnpm@12.21, no orchestrator, Changesets v3, `minimumReleaseAge: 2880` with `@sveltejs/*` excluded, `bumpVersionsWithWorkspaceProtocolOnly: true`. sveltejs/svelte pnpm@10.33.4, Changesets. bits-ui pnpm@10.33, `pnpm -F "./packages/**" --parallel`, catalog (kit 3.1.1, vite 8, vitest 5, TS 6), library declares `svelte` as peer only, `svelte-kit sync && svelte-package && publint`. skeleton pnpm@12.21, pnpm native `versioning` fixed group, `catalogMode: strict`, `minimumReleaseAge: 4320`. shadcn-svelte pnpm@12.14, Changesets, `preinstall: npx only-allow pnpm`. threlte pnpm@10.11 + Turborepo 2.3 with `cache: false` on most tasks. melt-ui runs Storybook inside the library package. superforms uses version-scoped `minimumReleaseAgeExclude` (`@sveltejs/kit@3.0.0`).

### Svelte runtime duplication (the top migration risk)

Cause: library lists `svelte` under `dependencies` (kitql #1299) or peer-variant splits under pnpm isolation (vite discussion #14672); symptom: `setContext` breaks across instances. Fixes: `svelte`/`@sveltejs/kit` as `peerDependencies` only, single catalog entry, `pnpm peers check` in CI, `resolve.dedupe: ['svelte']` in the app's Vite config. Storybook 10 + pnpm triple-install bug #32459 (closed 2025-10-21); run Storybook from the package, not `pnpx`. Tailwind 3 needs the app `content` glob to include `../../packages/io/src/**`; Tailwind 4 needs `@source` per package. Chromatic: one run per Storybook with `workingDir`, `onlyChanged`, `--storybook-base-dir`, `fetch-depth: 0`.

### GitHub Actions rules

docs.github.com troubleshooting-required-status-checks: a workflow skipped by `paths:` leaves required checks "Pending" and blocks merge; a job skipped by `if:` reports Success; use `always()` with `needs` for gate jobs. Community discussion #44490 still "In Backlog". Pattern used by Astro `ci.yml`: `dorny/paths-filter@v4` detection job, job-level `if:`, single gate job. Do not interpolate `*_files` outputs into `run:`. Rulesets "required reviewer by team for file paths" GA 2026-02-17. No per-directory write permission exists. Dependabot: `directories`, multi-ecosystem groups, `exclude-paths` (2025-08), cross-directory name groups (2026-02), pnpm catalogs supported since 2025-02.

### npm publishing rules

Classic tokens revoked 2025-12-09. Trusted publishing GA 2025-07-31: npm CLI >= 11.5.1, Node >= 22.14, GitHub-hosted runners only, registered per exact workflow filename, multiple configs per package since 2026-09, a new config must complete a first publish within 2 days or expires (2026-10). Provenance auto-generated under trusted publishing, not for private source repos. Late-2025 reports: OIDC could not bootstrap a never-published package; unconfirmed whether fixed by Nov 2026. Primer React's release.yml is the reference (`id-token: write`, changesets/action v2 sub-actions).

### Versioning precedents

Fixed: Chakra (`"fixed": [["@chakra-ui/**"]]`), Mantine (custom scripts, refuses separate publish), Docusaurus. Independent: Radix, Primer, shadcn, Carbon, MUI, React Spectrum, SvelteKit, Svelte, Astro. Changesets `fixed` bumps and publishes the group together even without changes; `linked` only bumps changed packages. `privatePackages: {version: true, tag: false}` for internal tooling; `ignore` for examples. pnpm rewrites `workspace:` and `catalog:` to real ranges on `pack`/`publish`; a public package may not list a private workspace package in `dependencies` (`ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY`), use `devDependencies`. Removing an `exports` path is semver-major (SvelteKit packaging docs).

### Go module facts (go.dev/ref/mod, for Stage 2 only)

A module in a subdirectory must have path `<repo>/<subdir>/vN` and tags `<subdir>/vX.Y.Z` (e.g. `server/v2.59.0`); the old path `github.com/temporalio/ui-server/v2` cannot be served from the ui repo except via a Go 1.25+ `go-import ... subdirectory` vanity meta tag. proxy.golang.org never removes cached versions; `retract` is the only remedy. Go docs advise against committing `go.work`; CI should run with `GOWORK=off`. goreleaser's `monorepo:` block is Pro-only; OSS uses `builds[].dir`. temporalio/cli imports `ui-server/v2/server`, `/server/config`, `/server/server_options`, pins v2.56.4, and ignores ui-server in Dependabot ("managed manually"). Comparables: Prometheus, Argo CD, Gitea, Jaeger gitignore built assets and embed at build time with a placeholder or disk fallback; Grafana ships `public/` beside the binary; only ui-server commits bundles (to keep `go get` working offline).

### History migration (if ui-server is ever merged in)

Keep `temporalio/ui` as base, never rewrite its history (tags, SHAs cloud-ui vendored, issues stay valid); plain `git mv` keeps blame and `git log --follow`. Import others with `git clone --no-local`, `git filter-repo --to-subdirectory-filter server/ --tag-rename :ui-server-`, `git merge --allow-unrelated-histories`. Sentry's replay merge (#6257) preserved history this way; Mattermost's webapp merge lost history and had to copy PRs by hand. Archive old repos, never recreate the names (GitHub redirects break). `gh issue transfer` works within the org; PRs cannot be transferred.

### Cloud UI / private-public patterns (Stage 3 only)

Ranked: (1) public repo publishes packages, cloud-ui consumes npm with a `main` snapshot dist-tag, SHA dispatch kept as bridge; (2) SHA vendoring adapted via `pnpm --filter ... pack` or `pnpm --filter @temporalio/ui --prod deploy`; (3) explicit extension seams with private overlay (Grafana `pkg/extensions` file-present check, Mattermost `enterprise` build tag, GitLab `ee/` + `FOSS_ONLY` as-if-public CI); (4) Copybara super-repo (Dagster `copy.bara.sky`, hub-and-spoke, public PRs cannot merge directly); (5) submodule/subtree of private code: avoid; (6) private fork: avoid.

### Evidence base for pros/cons

Independent CI-caching data: Sentry median 20 -> 18 min with Nx caching (35% best case) vs vendor claims (Nx: 45 -> 6 min). Affected-only runs matter more than caching. Small-OSS analogue: Readium discussion #136 (split then wanted to re-merge: joined PRs, no bisect, flaky cross-repo CI, confused newcomers). Reverse cases: HashiCorp split Terraform providers (2017) for release autonomy; Vite moved plugin-react/vue out (#11158, 2022) to untangle release cycles. Prisma uses a flat `* @team` CODEOWNERS on purpose ("per-directory rules drift").
