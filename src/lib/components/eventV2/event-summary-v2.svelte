<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import { groupEvents } from '$lib/models/event-groups';
  import EventGroupSummaryCard from './event-group-summary-card.svelte';
  import InitialEventCard from './initial-event-card.svelte';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { importEvents } from '$lib/stores/import-events';
  import RunningCard from './running-card.svelte';
  import FinalEventCard from './final-event-card.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];
  export let importingHistory: boolean = false;
  export let showNonCompleted = false;
  export let showWorkflowTasks = false;
  export let showStackTrace = false;
  export let stackTrace;

  const getGroups = (
    events: CommonHistoryEvent[],
    showNonCompleted: boolean,
    showWorkflowTasks: boolean,
  ): EventGroups => {
    return groupEvents(
      events,
      'ascending',
      $workflowRun?.workflow?.pendingActivities ?? [],
      {
        createWorkflowTaskGroups: showWorkflowTasks,
        nonCompletedEventsOnly: showNonCompleted,
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
  $: groups = getGroups(currentEvents, showNonCompleted, showWorkflowTasks);
  $: firstEvent = currentEvents?.[0];
  $: lastEvent = currentEvents?.[currentEvents?.length - 1];
  $: uniqueLastEvent =
    lastEvent &&
    lastEvent.id !== firstEvent.id &&
    !groups.find(
      (group) =>
        group.eventList.find((e) => e.id === lastEvent.id) ||
        group.subGroupList.find((g) =>
          g.eventList.find((e) => e.id === lastEvent.id),
        ),
    );

  $: ({ input, results } =
    getWorkflowStartedCompletedAndTaskFailedEvents(history));
  $: resultStackTrace = results && getStackTrace(parseWithBigInt(results));
</script>

<div class="flex w-full flex-col gap-0">
  {#if firstEvent}
    <InitialEventCard
      event={firstEvent}
      events={currentEvents}
      content={showStackTrace ? stackTrace : input}
      {showStackTrace}
    />
  {/if}
  {#each groups as event}
    <EventGroupSummaryCard {event} events={groups} {firstEvent} />
  {/each}
  {#if uniqueLastEvent}
    <FinalEventCard
      event={lastEvent}
      events={currentEvents}
      content={results}
      stackTrace={resultStackTrace}
      {firstEvent}
    />
  {/if}
  {#if $workflowRun?.workflow?.isRunning}
    <RunningCard />
  {/if}
</div>
