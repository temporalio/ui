# Task Completion Workflow

## Mandatory Steps After Code Changes

### 1. Code Quality Checks (Always Required)

```bash
pnpm lint              # Run all linters (prettier, eslint, stylelint)
pnpm check             # TypeScript type checking
```

### 2. Testing (When Applicable)

```bash
# For utility functions and business logic
pnpm test -- --run     # Run unit tests once

# For UI components and user flows
pnpm test:integration  # Run integration tests with mocks

# For full application features
pnpm test:e2e         # Run end-to-end tests (if needed)
```

### 3. Verification Steps

- Review ESLint output for any remaining issues
- Check TypeScript compilation for type errors
- Verify that all tests pass
- Ensure code follows established patterns and conventions
- Confirm accessibility guidelines are met

## Before Committing

1. **Stage changes**: `git add .`
2. **Review changes**: `git diff --staged`
3. **Commit with descriptive message**: `git commit -m "descriptive message"`
4. **Never commit secrets or sensitive data**

## Development Workflow

1. **Always run linting**: Execute `pnpm lint` after making changes
2. **Type checking**: Run `pnpm check` to verify TypeScript compliance
3. **Test execution**: Run appropriate test suites based on changes
4. **Follow patterns**: Use existing component patterns and utility functions
5. **Design system**: Prefer Holocene components over custom implementations
6. **Accessibility**: Ensure proper ARIA attributes and semantic HTML

## Error Resolution

- If linting fails: Run `pnpm format` to auto-fix formatting issues
- If TypeScript fails: Address type errors before proceeding
- If tests fail: Fix failing tests before considering task complete
- If build fails: Resolve build errors and verify with appropriate build command

## Code Review Checklist

- [ ] Code follows established naming conventions
- [ ] Imports are organized according to ESLint rules
- [ ] TypeScript types are properly defined
- [ ] Components use Holocene design system where possible
- [ ] Error handling is implemented appropriately
- [ ] Accessibility requirements are met
- [ ] Tests are written for new utilities and business logic
- [ ] All linting and type checking passes
- [ ] No hardcoded secrets or sensitive data
