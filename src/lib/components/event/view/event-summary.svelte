<script lang="ts">
  import LoadingRow from '$lib/components/loading-row.svelte';
  import Pagination from '$lib/components/pagination.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from '../event-empty-row.svelte';

  export let items: HistoryEventWithId[];
</script>

{#await items}
  <LoadingRow />
{:then items}
  <Pagination {items} floatId="event-view-toggle" let:visibleItems>
    <EventSummaryTable>
      {#each visibleItems as event (event.id)}
        <EventSummaryRow {event} />
      {/each}
      {#if !items?.length}
        <EventEmptyRow />
      {/if}
    </EventSummaryTable>
  </Pagination>
{/await}
