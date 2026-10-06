<script lang="ts" module>
  export type BadgeCountSize = 'sm' | 'md';

  const sharedClasses =
    'inline-flex whitespace-nowrap rounded-full border border-secondary bg-surface-tertiary font-sans uppercase font-medium leading-none text-primary';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1';

  const sizeClasses: Record<
    BadgeCountSize,
    { badge: string; segment: string }
  > = {
    sm: {
      badge: 'text-2xs leading-none min-h-[16px] py-0.5',
      segment: ' px-1',
    },
    md: {
      badge: 'text-xs leading-none min-h-[20px] py-0.5 ',
      segment: 'px-1.5',
    },
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
  <span class={twMerge(segmentClasses, sizeClasses[size].segment)}>
    <span>{value}</span>
  </span>
  {#if total !== undefined}
    <span class="inline-flex items-center justify-center">
      <span>/</span>
    </span>
    <span class={twMerge(segmentClasses, sizeClasses[size].segment)}>
      <span>{total}</span>
    </span>
  {/if}
</span>
