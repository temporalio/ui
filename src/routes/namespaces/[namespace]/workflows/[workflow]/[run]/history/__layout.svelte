<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { routeForWorkers, routeForWorkflow } from '$lib/utilities/route-for';

  export const load: Load = async function ({ params, stuff }) {
    const { workflow, workers } = stuff;
    const { namespace } = params;

    return {
      props: {
        namespace,
        workflow,
        workers,
      },
    };
  };
</script>

<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faTable,
  } from '@fortawesome/free-solid-svg-icons';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';
  import { eventViewType } from '$lib/stores/event-view';

  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/events';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import PendingActivties from './_pending-activties.svelte';
  import WorkflowStackTraceError from '$lib/components/workflow/workflow-stack-trace-error.svelte';
  import InputAndResults from './_input-and-results.svelte';
  import WorkflowDetail from '../_workflow-detail.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

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
    <div class="flex gap-1 flex-col md:flex-row md:gap-6">
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
      <WorkflowDetail
        title="Parent"
        content={workflow.parent?.workflowId}
        href={routeForWorkflow({
          namespace,
          workflow: workflow.parent?.workflowId,
          run: workflow.parent?.runId,
        })}
      />
    {/if}
    <WorkflowDetail
      title="State Transitions"
      content={workflow.stateTransitionCount}
    />
  </section>
  <WorkflowStackTraceError {workflow} {workers} />
  <section class="flex gap-4 w-full flex-col lg:flex-row">
    <InputAndResults type="input" />
    <InputAndResults type="results" />
  </section>
  <PendingActivties />
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
      <h3 class="text-lg font-medium">Recent Events</h3>
      <div id="event-view-toggle" class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon={faTable}
            base={routeForEventHistory(routeParameters('feed'))}
            href={routeForEventHistory(routeParameters('feed'))}
            active={$eventViewType === 'feed'}
            data-cy="feed"
            on:click={() => ($eventViewType = 'feed')}>Timeline</ToggleButton
          >
          <ToggleButton
            icon={faLayerGroup}
            href={routeForEventHistory(routeParameters('compact'))}
            active={$eventViewType === 'compact'}
            data-cy="compact"
            on:click={() => ($eventViewType = 'compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon={faCode}
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
