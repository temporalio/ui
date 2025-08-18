# Task Completion Checklist

When completing any development task, always:

1. **Linting & Type Checking**

   - Run `pnpm lint` to check all linting rules
   - Run `pnpm check` for TypeScript type checking
   - Fix any issues found

2. **Testing**

   - Run appropriate tests based on changes made
   - `pnpm test -- --run` for unit tests
   - Consider E2E tests if UI changes affect user workflows

3. **Code Quality**

   - Follow established patterns from existing codebase
   - Use Holocene design system components when possible
   - Ensure proper accessibility (ARIA attributes, semantic HTML)
   - Validate forms with Zod schemas

4. **Import Organization**

   - Follow the established import order
   - Use direct imports, avoid barrel imports
   - Use `import type` for type-only imports

5. **Git Practices**
   - Only commit when explicitly requested
   - Follow conventional commit format: type(scope): description
   - Never include AI attribution in commits
