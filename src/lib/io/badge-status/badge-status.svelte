<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  export type BadgeStatusValue =
    | 'Running'
    | 'Paused'
    | 'Completed'
    | 'ContinuedAsNew'
    | 'Failed'
    | 'TimedOut'
    | 'Terminated'
    | 'Canceled';

  export type BadgeStatusColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error';

  export type BadgeStatusExtension = {
    text?: string;
    colorScheme?: BadgeStatusColorScheme;
    LeadIcon?: ConditionalValue<IconComponent>;
    TrailIcon?: ConditionalValue<IconComponent>;
  };

  export type BadgeStatusExtensions = ConditionalValue<BadgeStatusExtension>[];

  const isBadgeStatusExtension = (
    extension: ConditionalValue<BadgeStatusExtension>,
  ): extension is BadgeStatusExtension =>
    extension !== false && extension !== null && extension !== undefined;

  const sharedClasses =
    '[text-box:trim-both_cap_alphabetic] [&_span]:[text-box:inherit] inline-flex items-stretch overflow-hidden whitespace-nowrap rounded-full font-mono text-xs font-medium leading-none uppercase tracking-wide';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 border px-1 py-0.5';

  const colorSchemeClasses: Record<BadgeStatusColorScheme, string> = {
    neutral: 'border-tertiary bg-surface-tertiary text-secondary',
    info: 'border-information bg-surface-information text-information',
    success: 'border-success bg-surface-success text-success',
    warning: 'border-warning bg-surface-warning text-warning',
    danger: 'border-danger bg-surface-danger text-danger',
    error: 'border-error bg-surface-error text-error',
  };

  const statusConfiguration: Record<
    BadgeStatusValue,
    { text: string; colorScheme: BadgeStatusColorScheme }
  > = {
    Running: { text: 'running', colorScheme: 'info' },
    Paused: { text: 'paused', colorScheme: 'info' },
    Completed: { text: 'complete', colorScheme: 'success' },
    ContinuedAsNew: { text: 'continued as new', colorScheme: 'success' },
    Failed: { text: 'failed', colorScheme: 'danger' },
    TimedOut: { text: 'timed out', colorScheme: 'error' },
    Terminated: { text: 'terminated', colorScheme: 'warning' },
    Canceled: { text: 'cancelled', colorScheme: 'neutral' },
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: BadgeStatusValue;
    text?: string;
    TrailIcon?: ConditionalValue<IconComponent>;
    extensions?: ConditionalValue<BadgeStatusExtensions>;
    class?: string;
  }

  let {
    status,
    text,
    TrailIcon,
    extensions,
    class: className,
    ...rest
  }: Props = $props();

  const configuration = $derived(statusConfiguration[status]);
  const visibleExtensions = $derived(
    extensions ? extensions.filter(isBadgeStatusExtension) : [],
  );
</script>

<span class={twMerge(sharedClasses, className)} {...rest}>
  <span
    class={twMerge(
      segmentClasses,
      colorSchemeClasses[configuration.colorScheme],
      visibleExtensions.length ? 'rounded-l-full border-r-0' : 'rounded-full',
    )}
  >
    <span>{text ?? configuration.text}</span>
    {#if TrailIcon}
      <TrailIcon width="1em" height="1em" />
    {/if}
  </span>
  {#each visibleExtensions as extension, index (index)}
    <span
      class={twMerge(
        segmentClasses,
        colorSchemeClasses[extension.colorScheme ?? configuration.colorScheme],
        index < visibleExtensions.length - 1 ? 'border-r-0' : 'rounded-r-full',
      )}
    >
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
  {/each}
</span>
