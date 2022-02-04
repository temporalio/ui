<script lang="ts">
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import { notifications } from '$lib/stores/notifications';
  import { handleError } from '$lib/utilities/handle-error';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import Button from '$lib/components/button.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let reason = '';
  const { refresh } = getAppContext('workflow');

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const handleSuccessfulTermination = () => {
    reason = '';
    notifications.add('success', 'Workflow Terminated');
    refresh();
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
