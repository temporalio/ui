<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { clearActives } from '$lib/stores/active-events';
  import {
    eventFilterSort,
    eventViewType,
    minimizeEventView,
  } from '$lib/stores/event-view';
  import { currentEventHistory, fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  export let namespace = page.params.namespace;
  export let workflowId = page.params.workflow;
  export let runId = page.params.run;

  let workflowRunController: AbortController;

  // $: pendingActivities = workflow?.pendingActivities;
  // $: pendingNexusOperations = workflow?.pendingNexusOperations;
  $: reverseSort = $eventFilterSort === 'descending';
  $: currentExecution =
    workflowId === $workflowRun.workflow.id &&
    runId === $workflowRun.workflow.runId;

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $currentEventHistory,
    'ascending',
  );

  $: $eventViewType, clearActives();

  beforeNavigate(() => {
    clearActives();
  });

  const getWorkflowAndEventHistory = async (): Promise<
    [WorkflowExecution, WorkflowEvents, EventGroups]
  > => {
    const result = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });
    const workflow = result.workflow;

    workflowRunController = new AbortController();

    const history = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
      signal: workflowRunController.signal,
      historySize: workflow.historyEvents,
    });
    const ascendingGroups = groupEvents(history, 'ascending', [], []);
    const groups = reverseSort
      ? [...ascendingGroups].reverse()
      : ascendingGroups;

    return [workflow, history, groups];
  };

  // const abortPolling = () => {
  //   if (workflowRunController) {
  //     workflowRunController.abort();
  //   }
  // };
</script>

{#if currentExecution}
  {@const ascendingGroups = groupEvents($fullEventHistory, 'ascending', [], [])}
  {@const groups = reverseSort
    ? [...ascendingGroups].reverse()
    : ascendingGroups}
  <div class="flex flex-col gap-0 px-4 pt-4 xl:px-8">
    <div class="flex flex-col gap-2">
      <InputAndResults
        showTitle={false}
        workflow={$workflowRun.workflow}
        history={$fullEventHistory}
      />
    </div>
  </div>
  <div class="relative px-4 pb-24 xl:px-8">
    <div class="flex w-full flex-col border-t border-subtle">
      <TimelineGraph
        workflow={$workflowRun.workflow}
        {groups}
        {workflowTaskFailedError}
        viewportHeight={$minimizeEventView ? 360 : undefined}
      />
      <EventSummary
        {groups}
        history={$fullEventHistory}
        minimized={$minimizeEventView}
      />
    </div>
  </div>
{:else}
  {#await getWorkflowAndEventHistory() then [workflow, history, groups]}
    <div class="flex flex-col gap-0 px-4 pt-4 xl:px-8">
      <div class="flex flex-col gap-2">
        <InputAndResults showTitle={false} {workflow} {history} />
      </div>
    </div>
    <div class="relative px-4 pb-24 xl:px-8">
      <div class="flex w-full flex-col border-t border-subtle">
        <TimelineGraph
          {workflow}
          {groups}
          {workflowTaskFailedError}
          viewportHeight={$minimizeEventView ? 360 : undefined}
        />
        <EventSummary {groups} {history} minimized={$minimizeEventView} />
      </div>
    </div>
  {/await}
{/if}
