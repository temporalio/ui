<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  export type BadgeColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error'
    | 'accent';

  export type BadgeSize = 'sm' | 'md';

  export type BadgeExtension = {
    text?: string;
    LeadIcon?: ConditionalValue<IconComponent>;
    TrailIcon?: ConditionalValue<IconComponent>;
  };

  const sharedClasses =
    'inline-flex whitespace-nowrap divide-x divide-inherit rounded-full border font-mono font-medium leading-none uppercase';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1';

  const sizeClasses: Record<BadgeSize, { badge: string; segment: string }> = {
    sm: { badge: 'text-2xs', segment: 'py-0.5 px-1' },
    md: { badge: 'text-xs', segment: 'py-1 px-1.5' },
  };

  const colorSchemeClasses: Record<BadgeColorScheme, string> = {
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
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    colorScheme?: BadgeColorScheme;
    size?: BadgeSize;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<BadgeExtension>;
    class?: string;
  }

  let {
    text,
    colorScheme = 'neutral',
    size = 'md',
    Icon,
    extension,
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={twMerge(
    sharedClasses,
    sizeClasses[size].badge,
    colorSchemeClasses[colorScheme],
    className,
  )}
  {...rest}
>
  <span class={twMerge(segmentClasses, sizeClasses[size].segment)}>
    <span>{text}</span>
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
  </span>
  {#if extension}
    <span class={twMerge(segmentClasses, sizeClasses[size].segment)}>
      {#if extension.LeadIcon}
        <extension.LeadIcon width="1em" height="1em" />
      {/if}
      {#if extension.text}
        <span>{extension.text}</span>
      {/if}
      {#if extension.TrailIcon}
        <extension.TrailIcon width="1em" height="1em" />
      {/if}
    </span>
  {/if}
</span>
