<script lang="ts">
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter, eventStatusFilter } from '$lib/stores/filters';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
    IterableEvent,
  } from '$lib/types/events';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import EventEmptyRow from './event-empty-row.svelte';

  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const getEventsOrGroups = (
    items: CommonHistoryEvent[],
    category: string,
    status: string,
  ): IterableEvent[] => {
    let filteredItems = [...items];
    if (category) {
      filteredItems = filteredItems.filter((i) => {
        if (category === CATEGORIES.LOCAL_ACTIVITY) {
          return isLocalActivityMarkerEvent(i);
        }
        return i.category === category;
      });
    }

    if (!compact) {
      if (status) {
        return filteredItems.filter((i) => i.classification === status);
      }
      return filteredItems;
    }

    const groups = groupEvents(filteredItems, $eventFilterSort);
    if (status) {
      return groups.filter((g) => g.status === status);
    }
    return groups;
  };

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: status = $eventStatusFilter;
  $: intialEvents =
    $eventFilterSort === 'descending' && !compact
      ? $eventHistory?.end
      : $eventHistory?.start;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : intialEvents;
  $: initialItem = currentEvents?.[0];
  $: items = getEventsOrGroups(currentEvents, category, status);
  $: updating = currentEvents.length && !$fullEventHistory.length;
</script>

<Pagination
  floatId="event-view-toggle"
  {items}
  {updating}
  let:visibleItems
  let:activeRowIndex
  let:setActiveRowIndex
  aria-label={translate('workflows.event-history')}
  pageSizeSelectLabel={translate('common.per-page')}
  previousButtonLabel={translate('common.previous')}
  nextButtonLabel={translate('common.next')}
>
  <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event, index (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        active={activeRowIndex === index}
        onRowClick={() => setActiveRowIndex(index)}
      />
    {:else}
      <EventEmptyRow loading={!intialEvents.length} />
    {/each}
  </EventSummaryTable>
</Pagination>
