<script lang="ts">
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { notifications } from '$lib/stores/notifications';
  import Button from '$lib/components/button.svelte';
  import { handleError } from '$lib/utilities/handle-error';
  import { isFunction } from '$lib/utilities/is-function';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: () => void = null;

  let reason: string = '';

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const terminate = () => {
    terminateWorkflow({
      workflow,
      namespace,
      reason,
    })
      .then(() => {
        reason = '';
        notifications.add('success', 'Workflow Terminated');
        if (isFunction(refresh)) refresh();
      })
      .catch(handleError);
  };
</script>

{#if isEligibleForTermination(workflow)}
  <Button variant="destroy" size="small" on:click={terminate}>Terminate</Button>
{/if}
