<script lang="ts">
  import { retriggerWorkflow } from "$lib/services/workflow-service.js";
  import { workflowRun } from "$lib/stores/workflow-run.js";
  import Modal from "$lib/holocene/modal.svelte";
  import Input from "$lib/holocene/input/input.svelte";

  export let namespace: string;
  export let isRunning: boolean;

  let reason = '';
  let eventId = '';

  let retriggerConfirmationModal: Modal

  const onRetrigger = () => {
    retriggerConfirmationModal.open()
  }

  const hideRetriggerModal = () => {
    reason = '';
  }

  const retrigger = async () => {
    const res = await retriggerWorkflow({
      namespace, workflowId: $workflowRun?.workflow.id, runId: $workflowRun?.workflow.runId, reason, eventId
    });

    if (res.ok) {
      reason = '';
      eventId = '';
      retriggerConfirmationModal.close();
    }
  }
</script>

{#if !isRunning}
  <button id="retrigger" class="bg-black text-offWhite p-2 rounded" on:click={() => onRetrigger()}>Re-trigger Workflow</button>
{/if}

<Modal
  data-testid="re-trigger-confirmation-modal"
  bind:this={retriggerConfirmationModal}
  confirmText="Retrigger"
  on:cancelModal={hideRetriggerModal}
  on:confirmModal={retrigger}
>
  <h3 slot="title">Re-trigger Workflow</h3>
  <div slot="content" id="retrigger-modal">
    <p>
      Are you sure you want to re-trigger this workflow? This action cannot be
      undone.
    </p>
    <Input
      id="workflow-retrigger-reason"
      class="mt-4"
      placeholder="Enter a reason"
      bind:value={reason}
    />
    <Input
      id="workflow-retrigger-reason"
      class="mt-4"
      placeholder="Enter a namespace"
      bind:value={namespace}
      disabled="disabled"
    />
    <Input
      id="workflow-retrigger-event-id"
      class="mt-4"
      placeholder="Enter Event Id"
      bind:value={eventId}
      type="number"
    />
  </div>
</Modal>