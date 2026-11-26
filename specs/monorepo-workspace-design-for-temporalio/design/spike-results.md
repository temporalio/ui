# Spike results

Verified at commit: `ccd8f4f69`

The spike ran on the branch `spike/workspace-design`, from `051de464a` on `main`. The branch is pushed to origin with no PR. Its README starts with a banner that says "DISPOSABLE SPIKE BRANCH. NEVER MERGE." The team deletes the branch after the meeting. Nothing from the spike reaches `main` (R8.S3).

The citations in this document point at the spike branch, at the commit above.

## Result for each check

| #   | Check                                                    | Result                                                       | Commit      | Effect on the design                                                                              |
| --- | -------------------------------------------------------- | ------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------- |
| A   | The banner                                               | Pass                                                         | `be544facc` | None                                                                                              |
| B   | pnpm 12.23.0, the workspace and the catalog              | Pass, after four changes                                     | `07b2721e6` | Stage 0.2 gets the four changes (below)                                                           |
| C   | The move to `apps/ui` and `packages/io`                  | Pass, after three changes                                    | `519087433` | Steps 1.1 and 1.2 get the three changes (below)                                                   |
| 1   | Io extraction                                            | **Partial.** It works, but `svelte-check --tsgo` fails       | `184e63fdf` | A new open item (risks-and-open-questions.md, S1). Step 1.3 gets more work                        |
| 2   | Io Storybook and Chromatic                               | **Partial.** The build passes. Chromatic needs a token       | `4c8c32872` | Confirms that Io takes the theme. Chromatic stays open (risks-and-open-questions.md, S2)          |
| 3   | Tailwind 3 sees the Io classes                           | Pass                                                         | `5ae44fd9a` | None                                                                                              |
| 4   | One Svelte runtime across packages                       | **Partial.** One runtime is proved. `pnpm peers check` fails | `ccd8f4f69` | `pnpm peers check` needs one unrelated fix before CI can use it (risks-and-open-questions.md, S3) |
| 5   | `pnpm build:server` from the root writes the server tree | Pass                                                         | `519087433` | None                                                                                              |

## B. pnpm 12.23.0

- **Command:** `npx -y pnpm@12.23.0 install`.
- **Result:** pass, after these four changes:
  1. **pnpm 12 does not read the `pnpm` field in `package.json`.** It printed: `The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.overrides", "pnpm.onlyBuiltDependencies".` The overrides moved into `pnpm-workspace.yaml:28`.
  2. **pnpm 12 ignores `onlyBuiltDependencies` with no warning.** The install then failed with `ERR_PNPM_IGNORED_BUILDS … Ignored build scripts: @swc/core, esbuild, protobufjs, svelte-preprocess, unrs-resolver`. An `allowBuilds` map replaced it (`pnpm-workspace.yaml:19-26`).
  3. **An unknown key is an error.** A test key gave `ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`. A typo in `pnpm-workspace.yaml` stops every install.
  4. **The old lockfile failed the integrity check.** pnpm printed `ERR_PNPM_MISSING_TARBALL_INTEGRITY … 3 lockfile entries failed verification`, for the three `@buf/*` packages. The spike deleted the 6 `@buf` blocks and ran `pnpm install --lockfile-only --fix-lockfile`. The entries came back with integrity hashes.
- **Lockfile diff:** +649 and −497 lines. The new lockfile pins pnpm 12.23.0 in a header document. About 15 duplicate entries went away.
- **`catalogMode: strict`** (`pnpm-workspace.yaml:7`):
  - `pnpm add -D svelte@5.56.2` failed with `ERR_PNPM_CATALOG_VERSION_MISMATCH`. The rule works for `pnpm add`.
  - The rule does **not** check a version that someone writes by hand in `package.json`. The app kept `tailwindcss: ^3.4.1` while the catalog had `^3.4.19`, and the install passed. A separate check is necessary (boundaries.md, rule B8).

## C. The move

- **Command:** `git mv` of the app into `apps/ui`, and of `src/lib/io` into `packages/io/src`. `server/` and `.npmrc` stay at the root.
- **Result:** pass, after these three changes:
  1. **`.gitignore` entries are anchored at the root.** `/.svelte-kit`, `/build` and `/dist` no longer matched in `apps/ui`, and more than 2,000 generated files were staged. The spike added entries for the package folders (`.gitignore:64-71`).
  2. **The pre-commit hook broke in two ways.** `lint-staged` at the root failed with `eslint --fix ENOENT`, because ESLint and Stylelint are now dependencies of `apps/ui`. The Io docs step in `.husky/pre-commit:7` matches `src/lib/io/…` and `.storybook/…`. Those paths no longer exist, so the docs step never runs, and no error shows it.
  3. **Husky must run from the git root.** The spike removed `husky install` from the app `prepare` (`apps/ui/package.json:29`) and put it in the root `package.json`.
- **Other changes:**
  - `apps/ui/package.json:44`: `BUILD_PATH=../../server/ui/assets/local`.
  - `apps/ui/package.json:112`: `"@temporalio/io": "workspace:*"`.
  - 71 imports inside Io changed from `$lib/io/…` to relative paths.
  - 14 re-export files keep `$lib/io/<name>` working in the app, for example `apps/ui/src/lib/io/badge-status/index.ts:1`.
  - 8 app files imported `$lib/io/….svelte` directly. They now import `@temporalio/io/….svelte`.

## Check 1. Io extraction: partial

### What passed

- **Io without app imports.** `packages/io/src/i18n/index.ts:32-35` adds `setIoTranslate` and `getIoTranslate`, a Svelte context with English defaults. `badge-status` and `breadcrumbs` use it. The app fills it in `apps/ui/src/routes/+layout.svelte:10`.
- **`svelte-package` in `packages/io`:** pass. The output was 592 files in `dist`.
  - The `.svelte` files in `dist` keep `lang="ts"`.
  - Stories and `.md` files are in `dist`. The `files` field must exclude them.
- **The app imports Io from the workspace:** pass. `vitest run src/lib/components/app-palette/ src/lib/holocene` gave `Test Files 18 passed, Tests 229 passed`. The stack traces resolve to `packages/io/src`.
  - Before a fix, 56 tests failed with `ReferenceError: IconSvgWrapper is not defined`. `svelte-preprocess` reads the nearest tsconfig, and without `verbatimModuleSyntax` it removes imports that only the markup uses. The fix is `packages/io/tsconfig.json:9`.
- **`generate-exports.mjs`:** it needed a package-root argument and a `--publish-config` flag, which writes to `publishConfig.exports`. The result was 294 export entries. 13 of them are `*.stories.svelte` files, because the script does not skip stories.
- **The published `@temporalio/ui/io/*` paths:** `svelte-package` in `apps/ui` writes `dist/io/badge-status/index.js` as `export * from '@temporalio/io/badge-status';`. **So the re-exports work only if `@temporalio/io` is also published.** This is evidence for decision record 4: a private Io package needs `bundleDependencies` to keep the 2.x import paths.

### What failed

- **`pnpm check` (`svelte-check --tsgo`) failed with 27 errors.** An example: `"../../packages/io/src/badge-status/index.ts" … Module '"*.svelte"' has no exported member 'BadgeStatusValue'`.
  - When the app tsconfig `include` also had `packages/io`, the result was 32 errors.
  - The same `svelte-check` without `--tsgo` gave `0 ERRORS 65 WARNINGS`.
  - The `--tsgo` mode does not type `.svelte` files outside the folder of its tsconfig. The spike did not find a fix. This is open item S1.
- **The full app test suite:** `Test Files 5 failed | 325 passed`, `Tests 19 failed | 4424 passed`.
  - 3 files failed because of paths that the move changed: `catalog-artifacts.test.ts`, `local-migration.test.ts` (`ENOENT … apps/ui/.gitignore`) and `generate-markdown-css.test.ts` (`ENOENT … apps/ui/server/server/route/markdown.gen.css`). Step 1.2 fixes these paths.
  - 2 files (`catalog-list.test.ts`, `multi-region-wiring.svelte.test.ts`) failed in the full run and passed alone. The spike did not find the cause. This is open item S4 (risks-and-open-questions.md).
  - The 3 Io `*.test.ts` files no longer ran, because the app Vitest `include` looks only in `apps/ui`. Io needs its own Vitest config.

## Check 2. Io Storybook: build pass, Chromatic partial

- **Command:** `pnpm exec storybook build` in `packages/io`.
- **Result:** `Storybook build completed successfully`, with 81 index entries for 13 components.
- **Two failures on the way:**
  1. With no Vite config: `[plugin storybook:svelte-docgen-plugin] … Parse failed … Unexpected JSX expression`. The fix is a `packages/io/vite.config.ts` with `sveltekit()`.
  2. Then `Error: src/app.html does not exist`. The fix is `packages/io/svelte.config.js:12-14`: `lib: 'src'`, `appTemplate` and `routes` in `.storybook/`.
- **The styles still come from the app.** `packages/io/.storybook/preview.ts:3` imports `apps/ui/src/app.css`, and `packages/io/postcss.config.cjs:8` uses the app Tailwind config. This confirms the design: `src/lib/theme` and the base CSS layers must move into Io (target-layout.md). The spike did not move them.
- **The Io Storybook has no theme switcher and no `ComponentDocs` block.** Step 1.3 adds them.
- **Chromatic:** `npx chromatic@18.14.3 --dry-run --working-dir . --only-changed` gave `✖ Missing project token`. A dry run also needs a token. The CLI accepted the options. The proposed config is `packages/io/chromatic.config.json` (`storybookBaseDir: packages/io`, `onlyChanged: true`). The real run is open item S2.

## Check 3. Tailwind 3: pass

- **Command:** `pnpm run build:local` in `apps/ui`, then `grep -oF -- '<class>'` on the built CSS.
- **Before:** each count was 0 for `min-h-\[16px\]` (from Io `badge/recipe.ts`), `bg-surface-overlay-information` (from Io `chip/recipe.ts`) and `var(--group-border-width)`.
- **After** `apps/ui/tailwind.config.ts:9` added `../../packages/io/src/**/*.{html,js,svelte,ts}`: each count was 1.
- The path is relative to the folder where the build runs (`apps/ui`).

## Check 4. One Svelte runtime: partial

- **`pnpm ls -r svelte`:** both packages have `svelte@5.56.3`. Both links point to the same folder, `.pnpm/svelte@5.56.3_@typescript-eslint+types@8.62.0`.
  - The folder name has a peer suffix. If the two packages ever resolve a different peer, pnpm makes two Svelte copies. `pnpm peers check` and the catalog prevent this (risks-and-open-questions.md, K1).
- **`pnpm peers check`** exited with 1. The only issue is not related to Svelte: `apps/ui ✕ unmet peer eslint Installed: 9.39.4 Wanted: ^8.56.0 (@typescript-eslint/utils@7.18.0)`. CI can use `pnpm peers check` only after this peer is fixed.
- **The context test:** `apps/ui/src/lib/io-singleton/io-singleton.test.ts:23,31`. The app sets the Io translate context, and `BadgeStatus` from `@temporalio/io` reads it. A second test with no context gets the English default. Result: `Tests 2 passed`.
- **The Vitest Svelte alias** (`apps/ui/vitest.config.ts:20-34`) still works from `apps/ui`, and it is still necessary. Without it: `Tests 67 failed`, `lifecycle_function_unavailable`. With it: `130 passed`.

## Check 5. `build:server`: pass

- **Command:** `pnpm build:server` at the root. The root script runs `pnpm --filter @temporalio/ui build:server`, which runs `VITE_API= BUILD_PATH=../../server/ui/assets/local vite build` (`apps/ui/package.json:44`). It took about 39 seconds.
- **Output:** `Wrote site to "../../server/ui/assets/local"`. The folder has `_app`, `favicon.ico` and `index.html`, with 380 files. Nothing went to `apps/ui/server`.
- The Go server embeds `all:assets` (`server/ui/embed.go:8`), so the path is correct.
- The CI workflows call `pnpm build:server` at the root (`.github/workflows/test.yml:22`, `.github/workflows/playwright.yml:47`). The root script keeps them working. The `ui-server` sync calls the same root script (ci-and-release.md).

## What the spike did not test

- The catalog and dev-tools packages (steps 1.4 and 1.5).
- The `ui-server` sync and the `cloud-ui` pack flow, because both run in other repos.
- The CI workflows and the gate job.
- A publish to npm.
