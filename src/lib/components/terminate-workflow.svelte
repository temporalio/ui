<script lang="ts">
  import { goto } from '$app/navigation';

  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { handleError } from '$lib/utilities/handle-error';
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import { notifications } from '$lib/stores/notifications';

  import Button from '$lib/components/button.svelte';
  import Modal from '$lib/components/modal.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let reason = '';
  let showConfirmation = false;

  const show = () => (showConfirmation = true);
  const cancel = () => (showConfirmation = false);

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const handleSuccessfulTermination = () => {
    showConfirmation = false;
    reason = '';
    notifications.add('success', 'Workflow Terminated');
    window.location.reload();
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
  <Button destroy on:click={show}>Terminate</Button>
  <Modal
    open={showConfirmation}
    confirmText="Terminate"
    on:cancelModal={cancel}
    on:confirmModal={terminate}
  >
    <span slot="title">
      Are you sure you want to terminate this workflow?
    </span>
    <span slot="content">
      <input
        class="block w-full border border-gray-200 p-4"
        placeholder="Reason"
        bind:value={reason}
      />
    </span>
  </Modal>
{/if}
