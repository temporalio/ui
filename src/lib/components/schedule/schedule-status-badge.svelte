<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import {
    BadgeStatus,
    type BadgeStatusExtensions,
  } from '$lib/io/badge-status';
  import { IconPause } from '$lib/io/icon';
  import type { ScheduleStatus } from '$lib/types/schedule';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: ScheduleStatus;
  }

  let { status, ...rest }: Props = $props();

  const extensions = $derived.by<BadgeStatusExtensions>(() => {
    switch (status) {
      case 'Paused': {
        return [
          {
            colorScheme: 'warning',
            TrailIcon: IconPause,
          },
        ];
      }

      default: {
        return [];
      }
    }
  });
</script>

<BadgeStatus {status} {extensions} {...rest} data-testid="schedule-status" />
