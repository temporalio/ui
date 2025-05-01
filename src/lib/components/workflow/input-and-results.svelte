<script lang="ts">
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: isRunning = $workflowRun.workflow.isRunning;
</script>

<div class="flex flex-col gap-4 lg:flex-row" data-testid="input-and-result">
  <InputAndResultsPayload
    title="Input"
    content={workflowEvents.input}
    {isRunning}
  />
  <InputAndResultsPayload
    title="Result"
    content={workflowEvents.results}
    {isRunning}
  />
</div>
