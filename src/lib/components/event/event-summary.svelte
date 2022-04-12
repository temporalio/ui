<script lang="ts">
  import Pagination from '$lib/components/pagination.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';

  export let items: IterableEvents;
  export let groups: CompactEventGroups;
  export let expandAll = false;
  export let compact = false;
</script>

<Pagination {items} floatId="event-view-toggle" let:visibleItems>
  <EventSummaryTable {compact}>
    {#each visibleItems as event (event.id)}
      <EventSummaryRow {event} {groups} {expandAll} {compact} />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</Pagination>
