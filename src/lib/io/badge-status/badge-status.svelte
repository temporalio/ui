<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';

  export type BadgeStatusValue =
    | 'Running'
    | 'Paused'
    | 'Completed'
    | 'ContinuedAsNew'
    | 'Failed'
    | 'TimedOut'
    | 'Terminated'
    | 'Canceled';

  export type BadgeStatusExtension = {
    text?: string;
    LeadIcon?: IconComponent;
    TrailIcon?: IconComponent;
  };

  type BadgeStatusColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error';

  const sharedClasses =
    'inline-flex whitespace-nowrap divide-x divide-inherit rounded-full border font-mono text-xs font-medium leading-none uppercase tracking-wide';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 px-1 py-0.5';

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
    TrailIcon?: IconComponent | null;
    extension?: BadgeStatusExtension;
    class?: string;
  }

  let {
    status,
    TrailIcon,
    extension,
    class: className,
    ...rest
  }: Props = $props();

  const configuration = $derived(statusConfiguration[status]);
</script>

<span
  class={twMerge(
    sharedClasses,
    colorSchemeClasses[configuration.colorScheme],
    className,
  )}
  {...rest}
>
  <span class={segmentClasses}>
    <span>{configuration.text}</span>
    {#if TrailIcon}
      <TrailIcon width="1em" height="1em" />
    {/if}
  </span>
  {#if extension}
    <span class={segmentClasses}>
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
