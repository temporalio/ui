<script lang="ts">
  import { page } from '$app/stores';

  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { eventHistory } from '$lib/stores/events';

  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let fetchEvents = () => {
    console.log('fetching...');
    return getPaginatedEvents({
      namespace,
      workflowId,
      runId,
      sort: $eventFilterSort,
      compact,
    });
  };
</script>

<ApiPagination
  let:visibleItems
  let:initialItem
  let:updating
  onFetch={fetchEvents}
  onError={(error) => console.error(error)}
  reset={$eventFilterSort}
  total={$eventHistory.end[0]?.id}
>
  <EventSummaryTable {compact} on:expandAll={handleExpandChange} {updating}>
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
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
