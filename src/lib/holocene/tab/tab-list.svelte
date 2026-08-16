<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    class?: string;
    children: Snippet;
  }

  let {
    label,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();
</script>

<div
  class={merge(
    'flex flex-nowrap gap-x-4 overflow-x-auto border-b border-subtle [scrollbar-width:thin]',
    className,
  )}
  role="tablist"
  aria-label={label}
  {...restProps}
>
  {@render children()}
</div>
