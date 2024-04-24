<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import CompactGraph from '$lib/components/lines-and-dots/svg/compact-graph.svelte';
  import HistoryGraph from '$lib/components/lines-and-dots/svg/history-graph.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import {
    activeEvents,
    activeGroups,
    clearActives,
  } from '$lib/stores/active-events';
  import { eventViewType } from '$lib/stores/event-view';
  import {
    decodeEventHistory,
    filteredEventHistory,
    fullEventHistory,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { exportHistory } from '$lib/utilities/export-history';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  let showFilters = false;
  let zoomLevel = 1;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: groups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
  );

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $fullEventHistory,
    'ascending',
  );

  $: $eventViewType, clearActives();

  beforeNavigate(() => {
    clearActives();
  });

  let canvasWidth = 0;
  let showDownloadPrompt = false;

  const onDownloadClick = () => {
    showDownloadPrompt = false;
    exportHistory({
      namespace: decodeURIForSvelte(namespace),
      workflowId: decodeURIForSvelte(workflow?.id),
      runId: decodeURIForSvelte(workflow?.runId),
      settings: $page.data.settings,
      decodeEventHistory: $decodeEventHistory,
    });
  };

  const zoomOut = () => {
    if (zoomLevel < 10) zoomLevel += 0.5;
  };

  const zoomIn = () => {
    if (zoomLevel > 1) {
      zoomLevel -= 0.5;
    }
  };
</script>

<div class="surface-secondary flex flex-col gap-0 px-8">
  <WorkflowCallStackError />
  <div class="flex flex-col gap-2">
    <WorkflowDetails />
    <InputAndResults />
    {#if workflowTaskFailedError}
      <WorkflowError error={workflowTaskFailedError} />
    {/if}
    <div class="flex flex-col justify-between gap-2 py-2 md:flex-row">
      <div class="flex flex-col gap-2 md:flex-row md:gap-4">
        <h2 class="text-2xl font-medium">
          {translate('workflows.event-history')}
        </h2>
        <ToggleButtons>
          <ToggleButton
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => ($eventViewType = 'compact')}
            >{translate('workflows.compact')}</ToggleButton
          >
          <ToggleButton
            active={$eventViewType === 'timeline'}
            data-testid="timeline"
            on:click={() => ($eventViewType = 'timeline')}
            >{translate('common.timeline')}</ToggleButton
          >
          <ToggleButton
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => ($eventViewType = 'feed')}
            >{translate('workflows.full-history')}</ToggleButton
          >
        </ToggleButtons>
      </div>
      <div class="flex gap-2">
        <span class="font-mono text-sm">{(100 / zoomLevel).toFixed(0)}%</span>
        <ToggleButtons>
          <ToggleButton
            data-testid="zoom-in"
            disabled={zoomLevel === 1}
            on:click={zoomIn}>+</ToggleButton
          >
          <ToggleButton
            data-testid="zoom-out"
            disabled={zoomLevel === 10}
            on:click={zoomOut}>-</ToggleButton
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
    </div>
    {#if showFilters}
      <div class="flex flex-col justify-center pb-2">
        <EventTypeFilter compact={$eventViewType !== 'feed'} />
      </div>
    {/if}
  </div>
</div>
<div class="bg-inverse">
  <div class="w-full overflow-auto" bind:clientWidth={canvasWidth}>
    {#if $eventViewType === 'compact'}
      <CompactGraph
        {workflow}
        {groups}
        {zoomLevel}
        {canvasWidth}
        activeGroups={$activeGroups}
      />
    {:else if $eventViewType === 'timeline'}
      <TimelineGraph
        {workflow}
        history={$fullEventHistory}
        {groups}
        {zoomLevel}
        {canvasWidth}
        activeGroups={$activeGroups}
      />
    {:else}
      <HistoryGraph
        history={$filteredEventHistory}
        {groups}
        {zoomLevel}
        {canvasWidth}
        activeEvents={$activeEvents}
      />
    {/if}
  </div>
</div>
<Modal
  id="download-history"
  large
  bind:open={showDownloadPrompt}
  confirmType="primary"
  confirmText={translate('common.download')}
  cancelText={translate('common.cancel')}
  on:confirmModal={() => onDownloadClick()}
  on:cancelModal={() => (showDownloadPrompt = false)}
>
  <h3 slot="title">
    {translate('common.download-json')}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <ToggleSwitch
      label={translate('events.decode-event-history')}
      id="decode-event-history"
      bind:checked={$decodeEventHistory}
      data-testid="decode-event-history-toggle"
    />
  </div>
</Modal>
