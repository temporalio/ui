# Meeting summary: `temporalio/ui` as a pnpm workspace

Verified at commit: `051de464a`

## Proposed layout

```text
temporalio/ui/
├── apps/ui/            @temporalio/ui            public    app, Holocene, catalog UI, Playwright
├── packages/io/        @temporalio/io            public    Io components, theme, Tailwind preset, Io Storybook
├── packages/catalog/   @temporalio/ui-catalog    private   catalog worker, authoring, CLI
├── packages/config/    @temporalio/ui-config     private   tsconfig, eslint, prettier, stylelint bases
├── packages/dev-tools/ @temporalio/ui-dev-tools  private   utilities, Vite plugins, demo, e2e workers
└── server/             Go server, unchanged
```

"Public" means that pnpm can pack the package for `cloud-ui`. Nothing publishes to npm in Stage 0 or Stage 1.

## Five decisions to vote on

| #   | Decision                                                                                     | Options                                      | Recommendation                                                                   |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | [Go or no-go](decisions.md#decision-record-3-go-or-no-go)                                    | Two gates / all now / no-go                  | **Two gates:** Stage 0 after the code freeze, Stage 1 after Stage 0 exits        |
| 2   | [Io as `@temporalio/io`](decisions.md#decision-record-4-io-becomes-the-package-temporalioio) | Public, not on npm / private / no package    | **Public, not on npm now,** with `@temporalio/ui/io/*` re-exports for all of 2.x |
| 3   | [Versions](decisions.md#decision-record-5-one-fixed-version)                                 | One fixed / independent / mixed              | **One fixed version.** `UIVersion` stays the source of truth                     |
| 4   | [How `cloud-ui` gets Io](decisions.md#decision-record-6-how-cloud-ui-gets-io-in-2x)          | Pack both tarballs / bundle Io / app at root | **Pack both tarballs:** about 15 lines change in `cloud-ui`                      |
| 5   | [CI shape](decisions.md#decision-record-7-ci-shape-and-the-task-runner)                      | Path filters and a gate job / Turborepo / Nx | **Path filters and one gate job.** Turborepo can come later                      |

## Expected first question

**Why is `server/` not in `apps/`, and Holocene not in `packages/`?** ([decision record 1](target-layout.md#decision-record-1-the-app-moves-to-appsui))

- **`apps/server` in Stage 2.** A move now breaks the `ui-server` sync and about 20 workflow paths. In Stage 2, the folder sets the new Go module path.
- **No `packages/holocene`.** Holocene imports the app about 100 times. Io replaces Holocene: each component moves into Io without its app imports.

## Pros and cons of Stage 1

Stage 0 is a clear gain: each item helps without the split.

- **Pros:** the package manager stops Io from importing the app or using undeclared dependencies. Io grows as it replaces Holocene, so the boundary matters more over time. A move now costs the least (13 Io components, 44 import lines).
- **Cons:** 17 to 21 engineer-days. One large rename PR. `cloud-ui` must change in the same window. Open items S1 (`--tsgo` type check), S2 (Io Chromatic project) and the untested catalog copy step.

**Opinion of the author:** the pros are larger than the cons. The largest risk is S1, so step 1.3 must solve it first.

## Already decided, and changes from the brief or the spec

- **Decided:** the app moves to `apps/ui`. The catalog is a private package, and `@temporalio/ui` ships a copy at the 2.x paths ([target-layout.md](target-layout.md)).
- **Changes:** `cloud-ui` must change (vote 4). Io takes the theme (DR 8). `UI Tests` stays a second required check (DR 9). Two Storybooks and two Chromatic projects (DR 10). No npm publish until Stage 3, because nobody installs from npm today (DR 11). See [decisions.md](decisions.md).

## Spike results

A disposable branch moved the app and Io into packages ([spike-results.md](spike-results.md)).

- **Pass:** pnpm 12 with the catalog, the Io Tailwind classes, `pnpm build:server`.
- **Partial:** `svelte-check --tsgo` gives 27 errors across packages (S1). The Io Storybook builds, but Chromatic needs a token. `pnpm peers check` fails on an unrelated eslint peer.

## Effort

| Stage | Scope                                                                             | Estimate                                  |
| ----- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| 0     | Path-gated CI, pnpm 12, Dependabot for Go, Io without i18n imports, one alias map | 7 to 10 engineer-days (1.4 to 2 weeks)    |
| 1     | 7 PRs: skeleton, app move, Io, catalog, dev tools, boundaries, first release      | 17 to 21 engineer-days (3.4 to 4.2 weeks) |
| 2     | Go module from `ui`, `apps/server`, retire the `ui-server` mirror                 | Separate decision                         |
| 3     | `cloud-ui` extension seams, npm publishing, snapshot publishing                   | Separate decision                         |

**Open questions** ([risks-and-open-questions.md](risks-and-open-questions.md)): the status name of the Io Chromatic project, and whether the `ui-server` sync installs pnpm 12.
