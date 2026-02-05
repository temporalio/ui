<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';

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
  import Tooltip from '$lib/holocene/tooltip.svelte';
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

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);

  let reverseSort = $derived($eventFilterSort === 'descending');
  let compact = $derived($eventViewType === 'compact');

  let ascendingGroups = $derived(
    groupEvents(
      $filteredEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  let groups = $derived(
    reverseSort ? [...ascendingGroups].reverse() : ascendingGroups,
  );
  let history = $derived(
    reverseSort ? [...$filteredEventHistory].reverse() : $filteredEventHistory,
  );

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  $effect(() => {
    $eventViewType;
    clearActives();
  });

  beforeNavigate(() => {
    clearActives();
  });

  $effect(() => {
    if (!workflow.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };
</script>

<div class="flex flex-col gap-0 pt-4">
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
<div class="relative pb-24">
  <div
    class={merge(
      'surface-background flex flex-wrap items-center justify-between gap-2 border-b border-subtle py-2 xl:gap-8',
      !$minimizeEventView && 'sticky top-0 z-30 md:top-12',
    )}
  >
    <h2>
      {translate('workflows.event-history')}
    </h2>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            leadingIcon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            on:click={onSort}
            size="sm"
          >
            {reverseSort
              ? translate('common.descending')
              : translate('common.ascending')}
          </ToggleButton>
        {/if}
        <Tooltip
          text={$minimizeEventView
            ? translate('workflows.timeline-minimized')
            : translate('workflows.timeline-expanded')}
          top
        >
          <ToggleButton
            leadingIcon={$minimizeEventView ? 'minimize' : 'expand'}
            data-testid="expandAll"
            size="sm"
            on:click={() => ($minimizeEventView = !$minimizeEventView)}
          >
            {$minimizeEventView
              ? translate('workflows.minimized')
              : translate('workflows.expanded')}
          </ToggleButton>
        </Tooltip>
        <EventTypeFilter {compact} minimized={$minimizeEventView} />
        <ToggleButton
          disabled={!workflow.isRunning}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates ||
            !workflow.isRunning
              ? 'bg-slate-300'
              : 'bg-green-600'}"
          ></span>
          {$pauseLiveUpdates || !workflow.isRunning
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
      error={Boolean(workflowTaskFailedError)}
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
