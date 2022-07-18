<script lang="ts">
  import { handleError } from '$lib/utilities/handle-error';
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import { notifications } from '$lib/stores/notifications';

  import Button from '$holocene/button.svelte';
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
  <Button variant="destructive" on:click={show}>Terminate</Button>
  <Modal
    open={showConfirmation}
    confirmText="Terminate"
    confirmType="destructive"
    on:cancelModal={cancel}
    on:confirmModal={terminate}
  >
    <h3 slot="title">Terminate Workflow</h3>
    <div slot="content">
      <p>
        Are you sure you want to terminate this workflow? This action cannot be
        undone.
      </p>
      <input
        class="mt-4 block w-full rounded-md border border-gray-200 p-2"
        placeholder="Enter a reason"
        bind:value={reason}
      />
    </div>
  </Modal>
{/if}
