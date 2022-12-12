<script lang="ts">
  import { page } from '$app/stores';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import KeyboardShortcut from '$lib/holocene/keyboard-shortcut/shortcut.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let fetchEvents = () => {
    return getPaginatedEvents({
      namespace,
      workflowId,
      runId,
      sort: $eventFilterSort,
      compact,
    });
  };

  const onPageReset = () => {
    if ($workflowRun.workflow.isRunning) {
      $refresh = Date.now();
    }
  };

  const onShiftUp = () => {
    if (!compact) {
      const sort = 'ascending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: 'ascending',
        url: $page.url,
      });
    }
  };

  const onShiftDown = () => {
    if (!compact) {
      const sort = 'descending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: sort,
        url: $page.url,
      });
    }
  };
</script>

<ApiPagination
  let:visibleItems
  let:initialItem
  let:updating
  let:activeRow
  onFetch={fetchEvents}
  onError={(error) => console.error(error)}
  pageSizeOptions={[]}
  {onShiftUp}
  {onShiftDown}
  {onPageReset}
  reset={$eventFilterSort}
  total={$eventHistory.end[0]?.id}
>
  <svelte:fragment slot="shortcuts">
    <KeyboardShortcut tooltipText="Open / Close Row">Space</KeyboardShortcut>
    {#if !compact}
      <Tooltip text="Ascending order" top>
        <div class="flex gap-1 text-gray-500 dark:text-gray-400">
          <KeyboardShortcut>Shift</KeyboardShortcut>
          +
          <KeyboardShortcut arrow="up" />
        </div>
      </Tooltip>
      <Tooltip text="Descending order" top>
        <div class="flex gap-1 text-gray-500 dark:text-gray-400">
          <KeyboardShortcut>Shift</KeyboardShortcut>
          +
          <KeyboardShortcut arrow="down" />
        </div>
      </Tooltip>
    {/if}
  </svelte:fragment>
  <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
    {#each compact ? groupEvents(visibleItems) : visibleItems as event, index (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        {visibleItems}
        active={activeRow === index}
      />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</ApiPagination>
