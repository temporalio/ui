<script lang="ts">
  import { page } from '$app/stores';

  import type { GraphView } from '$lib/components/lines-and-dots/constants';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import CompactGraph from '$lib/components/lines-and-dots/svg/compact-graph.svelte';
  import HistoryGraph from '$lib/components/lines-and-dots/svg/history-graph.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    decodeEventHistory,
    filteredEventHistory,
    // fullEventHistory,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowEvent } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { exportHistory } from '$lib/utilities/export-history';
  // import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  let view: GraphView = 'compact';
  let zoomLevel = 1;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: groups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
  );
  // $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
  //   $fullEventHistory,
  //   'ascending',
  // );
  $: workflow, view, clearActives();

  let activeGroups: string[] = [];
  let activeEvents: string[] = [];

  let canvasWidth = 0;
  let showDownloadPrompt = false;

  const clearActives = () => {
    activeGroups = [];
    activeEvents = [];
  };

  const setActiveGroup = (group: EventGroup) => {
    activeEvents = [];
    if (!activeGroups.includes(group.id)) {
      activeGroups = [...activeGroups, group.id];
    } else {
      activeGroups = activeGroups.filter((id) => id !== group.id);
    }
  };

  const setActiveGroupAndEvent = (group: EventGroup, event: WorkflowEvent) => {
    if (group) {
      if (!activeGroups.includes(group.id)) {
        activeGroups = [...activeGroups, group.id];
      } else {
        activeGroups = activeGroups.filter((id) => id !== group.id);
      }
    }

    if (event) {
      if (!activeEvents.includes(event.id)) {
        activeEvents = [...activeEvents, event.id];
      } else {
        activeEvents = activeGroups.filter((id) => id !== event.id);
      }
    }
  };

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
    if (zoomLevel < 6) zoomLevel += 0.5;
  };

  const zoomIn = () => {
    if (zoomLevel > 1) {
      zoomLevel -= 0.5;
    }
  };
</script>

<div class="surface-secondary flex flex-col gap-0 px-4">
  <WorkflowCallStackError />
  <!-- {#if workflowTaskFailedError}
    <WorkflowTypedError error={workflowTaskFailedError} />
  {/if} -->
  <div class="flex flex-col gap-0">
    <WorkflowDetails />
    <InputAndResults />
    <div
      class="flex flex-col items-center justify-between gap-2 py-2 md:flex-row"
    >
      <div class="flex flex-col items-center gap-2 md:flex-row md:gap-4">
        <h2 class="text-2xl font-medium">
          {translate('workflows.event-history')}
        </h2>
        <ToggleButtons>
          <ToggleButton
            active={view === 'compact'}
            data-testid="feed"
            on:click={() => (view = 'compact')}
            >{translate('workflows.compact')}</ToggleButton
          >
          <ToggleButton
            active={view === 'timeline'}
            data-testid="compact"
            on:click={() => (view = 'timeline')}
            >{translate('common.timeline')}</ToggleButton
          >
          <ToggleButton
            active={view === 'history'}
            data-testid="feed"
            on:click={() => (view = 'history')}
            >{translate('workflows.full-history')}</ToggleButton
          >
          <ToggleButton
            data-testid="download"
            on:click={() => (showDownloadPrompt = true)}
            icon="download"
          />
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
        </ToggleButtons>
        <span class="text-sm">{(100 / zoomLevel).toFixed(0)}%</span>
      </div>
      <div class="flex gap-2">
        <EventTypeFilter compact={view === 'compact' || view === 'timeline'} />
      </div>
    </div>
  </div>
</div>
<div class="surface-inverse">
  <div class="w-full overflow-x-hidden" bind:clientWidth={canvasWidth}>
    {#if view === 'compact'}
      <CompactGraph
        {groups}
        {activeGroups}
        {zoomLevel}
        {canvasWidth}
        onClick={setActiveGroup}
      />
    {:else if view === 'timeline'}
      <TimelineGraph
        {workflow}
        history={$filteredEventHistory}
        {groups}
        {activeGroups}
        {zoomLevel}
        {canvasWidth}
        onClick={setActiveGroup}
      />
    {:else}
      <HistoryGraph
        history={$filteredEventHistory}
        {groups}
        {activeGroups}
        {activeEvents}
        {zoomLevel}
        {canvasWidth}
        onClick={setActiveGroupAndEvent}
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
