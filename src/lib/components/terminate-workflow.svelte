<script lang="ts">
  import { goto } from '$app/navigation';

  import { routeForWorkflow } from '$lib/utilities/route-for';
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
      routeForWorkflow({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
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
