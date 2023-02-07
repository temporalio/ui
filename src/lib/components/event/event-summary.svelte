<script lang="ts">
  import { page } from '$app/stores';
  import {
    eventFilterSort,
    type EventSortOrder,
    expandAllEvents,
  } from '$lib/stores/event-view';
  import { refresh } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';
  import { authUser } from '$lib/stores/auth-user';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';

  export let compact = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  let fullHistory: CommonHistoryEvent[] = [];
  let loading: boolean = true;

  const resetFullHistory = () => {
    fullHistory = [];
    loading = true;
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    sort: EventSortOrder,
  ) => {
    const { settings } = $page.data;
    resetFullHistory();
    fullHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: $authUser?.accessToken,
      sort: compact ? 'ascending' : sort,
    });
    loading = false;
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
      const filteredItems = items.filter((i) => i.category === category);
      return compact
        ? groupEvents(filteredItems, $eventFilterSort)
        : filteredItems;
    }
    return compact ? groupEvents(items, $eventFilterSort) : items;
  };

  $: category = $page.url.searchParams.get('category');
  $: intialEvents =
    $eventFilterSort === 'descending' && !compact
      ? $eventHistory?.end
      : $eventHistory?.start;
  $: currentEvents = fullHistory.length ? fullHistory : intialEvents;
  $: initialItem = currentEvents?.[0];
  $: items = getEventsOrGroups(currentEvents, category);
  $: updating = currentEvents.length && !fullHistory.length;
</script>

{#key [$eventFilterSort, category, $refresh]}
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
{/key}
