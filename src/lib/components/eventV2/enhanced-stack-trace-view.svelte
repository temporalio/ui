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
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EnhancedStackTrace from './event-summary-card/enhanced-stack-trace.svelte';
  import EnhancedStackTraceCard from './enhanced-stack-trace-card.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];
  export let importingHistory: boolean = false;
  export let showNonCompleted = false;
  export let showWorkflowTasks = false;
  export let stacks = {};
  export let timeTravelPosition = 1;

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
  $: currentStacks = Object.values(stacks)[timeTravelPosition - 1];
</script>

<div class="flex flex-row gap-0 pt-4">
  <div class="flex w-full flex-col gap-2 xl:w-[50%]">
    {#each currentStacks as stack}
      <EnhancedStackTrace {...stack} />
    {/each}
  </div>
  <div class="flex w-full flex-col gap-2 xl:w-[50%]">
    {#each currentStacks as stack}
      {#each stack.eventIds as id}
        <EnhancedStackTraceCard
          event={currentEvents.find((event) => event.eventId === id.toString())}
          events={currentEvents}
          {firstEvent}
        />
      {/each}
    {/each}
  </div>
</div>
