<script lang="ts">
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';

  import type {
    CommonHistoryEvent,
    EventTypeCategory,
    IterableEvent,
  } from '$lib/types/events';

  export let compact = false;

  let loading: boolean = true;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const getEventsOrGroups = (
    items: CommonHistoryEvent[],
    category: string,
  ): IterableEvent[] => {
    if (category) {
      const filteredItems = items.filter((i) => {
        if (category === CATEGORIES.LOCAL_ACTIVITY) {
          return isLocalActivityMarkerEvent(i);
        }
        return i.category === category;
      });
      return compact
        ? groupEvents(filteredItems, $eventFilterSort)
        : filteredItems;
    }
    return compact ? groupEvents(items, $eventFilterSort) : items;
  };

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: intialEvents =
    $eventFilterSort === 'descending' && !compact
      ? $eventHistory?.end
      : $eventHistory?.start;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : intialEvents;
  $: initialItem = currentEvents?.[0];
  $: items = getEventsOrGroups(currentEvents, category);
  $: updating = currentEvents.length && !$fullEventHistory.length;
</script>

<Pagination
  floatId="event-view-toggle"
  {items}
  {updating}
  let:visibleItems
  let:activeRowIndex
  let:setActiveRowIndex
  aria-label="recent events"
>
  <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event, index (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        {visibleItems}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        active={activeRowIndex === index}
        onRowClick={() => setActiveRowIndex(index)}
      />
    {:else}
      <EventEmptyRow {loading} />
    {/each}
  </EventSummaryTable>
</Pagination>
