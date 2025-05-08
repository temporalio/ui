<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import {
    eventFilterSort,
    eventViewType,
    minimizeEventView,
  } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;
  $: reverseSort = $eventFilterSort === 'descending';
  $: compact = $eventViewType === 'compact';

  $: ascendingGroups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );

  $: groups = reverseSort ? [...ascendingGroups].reverse() : ascendingGroups;
  $: history = reverseSort
    ? [...$filteredEventHistory].reverse()
    : $filteredEventHistory;

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

  let showDownloadPrompt = false;

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };
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
      <WorkflowCallbacks callbacks={workflow.callbacks} />
    {/if}
  </div>
</div>
<div class="relative px-2 pb-24 md:px-4 lg:px-8">
  <div
    class="flex items-center justify-between gap-2 bg-off-white/50 py-2 xl:gap-8 dark:bg-space-black/50"
    class:sticky-header={!$minimizeEventView}
  >
    <h2>
      {translate('workflows.event-history')}
    </h2>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            icon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            on:click={onSort}
            >{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
          >
        {/if}
        <ToggleButton
          icon={$minimizeEventView ? 'minimize' : 'expand'}
          data-testid="expandAll"
          tooltip={$minimizeEventView
            ? 'Timeline and Event History are collapsed to minimized height'
            : 'Timeline and Event History are expanded to full height'}
          on:click={() => ($minimizeEventView = !$minimizeEventView)}
          >{$minimizeEventView ? 'Minimized' : 'Expanded'}</ToggleButton
        >
        <EventTypeFilter {compact} minimized={$minimizeEventView} />
        <ToggleButton
          disabled={!workflow.isRunning}
          icon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        >
          {$pauseLiveUpdates ? 'Resume' : 'Pause'}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          icon="download"
          on:click={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>
  <div class="flex w-full flex-col">
    <TimelineGraph
      {workflow}
      {groups}
      {workflowTaskFailedError}
      viewportHeight={$minimizeEventView ? 360 : undefined}
    />
    <EventSummary {groups} {history} minimized={$minimizeEventView} />
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>

<style lang="postcss">
  .sticky-header {
    @apply sticky top-0 z-30 border-b border-subtle md:top-12;
  }
</style>
