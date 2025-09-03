<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    class?: string;
    borderBottom?: boolean;
    children: Snippet;
  }

  let {
    label,
    class: className = '',
    borderBottom = false,
    children,
    ...restProps
  }: Props = $props();
</script>

<div
  class={merge(
    'flex flex-row gap-4',
    borderBottom && 'border-b border-subtle',
    className,
  )}
  role="tablist"
  aria-label={label}
  {...restProps}
>
  {@render children()}
</div>
