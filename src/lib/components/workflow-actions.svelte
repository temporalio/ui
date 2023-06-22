<script lang="ts">
  import { page } from '$app/stores';
  import {
    resetWorkflow,
    signalWorkflow,
    terminateWorkflow,
  } from '$lib/services/workflow-service';
  import { authUser } from '$lib/stores/auth-user';

  import { formatReason } from '$lib/utilities/workflow-actions';
  import { Action } from '$lib/models/workflow-actions';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';
  import { ResetReapplyType } from '$lib/models/workflow-actions';

  import { refresh } from '$lib/stores/workflow-run';
  import { settings } from '$lib/stores/settings';
  import { coreUserStore } from '$lib/stores/core-user';
  import { cancelWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';

  import SplitButton from '$lib/holocene/split-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuDivider from '$lib/holocene/primitives/menu/menu-divider.svelte';
  import JSONEditor from '$lib/holocene/json-editor.svelte';
  import { resetEvents } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import WorkflowResetForm from '$lib/components/workflow/workflow-reset-form.svelte';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { translate } from '$lib/i18n/translate';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let cancelInProgress: boolean;

  let reason = '';
  let signalInput = '';
  let signalName = '';
  let cancelConfirmationModal: Modal;
  let terminateConfirmationModal: Modal;
  let resetConfirmationModal: Modal;
  let signalConfirmationModal: Modal;
  let resetReapplyType: ResetReapplyType = ResetReapplyType.Unspecified;
  let resetId: string;
  let resetReason: string;
  let loading = false;

  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: signalEnabled = workflowSignalEnabled($page.data.settings);
  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: resetEnabled = workflowResetEnabled($page.data.settings);

  const hideTerminationModal = () => {
    reason = '';
  };

  const hideSignalModal = () => {
    signalInput = '';
    signalName = '';
  };

  const hideResetModal = () => {
    resetReapplyType = ResetReapplyType.Unspecified;
    resetId = undefined;
    resetReason = undefined;
  };

  const handleSuccessfulTermination = async () => {
    terminateConfirmationModal?.close();
    $refresh = Date.now();
    toaster.push({
      id: 'workflow-termination-success-toast',
      message: translate('workflows', 'terminate-success'),
    });
  };

  const handleTerminationError = (error: NetworkError) => {
    reason = '';
    terminateConfirmationModal?.setError(
      error?.message ?? translate('unknown-error'),
    );
  };

  const terminate = () => {
    if (!workflow.canBeTerminated) return;
    terminateWorkflow({
      workflow,
      namespace,
      reason: formatReason({
        action: Action.Terminate,
        reason,
        email: $authUser.email,
      }),
      identity: $authUser.email,
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
      cancelConfirmationModal?.close();
      loading = false;
      $refresh = Date.now();
      toaster.push({
        id: 'workflow-cancelation-success-toast',
        message: translate('workflows', 'cancel-success'),
      });
    } catch (error) {
      cancelConfirmationModal?.setError(
        error?.message ?? translate('unknown-error'),
      );
    }
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
      signalConfirmationModal?.close();
      $refresh = Date.now();
      toaster.push({
        message: translate('workflows', 'signal-success'),
        id: 'workflow-signal-success-toast',
      });
    } catch (error) {
      signalConfirmationModal?.setError(
        error?.message ?? translate('unknown-error'),
      );
    }

    hideSignalModal();
  };

  const reset = async () => {
    try {
      const response = await resetWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
        eventId: resetId,
        reason: formatReason({
          action: Action.Reset,
          reason: resetReason,
          email: $authUser.email,
        }),
        resetReapplyType,
      });

      if (response && response.runId) {
        resetWorkflows.update((previous) => ({
          ...previous,
          [workflow.runId]: response.runId,
        }));
      }
      resetConfirmationModal?.close();
      $refresh = Date.now();
    } catch (error) {
      resetConfirmationModal?.setError(
        error?.message ?? translate('unknown-error'),
      );
    }
    hideResetModal();
  };

  let workflowActions: {
    label: string;
    onClick: () => void;
    allowed: boolean;
    testId: string;
    destructive?: boolean;
    tooltip?: string;
  }[];

  const resetTooltipText = (): string | undefined => {
    if (!resetEnabled) return translate('workflows', 'reset-disabled');
    if (resetEnabled && workflow?.pendingChildren?.length > 0)
      return translate('workflows', 'reset-disabled-pending-children');
    if (
      resetEnabled &&
      workflow?.pendingChildren?.length === 0 &&
      $resetEvents.length === 0
    )
      return translate('workflows', 'reset-disabled-no-events');
  };

  $: workflowActions = [
    {
      label: translate('workflows', 'reset'),
      onClick: () => resetConfirmationModal.open(),
      testId: 'reset-button',
      allowed:
        resetEnabled &&
        workflow?.pendingChildren?.length === 0 &&
        $resetEvents.length > 0,
      tooltip: resetTooltipText(),
    },
    {
      label: translate('workflows', 'signal'),
      onClick: () => signalConfirmationModal.open(),
      testId: 'signal-button',
      allowed: signalEnabled,
      tooltip: signalEnabled ? '' : translate('workflows', 'signal-disabled'),
    },
    {
      label: translate('workflows', 'terminate'),
      onClick: () => terminateConfirmationModal.open(),
      testId: 'terminate-button',
      allowed: terminateEnabled,
      destructive: true,
      tooltip: terminateEnabled
        ? ''
        : translate('workflows', 'terminate-disabled'),
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
  on:click={() => cancelConfirmationModal.open()}
  label={translate('workflows', 'request-cancellation')}
>
  {#each workflowActions as { onClick, destructive, label, allowed, testId, tooltip }}
    {#if destructive}
      <MenuDivider />
    {/if}
    <MenuItem
      on:click={onClick}
      {destructive}
      {testId}
      disabled={!allowed}
      tooltipProps={{ text: tooltip, left: true, width: 200 }}
    >
      {label}
    </MenuItem>
  {/each}
</SplitButton>

<Modal
  id="reset-confirmation-modal"
  data-testid="reset-confirmation-modal"
  bind:this={resetConfirmationModal}
  on:confirmModal={reset}
  on:cancelModal={hideResetModal}
  confirmDisabled={!resetId}
>
  <h3 slot="title">{translate('workflows', 'reset-modal-title')}</h3>
  <svelte:fragment slot="content">
    <WorkflowResetForm
      bind:eventId={resetId}
      bind:resetReapplyType
      bind:reason={resetReason}
    />
  </svelte:fragment>
</Modal>
<Modal
  id="cancel-confirmation-modal"
  data-testid="cancel-confirmation-modal"
  bind:this={cancelConfirmationModal}
  {loading}
  confirmType="destructive"
  on:confirmModal={cancel}
>
  <h3 slot="title">{translate('workflows', 'cancel-modal-title')}</h3>
  <svelte:fragment slot="content">
    <p>
      {translate('workflows', 'cancel-modal-confirmation')}
    </p>
  </svelte:fragment>
</Modal>
<Modal
  id="terminate-confirmation-modal"
  data-testid="terminate-confirmation-modal"
  bind:this={terminateConfirmationModal}
  confirmText={translate('workflows', 'terminate')}
  confirmType="destructive"
  on:cancelModal={hideTerminationModal}
  on:confirmModal={terminate}
>
  <h3 slot="title">{translate('workflows', 'terminate-modal-title')}</h3>
  <div slot="content">
    <p>
      {translate('workflows', 'terminate-modal-confirmation')}
    </p>
    <Input
      id="workflow-termination-reason"
      class="mt-4"
      placeholder={translate('workflows', 'terminate-reason-input-placeholder')}
      bind:value={reason}
    />
  </div>
</Modal>
<Modal
  id="signal-confirmation-modal"
  data-testid="signal-confirmation-modal"
  bind:this={signalConfirmationModal}
  confirmText={translate('submit')}
  confirmDisabled={!signalName}
  on:cancelModal={hideSignalModal}
  on:confirmModal={signal}
>
  <h3 slot="title">{translate('workflows', 'signal-modal-title')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <Input
      id="signal-name"
      label={translate('workflows', 'signal-name-label')}
      required
      bind:value={signalName}
    />
    <div>
      <span class="font-secondary text-sm font-medium"
        >{translate('workflows', 'signal-payload-input-label')}</span
      >
      <span class="font-secondary text-xs font-light italic">
        {translate('workflows', 'signal-payload-input-label-hint')}
      </span>
      <JSONEditor
        class="max-h-80 overflow-y-scroll overscroll-contain"
        value={signalInput}
        on:change={handleSignalInputChange}
      />
    </div>
  </div>
</Modal>
