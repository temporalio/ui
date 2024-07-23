<script lang="ts">
  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
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
  aria-label={translate('workflows.event-history')}
  pageSizeSelectLabel={translate('common.per-page')}
  previousButtonLabel={translate('common.previous')}
  nextButtonLabel={translate('common.next')}
>
  <EventSummaryTable on:expandAll={handleExpandChange}>
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
      />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</Pagination>
