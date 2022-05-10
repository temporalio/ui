<script lang="ts">
  import { expandAllEvents } from '$lib/stores/event-view';

  import Pagination from '$lib/components/pagination.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';

  export let items: IterableEvents;
  export let groups: EventGroups;
  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }
</script>

<Pagination
  {items}
  floatId="event-view-toggle"
  let:visibleItems
  let:initialItem
>
  <EventSummaryTable {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event (event.id)}
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
