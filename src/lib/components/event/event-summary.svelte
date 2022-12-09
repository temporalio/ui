<script lang="ts">
  import { page } from '$app/stores';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory, updating } from '$lib/stores/events';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { refresh } from '$lib/stores/workflow-run';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { groupEvents } from '$lib/models/event-groups';

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
    $refresh = Date.now();
  };
</script>

<ApiPagination
  let:visibleItems
  let:initialItem
  let:updating
  onFetch={fetchEvents}
  onError={(error) => console.error(error)}
  onArrowUp={() => ($eventFilterSort = 'descending')}
  onArrowDown={() => ($eventFilterSort = 'ascending')}
  {onPageReset}
  reset={$eventFilterSort}
  total={$eventHistory.end[0]?.id}
>
  <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
    {#each compact ? groupEvents(visibleItems) : visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        {visibleItems}
      />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</ApiPagination>
