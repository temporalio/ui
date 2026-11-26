# Meeting summary: `temporalio/ui` as a pnpm workspace

Verified at commit: `051de464a`

## Proposed layout

```text
temporalio/ui/
├── apps/ui/            @temporalio/ui      published   app, Holocene, catalog UI, Playwright
├── packages/io/        @temporalio/io      published   Io components, theme, Tailwind preset, Io Storybook
├── packages/catalog/   @temporalio/ui-catalog    private   catalog worker, authoring, CLI
├── packages/config/    @temporalio/ui-config     private   tsconfig, eslint, prettier, stylelint bases
├── packages/dev-tools/ @temporalio/ui-dev-tools  private   utilities, Vite plugins, demo, e2e workers
└── server/             Go server, unchanged
```

## Already decided (not votes)

- **Layout:** the app moves to `apps/ui` ([decision record 1](target-layout.md#decision-record-1-the-app-moves-to-appsui)).
- **Catalog:** a private package. Its UI imports Holocene, so the UI stays in the app ([decision record 2](target-layout.md#decision-record-2-the-catalog-is-a-private-package-and-its-ui-stays-in-the-app)).

## Five decisions to vote on

| #   | Decision                       | Options                                            | Recommendation                                                                              | Record                                                              |
| --- | ------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Go or no-go                    | Two gates / all now / no-go                        | **Go in two gates:** Stage 0 after the freeze, Stage 1 when Stage 0 meets its exit criteria | [DR 3](decisions.md#decision-record-3-go-or-no-go)                  |
| 2   | Publish Io as `@temporalio/io` | Published / private package / no package           | **Published,** with `@temporalio/ui/io/*` re-exports for all of 2.x                         | [DR 4](decisions.md#decision-record-4-publish-io-as-temporalioio)   |
| 3   | Versions                       | One fixed version / independent / mixed            | **One fixed version,** 2.x continues, `UIVersion` stays the source of truth                 | [DR 5](decisions.md#decision-record-5-one-fixed-version)            |
| 4   | How `cloud-ui` gets Io in 2.x  | Pack both tarballs / bundle Io / app at the root   | **Pack both tarballs:** about 10 lines change in `cloud-ui`                                 | [DR 6](decisions.md#decision-record-6-how-cloud-ui-gets-io-in-2x)   |
| 5   | CI shape                       | Path filters and one gate job / Turborepo now / Nx | **Path filters and one gate job,** no task runner now, compatible with Turborepo later      | [DR 7](decisions.md#decision-record-7-ci-shape-and-the-task-runner) |

## Where the design disagrees with the brief

1. **The `cloud-ui` side must change** (vote 4). The dispatch stays the same. `cloud-ui` builds `@temporalio/ui` with `pnpm package` and `pnpm pack` at the ui repo root, and that no longer works after the move.
2. **The coupling is larger than the audit counted** ([claims ledger](README.md#claims-ledger)):
   - Holocene has 53 app imports in 39 files, not about 20. Holocene stays in the app, so the design does not change.
   - The tool folders have 70 relative imports into `src/`, not about 7. Most go to `src/lib/demo`, which no app code uses, so `src/lib/demo` moves into the dev-tools package.
3. **Io takes the theme.** The Tailwind preset and plugin import no app code, and Io needs them. `@temporalio/ui/theme/preset` stays as a re-export.
4. **A change only in Io saves little CI.** The app depends on Io, so its tests still run. The savings come from changes to `server/`, to dev tools and to docs only.

## Spike results

_The spike results are added here when the spike is complete ([spike-results.md](spike-results.md))._

## Effort

| Stage | Scope                                                                                                                                        | Estimate                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 0     | Path-gated CI and the gate job, pnpm 12, Dependabot for Go, Io without i18n imports, one alias map, trusted publishing for `@temporalio/ui`  | 1.5 to 2 engineer-weeks |
| 1     | 7 PRs: workspace skeleton, the app move (with the `cloud-ui` change), Io, catalog, dev tools, boundaries, the first release of both packages | 3 to 4 engineer-weeks   |
| 2     | Go module from `ui`, retirement of the `ui-server` mirror                                                                                    | Separate decision       |
| 3     | `cloud-ui` extension seams, snapshot publishing                                                                                              | Separate decision       |

## Questions the meeting cannot settle

The `UI Tests` required check has no producer in this repo, and the design does not know who owns it. Two npm questions need an org owner: OIDC for a new package, and the current publisher of `@temporalio/ui`. One question needs the `ui-server` maintainers: does their sync install pnpm 12? See [risks-and-open-questions.md](risks-and-open-questions.md).
