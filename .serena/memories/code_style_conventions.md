# Code Style & Conventions

## Svelte 5 Patterns

- Use runes syntax: `let { prop } = $props()`, `let state = $state()`, `const computed = $derived()`
- Use `$effect()` for side effects with cleanup functions
- SuperForms pattern: `const { form, errors, enhance } = $derived(superForm(data, {...}))`

## Import Order

1. Node.js built-ins
2. External libraries (svelte/\*\* first)
3. SvelteKit imports ($app/\*\*)
4. Internal imports ($lib/\*\*)
5. Component imports ($components/\*_/_.svelte)
6. Relative imports (./, ../)

## Naming Conventions

- Files: kebab-case (workflow-status.svelte)
- Components: PascalCase in imports, kebab-case files
- Functions: camelCase
- Types: PascalCase
- Use `import type` for type-only imports

## TypeScript

- Always provide proper TypeScript types
- Use Zod for runtime validation
- Prefer type safety and early returns

## Code Quality

- No comments unless explicitly requested
- No barrel imports (import directly for better tree shaking)
- Prefer composition over inheritance
- Keep functions small and focused
