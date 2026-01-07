# Code Style and Conventions

## Svelte 5 Patterns

### Props Definition

```typescript
interface Props {
  class?: string;
  adapter: Adapter;
}
let { class: className = '', adapter }: Props = $props();
```

### State Management

```typescript
// State
let count = $state(0);

// Computed values
const doubled = $derived(count * 2);

// Complex computed with function
const complex = $derived.by(() => {
  // computation logic
  return result;
});

// Effects (use sparingly - team prefers avoiding them)
$effect.pre(() => {
  // side effect logic
});
```

### SuperForms Pattern

```typescript
const { form, errors, enhance } = $derived(
  superForm(data, {
    SPA: true,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      // handle submit
    },
  }),
);
```

## Import Order (STRICT)

1. Node.js built-ins
2. External libraries (`svelte/**` first)
3. SvelteKit imports (`$app/**`, `$types`)
4. Internal imports (`$lib/**`)
5. Component imports (`$components/**/*.svelte`)
6. Relative imports (`./`, `../`)

## Naming Conventions

- **Files**: kebab-case (`workflow-status.svelte`)
- **Components**: PascalCase in imports, kebab-case files
- **Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE or PascalCase
- **CSS classes**: kebab-case with Tailwind utilities

## TypeScript Requirements

- Always use proper types (no `any`, `unknown`, or `as` assertions)
- Use `import type` for type-only imports
- Prefer interfaces over type aliases for object shapes
- Use generic constraints instead of type escapes

## Functional Programming Patterns

- **Guard statements**: Use early returns, no nested if/else
- **Pure functions**: No side effects in transformations
- **Immutable patterns**: Don't mutate inputs
- **Small functions**: Single responsibility
- **Explicit errors**: Throw meaningful errors, don't fail silently
- **Constants over functions**: `const VALUE = x` not `const getValue = () => x`
- **Logical operators**: Use `||` for fallbacks, not if statements

## Component Structure

```
component-name/
├── index.svelte          # Main component
├── {name}.ts            # Pure functions, types
├── {name}.svelte.ts     # Svelte lifecycle functions
└── {sub}.svelte         # Sub-components
```

## Formatting Rules (Prettier)

- Print width: 80
- Tab width: 2 spaces
- Single quotes
- Semicolons: always
- Trailing comma: all
- Bracket spacing: true

## CSS/Styling

- Use TailwindCSS utilities first
- PostCSS for custom styles
- Holocene design system components
- Avoid inline styles
- Use CSS variables from theme

## Comments and Documentation

- NO code comments unless explicitly requested
- Use descriptive variable/function names instead
- TypeScript types serve as documentation
- Component props should be self-documenting

## Error Handling

- Use Zod for validation
- Handle errors at component level
- Show user-friendly error messages
- Use toast notifications for async operations
- Implement proper loading states

## Accessibility

- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
