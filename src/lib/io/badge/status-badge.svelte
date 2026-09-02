<script lang="ts" module>
  import type { BadgeVariant, StatusBadgeStatus } from './types';

  const statusConfiguration: Record<
    StatusBadgeStatus,
    { text: string; variant: BadgeVariant }
  > = {
    Running: { text: 'running', variant: 'info' },
    Paused: { text: 'paused', variant: 'info' },
    Completed: { text: 'complete', variant: 'success' },
    ContinuedAsNew: { text: 'continued as new', variant: 'success' },
    Failed: { text: 'failed', variant: 'danger' },
    TimedOut: { text: 'timed out', variant: 'error' },
    Terminated: { text: 'terminated', variant: 'warning' },
    Canceled: { text: 'cancelled', variant: 'neutral' },
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { BadgeExtension, BadgeSegment } from './types';

  import BaseBadge from './_badge.svelte';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: StatusBadgeStatus;
    TrailIcon?: BadgeSegment['TrailIcon'];
    extension?: BadgeExtension;
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
  const segments = $derived<BadgeSegment[]>([
    { text: configuration.text, TrailIcon },
    ...(extension
      ? [
          {
            text: extension.text ?? '',
            LeadIcon: extension.LeadIcon,
            TrailIcon: extension.TrailIcon,
          },
        ]
      : []),
  ]);
</script>

<BaseBadge
  variant={configuration.variant}
  {segments}
  class={className}
  {...rest}
/>
