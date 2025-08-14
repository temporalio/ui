# Task Completion Checklist

After making any code changes, ALWAYS run these commands in order:

## 1. Type Checking

```bash
pnpm check
```

Must pass without errors before proceeding.

## 2. Linting (All)

```bash
pnpm lint
```

Runs prettier, eslint, and stylelint. All must pass.

## 3. Unit Tests (if applicable)

```bash
pnpm test -- --run
```

Run if changes affect testable logic.

## 4. Integration/E2E Tests (if applicable)

```bash
pnpm test:integration  # For UI changes
pnpm test:e2e          # For major features
```

## Quality Gates

- Zero TypeScript errors
- Zero linting violations
- All relevant tests passing
- No console errors in browser (for UI changes)

## Svelte 5 Conversion Verification

For migration tasks, verify all patterns are converted:

- No `export let` statements
- No `<slot>` elements (should be `{@render}`)
- No `on:event` handlers (should be `onevent`)
- No `createEventDispatcher` imports
- All imports from `$lib/holocene/` updated to `$lib/anthropocene/`
