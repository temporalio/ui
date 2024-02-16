<script lang="ts">
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: isRunning = $workflowRun.workflow.isRunning;
</script>

<div class="flex flex-col gap-0 border-b-4 lg:flex-row">
  <InputAndResultsPayload
    content={workflowEvents.input}
    {isRunning}
    title="Input"
    class="border-r-4"
  />
  <InputAndResultsPayload
    content={workflowEvents.results}
    {isRunning}
    title="Results"
  />
</div>
