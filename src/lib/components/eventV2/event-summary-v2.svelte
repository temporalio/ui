<script lang="ts">
  import { page } from '$app/stores';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';
  import { authUser } from '$lib/stores/auth-user';

  import { groupEvents, isEventGroup } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import EventGroupSummaryCard from './event-group-summary-card.svelte';
  import InitialEventCard from './initial-event-card.svelte';
  import LastEventCard from './last-event-card.svelte';
  import {
    getWorkflowStartedCompletedAndTaskFailedEvents,
    isCompletionEvent,
  } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { importEvents } from '$lib/stores/import-events';
  import PendingActivityCard from './pending-activity-card.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { isWorkflowExecutionCompletedEvent } from '$lib/utilities/is-event-type';

  export let importingHistory = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  let fullHistory: CommonHistoryEvent[] = [];

  const resetFullHistory = () => {
    fullHistory = [];
  };

  const onUpdate = async ({ history }) => {
    const { settings } = $page.data;
    fullHistory = await toEventHistory({
      response: history.events,
      namespace,
      settings,
      accessToken: $authUser?.accessToken,
    });
    const lastEvent = fullHistory[fullHistory.length - 1];
    if (isCompletionEvent(lastEvent)) {
      $refresh = Date.now();
    }
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (!importingHistory) {
      const { settings } = $page.data;
      resetFullHistory();
      fullHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
        settings,
        accessToken: $authUser?.accessToken,
        sort: 'ascending',
        onUpdate,
      });
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  const getGroups = (
    events: CommonHistoryEvent[],
    category: string,
  ): EventGroups => {
    if (category) {
      const filteredEvents = events.filter((i) => i.category === category);
      return groupEvents(
        filteredEvents,
        'ascending',
        $workflowRun?.workflow?.pendingActivities ?? [],
      );
    }
    return groupEvents(
      events,
      'ascending',
      $workflowRun?.workflow?.pendingActivities ?? [],
    );
  };

  // Make into derived store?
  $: history = importingHistory
    ? { start: $importEvents, end: $importEvents }
    : $eventHistory;
  $: category = $page.url.searchParams.get('category');
  $: intialEvents = history.start;
  $: currentEvents = importingHistory
    ? $importEvents
    : fullHistory.length
    ? fullHistory
    : intialEvents;
  $: items = getGroups(currentEvents, category);
  $: initialItem = currentEvents?.[0];
  $: finalItem = currentEvents?.[currentEvents?.length - 1];
  $: uniqueFinalItem =
    finalItem &&
    finalItem.id !== initialItem.id &&
    !items.find(
      (group) =>
        group.eventList.find((e) => e.id === finalItem.id) ||
        group.subGroupList.find((g) =>
          g.eventList.find((e) => e.id === finalItem.id),
        ),
    );

  $: ({ input, results } =
    getWorkflowStartedCompletedAndTaskFailedEvents(history));
  $: stackTrace = results && getStackTrace(parseWithBigInt(results));
</script>

<div class="flex gap-4">
  <div class="flex w-full flex-col gap-0">
    {#if initialItem}
      <InitialEventCard
        event={initialItem}
        {input}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
    {#each items as item}
      <EventGroupSummaryCard event={item} visibleItems={items} {initialItem} />
      {#if isEventGroup(item) && item?.subGroupList?.length}
        <div class="flex w-full flex-col pl-12">
          {#each item?.subGroupList as group}
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
    {#if uniqueFinalItem}
      <LastEventCard
        event={finalItem}
        {results}
        {stackTrace}
        visibleItems={currentEvents}
        {initialItem}
      />
    {/if}
  </div>
</div>
