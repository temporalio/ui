<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
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

  const filterableLabels = ['Activity ID', 'Run ID', 'Type', 'Task Queue'];

  const className = 'h-8 whitespace-nowrap';
  const testId = 'activities-summary-table-body-cell';
</script>

{#snippet renderFilterableTableCell(
  filterableCellProps: Pick<
    ComponentProps<typeof FilterableTableCell>,
    'attribute' | 'value' | 'href'
  >,
)}
  <FilterableTableCell
    class={className}
    data-testid={testId}
    {...filterableCellProps}
  />
{/snippet}

{#if filterableLabels.includes(label)}
  {#if label === 'Activity ID'}
    {@render renderFilterableTableCell({
      attribute: 'ActivityId',
      value: activity.activityId ?? '',
      href: routeForStandaloneActivityDetails({
        namespace,
        activityId: activity.activityId ?? '',
        runId: activity.runId ?? '',
      }),
    })}
  {:else if label === 'Run ID'}
    {@render renderFilterableTableCell({
      attribute: 'RunId',
      value: activity.runId ?? '',
      href: routeForStandaloneActivityDetails({
        namespace,
        activityId: activity.activityId ?? '',
        runId: activity.runId ?? '',
      }),
    })}
  {:else if label === 'Type'}
    {@render renderFilterableTableCell({
      attribute: 'ActivityType',
      value: activity.activityType?.name ?? '',
    })}
  {:else if label === 'Task Queue'}
    {@render renderFilterableTableCell({
      attribute: 'TaskQueue',
      value: activity.taskQueue ?? '',
    })}
  {/if}
{:else}
  <td class={className} data-testid={testId}>
    {#if label === 'Status'}
      <WorkflowStatus status={toActivityStatus(activity.status)} />
    {:else if label === 'Start'}
      <Timestamp dateTime={activity.scheduleTime} />
    {:else if label === 'End'}
      <Timestamp dateTime={activity.closeTime} />
    {:else if label === 'Execution Duration'}
      {#if activity.executionDuration}
        {formatDurationAbbreviated(activity.executionDuration)}
      {/if}
    {:else if label === 'State Transitions'}
      {activity.stateTransitionCount ?? ''}
    {:else if label === 'Execution Time'}
      <Timestamp dateTime={activity.executionTime} />
    {/if}
  </td>
{/if}
