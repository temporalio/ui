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
6. **Accessibility**: Enforced, not optional — see the Accessibility section below; run `pnpm check:a11y` before pushing UI changes.

## Accessibility

Svelte compiler accessibility warnings are gated as **CI errors** via `pnpm check:a11y` (the `check-a11y` job) — a PR that introduces an `a11y_*` warning fails. Run it locally before pushing.

- **Compose Holocene primitives; don't hand-roll interactive elements.** `Button`, `Input`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Tooltip`, `Modal`, `Drawer`, `Menu`, `Table`, `Accordion` own the a11y contract (name, role, keyboard, focus). A `<div role="button">`, `<tr onclick>`, or CSS `:after` "tooltip" is the top source of audit findings.
- **Every interactive control needs** an accessible name, a keyboard path (Enter/Space, Escape to dismiss), and a visible focus indicator. Icon-only buttons get an `aria-label`. Form controls get a real (non-empty) label; forward native `required`; set `aria-invalid`/`aria-describedby` on the focusable control.
- **Don't signal state by color alone; live regions must pre-exist empty; `<th>` needs `scope`; DOM order must equal visual order (no `flex-*-reverse`).**
- axe (Storybook `addon-a11y`, Playwright `tests/accessibility/`) is a floor — it can't see keyboard operability, focus order, or name quality. Keyboard-walk changes and verify announcements with a screen reader.

Audit/review conventions (manifest, PR labels, per-SC authoring & review guidance) live in the `winston-claude-skills` a11y skills.

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
