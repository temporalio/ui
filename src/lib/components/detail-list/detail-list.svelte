<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  interface Props {
    children: Snippet;
    'aria-label': string;
    rowCount: number;
    class?: ClassNameValue;
  }
  let {
    children,
    'aria-label': ariaLabel,
    rowCount,
    class: className = '',
  }: Props = $props();
</script>

<dl
  class={twMerge(
    'grid auto-cols-[max-content_minmax(0,max-content)] grid-flow-col gap-x-4 gap-y-1',
    className,
  )}
  style={`--row-count: ${rowCount}`}
  aria-label={ariaLabel}
>
  {@render children()}
</dl>
