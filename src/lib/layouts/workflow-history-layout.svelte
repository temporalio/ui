<script lang="ts">
  import { page } from '$app/stores';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowCallStackError from '$lib/components/workflow/workflow-call-stack-error.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import {
    workflowRun,
    workflowTimelineViewOpen,
  } from '$lib/stores/workflow-run';
  import type { EventView } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  let showDownloadPrompt = false;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $fullEventHistory,
    $eventFilterSort,
  );

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };
</script>

<div class="flex flex-col gap-2">
  <WorkflowCallStackError />
  {#if workflowTaskFailedError}
    <WorkflowTypedError error={workflowTaskFailedError} />
  {/if}
  <WorkflowSummary />
  <PendingActivities />
  <section>
    <Accordion
      title={workflowEvents.contAsNew
        ? translate('workflows.input')
        : translate('workflows.input-and-results')}
      icon="json"
      class=""
      data-testid="input-and-results"
    >
      <div class="flex w-full flex-col gap-2 lg:flex-row">
        <InputAndResults
          title="Input"
          content={workflowEvents.input}
          data-testid="workflow-input"
        />
        <InputAndResults
          content={workflowEvents.results}
          title={workflowEvents.contAsNew
            ? translate('workflows.continued-as-new-with-input')
            : translate('workflows.results')}
          data-testid="workflow-results"
          running={workflow?.isRunning}
        />
      </div>
    </Accordion>
  </section>
  <Accordion
    title={translate('common.timeline')}
    data-testid="timeline-accordion"
    icon="timeline"
    open={$workflowTimelineViewOpen}
    onToggle={() => {
      $workflowTimelineViewOpen = !$workflowTimelineViewOpen;
    }}
  >
    <EventHistoryTimeline history={$fullEventHistory} />
  </Accordion>
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-end"
      aria-label={translate('workflows.event-history-view')}
    >
      <h2 class="text-2xl font-medium">
        {translate('workflows.event-history')}
      </h2>
      <div id="event-view-toggle" class="surface-primary mt-4 flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed' || $eventViewType === 'timeline'}
            data-testid="feed"
            on:click={() => onViewClick('feed')}
            >{translate('workflows.history')}</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => onViewClick('compact')}
            >{translate('workflows.compact')}</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-testid="json"
            on:click={() => onViewClick('json')}
            >{translate('workflows.json')}</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-testid="download"
            on:click={() => (showDownloadPrompt = true)}
            >{translate('workflows.download')}</ToggleButton
          >
        </ToggleButtons>
      </div>
    </nav>
    <slot />
  </section>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
