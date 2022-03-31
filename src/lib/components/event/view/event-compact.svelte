<script lang="ts">
  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import LoadingRow from '$lib/components/loading-row.svelte';

  import EventCompactTable from '$lib/components/event/event-compact-table.svelte';
  import EventCompactRow from '$lib/components/event/event-compact-row.svelte';

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
      {#if !items.length}
        <EmptyState title="No Events Found" />
      {/if}
    </EventCompactTable>
  </Pagination>
{/await}
