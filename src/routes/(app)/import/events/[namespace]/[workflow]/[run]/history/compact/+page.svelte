<script lang="ts">
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { importEventGroups } from '$lib/stores/import-events';

  $: sortedEvents =
    $eventFilterSort === 'descending'
      ? [...$importEventGroups].reverse()
      : $importEventGroups;
  $: filteredEventGroups = sortedEvents.filter((event: EventGroup) => {
    if ($eventCategoryFilter)
      return $eventCategoryFilter.includes(event.category);
    return event;
  });

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }
</script>

<EventSummaryTable
  items={filteredEventGroups}
  groups={filteredEventGroups}
  on:expandAll={handleExpandChange}
/>
