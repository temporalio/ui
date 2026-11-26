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
│       │   ├── lib/catalog/     the catalog UI only (browser/*.svelte, host/)
│       │   ├── lib/io/          re-export files to @temporalio/io (2.x only)
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
│   │   └── src/                 today src/lib/catalog/{worker,authoring*} and the pure browser modules
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
allowBuilds:
  - <the packages that need install scripts today, for example esbuild>
```

- `catalogMode: strict` makes each package take a shared dependency from the catalog. Two packages then cannot declare two different `svelte` versions. This is the first defense against two Svelte runtimes.
- `minimumReleaseAge: 20160` keeps today's 14-day rule (`pnpm-workspace.yaml:1`).
- `allowBuilds` replaces `onlyBuiltDependencies` in pnpm 11 and later. The list starts from the packages that need install scripts today.
- The versions are today's versions from `package.json`. The catalog entries change one time, in one place, for each later upgrade.

## Package shapes

### Root: `temporal-ui-workspace` (private)

| Field                                  | Value                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `private`                              | `true`                                                                                                             |
| `packageManager`                       | `pnpm@12.23.0`                                                                                                     |
| `scripts`                              | `lint`, `check`, `test`, `build` as `pnpm -r --filter "...[origin/main]" <task>` wrappers, and `prepare` for husky |
| `devDependencies`                      | Only repo-wide tools: `husky`, `lint-staged`, `prettier`, `eslint`, `knip`, `@temporalio/ui-config: workspace:*`   |
| `exports`, `files`, `peerDependencies` | None (the root is never published)                                                                                 |

The root must not hold app dependencies. When a package needs a dependency, the package declares it. The [App at the root](#variant-app-at-the-root) section explains why this matters.

### `apps/ui`: `@temporalio/ui` (published)

| Field              | Value                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `version`  | `@temporalio/ui`, the fixed version (2.x continues, see ci-and-release.md)                                                                                                         |
| `exports`          | Today's map, generated by `generate-exports.mjs` at `prepack`: `./holocene/<name>.svelte`, `./*`, `./theme/preset`, and `./io/*` as re-exports of `@temporalio/io` for all of 2.x  |
| `peerDependencies` | `svelte`, `@sveltejs/kit` and today's other peers (`package.json` `peerDependencies`: `date-fns`, `date-fns-tz`, `nexus-rpc`, `zx`)                                                |
| `dependencies`     | `@temporalio/io: workspace:*` (pnpm writes the real version at publish) and today's runtime dependencies                                                                           |
| `devDependencies`  | `@temporalio/ui-catalog`, `@temporalio/ui-dev-tools` and `@temporalio/ui-config`, all `workspace:*`                                                                                |
| `files`            | `dist/**/*`, without tests (today's `files`)                                                                                                                                       |
| `scripts`          | Today's app scripts: `dev`, `build`, `build:server` (writes to `../../server/ui/assets/local`), `check`, `test`, `test:e2e`, `test:integration`, `stories:*`, `package`, `prepack` |

`@temporalio/ui` must not list a private workspace package in `dependencies`. pnpm stops the publish with `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY` (see boundaries.md). So the catalog, the dev tools and the config stay in `devDependencies`.

### `packages/io`: `@temporalio/io` (published)

| Field              | Value                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `version`  | `@temporalio/io`, the same fixed version as `@temporalio/ui`                                                                                              |
| `exports`          | `./<component>` for each Io component folder, `./icon`, `./theme/preset`, `./theme/plugin`, `./theme/io/*`                                                |
| `peerDependencies` | `svelte`, `tailwindcss` (Io uses the Tailwind preset and plugin)                                                                                          |
| `dependencies`     | Only what Io components use at runtime: today `tailwind-merge` (11 imports in `src/lib/io`)                                                               |
| `devDependencies`  | `@sveltejs/package`, `@sveltejs/kit`, `storybook`, `@storybook/sveltekit`, `@temporalio/ui-config`                                                        |
| `files`            | `dist/**/*`, without tests                                                                                                                                |
| `scripts`          | `package` (`svelte-package`), `prepack` (`generate-exports.mjs <package root>`), `test`, `check`, `stories:dev`, `stories:build`, `stories:generate-docs` |

`svelte` is a peer only, never a dependency. A library with `svelte` in `dependencies` can install a second Svelte runtime (see risks-and-open-questions.md).

Io takes the theme with it. `src/lib/theme` imports only `tailwindcss` and `postcss`. It does not import app code. Io components need the preset and the plugin to render. `@temporalio/ui` keeps `./theme/preset` as a re-export for all of 2.x.

### `packages/catalog`: `@temporalio/ui-catalog` (private)

| Field              | Value                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `private`          | `true`, and never published                                                                                                          |
| `exports`          | `./authoring`, `./worker/*`, `./types`, `./metadata-schema`, `./routing`, `./schema-validator` (TypeScript source, no build step)    |
| `peerDependencies` | None                                                                                                                                 |
| `dependencies`     | `@temporalio/activity`, `@temporalio/workflow`, `@hyperjump/json-schema`, `zod` and the other dependencies that the worker code uses |
| `bin`              | `catalog` (today `pnpm catalog`, `scripts/catalog/catalog-cli.ts`)                                                                   |
| `scripts`          | `catalog`, `test`, `test:package` (today `catalog:test-package`)                                                                     |

The Vite plugin `vite-plugin-catalog-local` and the app depend on it with `workspace:*`. No publish step includes it. The catalog UI stays in the app, because it imports Holocene (decision record 2).

### `packages/config`: `@temporalio/ui-config` (private)

| Field              | Value                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `exports`          | `./tsconfig.base.json`, `./tsconfig.library.json`, `./eslint`, `./prettier`, `./stylelint` |
| `peerDependencies` | `eslint`, `prettier`, `stylelint`, `typescript`                                            |
| `scripts`          | None                                                                                       |

### `packages/dev-tools`: `@temporalio/ui-dev-tools` (private)

| Field          | Value                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| `exports`      | `./plugins/*` (the four Vite plugins), `./utilities/*`, `./temporal/*`                                      |
| `dependencies` | `@temporalio/ui-catalog: workspace:*` and what `utilities/`, `plugins/`, `temporal/` and `src/lib/demo` use |
| `bin`          | `temporal-ui-demo` (today `utilities/demo/demo-cli.ts`)                                                     |
| `scripts`      | `test`, `check`                                                                                             |

This package collects the 70 relative imports into `src/` from `utilities/`, `scripts/` and `plugins/` (claims ledger, row 22). 40 of them go to `src/lib/demo`. No file in the app imports `src/lib/demo`, so `demo` moves into this package and those imports become local. The 29 catalog imports go to `@temporalio/ui-catalog`. One package is the start. It can split later if `temporal/` needs its own release cycle.

## Tool owners

| Tool                                                   | Owner                                                                           | Why                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook (Io stories, 13 today)                       | `packages/io`                                                                   | Io stories document the published Io package. They must build without the app.                                                              |
| Storybook (Holocene, components, catalog UI, 59 today) | `apps/ui`                                                                       | These stories import app code.                                                                                                              |
| Chromatic                                              | One run per Storybook, in the package that owns the Storybook                   | Chromatic builds one Storybook per run. Each run uses `workingDir` and `onlyChanged` (see ci-and-release.md).                               |
| Playwright                                             | `apps/ui`                                                                       | The tests drive the built app (`playwright.config.ts:52-54` starts the app server).                                                         |
| The catalog                                            | `packages/catalog` (worker, authoring, CLI). The catalog UI stays in `apps/ui`. | Decision record 2                                                                                                                           |
| The Io docs generator                                  | `packages/io`                                                                   | `scripts/generate-io-docs.ts` reads Storybook entries under `./src/lib/io/`. After the move, it reads the Io Storybook in the same package. |
| The Tailwind preset                                    | `packages/io`                                                                   | Io components need it, and it imports no app code. `@temporalio/ui` re-exports `./theme/preset` in 2.x.                                     |

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

## Decision record 2: the catalog is a private package, and its UI stays in the app

- **Decided by:** the spec owner, in the Spec stage. The meeting sees it as decided. This record adds the split line that the code needs.
- **Fact:** the catalog is not one unit.
  - `src/lib/catalog/worker` has 110 files and no import of app code.
  - `src/lib/catalog/browser` has 53 files. 12 of them import app code (23 Holocene imports in the catalog) and 7 import Io.
  - `src/lib/catalog/host/ui-services.ts:1-13` imports app types and utilities.
  - The worker imports pure browser modules: `src/lib/catalog/worker/scenario-inputs.ts:1-2` imports `../browser/schema-validator.js` and `../browser/types`.
- **Options:**
  1. Move all of the catalog: not possible without a cycle between the catalog and the app.
  2. Split at the UI line (recommended).
  3. Leave all of the catalog in the app: the plugins and the scripts then keep relative imports across package roots.
- **Decision:** `packages/catalog` gets:
  - `worker/`
  - `authoring.ts`
  - the pure browser modules: `types`, `metadata-schema`, `routing`, `schema-validator`, `catalog-kinds`, `catalog-features`
  - the CLI from `scripts/catalog`

  The Svelte components of `browser/` and all of `host/` stay in `apps/ui/src/lib/catalog`, and they import the package.

- **Cost:** the Stage 1 catalog PR must sort each file of `browser/` by its imports. The migration plan gives this PR its own step.
