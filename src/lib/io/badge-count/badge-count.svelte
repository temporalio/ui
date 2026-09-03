<script lang="ts" module>
  const sharedClasses =
    '[text-box:trim-both_cap_alphabetic] [&_span]:[text-box:inherit] inline-flex whitespace-nowrap rounded-full border border-secondary bg-surface-tertiary font-mono text-xs font-medium leading-none text-primary uppercase';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 px-1 py-0.5';
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
    class?: string;
  }

  let { value, total, class: className, ...rest }: Props = $props();
</script>

<span class={twMerge(sharedClasses, className)} {...rest}>
  <span class={segmentClasses}>{value}</span>
  {#if total !== undefined}
    <span class="inline-flex items-center justify-center py-0.5">/</span>
    <span class={segmentClasses}>{total}</span>
  {/if}
</span>
