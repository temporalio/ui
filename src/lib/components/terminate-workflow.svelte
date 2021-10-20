<script lang="ts">
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export let workflow: WorkflowExecution;
  export let namespace: string;
</script>

<button
  class="mt-2 bg-red-600 p-1 text-white uppercase rounded text-sm"
  on:click={() =>
    terminateWorkflow({
      workflow,
      namespace,
      reason: 'REPLACE_ME',
    })}>Terminate</button
>
