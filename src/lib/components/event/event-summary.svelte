<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { authUser } from '$lib/stores/auth-user';
  import {
    eventFilterSort,
    type EventSortOrder,
    expandAllEvents,
  } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflow-run';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
    IterableEvent,
  } from '$lib/types/events';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import EventEmptyRow from './event-empty-row.svelte';

  export let compact = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  let loading = true;
  let hash = '';

  const resetFullHistory = () => {
    $fullEventHistory = [];
    loading = true;
  };

  onMount(() => {
    hash = $page.url.hash;
  });

  function scrollIntoView(target) {
    // does the id exist in history if not return/remove from url
    const element = document.getElementById(target);
    if (!element) return;

    goto(`${$page.url}`, { noScroll: true }).then(() => {
      console.log(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    sort: EventSortOrder,
  ) => {
    const { settings } = $page.data;
    resetFullHistory();
    $fullEventHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: $authUser?.accessToken,
      sort: compact ? 'ascending' : sort,
    });
    loading = false;
    setTimeout(() => {
      scrollIntoView(hash.slice(1));
    }, 250);
  };

  $: $refresh, fetchEvents(namespace, workflowId, runId, $eventFilterSort);

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
  aria-label={translate('workflows', 'recent-events')}
  pageSizeSelectLabel={translate('per-page')}
  previousButtonLabel={translate('previous')}
  nextButtonLabel={translate('next')}
>
  <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event, index (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        active={activeRowIndex === index || event.id === hash.slice(1)}
        onRowClick={() => setActiveRowIndex(index)}
      />
    {:else}
      <EventEmptyRow {loading} />
    {/each}
  </EventSummaryTable>
</Pagination>
