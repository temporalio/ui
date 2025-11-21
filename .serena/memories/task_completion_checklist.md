# Task Completion Checklist

## MUST DO After Every Code Change

### 1. Run Linting (REQUIRED)

```bash
pnpm lint
```

This runs prettier, eslint, and stylelint. Fix any issues before proceeding.

### 2. Run Type Checking (REQUIRED)

```bash
pnpm check
```

Ensures TypeScript types are correct. Must pass without errors.

### 3. Auto-fix Issues (if needed)

```bash
pnpm format
```

Automatically fixes most formatting and linting issues.

### 4. Run Tests (for logic changes)

```bash
pnpm test -- --run        # Run unit tests
pnpm test:e2e            # Run e2e tests if UI changed
```

### 5. Test in Browser

- Start dev server: `pnpm dev`
- Test the feature/fix manually
- Check console for errors
- Verify responsive behavior

### 6. Check Storybook (for component changes)

```bash
pnpm stories:dev
```

Update or add stories for new/modified components.

## Before Committing

### Git Workflow

1. Stage changes: `git add -A`
2. Review changes: `git status` and `git diff --staged`
3. Commit with conventional format:
   ```bash
   git commit -m "type(scope): description"
   ```
   Types: feat, fix, docs, style, refactor, test, chore

### PR Checklist

- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm check`)
- [ ] Tests pass (if applicable)
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility checked (keyboard nav, ARIA)
- [ ] No hardcoded strings (use i18n)
- [ ] Follows team conventions

## Common Issues to Check

### Import Order

Verify imports follow the strict order:

1. Node built-ins
2. External libraries
3. SvelteKit imports
4. Internal imports
5. Component imports
6. Relative imports

### Type Safety

- No `any` types
- No `as` type assertions
- No `@ts-ignore` comments
- Proper type imports with `import type`

### Code Style

- Guard statements (early returns)
- No nested if/else blocks
- Pure functions where possible
- Descriptive variable names
- No unnecessary comments

### Performance

- Lazy loading for heavy components
- Proper use of `$derived` vs `$effect`
- No memory leaks in effects
- Efficient list rendering with keys

## Final Verification

```bash
# Run all checks at once
pnpm lint && pnpm check && pnpm test -- --run
```

If all pass, the code is ready for review!
