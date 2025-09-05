# Code Style and Conventions for Temporal UI

## Svelte 5 Patterns (Required for Migration)

### Props

```typescript
interface Props {
  propName?: PropType;
  children?: Snippet;
}
let { propName = defaultValue, children }: Props = $props();
```

### State and Reactivity

```typescript
let count = $state(0); // Reactive state
const doubled = $derived(count * 2); // Computed values
$effect(() => {
  // Side effects
  console.log('Count:', count);
  return () => cleanup();
});
```

### Slots to Render Functions

```html
<!-- OLD: <slot name="header" /> -->
{@render header?.()} {#if children}{@render children()}{/if}
```

### Event Handling

```typescript
// OLD: createEventDispatcher, on:event
interface Props {
  oneventname?: (data: EventType) => void;
}
// Call: oneventname?.(data);
```

## Import Order

1. Node.js built-ins
2. External libraries (svelte/\*\* first)
3. SvelteKit imports ($app/\*\*, $types)
4. Internal imports ($lib/\*\*)
5. Component imports ($components/\*_/_.svelte)
6. Relative imports (./, ../)

## File Naming

- Files: kebab-case (`workflow-status.svelte`)
- Components: PascalCase in imports, kebab-case for files
- Functions: camelCase
- Types: PascalCase
- Use `import type` for type-only imports

## TypeScript Rules

- Always provide proper TypeScript types
- Use Zod for runtime type validation
- Prefer `interface` over `type` for object shapes
- Use `const` over `let` when possible

## No Comments Policy

- Don't add code comments unless explicitly requested
- Code should be self-documenting through clear naming
