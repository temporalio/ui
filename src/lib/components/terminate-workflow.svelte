<script lang="ts">
  import { goto } from '$app/navigation';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { routeFor } from '$lib/utilities/route-for';
  import { handleError } from '$lib/utilities/handle-error';
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import { notifications } from '$lib/stores/notifications';

  import Button from '$lib/components/button.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let reason = '';

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const handleSuccessfulTermination = () => {
    reason = '';
    notifications.add('success', 'Workflow Terminated');
    goto(
      routeFor('workflow', {
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
      }),
    );
  };

  const terminate = () => {
    terminateWorkflow({
      workflow,
      namespace,
      reason,
    })
      .then(handleSuccessfulTermination)
      .catch(handleError);
  };
</script>

{#if isEligibleForTermination(workflow)}
  <Button destroy on:click={terminate}>Terminate</Button>
{/if}
