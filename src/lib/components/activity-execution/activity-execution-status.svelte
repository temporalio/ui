<script lang="ts" module>
  import type { BadgeType } from '$lib/holocene/badge.svelte';
  import type { ActivityExecutionStatus } from '$lib/types/activity-execution';

  export const activityStatusToBadgeType: Record<
    ActivityExecutionStatus,
    BadgeType
  > = {
    ACTIVITY_EXECUTION_STATUS_RUNNING: 'primary',
    ACTIVITY_EXECUTION_STATUS_COMPLETED: 'success',
    ACTIVITY_EXECUTION_STATUS_CANCELED: 'warning',
    ACTIVITY_EXECUTION_STATUS_FAILED: 'danger',
    ACTIVITY_EXECUTION_STATUS_TERMINATED: 'warning',
    ACTIVITY_EXECUTION_STATUS_TIMED_OUT: 'warning',
    ACTIVITY_EXECUTION_STATUS_UNSPECIFIED: 'default',
  };

  export const activityStatusToLabel: Record<ActivityExecutionStatus, string> =
    {
      ACTIVITY_EXECUTION_STATUS_COMPLETED: 'Completed',
      ACTIVITY_EXECUTION_STATUS_RUNNING: 'Running',
      ACTIVITY_EXECUTION_STATUS_CANCELED: 'Canceled',
      ACTIVITY_EXECUTION_STATUS_FAILED: 'Failed',
      ACTIVITY_EXECUTION_STATUS_TERMINATED: 'Terminated',
      ACTIVITY_EXECUTION_STATUS_TIMED_OUT: 'Timed Out',
      ACTIVITY_EXECUTION_STATUS_UNSPECIFIED: 'Unspecified',
    };
</script>

<script lang="ts">
  import HeartbeatIndicator from '$lib/components/heart-beat-indicator.svelte';
  import Badge from '$lib/holocene/badge.svelte';

  interface Props {
    status: ActivityExecutionStatus;
  }

  let { status }: Props = $props();
</script>

<Badge class="flex items-center gap-1" type={activityStatusToBadgeType[status]}>
  {activityStatusToLabel[status]}
  {#if status === 'ACTIVITY_EXECUTION_STATUS_RUNNING'}
    <HeartbeatIndicator />
  {/if}
</Badge>
