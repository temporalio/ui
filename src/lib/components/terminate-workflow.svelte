<script lang="ts">
  import { tick } from 'svelte';

  import { refresh } from '$lib/stores/workflow-run';
  import { notifications } from '$lib/stores/notifications';
  import { terminateWorkflow } from '$lib/services/terminate-service';

  import Button from '$holocene/button.svelte';
  import Modal from '$holocene/modal.svelte';
  import { getCoreUser } from '$lib/utilities/core-user';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let reason = '';
  let showConfirmation = false;

  const show = () => (showConfirmation = true);
  const cancel = () => (showConfirmation = false);

  const handleSuccessfulTermination = async () => {
    showConfirmation = false;
    reason = '';
    $refresh = Date.now();
    await tick();
    notifications.add('success', 'Workflow Terminated');
  };

  const handleTerminationError = () => {
    showConfirmation = false;
    reason = '';
    notifications.add('error', 'Cannot Terminate Workflow');
  };

  const terminate = () => {
    if (!workflow.canBeTerminated) return;
    terminateWorkflow({
      workflow,
      namespace,
      reason,
    })
      .then(handleSuccessfulTermination)
      .catch(handleTerminationError);
  };

  const user = getCoreUser();
  $: terminateDisabled = user.terminateDisabled(namespace);
</script>

{#if workflow.canBeTerminated}
  <Tooltip
    bottomLeft
    hide={!terminateDisabled}
    width={200}
    text="You do not have permission to terminate this workflow. Contact your admin for assistance."
  >
    <Button
      variant="destructive"
      on:click={show}
      disabled={terminateDisabled}
      dataCy="terminate-button"
    >
      Terminate
    </Button>
  </Tooltip>
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
