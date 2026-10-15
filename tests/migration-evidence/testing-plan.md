# Vite migration evidence plan

The committed manifest covers 75 source routes: 61 `+page.svelte` routes, 12 load-only or redirect `+page.ts` routes, `+error.svelte`, and `/render`.

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
LOCKFILE_SHA256="$(node --input-type=module -e "import { createHash } from 'node:crypto'; import { readFileSync } from 'node:fs'; process.stdout.write(createHash('sha256').update(readFileSync('pnpm-lock.yaml')).digest('hex'))")"
PROVENANCE_ID="$COMMIT_SHA:$LOCKFILE_SHA256"
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
LOCKFILE_SHA256="$(node --input-type=module -e "import { createHash } from 'node:crypto'; import { readFileSync } from 'node:fs'; process.stdout.write(createHash('sha256').update(readFileSync('pnpm-lock.yaml')).digest('hex'))")"
PROVENANCE_ID="$COMMIT_SHA:$LOCKFILE_SHA256"
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
