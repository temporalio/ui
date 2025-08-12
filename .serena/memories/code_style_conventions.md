# Code Style and Conventions for Temporal UI

## File Naming Conventions

- **Files**: kebab-case (`workflow-status.svelte`, `event-history.ts`)
- **Components**: PascalCase in imports, kebab-case for files
- **Functions**: camelCase (`formatEventAttributes`, `getWorkflowStatus`)
- **Types**: PascalCase (`WorkflowExecution`, `EventGroup`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)

## Import Organization (Enforced by ESLint)

1. Node.js built-ins
2. External libraries (with `svelte/**` first)
3. SvelteKit imports (`$app/**`, `$types`)
4. Internal imports (`$lib/**`)
5. Component imports (`$components/**/*.svelte`)
6. Relative imports (`./`, `../`)

## Svelte 5 Patterns

```typescript
// Props - Use destructuring with defaults
let { class: className = '', adapter, disabled = false }: Props = $props();

// State - Use $state for reactive variables
let count = $state(0);
let items = $state<Item[]>([]);

// Computed values - Use $derived
const doubled = $derived(count * 2);
const filteredItems = $derived(items.filter((item) => item.active));

// Effects - Use $effect for side effects
$effect(() => {
  console.log('Count changed:', count);
  return () => {
    // Cleanup function
  };
});

// Forms - Use SuperForms with Zod validation
const { form, errors, enhance } = $derived(
  superForm(data, {
    SPA: true,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      // Handle form submission
    },
  }),
);
```

## TypeScript Guidelines

- Always use `import type` for type-only imports
- Provide explicit types for function parameters and return values
- Use Zod for runtime type validation
- Avoid `any` type (enforced by ESLint)
- Use array syntax `Type[]` instead of `Array<Type>` (enforced by ESLint)

## Component Patterns

- Use Holocene design system components over custom implementations
- Ensure proper ARIA attributes and semantic HTML for accessibility
- Implement error boundaries for components
- Provide loading states and error handling
- Use class-variance-authority (CVA) for component variants

## Code Quality Rules

- **No comments**: Don't add code comments unless explicitly requested
- **Single quotes**: Use single quotes for strings (enforced by ESLint)
- **No explicit any**: TypeScript `any` type is forbidden
- **Consistent type assertions**: Use `as` syntax instead of angle brackets
- **No barrel imports**: Avoid index.ts files for easier tree shaking

## Error Handling

- Use Zod for runtime type validation
- Handle API failures gracefully with proper error messages
- Provide clear user feedback for loading and error states
- Implement proper error boundaries in components

## Testing Conventions

- Unit tests: Use Vitest with `.test.ts` suffix
- E2E tests: Use Playwright with `.spec.ts` suffix
- Integration tests: Use Playwright with mocks
- Test utilities and business logic, not just components
- Mock external dependencies appropriately
