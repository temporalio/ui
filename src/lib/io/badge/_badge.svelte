<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import type { BadgeSegment, BadgeVariant } from './types';

  const sharedClasses =
    'inline-flex whitespace-nowrap divide-inherit rounded-full border font-mono text-xs font-medium leading-none uppercase';

  const variantClasses: Record<BadgeVariant, string> = {
    neutral: 'border-tertiary bg-surface-tertiary text-secondary',
    info: 'border-information bg-surface-information text-information',
    success: 'border-success bg-surface-success text-success',
    warning: 'border-warning bg-surface-warning text-warning',
    danger: 'border-danger bg-surface-danger text-danger',
    error: 'border-error bg-surface-error text-error',
    accent: 'border-accent bg-surface-accent text-accent',
  };
</script>

<script lang="ts">
  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    variant: BadgeVariant;
    segments: BadgeSegment[];
    divided?: boolean;
    class?: string;
  }

  let {
    variant,
    segments,
    divided = true,
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={twMerge(
    sharedClasses,
    variantClasses[variant],
    divided && 'divide-x',
    className,
  )}
  {...rest}
>
  {#each segments as segment (segment)}
    <span
      class={twMerge(
        'inline-flex flex-nowrap items-center justify-center gap-1 px-1 py-0.5',
        segment.class,
      )}
    >
      {#if segment.LeadIcon}
        <segment.LeadIcon width="1em" height="1em" />
      {/if}
      {#if segment.text}
        <span>{segment.text}</span>
      {/if}
      {#if segment.TrailIcon}
        <segment.TrailIcon width="1em" height="1em" />
      {/if}
    </span>
  {/each}
</span>
