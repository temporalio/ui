# Temporal UI - Contributing Guide

**Stack**: SvelteKit + Svelte 5 + TypeScript + TailwindCSS + Holocene design system

## 🚨 CRITICAL: After Every Change

```bash
pnpm lint              # MUST PASS - fixes formatting, eslint, stylelint
pnpm check             # MUST PASS - TypeScript type checking
```

## 🎯 Key Patterns

### Svelte 5 Runes (NO class components)

```typescript
let { class: className = '', ...props }: Props = $props(); // Props
let count = $state(0); // State
const doubled = $derived(count * 2); // Computed
$effect(() => {
  /* use sparingly - team dislikes */
}); // Effects
```

### Component Structure

```
component-name/
├── index.svelte          # Main component
├── {name}.ts             # Pure functions, types
└── {name}.svelte.ts      # Svelte lifecycle functions
```

### Import Order (STRICT - linter enforces)

1. Node built-ins
2. External (`svelte/**` first)
3. SvelteKit (`$app/**`, `$types`)
4. Internal (`$lib/**`)
5. Components (`*.svelte`)
6. Relative (`./`, `../`)

## ⚡ Development Commands

```bash
# Development
pnpm dev               # Start dev server (default)
pnpm dev:temporal-cli  # With Temporal CLI

# Testing
pnpm test -- --run     # Unit tests
pnpm test:e2e         # E2E tests (if UI changed)
pnpm stories:dev      # Storybook for components

# Auto-fix most issues
pnpm format
```

## 📝 Code Style

### MUST Follow

- **NO `any` types** - use proper types or generics
- **NO nested if/else** - use guard statements with early returns
- **NO comments** unless explicitly requested
- **USE Holocene components** - check `src/lib/holocene/` first
- **USE functional patterns** - pure functions, immutable data

### Naming

- Files: `kebab-case.svelte`
- Components: `PascalCase` in imports
- Functions: `camelCase`
- Types: `PascalCase`
- CSS: Tailwind utilities first

## 🏗️ Project Structure

```
src/
├── routes/(app)/         # Main app routes
│   └── _components/      # Route-specific components
├── lib/
│   ├── holocene/        # Design system (USE THESE!)
│   ├── components/      # Shared components
│   ├── services/        # API calls
│   └── utilities/       # Helpers
```

## ✅ PR Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm check` passes
- [ ] Manual testing completed
- [ ] Responsive design verified
- [ ] Used Holocene components where available
- [ ] No hardcoded strings (use i18n)
- [ ] Follows functional patterns (guard statements, no nested if/else)

## 🔗 References

- [Holocene Components](src/lib/holocene/) - Design system
- [Component Examples](src/lib/holocene/**/*.stories.svelte) - Storybook stories
- [Route Patterns](<src/routes/(app)/namespaces/>) - Route organization
- [Form Patterns](<src/routes/(app)/namespaces/[namespace]/settings/>) - SuperForms with Zod

## 🚫 Common Mistakes

1. Using `any` type → Use proper types
2. Creating custom components → Check Holocene first
3. Nested if/else → Use early returns
4. Forgetting to lint → Always run `pnpm lint`
5. Wrong import order → Follow the strict order
6. Adding comments → Code should be self-documenting
7. Using `$effect` → Team prefers `$derived`
