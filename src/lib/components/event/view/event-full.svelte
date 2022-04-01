<script lang="ts">
  import { page } from '$app/stores';

  import LoadingRow from '$lib/components/loading-row.svelte';
  import Pagination from '$lib/components/pagination.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from '../event-empty-row.svelte';

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
    floatId="event-view-toggle"
    let:visibleItems
  >
    <EventSummaryTable>
      {#each visibleItems as event (event.id)}
        <EventSummaryRow {event} expanded />
      {/each}
      {#if !items.length}
        <EventEmptyRow />
      {/if}
    </EventSummaryTable>
  </Pagination>
{/await}
