<script lang="ts">
  import { page } from '$app/stores';

  import LoadingRow from '$lib/components/loading-row.svelte';
  import Pagination from '$lib/components/pagination.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let items: HistoryEventWithId[];

  const startingIndex = items.findIndex(
    ({ id }) => $page.params.eventId === id,
  );
</script>

{#await items}
  <LoadingRow />
{:then items}
  <Pagination
    {items}
    {startingIndex}
    floatElementId="event-view-toggle"
    let:visibleItems
  >
    <EventSummaryTable>
      {#each visibleItems as event (event.id)}
        <EventSummaryRow {event} />
      {/each}
      {#if !items.length}
        <EmptyState
          title="No Events Match"
          content="There are no events that match your filters. Adjust your filters to see your events."
        />
      {/if}
    </EventSummaryTable>
  </Pagination>
{/await}
