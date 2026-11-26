<script lang="ts" module>
  import {
    Badge,
    type BadgeColorScheme,
    type BadgeExtension,
    type BadgeExtensions,
    type BadgeSize,
  } from '../badge';
  import { type IconComponent, IconPause } from '../icon';
  import type { IoTranslationKey } from '../i18n';
  import type { ConditionalValue } from '../types';

  export type BadgeStatusValue =
    | 'Running'
    | 'Paused'
    | 'Completed'
    | 'ContinuedAsNew'
    | 'Failed'
    | 'TimedOut'
    | 'Terminated'
    | 'Canceled';

  export type BadgeStatusColorScheme = BadgeColorScheme;

  export type BadgeStatusSize = BadgeSize;

  export type BadgeStatusExtension = BadgeExtension;

  export type BadgeStatusExtensions = BadgeExtensions;

  const statusConfiguration: Record<
    BadgeStatusValue,
    {
      translationId: IoTranslationKey;
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
          truncate: false,
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

  import { getIoTranslate } from '../i18n';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: BadgeStatusValue;
    size?: BadgeStatusSize;
    truncate?: boolean;
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
    truncate = true,
    text,
    count,
    TrailIcon,
    showImpliedExtensions = true,
    extensions,
    class: className,
    ...rest
  }: Props = $props();

  const translate = getIoTranslate();

  const configuration = $derived(statusConfiguration[status]);
  const label = $derived.by(() => {
    const statusText = text ?? translate(configuration.translationId);
    if (count == null) return statusText;

    const displayCount =
      typeof count === 'number' ? count.toLocaleString() : count;
    return `${displayCount} ${statusText}`;
  });

  const badgeExtensions = $derived([
    ...(showImpliedExtensions ? configuration.impliedExtensions : []),
    ...(extensions || []),
  ]);
</script>

<Badge
  {...rest}
  {size}
  {truncate}
  text={label}
  colorScheme={configuration.colorScheme}
  Icon={TrailIcon}
  extensions={badgeExtensions}
  class={className}
/>
