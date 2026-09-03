<script lang="ts" module>
  export type BadgeCountVariant = 'single' | 'happy' | 'error' | 'total';

  const sharedClasses =
    '[text-box:trim-both_cap_alphabetic] [&_span]:[text-box:inherit] inline-flex whitespace-nowrap rounded-full border font-mono text-xs font-medium leading-none uppercase';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 px-1 py-0.5';

  const variantClasses: Record<BadgeCountVariant, string> = {
    single: 'border-secondary bg-surface-tertiary text-primary',
    happy: 'border-secondary bg-surface-tertiary text-primary',
    error: 'border-danger bg-surface-danger text-danger',
    total: 'border-secondary bg-surface-tertiary text-primary',
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import { IconExclamationOctagon, IconHappyLappy } from '$lib/io/icon';

  type SharedProps = Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > & {
    value: string | number;
    class?: string;
  };

  type Props =
    | (SharedProps & {
        variant: 'single';
        total?: never;
      })
    | (SharedProps & {
        variant?: 'happy';
        total?: never;
      })
    | (SharedProps & {
        variant: 'error';
        total?: never;
      })
    | (SharedProps & {
        variant: 'total';
        total: string | number;
      });

  let {
    value,
    total,
    variant = 'happy',
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={twMerge(sharedClasses, variantClasses[variant], className)}
  {...rest}
>
  <span class={segmentClasses}>{value}</span>
  {#if variant === 'happy'}
    <span class={segmentClasses}>
      <IconHappyLappy width="1em" height="1em" />
    </span>
  {:else if variant === 'error'}
    <span class={segmentClasses}>
      <IconExclamationOctagon width="1em" height="1em" />
    </span>
  {:else if total !== undefined}
    <span class="inline-flex items-center justify-center py-0.5">/</span>
    <span class={segmentClasses}>{total}</span>
  {/if}
</span>
