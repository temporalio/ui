<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowCallback from '$lib/components/lines-and-dots/workflow-callback.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { activeGroups, clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  let showFilters = false;
  let showDownloadPrompt = false;

  $: ({ namespace } = $page.params);
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

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };

  $: reverseSort = $eventFilterSort === 'descending';
</script>

<div class="flex flex-col gap-0 px-8">
  <WorkflowCallStackError />
  <div class="flex flex-col gap-2">
    <WorkflowDetails />
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
      <ToggleButtons>
        <ToggleButton
          disabled={!workflow.isRunning}
          icon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          tooltip={$pauseLiveUpdates
            ? 'Resume Live Updates'
            : 'Pause Live Updates'}
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        />
        <ToggleButton
          icon={reverseSort ? 'arrow-down' : 'arrow-up'}
          data-testid="zoom-in"
          on:click={onSort}>{reverseSort ? 'Desc' : 'Asc'}</ToggleButton
        >
        <ToggleButton
          data-testid="filter"
          on:click={() => (showFilters = !showFilters)}
          icon="filter"
        />
        <ToggleButton
          data-testid="download"
          on:click={() => (showDownloadPrompt = true)}
          icon="download"
        />
      </ToggleButtons>
    </div>
    {#if showFilters}
      <div class="flex flex-col items-center justify-center pb-2">
        <EventTypeFilter compact={$eventViewType !== 'feed'} />
      </div>
    {/if}
  </div>
</div>
<div class="pb-24">
  <div class="flex w-full flex-col gap-4 overflow-auto px-8">
    <TimelineGraph
      {workflow}
      {groups}
      activeGroups={$activeGroups}
      {workflowTaskFailedError}
    />
    {#key $eventFilterSort}
      <EventSummary {groups} {history} />
    {/key}
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
