# Claude AI Assistant Rules for Temporal UI

This document defines the coding standards, testing practices, and project conventions that Claude should follow when working on the Temporal UI codebase.

## Project Overview

This is a SvelteKit-based TypeScript application for Temporal.io's web UI. The project uses:

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript with strict type checking
- **Styling**: TailwindCSS with custom design system (Holocene)
- **Testing**: Vitest for unit tests, Playwright for E2E/integration tests
- **Package Manager**: pnpm

## Testing Standards

### Unit Tests (Vitest)

- **Framework**: Vitest with jsdom environment
- **File Naming**: `*.test.ts` files alongside source code
- **Test Structure**: Use `describe`, `it`, `expect` pattern with BDD style
- **Mocking**: Use `vi.spyOn()` for mocking, prefer `vi.mock()` for module mocks
- **Setup**: Global test utilities in `vitest-setup.ts`
- **Coverage**: Aim for comprehensive coverage, exclude mocks and test files

**Test Commands:**

```bash
pnpm test              # Run unit tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run with coverage report
```

### E2E/Integration Tests (Playwright)

- **Framework**: Playwright with custom accessibility reporting
- **File Naming**: `*.spec.ts` in `/tests` directory
- **Structure**: Separate `e2e` and `integration` test suites
- **Devices**: Test both desktop and mobile viewports
- **Accessibility**: Include accessibility testing with custom violations reporter

**Test Commands:**

```bash
pnpm test:e2e           # Run E2E tests
pnpm test:integration   # Run integration tests
```

## Linting and Formatting

### ESLint Configuration

- **Extends**: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`
- **Plugins**: `svelte`, `@typescript-eslint`, `vitest`, `import`
- **Key Rules**:
  - Single quotes preferred: `quotes: ['error', 'single']`
  - No explicit `any`: `@typescript-eslint/no-explicit-any: 'error'`
  - Import ordering with groups and alphabetization
  - Unused variables prefixed with `_` are allowed

### Prettier Configuration

- **Print Width**: 80 characters
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes
- **Trailing Commas**: Always
- **Plugins**: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`

### Stylelint Configuration

- **Extends**: `stylelint-config-recommended`, `stylelint-config-standard`
- **Custom Syntax**: `postcss-html` for Svelte files
- **Tailwind Support**: Ignores Tailwind directives and functions

**Lint Commands:**

```bash
pnpm lint              # Run all linters
pnpm format            # Auto-fix all formatting
pnpm eslint:fix        # Fix ESLint issues
pnpm prettier:fix      # Fix Prettier formatting
pnpm stylelint:fix     # Fix Stylelint issues
```

## Code Style and Conventions

### TypeScript Standards

- **Strict Mode**: Enabled (though currently commented in tsconfig)
- **Import Style**: Use `import type` for type-only imports
- **File Extensions**: `.ts` for logic, `.svelte` for components
- **Type Assertions**: Use `as` syntax, not angle brackets

### Svelte Component Patterns

- **Script Context**: Use `context="module"` for shared logic
- **Props**: Export props with TypeScript types
- **Styling**: Use class-variance-authority (cva) for component variants
- **Events**: Define custom events with proper typing

### Svelte 5 Runes and Patterns

This project uses Svelte 5 with its new runes system. Follow these patterns:

#### Props and State

```typescript
// Use $props() for component props
let { class: className = '', namespace, adapter }: Props = $props();

// Use $state() for reactive local state
let count = $state(0);
let user = $state({ name: '', email: '' });
```

#### Reactive Declarations

```typescript
// Use $derived() instead of $: for computed values
const doubleCount = $derived(count * 2);
const formattedName = $derived(user.name.toUpperCase());

// For complex derivations
const expensiveCalculation = $derived(() => {
  return heavyComputation(someValue);
});
```

#### Effects

```typescript
// Use $effect() instead of afterUpdate/beforeUpdate
$effect(() => {
  console.log('Count changed:', count);
  // Cleanup function (optional)
  return () => cleanup();
});

// Use $effect.pre() for effects that run before DOM updates
$effect.pre(() => {
  measureElement();
});
```

#### Rune File Extensions

- **Utilities with runes**: Use `.svelte.ts` extension for utilities that use `$state`, `$derived`, etc.
- **Regular utilities**: Use `.ts` extension for pure TypeScript utilities
- **Components**: Always use `.svelte` extension

#### Rune Constraints

- `$state()` can only be used inside `.svelte` and `.svelte.ts` files
- `$derived()` must be used as a variable declaration initializer or class field
- `$effect()` runs after DOM updates, `$effect.pre()` runs before

#### Store Integration

When working with Svelte stores in Svelte 5 components:

```typescript
// Create a bridge utility for stores
export function storeToState<T>(store: Readable<T>) {
  let state = $state(/* initial value */);

  $effect(() => {
    const unsubscribe = store.subscribe((value) => {
      untrack(() => {
        state = value;
      });
    });
    return unsubscribe;
  });

  return { value: state };
}

// Use in components
const { form, errors } = $derived(
  storesToState({
    form: superFormInstance.form,
    errors: superFormInstance.errors,
  }),
);
```

#### SuperForms Integration

When using SuperForms with Svelte 5:

```typescript
// Create SuperForm instance
const superFormInstance = $derived(
  superForm(initialData, {
    // configuration
  }),
);

// Convert stores to state for cleaner template usage
const { form, errors, submitting } = $derived(
  storesToState({
    form: superFormInstance.form,
    errors: superFormInstance.errors,
    submitting: superFormInstance.submitting,
  }),
);

// Use state values in template
// form.value.fieldName instead of $form.fieldName
// errors.value.fieldName instead of $errors.fieldName
```

### Import Organization

Import order (enforced by ESLint):

1. Node.js built-ins
2. External libraries (with `svelte/**` first)
3. SvelteKit imports (`$app/**`, `$types`)
4. Internal imports (`$lib/**`)
5. Component imports (`$components/**/*.svelte`)
6. Relative imports (`./`, `../`)

### Naming Conventions

- **Files**: kebab-case for all files (`workflow-status.svelte`)
- **Components**: PascalCase in imports, kebab-case for files
- **Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase

### Component Structure

- **Holocene Design System**: Use components from `$lib/holocene/`
- **Styling**: Tailwind classes with design tokens
- **Accessibility**: Include proper ARIA attributes and roles

## File Organization

### Directory Structure

```
src/
├── lib/
│   ├── components/          # Business logic components
│   ├── holocene/           # Design system components
│   ├── models/             # Data models and business logic
│   ├── services/           # API and external service calls
│   ├── stores/             # Svelte stores for state management
│   ├── types/              # TypeScript type definitions
│   └── utilities/          # Pure utility functions
├── routes/                 # SvelteKit routes
└── fixtures/               # Test data fixtures
```

### Best Practices

- **Co-location**: Keep tests next to source files for utilities/models
- **Separation**: Keep E2E tests in dedicated `/tests` directory
- **Utilities**: Pure functions in `/utilities`, side effects in `/services`
- **Types**: Centralized type definitions in `/types`

## Development Workflow

### Pre-commit Hooks

Lint-staged runs on commit:

- **TypeScript/JavaScript**: ESLint + Prettier
- **Svelte**: ESLint + Prettier + Stylelint
- **CSS**: Stylelint
- **JSON/Markdown**: Prettier

### Build and Type Checking

```bash
pnpm check             # TypeScript type checking
pnpm build:local       # Build for local development
pnpm dev               # Start development server
```

### Code Quality Commands

Always run before committing:

```bash
pnpm lint              # Check all linting rules
pnpm check             # TypeScript type checking
pnpm test              # Run unit tests
```

## Claude-Specific Guidelines

### When Working on This Codebase

1. **Always run linting**: Execute `pnpm lint` after making changes
2. **Type checking**: Run `pnpm check` to verify TypeScript compliance
3. **Test execution**: Run appropriate test suites based on changes
4. **Follow patterns**: Use existing component patterns and utility functions
5. **Design system**: Prefer Holocene components over custom implementations
6. **Accessibility**: Ensure proper ARIA attributes and semantic HTML

### Code Generation Preferences

- **No comments**: Don't add code comments unless explicitly requested
- **Type safety**: Always provide proper TypeScript types
- **Component reuse**: Leverage existing components and utilities
- **Test coverage**: Write tests for new utilities and business logic
- **Import organization**: Follow the established import order

### Error Handling

- **Validation**: Use Zod for runtime type validation
- **Error boundaries**: Implement proper error boundaries for components
- **Network errors**: Handle API failures gracefully
- **User feedback**: Provide clear error messages and loading states
