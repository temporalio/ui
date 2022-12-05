<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    routeForEventHistory,
    routeForWorkers,
  } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';
  import { eventViewType } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';
  import { eventSortOrder } from '$lib/stores/event-view';

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

  const routeParameters = (view: EventView, eventId?: string) => ({
    namespace: $page.params.namespace,
    workflow: $workflowRun.workflow.id,
    run: $workflowRun.workflow.runId,
    view,
    eventId,
  });

  $: workflowEvents = getWorkflowStartedCompletedAndTaskFailedEvents(
    $eventHistory?.events ?? [],
    $eventSortOrder,
  );
</script>

<section class="flex flex-col gap-4">
  <section class="flex flex-col gap-1">
    <WorkflowDetail
      title="Workflow Type"
      content={$workflowRun.workflow.name}
    />
    <WorkflowDetail title="Run ID" content={$workflowRun.workflow.runId} />
    <div class="flex flex-col gap-1 md:flex-row md:gap-6">
      <WorkflowDetail
        title="Start Time"
        content={formatDate($workflowRun.workflow.startTime, $timeFormat)}
      />
      <WorkflowDetail
        title="Close Time"
        content={formatDate($workflowRun.workflow.endTime, $timeFormat)}
      />
    </div>
    <WorkflowDetail
      title="Task Queue"
      content={$workflowRun.workflow.taskQueue}
      href={routeForWorkers({
        namespace: $page.params.namespace,
        workflow: $workflowRun.workflow.id,
        run: $workflowRun.workflow.runId,
      })}
    />
    <WorkflowDetail
      title="State Transitions"
      content={$workflowRun.workflow.stateTransitionCount}
    />
    {#if $workflowRun.workflow?.parent}
      <div class="gap-2 xl:flex">
        <WorkflowDetail
          title="Parent Workflow ID"
          content={$workflowRun.workflow.parent?.workflowId}
          href={routeForEventHistory({
            view: $eventViewType,
            namespace: $page.params.namespace,
            workflow: $workflowRun.workflow.parent?.workflowId,
            run: $workflowRun.workflow.parent?.runId,
          })}
        />
        <WorkflowDetail
          title="Parent Run ID"
          content={$workflowRun.workflow.parent?.runId}
          href={routeForEventHistory({
            view: $eventViewType,
            namespace: $page.params.namespace,
            workflow: $workflowRun.workflow.parent?.workflowId,
            run: $workflowRun.workflow.parent?.runId,
          })}
        />
      </div>
    {/if}
    {#if $workflowRun.workflow?.pendingChildren.length}
      <ChildWorkflowsTable
        pendingChildren={$workflowRun.workflow?.pendingChildren}
        namespace={$page.params.namespace}
      />
    {/if}
  </section>
  <WorkflowStackTraceError
    workflow={$workflowRun.workflow}
    workers={$workflowRun.workers}
  />
  <WorkflowTypedError error={workflowEvents.error} />
  <PendingActivities />
  <section class="flex w-full">
    <Accordion
      id="input-and-results-accordion"
      title="Input and Results"
      icon="json"
      class="border-gray-900"
    >
      <div class="flex gap-2">
        <InputAndResults type="input" content={workflowEvents.input} />
        <InputAndResults type="results" content={workflowEvents.results} />
      </div>
    </Accordion>
  </section>
  <slot name="timeline" />
  <section id="event-history">
    <nav class="flex items-end justify-between gap-4 pb-4">
      <h3 class="text-lg font-medium">Recent Events</h3>
      <div id="event-view-toggle" class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon="feed"
            base={routeForEventHistory(routeParameters('feed'))}
            href={routeForEventHistory(routeParameters('feed'))}
            active={$eventViewType === 'feed'}
            data-cy="feed"
            on:click={() => ($eventViewType = 'feed')}>History</ToggleButton
          >
          <ToggleButton
            icon="compact"
            href={routeForEventHistory(routeParameters('compact'))}
            active={$eventViewType === 'compact'}
            data-cy="compact"
            on:click={() => ($eventViewType = 'compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon="json"
            href={routeForEventHistory(routeParameters('json'))}
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
</section>
