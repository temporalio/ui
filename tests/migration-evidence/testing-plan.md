# Vite migration evidence plan

The committed manifest covers 75 source routes: 61 `+page.svelte` routes, 12 load-only or redirect `+page.ts` routes, `+error.svelte`, and `/render`.

## Migration research

| Source                                                                                                               | Finding                                                                                                                                             | Decision                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Vite 6 to 7 migration](https://v7.vite.dev/guide/migration)                                                         | Node 20.19+/22.12+ is required and default browser targets rise.                                                                                    | Keep Node 22 and explicitly preserve Chrome 87, Edge 88, Firefox 78, and Safari 14.                                            |
| [Rolldown integration](https://v7.vite.dev/guide/rolldown)                                                           | Complex applications should test `rolldown-vite` before Vite 8.                                                                                     | Validate and commit Vite 7.2.2 and `rolldown-vite` 7.2.2 separately.                                                           |
| [Vite 7 to 8 migration](https://vite.dev/guide/migration)                                                            | Rolldown, Oxc, and Lightning CSS replace Rollup/esbuild internals and CommonJS interop changes.                                                     | Exercise all custom plugins, programmatic Vite servers, production outputs, and routes without adding speculative workarounds. |
| [Vite 8 announcement](https://vite.dev/blog/announcing-vite8)                                                        | Vite recommends the same gradual Rolldown path for large projects.                                                                                  | Preserve the intermediate checkpoints as rollback points.                                                                      |
| [Vitest 4 migration](https://v4.vitest.dev/guide/migration) and [Vite 8 support](https://vitest.dev/blog/vitest-4-1) | Vite 8 support starts in Vitest 4.1; `deps.inline` moves and mock behavior is stricter.                                                             | Align Vitest, UI, and coverage at 4.1.11 and migrate tests before Vite.                                                        |
| Repository `README.md`, `CLAUDE.md`, and `.github/WORKFLOWS.md`                                                      | Required gates include lint, type-check, tests, server builds, Playwright, package, and manual handling of major upgrades.                          | Use those gates at each applicable checkpoint and the complete matrix at final state.                                          |
| `../cloud-ui` commit `01fe8d51c`                                                                                     | Cloud UI moved Vite 6 to 8 with plugin-Svelte 7 and Vitest 4, then added Rolldown-specific optimizer rules for Sentry, Monaco, and the packaged UI. | Reuse the version pattern, but do not copy cloud-specific optimizer exclusions or its URL package patch.                       |

## Dependency ledger

| Dependency                     | Resolved before → after                         | Why                                                            | Scope                                                                         | Commit                                                         | Validation                                                                                         |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `@types/node`                  | 18.19.130 → 22.18.0                             | Match Node 22 and Vite/Vitest peer ranges.                     | Type tooling only; no route source.                                           | `1b9eea2e1`                                                    | Frozen install, lint, type-check, 3,809 tests, package, build, Storybook.                          |
| Vitest family                  | Vitest/UI 3.2.6 and coverage 4.1.9 → all 4.1.11 | Remove the existing peer mismatch and add Vite 8 support.      | Test configuration and tests only; no runtime routes.                         | `fe89ad150`                                                    | 295 files, 3,810 passing tests, coverage, UI smoke, strict peers, catalog and isolated-Vite tests. |
| `esbuild` override             | 0.25.12 → 0.28.2                                | Vite 8 declares optional peer `^0.27                           |                                                                               | ^0.28`; the old global override forced an unsupported version. | Shared build tooling and Storybook; global build validation.                                       | `af3404732` | Strict install, unit tests, production build, package, Storybook, lint, type-check. |
| `vite`                         | 6.4.3 → 7.2.2 → Rolldown-Vite 7.2.2 → 8.3.4     | Apply official gradual migration and isolate bundler behavior. | Global: all 61 pages, 12 load/redirect routes, error boundary, and `/render`. | `4fe06ad4b`, `a936898a3`, `c33c6996a`                          | Unit, integration, E2E, all adapters/builds, route A/B, artifact A/B, HMR, and custom modes.       |
| `@sveltejs/vite-plugin-svelte` | 6.2.4 → 7.3.1                                   | Plugin 6 excludes Vite 8; plugin 7 requires it.                | Svelte compilation globally; source edits were confined to test Vite configs. | `c33c6996a`                                                    | Plugin option migrations, isolated Vite tests, build, Storybook, integration, and route A/B.       |

Svelte 5.56.3, SvelteKit 2.70.2, Storybook 10.5.5, adapters, and Tailwind were not upgraded because their published peer ranges and runtime validation already support the target.

## Changed-file route impact

- `package.json`, `pnpm-lock.yaml`, and `vite.config.ts` are global build inputs, so their impact set is all 75 manifest entries.
- No production component, page, layout, service, hook, or route implementation changed.
- Plugin-Svelte option edits are confined to Vitest files and isolated client test runners. They are classified as test-only and map to no production route source.
- `scripts/catalog/catalog-artifacts.test.ts` is a package-consumer fixture. It is classified as package-test-only; catalog development routes were still validated separately.
- `scripts/vite-migration/**`, `tests/migration-evidence/**`, and `tsconfig.migration-evidence.json` are evidence tooling only.
- The manifest completeness test derives all route sources from `src/routes`, rejects omissions and duplicates, and verifies 61 page components plus 12 load-only routes, the error boundary, and `/render`.

## Route families

| Family             | Routes | Evidence focus                                                           |
| ------------------ | -----: | ------------------------------------------------------------------------ |
| Application        |      1 | Root shell and default landing state                                     |
| Authentication     |      2 | Login and sign-in semantics                                              |
| Namespaces         |      3 | List, selector, and namespace details                                    |
| Nexus endpoints    |      4 | List, create, details, and edit                                          |
| Workflows          |      2 | List and start form                                                      |
| Workflow details   |     20 | Redirects, timeline, history, metadata, query, workers, and related tabs |
| Workers            |      2 | Worker list and deterministic worker instance                            |
| Worker deployments |      7 | Current pages, version forms, and legacy redirects                       |
| Task queues        |      2 | List and deterministic queue details                                     |
| Schedules          |      4 | List, create, deterministic details, and edit                            |
| Nexus operations   |      6 | List, start, redirect, and detail tabs                                   |
| Catalog            |      2 | Production 404 for the development-only list and `hello` example         |
| Batch operations   |      2 | List and deterministic job details                                       |
| Archival           |      2 | List and deterministic workflow history                                  |
| Agents             |      1 | Agent list                                                               |
| Activities         |      7 | List, start, redirect, and detail tabs                                   |
| Event import       |      6 | Import form, redirect, and three history views                           |
| System             |      2 | Error boundary and `/render` response                                    |

Each route records its initial and final URL, navigation status and redirects, normalized application API requests, catch-all mock use, console messages, page errors, semantic headings and controls, ARIA snapshot, axe violations, and a deterministic viewport screenshot. One representative route in every production-navigable family also focuses and follows an accessible navigation control. Authentication, catalog, and system routes record why a navigation scenario is not applicable.

## Build and inventory

Build, exclusively archive, and serve the already-prepared baseline in one terminal:

```bash
HARNESS=/Users/alexthomsen/git/cloud-core/ui
cd /Users/alexthomsen/git/cloud-core/ui-vite6-baseline-20261014
BASELINE_ARCHIVE="$PWD/migration-evidence/previews/vite6-baseline"
BASELINE_DESCRIPTOR="$BASELINE_ARCHIVE.descriptor.json"
BASELINE_DEPLOY="$PWD/migration-evidence/deploy/vite6-baseline"
COMMIT_SHA="$(git rev-parse HEAD)"
LOCKFILE_BLOB_ID="$(git hash-object pnpm-lock.yaml)"
PROVENANCE_ID="$COMMIT_SHA:$LOCKFILE_BLOB_ID"
pnpm build:local
pnpm --filter . deploy --legacy "$BASELINE_DEPLOY"
test -d "$BASELINE_DEPLOY/node_modules/@sveltejs/kit"
pnpm --dir "$HARNESS" migration:preview archive \
  --build "$PWD/build" \
  --svelte-output "$PWD/.svelte-kit/output" \
  --node-modules "$BASELINE_DEPLOY/node_modules" \
  --archive "$BASELINE_ARCHIVE" \
  --inventory "$BASELINE_ARCHIVE.inventory.json" \
  --descriptor "$BASELINE_DESCRIPTOR" \
  --provenance-id "$PROVENANCE_ID"
pnpm --dir "$HARNESS" migration:preview serve \
  --archive "$BASELINE_ARCHIVE" \
  --host 127.0.0.1 \
  --port 4173
```

Build, exclusively archive, and serve the candidate in another terminal:

```bash
HARNESS=/Users/alexthomsen/git/cloud-core/ui
cd /Users/alexthomsen/git/cloud-core/ui
CANDIDATE_ARCHIVE="$PWD/migration-evidence/previews/vite8-candidate"
CANDIDATE_DESCRIPTOR="$CANDIDATE_ARCHIVE.descriptor.json"
CANDIDATE_DEPLOY="$PWD/migration-evidence/deploy/vite8-candidate"
COMMIT_SHA="$(git rev-parse HEAD)"
LOCKFILE_BLOB_ID="$(git hash-object pnpm-lock.yaml)"
PROVENANCE_ID="$COMMIT_SHA:$LOCKFILE_BLOB_ID"
pnpm build:local
pnpm --filter . deploy --legacy "$CANDIDATE_DEPLOY"
test -d "$CANDIDATE_DEPLOY/node_modules/@sveltejs/kit"
pnpm migration:preview archive \
  --build "$PWD/build" \
  --svelte-output "$PWD/.svelte-kit/output" \
  --node-modules "$CANDIDATE_DEPLOY/node_modules" \
  --archive "$CANDIDATE_ARCHIVE" \
  --inventory "$CANDIDATE_ARCHIVE.inventory.json" \
  --descriptor "$CANDIDATE_DESCRIPTOR" \
  --provenance-id "$PROVENANCE_ID"
pnpm migration:preview serve \
  --archive "$CANDIDATE_ARCHIVE" \
  --host 127.0.0.1 \
  --port 4174
```

Use a fresh deploy directory for every archive. Omitting `--prod` and `--dev` makes legacy deploy include dependencies and devDependencies; the explicit `@sveltejs/kit` check protects its current dev-only runtime requirement. Each archive contains `build/` as `static/`, `.svelte-kit/output/` as `svelte-kit-output/`, the deployed tree as `node_modules/`, and immutable metadata. The server imports `Server`, `manifest-full.js`, and `internal.js` only from that archive, resolves bare imports from archived `node_modules/`, and serves only archived static/client files. Startup rejects any symlink resolving outside the archive. Its required headers expose the full bundle inventory digest, including runtime packages, and provenance ID. Global setup verifies those headers plus the archived `index.html` entry identity. Live worktree build output and packages are never read.

### Required artifact matrix

Run the following from each variant worktree, changing `VARIANT` for every run. The fresh `ROOT` and exclusive archive/inventory writes prevent output reuse. Each output is archived before a later build can replace it.

```bash
VARIANT=vite8-candidate
HARNESS=/Users/alexthomsen/git/cloud-core/ui
WORKTREE="$PWD"
ROOT="$HARNESS/migration-evidence/artifacts/$VARIANT"
mkdir -p "$HARNESS/migration-evidence/artifacts"
mkdir "$ROOT"

pnpm build:local
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/build" --archive "$ROOT/static" --output "$ROOT/static.json"

pnpm build:docker
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/build" --archive "$ROOT/docker" --output "$ROOT/docker.json"

pnpm build:server
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/server/ui/assets/local" --archive "$ROOT/embedded-server" --output "$ROOT/embedded-server.json"

VERCEL=1 pnpm exec vite build
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/.vercel/output" --archive "$ROOT/vercel" --output "$ROOT/vercel.json"

pnpm package
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/dist" --archive "$ROOT/package" --output "$ROOT/package.json"

pnpm stories:build
pnpm --dir "$HARNESS" migration:inventory --build "$WORKTREE/storybook-static" --archive "$ROOT/storybook" --output "$ROOT/storybook.json"

pnpm catalog generate
pnpm catalog verify
mkdir "$ROOT/catalog-stage"
cp src/lib/catalog/browser/catalog.generated.json src/lib/catalog/browser/catalog.generated.ts "$ROOT/catalog-stage/"
pnpm --dir "$HARNESS" migration:inventory --build "$ROOT/catalog-stage" --archive "$ROOT/catalog" --output "$ROOT/catalog.json"

pnpm --dir "$HARNESS" migration:inventory \
  --matrix-output "$ROOT/matrix.json" \
  --provenance-id "$PROVENANCE_ID" \
  --static "$ROOT/static.json" \
  --docker "$ROOT/docker.json" \
  --embedded-server "$ROOT/embedded-server.json" \
  --vercel "$ROOT/vercel.json" \
  --package "$ROOT/package.json" \
  --storybook "$ROOT/storybook.json" \
  --catalog "$ROOT/catalog.json"
```

Matrix creation and comparison fail if any of the seven required outputs is missing. Compare the completed variant matrices from the main worktree:

```bash
pnpm migration:inventory \
  --compare-baseline migration-evidence/artifacts/vite6-baseline/matrix.json \
  --compare-candidate migration-evidence/artifacts/vite8-candidate/matrix.json \
  --comparison-output migration-evidence/artifacts/vite6-vs-vite8.json
```

## Baseline self-test

With the baseline preview running on port 4173:

```bash
cd /Users/alexthomsen/git/cloud-core/ui
BASELINE_DESCRIPTOR=/Users/alexthomsen/git/cloud-core/ui-vite6-baseline-20261014/migration-evidence/previews/vite6-baseline.descriptor.json
BASELINE_BUILD_SHA256="$(node -p "require('$BASELINE_DESCRIPTOR').buildSha256")"
BASELINE_BUNDLE_SHA256="$(node -p "require('$BASELINE_DESCRIPTOR').bundleSha256")"
BASELINE_PROVENANCE_ID="$(node -p "require('$BASELINE_DESCRIPTOR').provenanceId")"
MIGRATION_EVIDENCE_BASELINE_URL=http://127.0.0.1:4173 \
MIGRATION_EVIDENCE_CANDIDATE_URL=http://127.0.0.1:4173 \
MIGRATION_EVIDENCE_BASELINE_BUILD_SHA256="$BASELINE_BUILD_SHA256" \
MIGRATION_EVIDENCE_CANDIDATE_BUILD_SHA256="$BASELINE_BUILD_SHA256" \
MIGRATION_EVIDENCE_BASELINE_BUNDLE_SHA256="$BASELINE_BUNDLE_SHA256" \
MIGRATION_EVIDENCE_CANDIDATE_BUNDLE_SHA256="$BASELINE_BUNDLE_SHA256" \
MIGRATION_EVIDENCE_BASELINE_PROVENANCE_ID="$BASELINE_PROVENANCE_ID" \
MIGRATION_EVIDENCE_CANDIDATE_PROVENANCE_ID="$BASELINE_PROVENANCE_ID" \
MIGRATION_EVIDENCE_OUTPUT_DIR=migration-evidence/baseline-self-test-20261014 \
MIGRATION_EVIDENCE_REQUIRE_EQUAL=1 \
MIGRATION_EVIDENCE_ALLOW_IDENTICAL_PREVIEWS=1 \
pnpm migration:evidence
```

## Baseline versus candidate

With both previews running:

```bash
cd /Users/alexthomsen/git/cloud-core/ui
BASELINE_DESCRIPTOR=/Users/alexthomsen/git/cloud-core/ui-vite6-baseline-20261014/migration-evidence/previews/vite6-baseline.descriptor.json
CANDIDATE_DESCRIPTOR=migration-evidence/previews/vite8-candidate.descriptor.json
MIGRATION_EVIDENCE_BASELINE_URL=http://127.0.0.1:4173 \
MIGRATION_EVIDENCE_CANDIDATE_URL=http://127.0.0.1:4174 \
MIGRATION_EVIDENCE_BASELINE_BUILD_SHA256="$(node -p "require('$BASELINE_DESCRIPTOR').buildSha256")" \
MIGRATION_EVIDENCE_CANDIDATE_BUILD_SHA256="$(node -p "require('./$CANDIDATE_DESCRIPTOR').buildSha256")" \
MIGRATION_EVIDENCE_BASELINE_BUNDLE_SHA256="$(node -p "require('$BASELINE_DESCRIPTOR').bundleSha256")" \
MIGRATION_EVIDENCE_CANDIDATE_BUNDLE_SHA256="$(node -p "require('./$CANDIDATE_DESCRIPTOR').bundleSha256")" \
MIGRATION_EVIDENCE_BASELINE_PROVENANCE_ID="$(node -p "require('$BASELINE_DESCRIPTOR').provenanceId")" \
MIGRATION_EVIDENCE_CANDIDATE_PROVENANCE_ID="$(node -p "require('./$CANDIDATE_DESCRIPTOR').provenanceId")" \
MIGRATION_EVIDENCE_OUTPUT_DIR=migration-evidence/vite6-vs-vite8-20261014 \
MIGRATION_EVIDENCE_REQUIRE_EQUAL=1 \
pnpm migration:evidence
```

Real A/B runs require distinct URLs and provenance IDs but may legitimately have identical bundle or build identities. The identical-preview exception is valid only when both URL and provenance are identical for a baseline self-test. Strict equality is required for full baseline-versus-candidate and baseline self-test runs. Use non-strict mode only for an intentionally partial grep because unselected manifest routes are reported as missing. Repeat the relevant environment variables with a fresh output root, omit `MIGRATION_EVIDENCE_REQUIRE_EQUAL`, and append a grep such as:

```bash
pnpm migration:evidence --grep '\[workflow-details\]'
```

Validate all harness TypeScript, including the scripts and Playwright collector excluded by the root project:

```bash
pnpm check:migration-evidence
```

## Normalization and limitations

Normalization is limited to the two configured app origins, generated `/assets` and `/_app/immutable` content hashes, line endings, whitespace in extracted semantic names, and successful requests that Chromium reports as aborted after receiving a response. Initial-load and client-navigation scenario requests remain raw in evidence; separate parity projections normalize only successful post-response abort noise. Browser time, UUID generation, viewport, locale, timezone, color scheme, reduced motion, transitions, animations, and caret rendering are fixed for screenshot stability. Raw JPEG screenshots and SHA-256 digests remain in evidence. Screenshot equality uses a 180-pixel-wide RGB sample and tolerates at most 2/255 channel variation in no more than 0.1% of channels to account for isolated Chromium anti-alias noise; raw and normalized comparison results are reported separately. Console warnings, console errors, page errors, request failures, status codes, and stack locations remain in evidence. Known sandbox and expected-404 console errors are classified and approved per manifest entry; unclassified errors fail. The route-specific detached-element `ResizeObserver` race remains in raw evidence when observed, but only its explicitly classified unexpected form participates in equality.

Application API evidence contains method, path, sorted query, body category, status or failure, mock key, and count. Static asset requests are excluded. Existing integration mocks are used where available, and deterministic detail fixtures cover known missing endpoints. Every catch-all fixture must be approved by its route manifest entry; an unknown API returns 501 and fails. The `/render` response is fetched directly and must contain the expected rendered heading; its script-inert body is then used for browser semantics, axe, and screenshot collection because Chromium cannot reliably screenshot the response under its sandbox CSP.

Catalog pages are development-only and are expected to return accessible 404 pages in this production-preview parity run. Exercise their development behavior separately with `pnpm catalog dev`; it is intentionally outside production A/B equality.

## Final validation record

| Surface                     | Result                                                                                                                                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen strict install       | Passed with Vite 8.3.4, plugin-Svelte 7.3.1, Vitest family 4.1.11, Node types 22.18.0, and esbuild 0.28.2.                                                                                                                                                        |
| Lint and types              | `pnpm lint`, `pnpm check`, and `pnpm check:migration-evidence` passed. Existing lint/Svelte warnings are unchanged.                                                                                                                                               |
| Unit and coverage           | 295 files passed; 3,810 tests passed and 2 skipped. Final coverage passed at 74.27% statements, 71.14% branches, 60.92% functions, and 76.46% lines. The Vite 6 baseline coverage command cannot start because it already pairs Vitest 3.2.6 with coverage 4.1.9. |
| Vite 6 versus Vite 8 routes | 150 browser executions collected 75/75 entries and 74/74 applicable client navigations per side with zero differences, missing entries, or failed expectations. Only the `/render` server response is client-navigation exempt.                                   |
| Integration and E2E         | 401 integration tests passed with 1 skip; 37 E2E tests passed with 5 skips.                                                                                                                                                                                       |
| Production outputs          | Static, Docker, embedded server, Vercel, package, Storybook, and catalog outputs built and received provenance-bound inventories.                                                                                                                                 |
| Catalog                     | Generate/verify, clean packed consumer, list/detail development routes, readiness, and a completed `hello` workflow passed.                                                                                                                                       |
| Development                 | Full `ui-server` mode rendered; cross-family client navigation preserved state; markup and CSS HMR preserved browser state; current-page console was clean.                                                                                                       |
| Authentication              | `with-auth` mode reached the local OIDC provider sign-in page.                                                                                                                                                                                                    |
| Server and automation       | Go server build/race tests, 77-entry accessibility manifest, and 102 GitHub automation tests passed.                                                                                                                                                              |
| External/baseline gates     | See the risk register; baseline-identical failures are not reported as Vite regressions.                                                                                                                                                                          |

### Artifact comparison

| Output          |    File count | Raw size | Gzip size | Brotli size |
| --------------- | ------------: | -------: | --------: | ----------: |
| Static          |     424 → 370 |   -2.15% |    -3.43% |      -3.16% |
| Docker          |     424 → 370 |   -2.15% |    -3.40% |      -3.17% |
| Embedded server |     424 → 370 |   -2.15% |    -3.42% |      -3.20% |
| Vercel          | 1,095 → 1,037 |   -1.32% |    -2.44% |      -2.35% |
| Package         | 3,057 → 3,057 |  +0.002% |   +0.003% |     +0.003% |
| Storybook       |     187 → 205 |   +0.36% |    +0.06% |      +0.89% |
| Catalog         |       52 → 52 |   +0.04% |    +0.05% |      +0.01% |

No compressed-size increase exceeds the 5% investigation threshold.

## Risk register

| Classification     | Risk                                                                                                                                              | Evidence or disposition                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolved           | Vite 8 peer incompatibility with plugin-Svelte 6 and Vitest 3.                                                                                    | Upgraded to plugin-Svelte 7.3.1 and an aligned Vitest 4.1.11 family.                                                                                                         |
| Resolved           | Global esbuild 0.25 override violated Vite 8’s optional peer range.                                                                               | Override now resolves 0.28.2; Storybook and builds passed.                                                                                                                   |
| Resolved           | Rolldown could change route behavior, CJS interop, CSS, or output structure.                                                                      | Intermediate Rolldown checkpoint, 75-route A/B, integration/E2E, and seven output inventories passed.                                                                        |
| Accepted           | Vite warns that extensionless imports and `__dirname` in the config dependency graph are incompatible with a future native config-loader default. | Current Vite 8 bundle config loader works. This is a future-major migration item, not a Vite 8 failure.                                                                      |
| Accepted           | Rolldown reports `TOLERATED_TRANSFORM` for top-level `await` in SvelteKit server utilities against the preserved browser target.                  | The warnings affect SvelteKit’s SSR `node:path` and `node:process` imports; Node 22 supports them, and server builds plus E2E pass.                                          |
| Untested           | Actual Chrome 87, Edge 88, Firefox 78, and Safari 14 runtimes.                                                                                    | Build targets are explicitly preserved, but those historical browser binaries were unavailable locally.                                                                      |
| Baseline           | Standalone accessibility HAR suites time out on all 32 cases with a 500 page.                                                                     | Reproduced identically at baseline commit `2a6871759`; route A/B still compares axe output for every manifest entry.                                                         |
| Baseline           | Storybook browser tests report 36 accessibility failures in 13 suites.                                                                            | Vite 6 and Vite 8 both report exactly 36 failures, 286 passes, and 49 passing suites. Storybook production build passes.                                                     |
| Baseline           | `pnpm knip` reports four extension assets, two dev dependencies, thirteen command tokens, and one generated-export hint.                          | The migration config loading regression was fixed; remaining findings are baseline repository debt.                                                                          |
| Expected           | `pnpm validate:versions` rejects version 2.56.0 because it equals the latest release.                                                             | Version synchronization passes; the migration does not perform a release bump.                                                                                               |
| Baseline           | Standalone `dev:temporal-cli` renders a CORS-blocked 500 against `localhost:8080`.                                                                | Reproduced on both Vite 6 and Vite 8. Full `ui-server`, catalog, integration, and E2E stacks pass.                                                                           |
| Not run            | `dev:local-temporal`, Docker runtime, credentialed cloud connections, billable AgentCore provisioning, and real minimum-browser grid.             | Require external repositories, services, credentials, billing, or unavailable historical browsers. Their build outputs and non-billable test surfaces passed.                |
| Evidence retention | Generated screenshots, logs, archives, and matrices are ignored because they exceed repository size limits.                                       | The committed harness, manifest, commands, provenance schema, aggregate results, and this report make the runs reproducible; CI/PR artifacts should retain generated output. |
