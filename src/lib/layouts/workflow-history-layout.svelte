<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';

  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineAndHistoryToggle from '$lib/components/lines-and-dots/timeline-and-history-toggle.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import WorkflowHistory from '$lib/pages/workflow-history.svelte';
  import WorkflowMemo from '$lib/pages/workflow-memo.svelte';
  import WorkflowSearchAttributes from '$lib/pages/workflow-search-attributes.svelte';
  import WorkflowTimeline from '$lib/pages/workflow-timeline.svelte';
  import WorkflowUserMetadata from '$lib/pages/workflow-user-metadata.svelte';
  import { clearActives } from '$lib/stores/active-events';
  import {
    eventFilterSort,
    eventViewType,
    historyViewType,
  } from '$lib/stores/event-view';
  import { currentEventHistory, pauseLiveUpdates } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  const workflow = $derived($workflowRun.workflow);
  const reverseSort = $derived($eventFilterSort === 'descending');
  const summaryView = $derived($historyViewType === 'summary');
  const timelineView = $derived($historyViewType === 'timeline');
  const compactView = $derived($historyViewType === 'compact');
  const historyView = $derived($historyViewType === 'history');
  const jsonView = $derived($historyViewType === 'json');
  const relationshipView = $derived($historyViewType === 'relationship');

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  beforeNavigate(() => {
    clearActives();
  });

  $effect(() => {
    eventViewType;
    clearActives();
  });

  $effect(() => {
    if (!workflow.isRunning && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };
</script>

<div class="flex flex-col gap-2">
  <WorkflowCallStackError />
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
    class={merge(
      'surface-background sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 py-2 md:top-12 xl:gap-8',
      !historyView && 'border-b border-subtle',
    )}
  >
    <TimelineAndHistoryToggle />
    <div class="flex items-center gap-2">
      <ToggleButtons>
        {#if $eventViewType !== 'json'}
          <ToggleButton
            leadingIcon={reverseSort ? 'descending' : 'ascending'}
            data-testid="zoom-in"
            on:click={onSort}
            size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
          >
        {/if}
        <EventTypeFilter compact={compactView} />
        <ToggleButton
          disabled={!workflow.isRunning}
          leadingIcon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        >
          {$pauseLiveUpdates ? 'Unfreeze' : 'Freeze'}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>
  {#if summaryView}
    <div class="mt-4 flex flex-col gap-4">
      <InputAndResults />
      <WorkflowUserMetadata />
      <WorkflowSearchAttributes />
      <WorkflowMemo />
    </div>
  {:else if timelineView}
    <WorkflowTimeline />
  {:else if compactView}
    <WorkflowHistory />
  {:else if historyView}
    <WorkflowHistory />
  {:else if jsonView}
    <WorkflowHistoryJson />
  {:else if relationshipView}
    <WorkflowRelationships />
  {/if}
</div>
