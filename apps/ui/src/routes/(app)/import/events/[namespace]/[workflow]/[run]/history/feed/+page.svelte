<script lang="ts">
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { importEvents } from '$lib/stores/import-events';
  import type { WorkflowEvent } from '$lib/types/events';

  $: sortedEvents =
    $eventFilterSort === 'descending'
      ? [...$importEvents].reverse()
      : $importEvents;
  $: filteredEvents = sortedEvents.filter((event: WorkflowEvent) => {
    if ($eventCategoryFilter)
      return $eventCategoryFilter.includes(event.category);
    return event;
  });
</script>

<EventSummaryTable items={filteredEvents} />
