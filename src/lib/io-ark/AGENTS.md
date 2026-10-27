# IO components with Ark UI

## Component conventions

- Keep each component folder small: the Svelte component, optional pure `recipe.ts`, local helpers, and an explicit `index.ts` barrel.
- Consumers import from `$lib/io-ark/{name}` or `@temporalio/ui/io-ark/{name}`. Within a folder, import sibling files directly to avoid cycles.
- Export components and types explicitly. Export recipes directly from `recipe.ts`.
- Keep props, state, and markup in Svelte. Put substantial reusable styling in pure recipes using theme tokens, `twJoin`, and `twMerge` for caller overrides.
- Keep Ark-specific details inside the Temporal wrapper. Preserve native attributes, event handlers, accessible names, and appropriate button/link semantics.

## Migrating an existing component

- Inspect the original component and its consumers before choosing an Ark primitive. Preserve public props, binding behavior, tracking defaults, icon placement, loading behavior, and accessibility unless a change is explicitly requested.
- Own the implementation, recipes, component types, and tracking helpers locally. Do not import or re-export them from the legacy counterpart. In particular, the Ark Button must not depend on `$lib/io/button` or its subpaths.
- Existing shared theme tokens, icons, and general types may be reused. This does not permit importing the legacy component implementation or its helpers.
- Use the appropriate Ark primitive when it supplies the required behavior. Button and ButtonLink use `Ark` from `@ark-ui/svelte/factory`; do not invent a Button state machine.
- Keep native disabled behavior separate from loading presentation. The current Button shows a spinner and sets `aria-busy` for `isLoading`; callers pass `disabled` explicitly to prevent repeat activation.
- Add consumer examples and API guidance to the documentation app, following `docs/AGENTS.md`. Keep migration procedures and implementation rationale out of the component's usage page.
- Keep legacy APIs available during incremental adoption. Do not rewrite consumers or remove legacy components unless requested.

## Validation

- After implementation changes, run the main type check (`pnpm check`) and package build (`pnpm package`), plus targeted ESLint and Prettier checks.
- For documentation changes, run `pnpm docs:check` and `pnpm docs:build`.
- Verify meaningful interactive and visual changes in the browser, including keyboard behavior, disabled/loading states, and light/dark themes where relevant. Check package exports when adding a public entry point.
