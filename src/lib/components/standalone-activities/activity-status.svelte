<script lang="ts" module>
  import type { ActivityExecutionStatus } from '$lib/types/activity-execution';

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
  import { cva } from 'class-variance-authority';
  import { twMerge } from 'tailwind-merge';

  import HeartbeatIndicator from '$lib/components/heart-beat-indicator.svelte';

  const activityStatus = cva(
    [
      'flex items-center rounded-sm px-4 py-0.5 whitespace-nowrap text-black gap-1 font-medium text-lg',
    ],
    {
      variants: {
        status: {
          ACTIVITY_EXECUTION_STATUS_RUNNING: 'bg-blue-300',
          ACTIVITY_EXECUTION_STATUS_TIMED_OUT: 'bg-orange-200',
          ACTIVITY_EXECUTION_STATUS_COMPLETED: 'bg-green-200',
          ACTIVITY_EXECUTION_STATUS_FAILED: 'bg-red-200',
          ACTIVITY_EXECUTION_STATUS_CANCELED: 'bg-slate-100',
          ACTIVITY_EXECUTION_STATUS_TERMINATED: 'bg-yellow-200',
          ACTIVITY_EXECUTION_STATUS_UNSPECIFIED: 'bg-slate-100',
        },
      },
    },
  );

  interface Props {
    status: ActivityExecutionStatus;
  }

  let { status }: Props = $props();
</script>

<div class={twMerge(activityStatus({ status }))}>
  {activityStatusToLabel[status]}
  {#if status === 'ACTIVITY_EXECUTION_STATUS_RUNNING'}
    <HeartbeatIndicator />
  {/if}
</div>
