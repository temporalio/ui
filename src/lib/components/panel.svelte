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
    'border border-primary bg-surface-primary p-8 text-primary',
    className,
    error && 'border-danger bg-surface-danger',
  )}
>
  {@render children?.()}
</svelte:element>
