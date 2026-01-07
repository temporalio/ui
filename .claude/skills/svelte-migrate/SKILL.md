---
name: svelte-migrate
description: Migrate a Svelte 4 component to Svelte 5 runes syntax. Use when asked to migrate, convert, or upgrade a .svelte file to Svelte 5.
---

# Svelte 4 to 5 Migration

Migrate individual Svelte files from v4 to v5 runes syntax.

## Usage

When the user provides a file path, migrate that specific file following the patterns below.

## Migration Patterns

### 1. Props: `export let` → `$props()`

**Before:**

```svelte
<script lang="ts">
  export let name: string;
  export let count = 0;
  export let optional: string | undefined = undefined;

  let className = '';
  export { className as class };
</script>
```

**After:**

```svelte
<script lang="ts">
  interface Props {
    name: string;
    count?: number;
    optional?: string;
    class?: string;
  }

  let { name, count = 0, optional, class: className = '' }: Props = $props();
</script>
```

### 2. State: `let` → `$state()`

Only reactive variables that are reassigned or mutated need `$state()`.

**Before:**

```svelte
<script lang="ts">
  let count = 0;
  let items = [];
</script>
```

**After:**

```svelte
<script lang="ts">
  let count = $state(0);
  let items = $state<string[]>([]);
</script>
```

### 3. Derived Values: `$:` → `$derived()`

**Before:**

```svelte
<script lang="ts">
  $: doubled = count * 2;
  $: filtered = items.filter((i) => i.active);
</script>
```

**After:**

```svelte
<script lang="ts">
  const doubled = $derived(count * 2);
  const filtered = $derived(items.filter((i) => i.active));
</script>
```

For complex derivations use `$derived.by()`:

**Before:**

```svelte
<script lang="ts">
  $: {
    let total = 0;
    for (const item of items) total += item.value;
    sum = total;
  }
</script>
```

**After:**

```svelte
<script lang="ts">
  const sum = $derived.by(() => {
    let total = 0;
    for (const item of items) total += item.value;
    return total;
  });
</script>
```

### 4. Side Effects: `$:` statements → `$effect()`

**Before:**

```svelte
<script lang="ts">
  $: console.log('count changed:', count);
  $: if (count > 10) alert('High count!');
  $: document.title = `Count: ${count}`;
</script>
```

**After:**

```svelte
<script lang="ts">
  $effect(() => {
    console.log('count changed:', count);
  });

  $effect(() => {
    if (count > 10) alert('High count!');
  });

  $effect(() => {
    document.title = `Count: ${count}`;
  });
</script>
```

### 5. Event Handlers: `on:event` → `onevent`

**Before:**

```svelte
<button on:click={handleClick}>Click</button>
<button on:click={() => count++}>Increment</button>
<button on:click|preventDefault={submit}>Submit</button>
<input on:input={handleInput} on:focus={handleFocus} />
```

**After:**

```svelte
<button onclick={handleClick}>Click</button>
<button onclick={() => count++}>Increment</button>
<button
  onclick={(e) => {
    e.preventDefault();
    submit(e);
  }}>Submit</button
>
<input oninput={handleInput} onfocus={handleFocus} />
```

Event modifiers like `|preventDefault`, `|stopPropagation` must be handled manually in the handler.

### 6. Component Events: `createEventDispatcher` → callback props

**Before:**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    change: string;
    submit: { data: FormData };
  }>();

  function handleChange(value: string) {
    dispatch('change', value);
  }
</script>
```

**After:**

```svelte
<script lang="ts">
  interface Props {
    onchange?: (value: string) => void;
    onsubmit?: (data: { data: FormData }) => void;
  }

  let { onchange, onsubmit }: Props = $props();

  function handleChange(value: string) {
    onchange?.(value);
  }
</script>
```

**Parent component changes:**

Before: `<Child on:change={handler} />`
After: `<Child onchange={handler} />`

### 7. Forwarding Events: `on:event` → explicit handler

**Before:**

```svelte
<button on:click>Click me</button>
```

**After:**

```svelte
<script lang="ts">
  interface Props {
    onclick?: (e: MouseEvent) => void;
  }

  let { onclick }: Props = $props();
</script>

<button {onclick}>Click me</button>
```

### 8. Slots → Snippets

**Default slot:**

Before:

```svelte
<slot />
```

After:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children?.()}
```

**Named slots:**

Before:

```svelte
<slot name="header" />
<slot />
<slot name="footer" />
```

After:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  }

  let { header, children, footer }: Props = $props();
</script>

{@render header?.()}
{@render children?.()}
{@render footer?.()}
```

**Slots with props (let:):**

Before:

```svelte
<slot item={currentItem} index={i} />

<!-- Usage -->
<List {items} let:item let:index>
  <span>{index}: {item.name}</span>
</List>
```

After:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet<[{ item: Item; index: number }]>;
  }

  let { children }: Props = $props();
</script>

{@render children?.({ item: currentItem, index: i })}

<!-- Usage -->
<List {items}>
  {#snippet children({ item, index })}
    <span>{index}: {item.name}</span>
  {/snippet}
</List>
```

### 9. Bindable Props: `bind:` → `$bindable()`

**Before:**

```svelte
<script lang="ts">
  export let value = '';
</script>

<!-- Parent -->
<Input bind:value={name} />
```

**After:**

```svelte
<script lang="ts">
  interface Props {
    value?: string;
  }

  let { value = $bindable('') }: Props = $props();
</script>

<!-- Parent stays the same -->
<Input bind:value={name} />
```

### 10. Lifecycle: `beforeUpdate`/`afterUpdate` → `$effect`

**Before:**

```svelte
<script lang="ts">
  import { beforeUpdate, afterUpdate } from 'svelte';

  beforeUpdate(() => {
    console.log('before update');
  });

  afterUpdate(() => {
    console.log('after update');
  });
</script>
```

**After:**

```svelte
<script lang="ts">
  $effect.pre(() => {
    console.log('before update');
  });

  $effect(() => {
    console.log('after update');
  });
</script>
```

Note: `onMount` and `onDestroy` remain valid and preferred for mount/unmount logic.

### 11. Dynamic Components: `<svelte:component>` → direct usage

**Before:**

```svelte
<svelte:component this={DynamicComponent} {prop} />
```

**After:**

```svelte
<DynamicComponent {prop} />
```

Or with conditional:

```svelte
{#if Component}
  <Component {prop} />
{/if}
```

### 12. `class:` Directive → Conditional Classes

The `class:` directive still works but consider using conditional expressions:

**Before:**

```svelte
<div class:active={isActive} class:disabled>
```

**After (either works):**

```svelte
<div class:active={isActive} class:disabled>
<!-- or -->
<div class={`${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
```

### 12. App State

**Before:**

```svelte
import {page} from '$app/stores'
```

**After:**

```svelte
import {page} from '$app/state'
```

## Workflow

1. Read the file to understand its current structure
2. Identify all Svelte 4 patterns that need migration
3. Apply transformations systematically:
   - Props first (export let → $props)
   - State variables (let → $state where needed)
   - Derived values ($: assignments → $derived)
   - Side effects ($: statements → $effect)
   - Event handlers (on: → on)
   - Component events (dispatch → callback props)
   - Slots (slot → snippets)
4. Update imports (add Snippet type if needed, remove createEventDispatcher if no longer used)
5. Ensure TypeScript types are correct
6. Run `pnpm check` to verify no type errors

## Important Notes

- Keep `onMount` and `onDestroy` - they're still valid
- `context="module"` scripts are now `<script module>`
- CSS/styles don't change
- `{#if}`, `{#each}`, `{#await}` blocks remain unchanged
- `bind:` directives on elements remain unchanged
- `use:` action directives remain unchanged
- `transition:`, `in:`, `out:`, `animate:` directives remain unchanged
