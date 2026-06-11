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
    'flex flex-wrap gap-x-4 gap-y-1 border-b border-subtle',
    className,
  )}
  role="tablist"
  aria-label={label}
  {...restProps}
>
  {@render children()}
</div>
