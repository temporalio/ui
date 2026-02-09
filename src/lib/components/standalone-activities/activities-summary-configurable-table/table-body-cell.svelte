<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { formatDistance } from '$lib/utilities/format-time';
  import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { routeForStandaloneActivityDetails } from '$lib/utilities/route-for';

  import FilterableTableCell from './filterable-table-cell.svelte';

  type Props = {
    column: ConfigurableTableHeader;
    activity: ActivityExecutionInfo;
  };
  let { column, activity }: Props = $props();

  const { label } = $derived(column);
  const namespace = $derived(page.params.namespace);

  let filterOrCopyButtonsVisible = $state(false);
  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);
  const handleFocusOut = (e: FocusEvent) => {
    const nextTarget = e.relatedTarget as HTMLElement;
    if (
      nextTarget &&
      !['filter-button', 'copy-button'].includes(nextTarget.id)
    ) {
      hideFilterOrCopy();
    }
  };

  const filterableLabels = ['Activity ID', 'Activity Type', 'Task Queue'];
</script>

{#if filterableLabels.includes(label)}
  <td
    class="relative h-8 whitespace-nowrap pr-24"
    data-testid="activities-summary-table-body-cell"
    onmouseover={showFilterOrCopy}
    onfocus={showFilterOrCopy}
    onfocusin={showFilterOrCopy}
    onfocusout={handleFocusOut}
    onmouseleave={hideFilterOrCopy}
    onblur={hideFilterOrCopy}
  >
    {#if label === 'Activity ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="ActivityId"
        value={activity.activityId}
        href={routeForStandaloneActivityDetails({
          namespace,
          activityId: activity.activityId,
        })}
      />
    {:else if label === 'Activity Type'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="ActivityType"
        value={activity.activityType?.name ?? ''}
      />
    {:else if label === 'Task Queue'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TaskQueue"
        value={activity.taskQueue ?? ''}
      />
    {/if}
  </td>
{:else}
  <td
    class="h-8 whitespace-nowrap"
    data-testid="activities-summary-table-body-cell"
  >
    {#if label === 'Status'}
      <WorkflowStatus status={toActivityStatus(activity.status)} />
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
{/if}
