<script>import { tick } from 'svelte';
import { refresh } from '../stores/workflow-run';
import { notifications } from '../stores/notifications';
import { terminateWorkflow } from '../services/terminate-service';
import Button from '$holocene/button.svelte';
import Modal from '$holocene/modal.svelte';
export let workflow;
export let namespace;
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
    if (!workflow.canBeTerminated)
        return;
    terminateWorkflow({
        workflow,
        namespace,
        reason,
    })
        .then(handleSuccessfulTermination)
        .catch(handleTerminationError);
};
</script>

{#if workflow.canBeTerminated}
  <Button variant="destructive" on:click={show} dataCy="terminate-button">
    Terminate
  </Button>
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
