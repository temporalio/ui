<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import {
    routeForWorkflow,
    routeForWorkers,
    routeForEventHistory,
  } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';
  import { eventViewType } from '$lib/stores/event-view';

  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/events';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';

  const { namespace } = $page.params;
  const { workflow, workers } = $workflowRun;

  const routeParameters = (view: EventView, eventId?: string) => ({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
    view,
    eventId,
  });

  const workflowRoute = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  };

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<section class="flex flex-col gap-4">
  <section class="flex flex-col gap-1">
    <WorkflowDetail title="Workflow Type" content={workflow.name} />
    <WorkflowDetail title="Run ID" content={workflow.runId} />
    <div class="flex flex-col gap-1 md:flex-row md:gap-6">
      <WorkflowDetail
        title="Start Time"
        content={formatDate(workflow.startTime, 'UTC')}
      />
      <WorkflowDetail
        title="Close Time"
        content={formatDate(workflow.endTime, 'UTC')}
      />
    </div>
    <WorkflowDetail
      title="Task Queue"
      content={workflow.taskQueue}
      href={routeForWorkers(workflowRoute)}
    />
    {#if workflow?.parent}
      <div class="gap-2 xl:flex">
        <WorkflowDetail
          title="Parent"
          content={workflow.parent?.workflowId}
          href={routeForWorkflow({
            namespace,
            workflow: workflow.parent?.workflowId,
            run: workflow.parent?.runId,
          })}
        />
        <WorkflowDetail
          title="Parent ID"
          content={workflow.parent?.runId}
          href={routeForWorkflow({
            namespace,
            workflow: workflow.parent?.workflowId,
            run: workflow.parent?.runId,
          })}
        />
      </div>
    {/if}
    {#each workflow?.pendingChildren as child (child.runId)}
      <div class="gap-2 xl:flex">
        <WorkflowDetail
          title="Child"
          content={child.workflowId}
          href={routeForWorkflow({
            namespace,
            workflow: child.workflowId,
            run: child.runId,
          })}
        />
        <WorkflowDetail
          title="Child ID"
          content={child.runId}
          href={routeForWorkflow({
            namespace,
            workflow: child.workflowId,
            run: child.runId,
          })}
        />
      </div>
    {/each}
    <WorkflowDetail
      title="State Transitions"
      content={workflow.stateTransitionCount}
    />
  </section>
  <WorkflowStackTraceError {workflow} {workers} />
  <PendingActivities />
  <section class="flex w-full">
    <Accordion title="Input and Results" icon="json" class="border-gray-900">
      <div class="flex gap-2">
        <InputAndResults type="input" />
        <InputAndResults type="results" />
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
        </ToggleButtons>
      </div>
    </nav>
    <slot />
  </section>
</section>
