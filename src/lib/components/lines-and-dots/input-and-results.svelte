<script lang="ts">
  import type { WorkflowEvents } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  export let history: WorkflowEvents;
  export let isRunning = true;

  $: workflowEvents = getWorkflowStartedCompletedAndTaskFailedEvents(history);
</script>

<div class="flex gap-0">
  <InputAndResultsPayload
    content={workflowEvents.input}
    {isRunning}
    title="Input"
  />
  <InputAndResultsPayload
    content={workflowEvents.results}
    {isRunning}
    title="Results"
  />
</div>
