<script lang="ts">
  import { tick } from 'svelte';

  import { refresh } from '$lib/stores/workflow-run';
  import {
    signalWorkflow,
    terminateWorkflow,
  } from '$lib/services/workflow-service';
  import { settings } from '$lib/stores/settings';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import Modal from '$holocene/modal.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import { cancelWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/holocene/toaster.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import FeatureGuard from './feature-guard.svelte';
  import Button from '$lib/holocene/button.svelte';
  import MenuDivider from '$lib/holocene/primitives/menu/menu-divider.svelte';
  import JSONEditor from '$lib/holocene/JSON-editor.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let cancelInProgress: boolean;
  export let cancelEnabled: boolean;
  export let signalEnabled: boolean;

  let reason = '';
  let signalInput = '';
  let signalName = '';
  let showTerminationConfirmation = false;
  let showCancellationConfirmation = false;
  let showSignalConfirmation = false;
  let loading = false;

  const showTerminationModal = () => (showTerminationConfirmation = true);
  const hideTerminationModal = () => (showTerminationConfirmation = false);
  const showCancellationModal = () => (showCancellationConfirmation = true);
  const hideCancellationModal = () => (showCancellationConfirmation = false);
  const showSignalModal = () => (showSignalConfirmation = true);
  const hideSignalModal = () => (showSignalConfirmation = false);

  const handleSuccessfulTermination = async () => {
    showTerminationConfirmation = false;
    reason = '';
    $refresh = Date.now();
    await tick();
    toaster.push({
      id: 'workflow-termination-success-toast',
      message: 'Workflow terminated.',
      variant: 'success',
      yPosition: 'top',
    });
  };

  const handleTerminationError = () => {
    showTerminationConfirmation = false;
    reason = '';
    toaster.push({ message: 'Cannot terminate workflow.', variant: 'error' });
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

  const cancel = async () => {
    loading = true;
    try {
      await cancelWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
      });
      loading = false;
      $refresh = Date.now();
    } catch {
      toaster.push({
        yPosition: 'top',
        variant: 'error',
        message: 'Unable to cancel workflow.',
      });
    }
    showCancellationConfirmation = false;
  };

  const handleSignalInputChange = (event: CustomEvent<string>) => {
    signalInput = event.detail;
  };

  const sendSignal = async () => {
    try {
      await signalWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
        signalInput,
        signalName,
      });
      $refresh = Date.now();
      await tick();
      toaster.push({
        message: 'Workflow successfully signaled.',
        yPosition: 'bottom',
        id: 'workflow-signal-success-toast',
      });
    } catch (error) {
      toaster.push({
        variant: 'error',
        message: 'Error signaling workflow.',
        yPosition: 'bottom',
      });
    }
    signalInput = '';
    signalName = '';
    showSignalConfirmation = false;
  };

  let coreUser = coreUserStore();

  $: actionsDisabled =
    $coreUser.namespaceWriteDisabled(namespace) ||
    !writeActionsAreAllowed(settings);
</script>

<Tooltip
  bottomLeft
  hide={!actionsDisabled}
  width={200}
  text="You do not have permission to edit this workflow. Contact your admin for assistance."
>
  <FeatureGuard enabled={cancelEnabled}>
    <SplitButton
      primaryActionDisabled={cancelInProgress}
      disabled={actionsDisabled}
      label="Request Cancellation"
      on:click={showCancellationModal}
      id="workflow-actions"
    >
      {#if signalEnabled}
        <MenuItem
          dataCy="signal-button"
          on:click={showSignalModal}
          disabled={actionsDisabled}>Send a Signal</MenuItem
        >
        <MenuDivider />
      {/if}
      <MenuItem
        destructive
        on:click={showTerminationModal}
        disabled={actionsDisabled}
        dataCy="terminate-button"
      >
        Terminate
      </MenuItem>
    </SplitButton>
    <Button
      slot="fallback"
      variant="destructive"
      on:click={showTerminationModal}
      disabled={actionsDisabled}
      dataCy="terminate-button"
    >
      Terminate
    </Button>
  </FeatureGuard>
</Tooltip>

{#if !actionsDisabled}
  <Modal
    open={showCancellationConfirmation}
    {loading}
    confirmType="destructive"
    on:cancelModal={hideCancellationModal}
    on:confirmModal={cancel}
  >
    <h3 slot="title">Cancel Workflow</h3>
    <svelte:fragment slot="content">
      <p>
        Are you sure you want to cancel this workflow? This action cannot be
        undone.
      </p>
    </svelte:fragment>
  </Modal>
  <Modal
    open={showTerminationConfirmation}
    confirmText="Terminate"
    confirmType="destructive"
    on:cancelModal={hideTerminationModal}
    on:confirmModal={terminate}
  >
    <h3 slot="title">Terminate Workflow</h3>
    <div slot="content">
      <p>
        Are you sure you want to terminate this workflow? This action cannot be
        undone.
      </p>
      <Input
        id="workflow-termination-reason"
        class="mt-4"
        placeholder="Enter a reason"
        bind:value={reason}
      />
    </div>
  </Modal>
  <Modal
    open={showSignalConfirmation}
    confirmText="Submit"
    confirmDisabled={!signalName}
    on:cancelModal={hideSignalModal}
    on:confirmModal={sendSignal}
  >
    <h3 slot="title">Send a Signal</h3>
    <div slot="content" class="flex flex-col gap-4">
      <Input
        id="signal-name"
        label="Signal name"
        required
        bind:value={signalName}
      />
      <div>
        <span class="font-secondary text-sm font-medium">Input</span>
        <span class="font-secondary text-xs font-light italic">
          (only JSON payloads are supported)
        </span>
        <JSONEditor value={signalInput} on:change={handleSignalInputChange} />
      </div>
    </div>
  </Modal>
{/if}
