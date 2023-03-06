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

  import { groupEvents, isEventGroup } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import EventGroupSummaryCard from './event-group-summary-card.svelte';
  import SingleEventCard from './single-event-card.svelte';

  export let compact = true;

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
  <div class="flex w-full flex-col gap-0">
    {#if initialItem}
      <SingleEventCard
        event={initialItem}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
    {#each items as item}
      <EventGroupSummaryCard event={item} visibleItems={items} {initialItem} />
      {#if isEventGroup(item) && item?.subGroups?.length}
        <div class="flex w-full flex-col pl-12">
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
      <SingleEventCard
        event={finalItem}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
  </div>
</div>
