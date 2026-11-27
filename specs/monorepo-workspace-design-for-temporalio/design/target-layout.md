# Target layout

Verified at commit: `051de464a`

This document gives the target directory tree, the packages and the owner of each shared tool. The recommended layout moves the app to `apps/ui`. The lower-churn variant, with the app at the root, is described after it. The two decision records are at the end. The spike checks this layout in [spike-results.md](spike-results.md).

## Directory tree

```text
temporalio/ui/
├── package.json                 private workspace root (no app code)
├── pnpm-workspace.yaml          packages, catalog, settings
├── pnpm-lock.yaml
├── .github/                     workflows and actions (see ci-and-release.md)
├── .husky/                      pre-commit (see config-strategy.md)
├── apps/
│   └── ui/                      @temporalio/ui (published)
│       ├── package.json
│       ├── svelte.config.js  vite.config.ts  vitest.config.ts
│       ├── tailwind.config.ts  postcss.config.cjs  playwright.config.ts
│       ├── tsconfig.json
│       ├── .storybook/          app Storybook: Holocene, components, catalog UI
│       ├── src/
│       │   ├── lib/holocene/    stays in the app, exported by file
│       │   ├── lib/catalog/     the catalog UI only (browser/*.svelte, host/); the package step copies the catalog modules in
│       │   ├── lib/io/, lib/theme/  re-export files to @temporalio/io (2.x only)
│       │   └── ...              routes, components, stores, utilities, i18n
│       ├── static/
│       └── tests/               Playwright integration, e2e, accessibility
├── packages/
│   ├── io/                      @temporalio/io (published)
│   │   ├── package.json
│   │   ├── .storybook/          Io Storybook (13 stories today)
│   │   ├── scripts/generate-io-docs.ts
│   │   └── src/                 today src/lib/io and src/lib/theme
│   ├── catalog/                 @temporalio/ui-catalog (private)
│   │   ├── package.json
│   │   ├── cli/                 today scripts/catalog
│   │   └── src/                 today src/lib/catalog/{worker,authoring.ts} and six pure browser modules
│   ├── config/                  @temporalio/ui-config (private)
│   │   └── tsconfig, eslint, prettier, stylelint base configs
│   └── dev-tools/               @temporalio/ui-dev-tools (private)
│       ├── utilities/           today utilities/
│       ├── plugins/             today plugins/ (Vite plugins)
│       ├── demo/                today src/lib/demo (dev tooling, no app importer)
│       └── temporal/            today temporal/ (e2e workers, codec server)
├── server/                      Go server, unchanged (Stage 2 decides its future)
├── examples/                    unchanged, not workspace packages
├── agent-plugins/               unchanged, not a workspace package
└── docs/  bin/  scripts/        repo scripts that are not package-specific
```

The tree has four new package folders and one moved app. `server/` stays at the root, so the Go module path, its tags and the `ui-server` sync do not change (spec: out of scope).

## `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*

catalogMode: strict
catalog:
  svelte: 5.56.3
  '@sveltejs/kit': 2.70.2
  '@sveltejs/package': <current>
  '@sveltejs/vite-plugin-svelte': <current>
  vite: 8.3.4
  vitest: 4.1.11
  typescript: 6.0.3
  tailwindcss: ^3.4.1
  storybook: ^10.6.1
  '@storybook/sveltekit': ^10.6.1

minimumReleaseAge: 20160
engineStrict: true

allowBuilds:
  '@swc/core': true
  '@temporalio/core-bridge': true
  core-js: true
  esbuild: true
  protobufjs: true
  svelte-preprocess: true
  unrs-resolver: false

overrides:
  # the 44 entries of today's `pnpm.overrides` (`package.json:250-295`), unchanged
```

- `catalogMode: strict` makes `pnpm add` take a shared dependency from the catalog. It does **not** check a version that a person writes by hand in a `package.json` (spike-results.md, B). The guard against two `svelte` versions is the catalog lint script of boundaries.md, rule B8.
- `minimumReleaseAge: 20160` keeps today's 14-day rule (`pnpm-workspace.yaml:1`).
- `engineStrict: true` replaces `engine-strict=true` in `.npmrc:1`. pnpm 12 reads only auth and registry settings from `.npmrc`.
- `allowBuilds` is a map in pnpm 12. It replaces `onlyBuiltDependencies` (`package.json:296-303`), which pnpm 12 ignores with no warning. The six packages are today's list. `unrs-resolver: false` comes from the spike install (spike-results.md, B).
- `overrides` moves from the `pnpm` field of `package.json`, which pnpm 12 does not read. A copy that drops this block drops all 44 security overrides.
- The versions are today's versions from `package.json`. The catalog entries change one time, in one place, for each later upgrade.

## Package shapes

### Root: `temporal-ui-workspace` (private)

| Field                                  | Value                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `private`                              | `true`                                                                                                                                                                                                                                                                       |
| `packageManager`                       | `pnpm@12.23.0`                                                                                                                                                                                                                                                               |
| `scripts`                              | `lint`, `lint:ci`, `check`, `test` and `build` as `pnpm -r <task>` over all packages. `build:server` as `pnpm --filter @temporalio/ui build:server`. `catalog` as `pnpm --filter @temporalio/ui-catalog catalog --app-root apps/ui` (decision record 2). `prepare` for husky |
| `devDependencies`                      | Only repo-wide tools: `husky`, `lint-staged`, `prettier`, `eslint`, `knip`, `@temporalio/ui-config: workspace:*`                                                                                                                                                             |
| `exports`, `files`, `peerDependencies` | None (the root is never published)                                                                                                                                                                                                                                           |

The root wrappers run every package. CI selects the changed packages itself (ci-and-release.md). The `ui-server` sync and `server-test` call the root `build:server`.

The root must not hold app dependencies. When a package needs a dependency, the package declares it. The [App at the root](#variant-app-at-the-root) section explains why this matters.

### `apps/ui`: `@temporalio/ui` (published)

| Field              | Value                                                                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `version`  | `@temporalio/ui`, the fixed version (2.x continues, see ci-and-release.md)                                                                                                                                                              |
| `exports`          | Today's map, generated by `generate-exports.mjs` at `prepack`. Every key stays for all of 2.x: `./holocene/*`, `./catalog/*`, `./theme/*` and `./io/*` (re-exports of `@temporalio/io`, see below)                                      |
| `peerDependencies` | `svelte`, `@sveltejs/kit` and today's other peers (`package.json` `peerDependencies`: `date-fns`, `date-fns-tz`, `nexus-rpc`, `zx`)                                                                                                     |
| `dependencies`     | `@temporalio/io: workspace:*` (pnpm writes the real version at publish) and today's runtime dependencies                                                                                                                                |
| `devDependencies`  | `@temporalio/ui-catalog`, `@temporalio/ui-dev-tools` and `@temporalio/ui-config`, all `workspace:*`                                                                                                                                     |
| `files`            | `dist/**/*`, without tests (today's `files`)                                                                                                                                                                                            |
| `scripts`          | Today's app scripts: `dev`, `build`, `build:server` (writes to `../../server/ui/assets/local`), `check`, `test`, `test:e2e`, `test:integration`, `stories:*`, `package` (also copies the catalog modules, decision record 2), `prepack` |

`@temporalio/ui` must not list a private workspace package in `dependencies`. pnpm stops the publish with `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY` (see boundaries.md). So the catalog, the dev tools and the config stay in `devDependencies`.

That pnpm error does not see `devDependencies`. A shipped file that imports a private package passes `pnpm pack` and fails only in the consumer's install. So the `package` job also scans the packed files for the names of the private packages (boundaries.md, rule B6).

The 2.x paths that `cloud-ui` imports are listed in ci-and-release.md, "`cloud-ui` imports that must keep working". Each one stays in the `@temporalio/ui` export map.

### `packages/io`: `@temporalio/io` (published)

| Field              | Value                                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `version`  | `@temporalio/io`, the same fixed version as `@temporalio/ui`                                                                                                                                                                       |
| `exports`          | One entry per file, as `generate-exports.mjs` makes them today: `./<component>` for each Io component folder, `./<component>/<file>.svelte`, `./theme/preset`, `./theme/plugin`, `./theme/io/*`                                    |
| `peerDependencies` | `svelte`, `tailwindcss` (Io uses the Tailwind preset and plugin)                                                                                                                                                                   |
| `dependencies`     | Only what Io components use at runtime: today `tailwind-merge` (11 imports in `src/lib/io`)                                                                                                                                        |
| `devDependencies`  | `@sveltejs/package`, `@sveltejs/kit`, `storybook`, `@storybook/sveltekit`, `@temporalio/ui-config`                                                                                                                                 |
| `files`            | `dist/**/*`, without `*.test.*`, `*.spec.*`, `*.stories.*` and `*.md` (`svelte-package` copies stories and Markdown into `dist`, spike check 1)                                                                                    |
| `scripts`          | `package` (`svelte-package`), `prepack` (`generate-exports.mjs <package root> --publish-config`, which skips stories and writes `publishConfig.exports`), `test`, `check`, `stories:dev`, `stories:build`, `stories:generate-docs` |

`svelte` is a peer only, never a dependency. A library with `svelte` in `dependencies` can install a second Svelte runtime (see risks-and-open-questions.md).

Io takes the theme with it (decision record 8 in decisions.md). `src/lib/theme` imports only `tailwindcss` and `postcss` (`src/lib/theme/plugin.ts:1`, `src/lib/theme/preset.ts:1`). It does not import app code. Io components need the preset and the plugin to render.

`@temporalio/ui` keeps every Io and theme key of today's export map for all of 2.x. Step 1.3 writes one re-export module for each key:

- A folder key, for example `./io/badge`: `export * from '@temporalio/io/badge'`.
- A file key, for example `./io/badge/badge.svelte`: a JS module with `export { default } from '@temporalio/io/badge/badge.svelte'`. The key keeps its name.
- A theme key, for example `./theme/io/themes` and `./theme/preset`: a re-export of the same file in `@temporalio/io`. `./theme/preset` keeps its old `content` glob (config-strategy.md, site 6).

### `packages/catalog`: `@temporalio/ui-catalog` (private)

| Field              | Value                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `private`          | `true`, and never published                                                                                                          |
| `exports`          | `./authoring`, `./worker/*`, `./browser/*` for the six pure browser modules (TypeScript source in the workspace, decision record 2)  |
| `peerDependencies` | None                                                                                                                                 |
| `dependencies`     | `@temporalio/activity`, `@temporalio/workflow`, `@hyperjump/json-schema`, `zod` and the other dependencies that the worker code uses |
| `files`            | None (the package is never packed). `@temporalio/ui` ships the compiled modules in its own `dist/catalog` (decision record 2).       |
| `bin`              | `catalog` (today `pnpm catalog`, `scripts/catalog/catalog-cli.ts`)                                                                   |
| `scripts`          | `catalog`, `test`, `check`, `test:package` (today `catalog:test-package`)                                                            |

The Vite plugin `vite-plugin-catalog-local` and the app depend on it with `workspace:*`. No publish step publishes this package. The catalog UI stays in the app, because it imports Holocene (decision record 2).

### `packages/config`: `@temporalio/ui-config` (private)

| Field              | Value                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `private`          | `true`, and never published                                                                |
| `exports`          | `./tsconfig.base.json`, `./tsconfig.library.json`, `./eslint`, `./prettier`, `./stylelint` |
| `peerDependencies` | `eslint`, `prettier`, `stylelint`, `typescript`                                            |
| `files`            | None (the package is never packed)                                                         |
| `scripts`          | None                                                                                       |

### `packages/dev-tools`: `@temporalio/ui-dev-tools` (private)

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `private`          | `true`, and never published                                                                                              |
| `exports`          | `./plugins/*` (the four Vite plugins), `./utilities/*`, `./temporal/*`                                                   |
| `peerDependencies` | `vite` (the plugins import it). The package imports no `svelte` and no `@sveltejs/kit`, so rule B8 has no peer to check. |
| `dependencies`     | `@temporalio/ui-catalog: workspace:*` and what `utilities/`, `plugins/`, `temporal/` and `src/lib/demo` use              |
| `files`            | None (the package is never packed)                                                                                       |
| `bin`              | `temporal-ui-demo` (today `utilities/demo/demo-cli.ts`)                                                                  |
| `scripts`          | `test`, `check`                                                                                                          |

This package collects the 70 relative imports into `src/` from `utilities/`, `scripts/` and `plugins/` (claims ledger, row 22). 40 of them go to `src/lib/demo`. No file in the app imports `src/lib/demo`, so `demo` moves into this package and those imports become local. The 29 catalog imports go to `@temporalio/ui-catalog`. One package is the start. It can split later if `temporal/` needs its own release cycle.

## Tool owners

| Tool                  | Owner                                                                 | Why                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook             | `apps/ui` (the Storybook version, the addons and the app Storybook)   | Holocene, component and catalog UI stories (59 today) import app code. **Deviation:** `packages/io` runs a second Storybook (decision record 10). |
| Chromatic             | `apps/ui` (the project that posts the required `UI Tests` status)     | **Deviation:** the Io Storybook gets a second Chromatic project in `packages/io` (decision record 10).                                            |
| Playwright            | `apps/ui`                                                             | The tests drive the built app (`playwright.config.ts:52-54` starts the app server).                                                               |
| The catalog           | `packages/catalog` (worker, authoring, the pure browser modules, CLI) | Decision record 2. The catalog UI in `apps/ui` uses the package, as Holocene uses Io.                                                             |
| The Io docs generator | `packages/io`                                                         | `scripts/generate-io-docs.ts` reads Storybook entries under `./src/lib/io/`. After the move, it reads the Io Storybook in the same package.       |
| The Tailwind preset   | `packages/io`                                                         | Io components need it, and it imports no app code. `@temporalio/ui` re-exports `./theme/preset` in 2.x.                                           |

## Variant: app at the root

In this variant, Io, config, catalog and dev tools move to `packages/*`, and the app stays at the repo root. The root `package.json` is the workspace root and also `@temporalio/ui`.

**What it saves.** Stage 1 moves about 300 files instead of all app files. Config paths in the app (`svelte.config.js`, `vite.config.ts`, `playwright.config.ts`, the GitHub actions) do not change. `git log` of the app files shows no rename.

**The phantom-dependency trade-off.** With the app at the root, the root `package.json` holds the app dependencies. pnpm links root dependencies into the root `node_modules`. Node resolution goes up the directory tree, so code in `packages/io` can import a package that only the root declares, and the import works in the repo. The same import fails for a consumer who installs `@temporalio/io` from npm. This is a phantom dependency. It passes every local test and every CI test, and it breaks only after the publish. The app has 39 runtime dependencies and 95 dev dependencies, so the risk is large. Mitigations exist (an eslint `import/no-extraneous-dependencies` rule per package, or a test install of each packed tarball in CI), but they are extra work that the `apps/ui` layout does not need.

**Other costs.** The root mixes repo tooling and app scripts, so `pnpm -r` also runs app tasks from the root. A later move to `apps/ui` repeats the config change of all app sites.

## Decision record 1: the app moves to `apps/ui`

- **Decided by:** the spec owner, in the Spec stage. The meeting sees it as decided.
- **Options:**
  1. `apps/ui` (recommended)
  2. The app at the root
  3. The app at the root first, then `apps/ui`
- **Decision:** `apps/ui`.
- **Reasons:**
  - The root then has only repo tools, so a phantom dependency cannot come from the root.
  - All packages follow one pattern.
  - The config paths change one time, not two times.
  - `git mv` keeps the history. `git log --follow` and `git blame` follow the rename.
- **Costs:**
  - One large rename PR.
  - Open PRs at the time of the move need a rebase. Git rename detection handles most of these.
  - Each config site of the app changes (see config-strategy.md).
- **Later layout:** two more moves are good end states, but not in Stage 1. The Stage 1 layout can grow into both.
  - **`server/` to `apps/server`, in Stage 2.**
    - The folder does not set the module path today. `server/go.mod:1` declares `github.com/temporalio/ui-server/v2`.
    - A move in Stage 1 breaks the `ui-server` sync, which copies `server/`. The brief does not allow a change to the sync.
    - About 20 workflow lines use `server/go.mod` or `server/go.sum`, for example `.github/workflows/test.yml:26`.
    - `.github/workflows/version-bump.yml:105` reads `server/go.mod` at the last tag. The first release after the move must read both paths.
    - `server/` has no `package.json`, so the `apps/*` glob must exclude it, or the server gets a small `package.json`.
    - In Stage 2, the folder sets the module path and the tag prefix (migration-plan.md, "What Stage 2 and Stage 3 defer"). Stage 2 decides the folder and the module path together, so the sync and the tags change one time.
  - **Holocene to `packages/holocene`, after a separate decoupling project.**
    - A package cannot import the app. That makes a cycle and breaks rule B1 (boundaries.md).
    - Holocene imports the app about 100 times: 36 `$lib/utilities`, 17 `$lib/i18n`, 11 `$lib/stores`, 10 `$lib/types`, 6 `$lib/components` and 15 `$app/*` (README.md, claims ledger, rows 9 and 10).
    - Io had 3 app imports, and those 3 needed a new context in the spike (spike-results.md, check 1).
    - The decoupling project removes these imports with the same method. Then Holocene can move.

## Decision record 2: the catalog is a private package, and its UI stays in the app

- **Decided by:** the spec owner, in the Spec stage. The meeting sees it as decided. This record adds the split line that the code needs, and how `@temporalio/ui` keeps its 2.x catalog paths.
- **Fact:** the catalog is not one unit.
  - `src/lib/catalog/worker` has 110 files and no import of app code.
  - `src/lib/catalog/browser` has 53 files. 12 of them import app code (23 Holocene imports in the catalog) and 7 import Io.
  - `src/lib/catalog/host/ui-services.ts:1-13` imports app types and utilities.
  - The worker imports pure browser modules: `src/lib/catalog/worker/scenario-inputs.ts:1-2` imports `../browser/schema-validator.js` and `../browser/types`, and `src/lib/catalog/worker/registry.ts:10` imports `../browser/start-options.js`.
- **Fact:** the catalog modules are part of the published surface of `@temporalio/ui` today.
  - `svelte-package` packs all of `src/lib`, and `files` is `dist/**/*` (`package.json:21-25`). So `dist/catalog/worker/*`, `dist/catalog/authoring.js` and `dist/catalog/browser/*` ship.
  - The repo tests this contract. Its clean-consumer test imports `@temporalio/ui/catalog/authoring`, `catalog/browser/routing` and eight `catalog/worker/*` paths from the packed tarball (`scripts/catalog/catalog-artifacts.test.ts:1602-1611`).
  - `cloud-ui` imports these paths 52 times in 26 files (ci-and-release.md, "`cloud-ui` imports that must keep working").
  - The 2.x rule allows only additions to the export map (migration-plan.md, "Rules for every step").
- **The split line.** The pure browser modules are the ones that the worker, `authoring.ts`, the CLI or the dev tools import, and that import no app code: `types`, `metadata-schema`, `routing`, `schema-validator`, `start-options` and `catalog-sources`. The method: list the `../browser/*` and `src/lib/catalog/browser/*` imports of `worker/`, `authoring.ts`, `scripts/catalog`, `plugins/` and `utilities/`, then add the local imports of each module. `catalog-kinds` and `catalog-features` have only UI importers, so they stay in the app.
- **Options for the published catalog paths:**
  1. **The pure modules stay in `apps/ui`, and `packages/catalog` imports them from `@temporalio/ui`.** Rejected. `worker/` and `authoring.ts` still leave `@temporalio/ui`, so the `cloud-ui` imports of `catalog/worker/*` and `catalog/authoring` break. It also makes a cycle: `@temporalio/ui` needs the catalog Vite plugin through `@temporalio/ui-dev-tools`, which needs `@temporalio/ui-catalog`, which then needs `@temporalio/ui`.
  2. **Leave `src/lib/catalog` out of the `@temporalio/ui` package.** Rejected. It removes export keys that `cloud-ui` and the clean-consumer test use. That is a semver-major change, which the 2.x rule forbids.
  3. **All catalog code stays in `apps/ui`. `packages/catalog` holds only the CLI and depends on `@temporalio/ui`.** Rejected. The app needs the catalog Vite plugin, so the app and the catalog depend on each other. The app then does not depend on the catalog package, which R1.S5 asks for.
  4. **The source moves to `packages/catalog`, and `@temporalio/ui` ships a compiled copy at the old paths (recommended).** See below.
- **Decision:** `packages/catalog` gets:
  - `worker/`
  - `authoring.ts`
  - the six pure browser modules, in `src/browser/`, so that each module keeps its path below `catalog/`
  - the CLI from `scripts/catalog`

  The Svelte components of `browser/`, `catalog-kinds`, `catalog-features` and all of `host/` stay in `apps/ui/src/lib/catalog`. They import `@temporalio/ui-catalog/...`.

- **How the 2.x paths stay.** The `package` script of `apps/ui` compiles `packages/catalog/src` with `svelte-package` into a temporary folder, and copies the output into `apps/ui/dist/catalog/`. It then rewrites each `@temporalio/ui-catalog/<path>` import in `dist` to a relative path. Then `generate-exports.mjs` runs as today, so each `./catalog/*` key stays. `@temporalio/ui` keeps the runtime dependencies of the catalog in `dependencies`, as today (`package.json:108,111-112,134`).
- **The CLI also reads and writes app files by path.** The split line above counts imports only. The CLI has a second coupling: it resolves file paths against `getProjectRoot()`, the nearest folder above the script that has a `package.json` (`scripts/get-project-root.ts:5-16`).
  - It writes the generated catalog to `src/lib/catalog/browser/catalog.generated.json` and `catalog.generated.ts` (`scripts/catalog/project-artifacts.ts:18-19`, `scripts/catalog/ui-authoring.ts:80-81,159-164`).
  - Its boundary check reads 13 browser and host files and the app `package.json` (`scripts/catalog/project-artifacts.ts:27-42`).
  - It writes the worker files `shared-registrations.ts` and `workflows.ts`, and the examples (`scripts/catalog/ui-authoring.ts:78-79,155,167,176`).
  - It reads and writes `catalog.local/` (`scripts/catalog/project-artifacts.ts:20-22`).

  After step 1.4, `getProjectRoot()` finds `packages/catalog/package.json`. Each app path then resolves in the wrong folder, and `pnpm catalog` breaks.

- **Where the files live after the split.**
  - The generated files stay in the app, at `apps/ui/src/lib/catalog/browser/catalog.generated.json` and `.ts`. Their only importer is `catalog.ts` (`src/lib/catalog/browser/catalog.ts:1`), a UI module that stays in the app.
  - The worker files and the examples move with `worker/` to `packages/catalog/src/worker/`.
  - `catalog.local/` stays at the app root, `apps/ui/catalog.local/`. The Vite plugin reads it from the Vite root (`plugins/vite-plugin-catalog-local.ts:11`). The root-anchored `.gitignore` entry gets the new path (spike-results.md, C).
- **How the CLI finds the app root.** The CLI gets two roots in place of one `rootDirectory`:
  - The catalog root is the folder of its own `package.json`. The CLI gets its own copy of `getProjectRoot()`, because `scripts/get-project-root.ts` stays at the repo root, and a relative import across a package root breaks rule B7. Worker paths, `routing.ts` and `types.ts` resolve against the catalog root.
  - The app root comes from an explicit `--app-root` option, a path from the workspace root. The root `catalog` script passes `--app-root apps/ui`. Without the option, the CLI finds the workspace root (the folder with `pnpm-workspace.yaml`) and uses `apps/ui` below it. The generated files, the other 11 files of the boundary check, the app `package.json` and `catalog.local/` resolve against the app root.
- **The edge to the app is a path, not an import.** The CLI writes files in `apps/ui`, but no catalog module imports app code, and `packages/catalog/package.json` does not list `@temporalio/ui`. So the package graph stays as the next point says. pnpm does not see the path edge, but a catalog change that changes the generated files also changes files in `apps/ui`, so the `app` filter of CI turns on.
- **Why this keeps the catalog private.** The package `@temporalio/ui-catalog` is never packed or published, and `@temporalio/ui` lists it only in `devDependencies`. `@temporalio/ui` ships the compiled catalog modules that it ships today, and nothing more. The dependency graph has no cycle: the app, the dev tools and nothing else depend on the catalog, and the catalog depends on no workspace package except the config. The path edge of the CLI to `apps/ui` is not a package dependency (see above).
- **Checks.** The `package` job fails if an import specifier in a packed `dist` file names `@temporalio/ui-catalog`, or if a runtime dependency field of the packed `package.json` names it (boundaries.md, rule B6). Step 1.4 also runs the clean-consumer test and compares the export keys before and after (migration-plan.md).
- **Cost:**
  - The Stage 1 catalog PR must sort each file of `browser/` by its imports. The migration plan gives this PR its own step.
  - A copy step in the `apps/ui` package script, which the spike did not test (risks-and-open-questions.md, K9).
  - Two roots and an `--app-root` option in the CLI (risks-and-open-questions.md, K9).
  - In 3.0, the team can drop the copy. That needs a decision about how `cloud-ui` gets the catalog (Stage 3).
