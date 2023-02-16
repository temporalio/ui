<script lang="ts">
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import { exportHistory } from '$lib/utilities/export-history';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import EventShortcutKeys from '$lib/components/event/event-shortcut-keys.svelte';

  let showShortcuts = false;

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(workflow, $eventHistory);
  $: isContinuedAsNew = workflow?.status === 'ContinuedAsNew';

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };
</script>

<div class="flex flex-col gap-4">
  <WorkflowStackTraceError />
  <WorkflowTypedError error={workflowEvents.error} />
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <section>
    <Accordion
      title="Input and {isContinuedAsNew
        ? 'Continued as New with Input'
        : 'Results'}"
      icon="json"
      class="border-gray-900"
      data-testid="input-and-results"
    >
      <div class="flex w-full flex-col gap-2 lg:flex-row">
        <InputAndResults type="input" content={workflowEvents.input} />
        <InputAndResults
          type="results"
          content={workflowEvents.results}
          title={isContinuedAsNew ? 'Continued as New with Input' : null}
        />
      </div>
    </Accordion>
  </section>
  <slot name="timeline" />
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 pb-4 lg:flex-row lg:items-end"
      aria-label="recent events view"
    >
      <h2 class="text-lg font-medium">Recent Events</h2>
      <div id="event-view-toggle" class="flex gap-4 bg-white">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed'}
            data-testid="feed"
            on:click={() => onViewClick('feed')}>History</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-testid="compact"
            on:click={() => onViewClick('compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-testid="json"
            on:click={() => onViewClick('json')}>JSON</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-testid="download"
            on:click={() =>
              exportHistory({
                namespace: $page.params.namespace,
                workflowId: $workflowRun.workflow?.id,
                runId: $workflowRun.workflow?.runId,
              })}>Download</ToggleButton
          >
        </ToggleButtons>
      </div>
    </nav>
    <slot />
  </section>
  <EventShortcutKeys
    open={showShortcuts}
    onOpen={() => (showShortcuts = true)}
    onClose={() => (showShortcuts = false)}
  />
</div>
