<script lang="ts">
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { page } from '$app/stores';

  export let items: IterableEvents;
  export let groups: EventGroups;
  export let loading = false;
  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let fetchEvents = () =>
    getPaginatedEvents({
      namespace,
      workflowId,
      runId,
      sort: $eventFilterSort,
    });
</script>

{#if loading}
  <Loading />
{:else}
  <ApiPagination
    let:visibleItems
    let:initialItem
    onFetch={fetchEvents}
    onError={(error) => console.error(error)}
    reset={$eventFilterSort}
  >
    <EventSummaryTable {compact} on:expandAll={handleExpandChange}>
      {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
        <EventSummaryRow
          {event}
          {groups}
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
{/if}
