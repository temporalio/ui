<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { formatDistance } from '$lib/utilities/format-time';
  import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { routeForStandaloneActivityDetails } from '$lib/utilities/route-for';

  type Props = {
    column: ConfigurableTableHeader;
    activity: ActivityExecutionInfo;
  };
  let { column, activity }: Props = $props();

  const { label } = $derived(column);
  const namespace = $derived(page.params.namespace);
</script>

<td
  class="activities-summary-table-body-cell"
  data-testid="activities-summary-table-body-cell"
>
  {#if label === 'Status'}
    <WorkflowStatus status={toActivityStatus(activity.status)} />
  {:else if label === 'Activity ID'}
    <Link
      href={routeForStandaloneActivityDetails({
        namespace,
        activityId: activity.activityId,
      })}
    >
      {activity.activityId}
    </Link>
  {:else if label === 'Activity Type'}
    {activity.activityType?.name ?? ''}
  {:else if label === 'Task Queue'}
    {activity.taskQueue ?? ''}
  {:else if label === 'Run ID'}
    {activity.runId ?? ''}
  {:else if label === 'Start Time'}
    <Timestamp dateTime={activity.lastStartedTime || activity.scheduleTime} />
  {:else if label === 'Execution Time'}
    <Timestamp dateTime={activity.lastStartedTime} />
  {:else if label === 'Close Time'}
    <Timestamp dateTime={activity.closeTime} />
  {:else if label === 'Execution Duration'}
    {#if activity.executionDuration}
      {formatDistance({
        start: activity.lastStartedTime || activity.scheduleTime,
        end: activity.closeTime,
        includeMillisecondsForUnderSecond: true,
      })}
    {/if}
  {:else if label === 'State Transitions'}
    {activity.stateTransitionCount ?? ''}
  {/if}
</td>

<style lang="postcss">
  .activities-summary-table-body-cell {
    @apply h-8 whitespace-nowrap;
  }
</style>
