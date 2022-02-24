<script lang="ts">
  import Pagination from './pagination.svelte';
  import Event from './event.svelte';
  import HistoryTable from './history-table.svelte';

  export let events: CompactEventGroups;
</script>

<Pagination items={events} let:visibleItems>
  <HistoryTable>
    {#each visibleItems as event (event.id)}
      <Event {event} />
    {/each}
  </HistoryTable>
</Pagination>
