<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import { groupEvents, isEventGroup } from '$lib/models/event-groups';
  import EventGroupSummaryCard from './event-group-summary-card.svelte';
  import InitialEventCard from './initial-event-card.svelte';
  import LastEventCard from './last-event-card.svelte';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { importEvents } from '$lib/stores/import-events';
  import RunningCard from './running-card.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];
  export let importingHistory: boolean = false;
  export let debugMode = false;

  const getGroups = (
    events: CommonHistoryEvent[],
    category: string,
    debugMode: boolean,
  ): EventGroups => {
    if (category) {
      const filteredEvents = events.filter((i) => i.category === category);
      return groupEvents(
        filteredEvents,
        'ascending',
        $workflowRun?.workflow?.pendingActivities ?? [],
        {
          createSubGroups: true,
          includeWorkflowTasks: true,
          nonCompletedEventsOnly: debugMode,
        },
      );
    }
    return groupEvents(
      events,
      'ascending',
      $workflowRun?.workflow?.pendingActivities ?? [],
      {
        createSubGroups: true,
        includeWorkflowTasks: true,
        nonCompletedEventsOnly: debugMode,
      },
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
  $: items = getGroups(currentEvents, category, debugMode);
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

<div class="flex w-full flex-col gap-0">
  {#if initialItem}
    <InitialEventCard event={initialItem} content={input} />
  {/if}
  {#each items as item}
    <EventGroupSummaryCard event={item} visibleItems={items} {initialItem}>
      <svelte:fragment slot="subgroups">
        {#if isEventGroup(item) && item?.subGroupList?.length}
          <div class="flex w-full flex-col pl-12">
            {#each item?.subGroupList as group, index}
              <EventGroupSummaryCard
                isSubGroup
                event={group}
                visibleItems={items}
                {initialItem}
                removeTail={index === item?.subGroupList.length - 1}
              />
            {/each}
          </div>
        {/if}
      </svelte:fragment>
    </EventGroupSummaryCard>
  {/each}
  {#if uniqueFinalItem}
    <LastEventCard
      event={finalItem}
      content={results}
      {stackTrace}
      {initialItem}
      visibleItems={currentEvents}
    />
  {/if}
  {#if $workflowRun?.workflow.isRunning}
    <RunningCard />
  {/if}
</div>
