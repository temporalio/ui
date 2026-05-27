# Claude AI Assistant Rules for Temporal UI

SvelteKit + Svelte 5 + TypeScript + TailwindCSS + Holocene design system

## Commands

```bash
pnpm lint              # Run all linters
pnpm check             # TypeScript type checking
pnpm test -- --run              # Run unit tests
```

## Svelte 5 Patterns

```typescript
// Props
let { class: className = '', adapter }: Props = $props();

// State
let count = $state(0);

// Computed
const doubled = $derived(count * 2);

// Effects
$effect(() => {
  console.log('Count:', count);
  return () => cleanup();
});

// SuperForms
const { form, errors, enhance } = $derived(
  superForm(data, {
    SPA: true,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      /* handle submit */
    },
  }),
);
```

## Import Order

1. Node.js built-ins
2. External libraries (with `svelte/**` first)
3. SvelteKit imports (`$app/**`, `$types`)
4. Internal imports (`$lib/**`)
5. Component imports (`$components/**/*.svelte`)
6. Relative imports (`./`, `../`)

## Workflow

1. **Always run linting**: Execute `pnpm lint` after making changes
2. **Type checking**: Run `pnpm check` to verify TypeScript compliance
3. **Test execution**: Run appropriate test suites based on changes
4. **Follow patterns**: Use existing component patterns and utility functions
5. **Design system**: Prefer Holocene components over custom implementations
6. **Accessibility**: Ensure proper ARIA attributes and semantic HTML

## Code Generation

- **No comments**: Don't add code comments unless explicitly requested
- **Type safety**: Always provide proper TypeScript types
- **Component reuse**: Leverage existing components and utilities
- **Test coverage**: Write tests for new utilities and business logic
- **Import organization**: Follow the established import order

## Error Handling

- **Validation**: Use Zod for runtime type validation
- **Error boundaries**: Implement proper error boundaries for components
- **Network errors**: Handle API failures gracefully
- **User feedback**: Provide clear error messages and loading states

## Naming

- **Files**: kebab-case (`workflow-status.svelte`)
- **Components**: PascalCase in imports, kebab-case for files
- **Functions**: camelCase
- **Types**: PascalCase
- **Use** `import type` for type-only imports

## Accessibility Audit Follow-up

PRs that close an accessibility audit fix doc are auto-labeled by the `A11y PR Triage` GitHub Action. The labels surface the fix's bucket at the queue level so reviewers can fast-track design-mergeable changes.

**Title convention.** Use `a11y(<WCAG-code>): <description>`. The action gates on a title regex that also accepts legacy `fix(a11y):` and `a11y:` forms during the transition.

**PR body trailer.** Add one `A11y-Audit-Ref:` line per fix doc closed (case-insensitive, the bare slug — no path, no `.md`):

```
A11y-Audit-Ref: 2.5.8-chip-remove-button
A11y-Audit-Ref: 1.4.13-tooltip
```

Multi-criterion PRs include multiple `A11y-Audit-Ref:` lines.

**Labels the action applies.**

| Label                       | Meaning                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `a11y`                      | Umbrella — any PR whose title matches the a11y gate.                                    |
| `a11y:bucket-1`             | CSS / token-only fix. 1 design reviewer suffices.                                       |
| `a11y:bucket-2`             | HTML / ARIA attribute addition. 1 design reviewer suffices.                             |
| `a11y:bucket-3`             | Logic / component change. Engineer reviewer required; pings the designer Slack channel. |
| `a11y:bucket-4`             | Engineering + product judgment required; pings the designer Slack channel.              |
| `a11y:sc-X.Y.Z`             | One per WCAG criterion closed.                                                          |
| `a11y:needs-categorization` | Referenced entry exists but has no `bucket`. Audit team triage.                         |
| `a11y:broken-ref`           | Slug not in `scripts/a11y/manifest.yml`. Audit team adds entry or author corrects slug. |
| `a11y:no-fix-doc`           | No `A11y-Audit-Ref:` line. Audit team adopts or accepts as ad-hoc.                      |

**No manifest entry yet?** If your PR addresses a defect that isn't in `scripts/a11y/manifest.yml`, omit `A11y-Audit-Ref:` and the action labels it `a11y:no-fix-doc` + comments with the path forward. Coordinate with the audit team so they can author a manifest entry.

**Manifest validation.** Run `pnpm a11y:manifest:test` to validate `scripts/a11y/manifest.yml` against the schema (slug uniqueness, bucket enum, scope enum, SC pattern).

**Backfill / re-run.** The triage workflow has a `workflow_dispatch` trigger; invoke it via the Actions tab or `gh workflow run a11y-pr-triage.yml --field pr_number=<n>` to (re)label any open PR (e.g. after a manifest update or for one-time backfill).

Full design at [DT-4048](https://temporalio.atlassian.net/browse/DT-4048).
