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
    'border border-io-border-primary bg-io-surface-primary p-8 text-io-content-primary',
    className,
    error && 'border-io-border-danger bg-io-surface-danger',
  )}
>
  {@render children?.()}
</svelte:element>
