<script lang="ts">
  import { beforeNavigate } from '$app/navigation';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowCallback from '$lib/components/lines-and-dots/workflow-callback.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: ascendingGroups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );

  $: groups =
    $eventFilterSort === 'ascending'
      ? ascendingGroups
      : [...ascendingGroups].reverse();

  $: history =
    $eventFilterSort === 'ascending'
      ? $filteredEventHistory
      : [...$filteredEventHistory].reverse();

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $currentEventHistory,
    'ascending',
  );

  $: $eventViewType, clearActives();

  beforeNavigate(() => {
    clearActives();
  });

  $: {
    if (!workflow.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  }
</script>

<div class="flex flex-col gap-0 px-2 pt-4 md:px-4 lg:px-8">
  <WorkflowCallStackError />
  <div class="flex flex-col gap-2">
    <InputAndResults />
    {#if workflowTaskFailedError}
      <WorkflowError
        error={workflowTaskFailedError}
        pendingTask={workflow?.pendingWorkflowTask}
      />
    {/if}
    {#if workflow?.callbacks?.length}
      <WorkflowCallback callback={workflow.callbacks[0]} />
    {/if}
    <div
      class="flex flex-col items-center gap-2 py-2 xl:flex-row xl:justify-between xl:gap-8"
    >
      <h2>
        {translate('workflows.event-history')}
      </h2>
    </div>
  </div>
</div>
<div class="px-2 pb-24 md:px-4 lg:px-8">
  <div class="flex w-full flex-col border border-subtle">
    <TimelineGraph {workflow} {groups} {workflowTaskFailedError} />
    <EventSummary {groups} {history} />
  </div>
</div>
