<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  let { class: className = '', children }: Props = $props();
</script>

<div
  class={twMerge(
    'surface-primary',
    'border',
    'border-subtle',
    'p-4',
    className,
  )}
>
  {@render children?.()}
</div>
