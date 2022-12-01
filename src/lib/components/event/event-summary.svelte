<script lang="ts">
  import { expandAllEvents } from '$lib/stores/event-view';

  import Pagination from '$holocene/pagination.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';

  export let items: IterableEvents;
  export let groups: EventGroups;
  export let loading = false;
  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }
</script>

{#if loading}
  <Loading />
{:else}
  <ApiPagination
    let:visibleItems
    onFetch={() => getNamespacesPaginatedUsage(currentPeriod)}
    onError={handlePaginationError}
  />
  <Pagination
    {items}
    floatId="event-view-toggle"
    let:visibleItems
    let:initialItem
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
  </Pagination>
{/if}
