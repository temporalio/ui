<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { routeForWorkers } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';

  import Accordion from '$lib/holocene/accordion.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
</script>

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
      <WorkflowDetail content={$workflowRun.workflow?.name} copyable />
      <WorkflowDetail
        title="Run ID"
        content={$workflowRun.workflow?.runId}
        copyable
      />
    </div>
    <div class="col-span-1">
      <h3 class="font-medium">Task Queue</h3>
      <div class="h-0.5 rounded-full bg-gray-900" />
      <WorkflowDetail
        content={$workflowRun.workflow?.taskQueue}
        href={routeForWorkers({
          namespace: $page.params.namespace,
          workflow: $workflowRun.workflow?.id,
          run: $workflowRun.workflow?.runId,
        })}
        copyable
      />
      <WorkflowDetail
        title="State Transitions"
        content={$workflowRun.workflow?.stateTransitionCount}
      />
    </div>
    <div class="col-span-1">
      <h3 class="font-medium">Start & Close Time</h3>
      <div class="h-0.5 rounded-full bg-gray-900" />
      <WorkflowDetail
        title="Start Time"
        content={formatDate($workflowRun.workflow?.startTime, $timeFormat)}
      />
      <WorkflowDetail
        title="Close Time"
        content={formatDate($workflowRun.workflow?.endTime, $timeFormat)}
      />
    </div>
  </div>
</Accordion>
