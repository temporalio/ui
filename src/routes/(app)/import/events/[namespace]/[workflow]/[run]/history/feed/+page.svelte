<script lang="ts">
  import { importEvents } from '$lib/stores/import-events';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';

  import type { EventTypeCategory, WorkflowEvent } from '$lib/types/events';

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: sortedEvents =
    $eventFilterSort === 'descending'
      ? [...$importEvents].reverse()
      : $importEvents;
  $: filteredEvents = sortedEvents.filter((event: WorkflowEvent) => {
    if (category) return event.category === category;
    return event;
  });

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  let compact = false;
</script>

<Pagination
  items={filteredEvents}
  floatId="event-view-toggle"
  let:visibleItems
  let:initialItem
  aria-label="recent events"
>
  <EventSummaryTable {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
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
