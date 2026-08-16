<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  interface Props {
    children: Snippet;
    'aria-label'?: string;
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
    'grid min-w-0 grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)] gap-x-3 gap-y-1.5 xl:auto-cols-[minmax(7rem,max-content)_minmax(0,1fr)] xl:grid-flow-col',
    className,
  )}
  style={`--row-count: ${rowCount}`}
  aria-label={ariaLabel}
>
  {@render children()}
</dl>
