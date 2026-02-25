<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: urlParams = parseEventFilterParams($page.url);
  $: {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  }

  $: reverseSort = $eventFilterSort === 'descending';

  $: ascendingGroups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );

  $: groups = reverseSort ? [...ascendingGroups].reverse() : ascendingGroups;

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $currentEventHistory,
    'ascending',
  );

  beforeNavigate(() => {
    clearActives();
  });

  $: {
    if (!workflow?.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  }

  let showDownloadPrompt = false;

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams($page.url, { sort: newSort }, goto);
  };

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      $page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };
</script>

<InputAndResults />
<div class="flex flex-col gap-2">
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
<div class="relative pb-24">
  <div
    class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-12 md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>
        {translate('workflows.timeline-tab')}
      </h2>
      <EventHistoryLegend />
    </div>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          data-testid="zoom-in"
          on:click={onSort}
          size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <EventTypeFilter compact={false} minimized={false} />
        <ToggleButton
          disabled={!workflow?.isRunning}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates ||
            !workflow?.isRunning
              ? 'bg-slate-300'
              : 'bg-green-600'}"
          ></span>
          {$pauseLiveUpdates || !workflow?.isRunning
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
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
      viewportHeight={undefined}
      error={Boolean(workflowTaskFailedError)}
    />
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
