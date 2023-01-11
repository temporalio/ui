<script lang="ts">
  import { page } from '$app/stores';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import {
    routeForEventHistory,
    routeForWorkers,
  } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';
  import { eventViewType } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import WorkflowTypedError from '$lib/components/workflow/workflow-typed-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import { exportHistory } from '$lib/utilities/export-history';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import EventShortcutKeys from '$lib/components/event/event-shortcut-keys.svelte';

  let showShortcuts = false;

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);
</script>

<section class="flex flex-col gap-4">
  <Accordion
    title="Summary"
    icon="summary"
    open={$workflowSummaryViewOpen}
    onToggle={() => {
      $workflowSummaryViewOpen = !$workflowSummaryViewOpen;
    }}
  >
    <div
      class="grid-row-3 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:w-11/12"
    >
      <div class="col-span-1 md:col-span-2">
        <h3 class="font-medium">Workflow Type</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail content={$workflowRun.workflow.name} copyable />
        <WorkflowDetail
          title="Run ID"
          content={$workflowRun.workflow.runId}
          copyable
        />
      </div>
      <div class="col-span-1">
        <h3 class="font-medium">Task Queue</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail
          content={$workflowRun.workflow.taskQueue}
          href={routeForWorkers({
            namespace: $page.params.namespace,
            workflow: $workflowRun.workflow.id,
            run: $workflowRun.workflow.runId,
          })}
          copyable
        />
        <WorkflowDetail
          title="State Transitions"
          content={$workflowRun.workflow.stateTransitionCount}
        />
      </div>
      <div class="col-span-1">
        <h3 class="font-medium">Start & Close Time</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail
          title="Start Time"
          content={formatDate($workflowRun.workflow.startTime, $timeFormat)}
        />
        <WorkflowDetail
          title="Close Time"
          content={formatDate($workflowRun.workflow.endTime, $timeFormat)}
        />
      </div>
    </div>
  </Accordion>
  {#if $workflowRun.workflow?.parent || $workflowRun.workflow?.pendingChildren.length}
    <Accordion title="Relationships" icon="relationship">
      {#if $workflowRun.workflow?.parent}
        <h3 class="font-medium">Parent</h3>
        <div class="h-0.5 w-full rounded-full bg-gray-900 lg:w-3/4" />
        <WorkflowDetail
          title="Workflow ID"
          content={$workflowRun.workflow.parent?.workflowId}
          href={routeForEventHistory({
            namespace: $page.params.namespace,
            workflow: $workflowRun.workflow.parent?.workflowId,
            run: $workflowRun.workflow.parent?.runId,
          })}
        />
        <WorkflowDetail
          title="Run ID"
          content={$workflowRun.workflow.parent?.runId}
          href={routeForEventHistory({
            namespace: $page.params.namespace,
            workflow: $workflowRun.workflow.parent?.workflowId,
            run: $workflowRun.workflow.parent?.runId,
          })}
        />
      {/if}
      {#if $workflowRun.workflow?.pendingChildren.length}
        <ChildWorkflowsTable
          pendingChildren={$workflowRun.workflow?.pendingChildren}
          namespace={$page.params.namespace}
        />
      {/if}
    </Accordion>
  {/if}

  <WorkflowStackTraceError
    workflow={$workflowRun.workflow}
    workers={$workflowRun.workers}
  />
  <WorkflowTypedError error={workflowEvents.error} />
  <PendingActivities />
  <section class="flex w-full" data-cy="inputs-results">
    <Accordion title="Input and Results" icon="json" class="border-gray-900">
      <div class="flex gap-2">
        <InputAndResults type="input" content={workflowEvents.input} />
        <InputAndResults type="results" content={workflowEvents.results} />
      </div>
    </Accordion>
  </section>
  <slot name="timeline" />
  <section id="event-history">
    <nav
      class="flex flex-col items-center justify-between gap-4 pb-4 lg:flex-row lg:items-end"
    >
      <h3 class="text-lg font-medium">Recent Events</h3>
      <div id="event-view-toggle" class="flex gap-4 bg-white">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            active={$eventViewType === 'feed'}
            data-cy="feed"
            on:click={() => ($eventViewType = 'feed')}>History</ToggleButton
          >
          <ToggleButton
            icon="compact"
            active={$eventViewType === 'compact'}
            data-cy="compact"
            on:click={() => ($eventViewType = 'compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon="json"
            active={$eventViewType === 'json'}
            data-cy="json"
            on:click={() => ($eventViewType = 'json')}>JSON</ToggleButton
          >
          <ToggleButton
            icon="download"
            data-cy="download"
            on:click={() =>
              exportHistory({
                namespace: $page.params.namespace,
                workflowId: $workflowRun.workflow.id,
                runId: $workflowRun.workflow.runId,
              })}>Download</ToggleButton
          >
        </ToggleButtons>
      </div>
    </nav>
    <slot />
  </section>
  <EventShortcutKeys
    open={showShortcuts}
    compact={$eventViewType === 'compact'}
    onOpen={() => (showShortcuts = true)}
    onClose={() => (showShortcuts = false)}
  />
</section>
