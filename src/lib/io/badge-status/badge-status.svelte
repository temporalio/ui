<script lang="ts" module>
  import type { I18nKey } from '$lib/i18n';
  import { type IconComponent, IconPause } from '$lib/io/icon';
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

  export type BadgeStatusSize = 'sm' | 'md';

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
    'inline-flex max-w-full items-stretch overflow-hidden whitespace-nowrap rounded-full font-sans uppercase font-medium ';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 border py-0.5';

  const sizeClasses: Record<
    BadgeStatusSize,
    { badge: string; segment: string }
  > = {
    sm: {
      badge: 'text-2xs leading-none',
      segment: ' px-1 min-h-[16px]',
    },
    md: {
      badge: 'text-xs leading-none',
      segment: 'px-1.5 min-h-[20px]',
    },
  };

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
    {
      translationId: I18nKey;
      colorScheme: BadgeStatusColorScheme;
      impliedExtensions: BadgeStatusExtensions;
    }
  > = {
    Running: {
      translationId: 'workflows.running',
      colorScheme: 'info',
      impliedExtensions: [],
    },
    Paused: {
      translationId: 'workflows.paused',
      colorScheme: 'info',
      impliedExtensions: [
        {
          colorScheme: 'warning',
          TrailIcon: IconPause,
        },
      ],
    },
    Completed: {
      translationId: 'workflows.completed',
      colorScheme: 'success',
      impliedExtensions: [],
    },
    ContinuedAsNew: {
      translationId: 'workflows.continued-as-new',
      colorScheme: 'success',
      impliedExtensions: [],
    },
    Failed: {
      translationId: 'workflows.failed',
      colorScheme: 'danger',
      impliedExtensions: [],
    },
    TimedOut: {
      translationId: 'workflows.timed-out',
      colorScheme: 'error',
      impliedExtensions: [],
    },
    Terminated: {
      translationId: 'workflows.terminated',
      colorScheme: 'warning',
      impliedExtensions: [],
    },
    Canceled: {
      translationId: 'workflows.canceled',
      colorScheme: 'neutral',
      impliedExtensions: [],
    },
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: BadgeStatusValue;
    size?: BadgeStatusSize;
    text?: string;
    count?: string | number;
    TrailIcon?: ConditionalValue<IconComponent>;
    /** some statuses such as 'Paused' imply an extension (a pause icon)
     *  this is an escape hatch for when you do not want those extensions.
     */
    showImpliedExtensions?: boolean;
    extensions?: ConditionalValue<BadgeStatusExtensions>;
    class?: string;
  }

  let {
    status,
    size = 'md',
    text,
    count,
    TrailIcon,
    showImpliedExtensions = true,
    extensions,
    class: className,
    ...rest
  }: Props = $props();

  const configuration = $derived(statusConfiguration[status]);
  const visibleExtensions = $derived.by(() => {
    return [
      ...(showImpliedExtensions ? configuration.impliedExtensions : []),
      ...(extensions || []),
    ].filter(isBadgeStatusExtension);
  });
</script>

<span
  class={twMerge(sizeClasses[size].badge, sharedClasses, className)}
  {...rest}
>
  <span
    class={twMerge(
      segmentClasses,
      sizeClasses[size].segment,
      colorSchemeClasses[configuration.colorScheme],
      'min-w-0',
      visibleExtensions.length ? 'rounded-l-full border-r-0' : 'rounded-full',
    )}
  >
    <span class="-my-0.5 truncate py-0.5">
      {#if typeof count === 'number'}
        {count.toLocaleString()}
        {text ?? translate(configuration.translationId)}
      {:else if count != null}
        {count} {text ?? translate(configuration.translationId)}
      {:else}
        {text ?? translate(configuration.translationId)}
      {/if}
    </span>
    {#if TrailIcon}
      <TrailIcon width="1em" height="1em" />
    {/if}
  </span>
  {#each visibleExtensions as extension, index (index)}
    <span
      class={twMerge(
        segmentClasses,
        sizeClasses[size].segment,
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
