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
  import EventEmptyRow from '../event/event-empty-row.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';
  import Card from '$lib/holocene/card.svelte';
  import EventSummaryCard from './event-group-summary-card.svelte';
  import EventGroupSummaryCard from './event-group-summary-card.svelte';

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
  $: items = getEventsOrGroups(currentEvents, category);
  $: initialItem =
    $eventFilterSort === 'descending'
      ? currentEvents?.[currentEvents?.length - 1]
      : currentEvents?.[0];
  $: finalItem =
    $eventFilterSort === 'descending'
      ? currentEvents?.[0]
      : currentEvents?.[currentEvents?.length - 1];
</script>

<div class="flex gap-4">
  <div class="flex flex-col gap-0 w-full">
    {#if initialItem}
      <EventGroupSummaryCard
        event={initialItem}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
    {#each items as item}
      <EventGroupSummaryCard
        hasSubGroup={Boolean(item.subGroups.length)}
        event={item}
        visibleItems={items}
        {initialItem}
      />
      {#if item?.subGroups?.length}
        <div class="ml-8 flex flex-col gap-2 w-full">
          {#each item?.subGroups as group}
            <EventGroupSummaryCard
              isSubGroup
              event={group}
              visibleItems={items}
              {initialItem}
            />
          {/each}
        </div>
      {/if}
    {/each}
    {#if finalItem}
      <EventGroupSummaryCard
        event={finalItem}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
  </div>
</div>
