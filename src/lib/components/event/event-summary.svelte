<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { filteredEventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
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

  $: getEventsOrGroups = (
    items: CommonHistoryEvent[],
    category?: string[],
  ): IterableEvent[] => {
    if (category) {
      const filteredItems = items.filter((i) => {
        if (isLocalActivityMarkerEvent(i)) {
          return category.includes(CATEGORIES.LOCAL_ACTIVITY);
        }
        return category.includes(i.category);
      });
      return compact ? groupEvents(filteredItems, 'ascending') : filteredItems;
    }
    return compact ? groupEvents(items, 'ascending') : items;
  };

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  $: initialItem = $fullEventHistory?.[0];
  $: items =
    $eventFilterSort === 'descending'
      ? [
          ...getEventsOrGroups($filteredEventHistory, $eventCategoryFilter),
        ].reverse()
      : getEventsOrGroups($filteredEventHistory, $eventCategoryFilter);
  $: updating = !$fullEventHistory.length;
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
  <svelte:fragment slot="action-top-left">
    <div class="flex flex-col items-center md:items-start">
      <ToggleButtons>
        <ToggleButton
          active={!compact}
          data-testid="all"
          on:click={() => (compact = false)}>All</ToggleButton
        >
        <ToggleButton
          active={compact}
          data-testid="compact"
          on:click={() => (compact = true)}>Compact</ToggleButton
        >
      </ToggleButtons>
    </div>
  </svelte:fragment>
  <EventSummaryTable {updating} on:expandAll={handleExpandChange}>
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
      <EventEmptyRow loading={!$fullEventHistory.length} />
    {/each}
  </EventSummaryTable>
</Pagination>
