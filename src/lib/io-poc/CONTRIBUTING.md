# Contributing to io-poc components

Guidance for people and agents building or changing the components in this folder. For using them in an app, read [AGENTS.md](AGENTS.md).

## Component conventions

- Keep each component folder small: the Svelte component, optional pure `recipe.ts`, local helpers, and an explicit `index.ts` barrel.
- Consumers import from `$lib/io-poc/{name}` or `@temporalio/ui/io-poc/{name}`. Within a folder, import sibling files directly to avoid cycles.
- Export components and types explicitly. Export recipes directly from `recipe.ts`.
- Keep props, state, and markup in Svelte. Put substantial reusable styling in pure recipes using theme tokens, `twJoin`, and `twMerge` for caller overrides.
- Keep Ark-specific details inside the Temporal wrapper. Preserve native attributes, event handlers, accessible names, and appropriate button/link semantics.
- Reuse the shared pieces instead of copying them. `shared/recipe.ts` holds the floating panel, backdrop, list panel, list item, group label, empty state and in-control icon button classes; compose them in your own `recipe.ts`. `shared/animations.css` defines every io-poc keyframe once; import it from a component that animates and reference the existing names. `shared/` is internal and not a package export.
- Form controls that render their own helper and error text use `FieldMessages` and `getFieldMessageIds` from `$lib/io-poc/field`, so ids, `aria-describedby` order and styles stay consistent. Controls that read Ark field context can wrap themselves in `Field` instead.

## Migrating an existing component

- Inspect the original component and its consumers before choosing an Ark primitive. Preserve public props, binding behavior, tracking defaults, icon placement, loading behavior, and accessibility unless a change is explicitly requested.
- Own the implementation, recipes, component types, and tracking helpers locally. Do not import or re-export them from the legacy counterpart. In particular, the Ark Button must not depend on `$lib/io/button` or its subpaths.
- Existing shared theme tokens, icons, and general types may be reused. This does not permit importing the legacy component implementation or its helpers.
- Use the appropriate Ark primitive when it supplies the required behavior. Button and ButtonLink use `Ark` from `@ark-ui/svelte/factory`; do not invent a Button state machine.
- Keep native disabled behavior separate from loading presentation. The current Button shows a spinner and sets `aria-busy` for `isLoading`; callers pass `disabled` explicitly to prevent repeat activation.
- Add consumer examples and API guidance to the documentation app, following `docs/AGENTS.md`. Keep migration procedures and implementation rationale out of the component's usage page.
- Keep legacy APIs available during incremental adoption. Do not rewrite consumers or remove legacy components unless requested.

## Contracts

- Every component has a contract beside its source: `<folder>/<slug>.contract.md`, named after its docs slug (`progress/` holds `progress-circular.contract.md` and `progress-linear.contract.md`). The design-contract-review skill and the docs Contract section both read these files.
- Use the iO contract format: YAML frontmatter (`component`, `source` relative to the contract, `sourceCommit` once the component is committed, `usedBy`, `status`, `lastReviewed`), a `# <Name> contract` title, a note on what the types already express, then `## Input`, `## Behavior`, `## Display`, `## Accessibility`, `## Test hooks`, `## Known gaps`, `## Review candidates` and `## Decisions` as needed, and a `## Reconciliation log`.
- Each rule is a bullet starting with a bold ID (`IN-1`, `BEH-1`, `DIS-1`, `A11Y-1`, `TEST-1`, `GAP-1`, `RC-1`, `DEC-1`) and uses MUST, SHOULD or MAY. State only what the code or a recorded decision supports, cite files, and do not use tables.
- When a component changes, reconcile its contract in the same change: update or retire affected rules, close fixed gaps, and add a Reconciliation log entry with the new `sourceCommit`.

## Validation

- After implementation changes, run the main type check (`pnpm check`) and package build (`pnpm package`), plus targeted ESLint and Prettier checks.
- For documentation changes, run `pnpm docs:check` and `pnpm docs:build`.
- Verify meaningful interactive and visual changes in the browser, including keyboard behavior, disabled/loading states, and light/dark themes where relevant. Check package exports when adding a public entry point.
