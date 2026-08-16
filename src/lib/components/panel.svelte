<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    as?: string;
    error?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    as = 'div',
    error = false,
    class: className = '',
    children,
  }: Props = $props();
</script>

<svelte:element
  this={as}
  class={twMerge(
    'surface-primary rounded-panel border border-subtle p-[var(--panel-inset)]',
    className,
    error && 'border-danger bg-danger',
  )}
>
  {@render children?.()}
</svelte:element>
