<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import { groupEvents } from '$lib/models/event-groups';
  import EventGroupSummaryCard from './event-summary-card/card.svelte';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { importEvents } from '$lib/stores/import-events';
  import RunningCard from './running-card.svelte';
  import PendingActivityCard from './pending-activity-card.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];
  export let importingHistory: boolean = false;
  export let showNonCompleted = false;
  export let expandAll = false;
  export let showWorkflowTasks = false;

  const getGroups = (
    events: CommonHistoryEvent[],
    showNonCompleted: boolean,
    showWorkflowTasks: boolean,
  ): EventGroups => {
    return groupEvents(events, 'ascending', {
      createWorkflowTaskGroups: showWorkflowTasks,
      nonCompletedEventsOnly: showNonCompleted,
    });
  };

  // Make into derived store?
  $: history = importingHistory
    ? { start: $importEvents, end: $importEvents }
    : $eventHistory;
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

  $: ({ results } = getWorkflowStartedCompletedAndTaskFailedEvents(history));
  $: stackTrace = results && getStackTrace(parseWithBigInt(results));
</script>

<div class="flex w-full flex-col gap-0">
  {#if firstEvent}
    <EventGroupSummaryCard
      initial
      event={firstEvent}
      events={currentEvents}
      {firstEvent}
      {expandAll}
    />
  {/if}
  {#each groups as event}
    <EventGroupSummaryCard {event} events={groups} {firstEvent} {expandAll} />
  {/each}
  {#if uniqueLastEvent}
    <EventGroupSummaryCard
      event={lastEvent}
      events={currentEvents}
      {firstEvent}
      {expandAll}
    />
  {/if}
  {#each $workflowRun?.workflow?.pendingActivities ?? [] as activity}
    <EventGroupSummaryCard
      event={activity}
      events={currentEvents}
      {expandAll}
      pending
    />
  {/each}
  {#if $workflowRun?.workflow?.isRunning}
    <RunningCard />
  {/if}
</div>
