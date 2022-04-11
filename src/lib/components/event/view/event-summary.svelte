<script lang="ts">
  import Pagination from '$lib/components/pagination.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from '../event-empty-row.svelte';

  export let items: HistoryEventWithId[];
  export let expandAll = false;
</script>

<Pagination {items} floatId="event-view-toggle" let:visibleItems>
  <EventSummaryTable>
    {#each visibleItems as event (event.id)}
      <EventSummaryRow {event} {expandAll} />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</Pagination>
