<script lang="ts">
  import { page } from '$app/stores';

  import HistoryCanvas from '$lib/components/lines-and-dots/canvas/history-canvas.svelte';
  import EventSortFilter from '$lib/components/lines-and-dots/event-sort-filter.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import HistoryGraph from '$lib/components/lines-and-dots/svg/history-graph.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import {
    decodeEventHistory,
    filteredEventHistory,
    fullEventHistory,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { exportHistory } from '$lib/utilities/export-history';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: groups = groupEvents(
    $filteredEventHistory,
    $eventFilterSort,
    pendingActivities,
  );

  let activeGroup: EventGroup | undefined = undefined;
  let activeEvent: WorkflowEvent | PendingActivity | undefined = undefined;

  let showDownloadPrompt = false;
  let renderType = 'canvas';

  const clearActives = () => {
    activeGroup = undefined;
    activeEvent = undefined;
  };

  const setActiveEvent = (event: WorkflowEvent | PendingActivity) => {
    if (event.id === activeEvent?.id) {
      clearActives();
    } else {
      activeEvent = event;
      activeGroup = groups.find((g) => g.eventIds.has(event?.id));
    }
  };

  const setActiveGroup = (group: EventGroup) => {
    if (group.id === activeGroup?.id) {
      clearActives();
    } else {
      activeEvent = undefined;
      activeGroup = group;
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

  $: compact = $eventViewType === 'compact';
  $: workflow, compact, clearActives();
  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $fullEventHistory,
    $eventFilterSort,
  );
</script>

<div class="flex flex-col gap-0">
  <WorkflowCallStackError />
  {#if workflowTaskFailedError}
    <WorkflowTypedError error={workflowTaskFailedError} />
  {/if}
  <div class="flex flex-col gap-0 border-4 border-t-0 bg-slate-950">
    <WorkflowDetails />
    <InputAndResults />
    <div
      class="surface-inverse flex flex-col items-center justify-between gap-2 border-b-4 bg-slate-900 px-4 py-2 md:flex-row"
    >
      <div class="flex flex-col items-center gap-2 md:flex-row md:gap-4">
        <h2 class="text-xl font-medium">
          {translate('workflows.event-history')}
        </h2>
        <ToggleButtons>
          <ToggleButton
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => ($eventViewType = 'compact')}
            >{translate('common.timeline')}</ToggleButton
          >
          <ToggleButton
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => ($eventViewType = 'feed')}
            >{translate('workflows.full-history')}</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-testid="download"
            on:click={() => (showDownloadPrompt = true)}
          ></ToggleButton>
        </ToggleButtons>
      </div>
      <div class="flex gap-2">
        <ToggleButtons>
          <ToggleButton
            active={renderType === 'svg'}
            data-testid="svg"
            on:click={() => (renderType = 'svg')}>SVG</ToggleButton
          >
          <ToggleButton
            active={renderType === 'canvas'}
            data-testid="canvas"
            on:click={() => (renderType = 'canvas')}>Canvas</ToggleButton
          >
        </ToggleButtons>
      </div>
      <div class="flex gap-2">
        <EventTypeFilter {compact} />
        <EventSortFilter {compact} />
      </div>
    </div>
    {#if compact}
      <TimelineGraph
        {workflow}
        {groups}
        {activeGroup}
        {activeEvent}
        onClick={setActiveGroup}
        clearActive={clearActives}
      />
    {:else if renderType === 'canvas'}
      <HistoryCanvas
        history={$filteredEventHistory}
        {groups}
        {pendingActivities}
        {activeGroup}
        {activeEvent}
        onClick={setActiveEvent}
        clearActive={clearActives}
      />
    {:else}
      <HistoryGraph
        history={$filteredEventHistory}
        {groups}
        {pendingActivities}
        {activeGroup}
        {activeEvent}
        onClick={setActiveEvent}
        clearActive={clearActives}
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
