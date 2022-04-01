<script lang="ts">
  import Pagination from '$lib/components/pagination.svelte';
  import LoadingRow from '$lib/components/loading-row.svelte';

  import EventCompactTable from '$lib/components/event/event-compact-table.svelte';
  import EventCompactRow from '$lib/components/event/event-compact-row.svelte';
  import EventEmptyRow from '../event-empty-row.svelte';

  export let items: IterableEvents;
</script>

{#await items}
  <LoadingRow />
{:then items}
  <Pagination {items} floatId="event-view-toggle" let:visibleItems>
    <EventCompactTable>
      {#each visibleItems as eventGroup (eventGroup.id)}
        <EventCompactRow {eventGroup} />
      {/each}
      {#if !items?.length}
        <EventEmptyRow />
      {/if}
    </EventCompactTable>
  </Pagination>
{/await}
