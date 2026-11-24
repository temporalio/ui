# IO Components

- Keep component folders small: `{name}.svelte`, `{name}.stories.svelte`, optional `recipe.ts`, and `index.ts`.
- A barrel is the public API. Consumers import components, recipes, and types from `$lib/io/{name}` (or `@temporalio/ui/io/{name}`). Inside the folder, import sibling files directly to avoid cycles.
- Keep barrels tiny: explicit named re-exports and `export type` only. Export recipes directly from `recipe.ts`, not through the component.
- Keep props, state, and markup in Svelte; substantial or reusable styling belongs in pure recipes.
- Use `twJoin` for static classes, split into short readable groups. Use `twMerge` for composition and caller overrides, usually last.
- Reuse base components when their structure fits; otherwise reuse recipes. Do not complicate a base API just to eliminate a little markup.
- Reuse types and theme tokens. Preserve native attributes, accessibility, and existing public behavior.
- Show keyboard focus with a CSS outline (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-{color}`), not a Tailwind `ring`. Outlines survive forced-colors mode and their offset gap is transparent, so they don't paint over neighboring elements.
- Keep stories focused on meaningful variants and component-specific behavior. Verify visual changes in the browser and follow repository validation rules.
