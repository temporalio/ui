<script lang="ts" module>
  export type BadgeCountSize = 'sm' | 'md';

  const sharedClasses =
    'inline-flex whitespace-nowrap rounded-full border border-secondary bg-surface-tertiary font-mono font-medium leading-none text-primary uppercase';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1';

  const sizeClasses: Record<
    BadgeCountSize,
    { badge: string; segment: string }
  > = {
    sm: { badge: 'text-2xs', segment: 'py-0.5 px-1' },
    md: { badge: 'text-xs', segment: 'py-1 px-1.5' },
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    value: string | number;
    total?: string | number;
    size?: BadgeCountSize;
    class?: string;
  }

  let {
    value,
    total,
    size = 'md',
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={twMerge(sharedClasses, sizeClasses[size].badge, className)}
  {...rest}
>
  <span class={twMerge(segmentClasses, sizeClasses[size].segment)}>{value}</span
  >
  {#if total !== undefined}
    <span class="inline-flex items-center justify-center py-0.5">/</span>
    <span class={twMerge(segmentClasses, sizeClasses[size].segment)}
      >{total}</span
    >
  {/if}
</span>
