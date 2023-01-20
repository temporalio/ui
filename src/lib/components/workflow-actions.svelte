<script lang="ts">
  import { refresh } from '$lib/stores/workflow-run';
  import {
    signalWorkflow,
    terminateWorkflow,
  } from '$lib/services/workflow-service';
  import { settings } from '$lib/stores/settings';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import Modal from '$lib/holocene/modal.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import { cancelWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuDivider from '$lib/holocene/primitives/menu/menu-divider.svelte';
  import JSONEditor from '$lib/holocene/json-editor.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let cancelInProgress: boolean;
  export let terminateEnabled: boolean;
  export let cancelEnabled: boolean;
  export let signalEnabled: boolean;

  let reason = '';
  let signalInput = '';
  let signalName = '';
  let showTerminationConfirmation = false;
  let showCancellationConfirmation = false;
  let showSignalConfirmation = false;
  let loading = false;

  const showTerminationModal = () => {
    showTerminationConfirmation = true;
  };

  const hideTerminationModal = () => {
    showTerminationConfirmation = false;
    reason = '';
  };

  const showCancellationModal = () => {
    showCancellationConfirmation = true;
  };

  const hideCancellationModal = () => {
    showCancellationConfirmation = false;
  };

  const showSignalModal = () => {
    showSignalConfirmation = true;
  };

  const hideSignalModal = () => {
    showSignalConfirmation = false;
    signalInput = '';
    signalName = '';
  };

  const handleSuccessfulTermination = async () => {
    showTerminationConfirmation = false;
    reason = '';
    $refresh = Date.now();
    toaster.push({
      id: 'workflow-termination-success-toast',
      message: 'Workflow terminated.',
      variant: 'success',
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
        variant: 'error',
        message: 'Unable to cancel workflow.',
      });
    }
    showCancellationConfirmation = false;
  };

  const handleSignalInputChange = (event: CustomEvent<string>) => {
    signalInput = event.detail;
  };

  const signal = async () => {
    try {
      await signalWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
        signalInput,
        signalName,
      });
      $refresh = Date.now();
      toaster.push({
        message: 'Workflow successfully signaled.',
        id: 'workflow-signal-success-toast',
      });
    } catch (error) {
      toaster.push({
        variant: 'error',
        message: 'Error signaling workflow.',
      });
    }
    signalInput = '';
    signalName = '';
    showSignalConfirmation = false;
  };

  let workflowActions: {
    label: string;
    onClick: () => void;
    allowed: boolean;
    dataCy: string;
    destructive?: boolean;
  }[];

  $: workflowActions = [
    {
      label: 'Send a Signal',
      onClick: showSignalModal,
      dataCy: 'signal-button',
      allowed: signalEnabled,
    },
    {
      label: 'Terminate',
      onClick: showTerminationModal,
      dataCy: 'terminate-button',
      allowed: terminateEnabled,
      destructive: true,
    },
  ];

  let coreUser = coreUserStore();

  $: actionsDisabled =
    $coreUser.namespaceWriteDisabled(namespace) ||
    !writeActionsAreAllowed(settings);
</script>

<SplitButton
  id="workflow-actions"
  position="right"
  disabled={actionsDisabled}
  primaryActionDisabled={!cancelEnabled || cancelInProgress}
  on:click={showCancellationModal}
  label="Request Cancellation"
>
  {#each workflowActions as { onClick, destructive, label, allowed, dataCy }}
    {#if destructive}
      <MenuDivider />
    {/if}
    <MenuItem on:click={onClick} {destructive} {dataCy} disabled={!allowed}>
      {label}
    </MenuItem>
  {/each}
</SplitButton>

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
  on:confirmModal={signal}
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
      <JSONEditor
        class="max-h-80 overflow-y-scroll overscroll-contain"
        value={signalInput}
        on:change={handleSignalInputChange}
      />
    </div>
  </div>
</Modal>
