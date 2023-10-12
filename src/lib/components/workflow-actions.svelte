<script lang="ts">
  import { writable } from 'svelte/store';

  import { page } from '$app/stores';

  import WorkflowResetForm from '$lib/components/workflow/workflow-reset-form.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import Modal from '$lib/holocene/modal.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { createTranslate, translate } from '$lib/i18n/translate';
  import { Action, ResetReapplyType } from '$lib/models/workflow-actions';
  import {
    cancelWorkflow,
    resetWorkflow,
    signalWorkflow,
    terminateWorkflow,
  } from '$lib/services/workflow-service';
  import { authUser } from '$lib/stores/auth-user';
  import { coreUserStore } from '$lib/stores/core-user';
  import {
    codecEndpoint,
    includeCredentials,
    passAccessToken,
  } from '$lib/stores/data-encoder-config';
  import { resetEvents } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { settings } from '$lib/stores/settings';
  import { toaster } from '$lib/stores/toaster';
  import { refresh } from '$lib/stores/workflow-run';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatReason } from '$lib/utilities/workflow-actions';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let cancelInProgress: boolean;
  export let isRunning: boolean;
  const t = createTranslate('workflows');

  const getDefaultSignalInput = () =>
    $codecEndpoint ? '{"metadata": {"encoding": ""}, "data": ""}' : '';

  let reason = '';
  let signalInput = getDefaultSignalInput();
  let signalName = '';
  let cancelConfirmationModalOpen = false;
  let terminateConfirmationModalOpen = false;
  let resetConfirmationModalOpen = false;
  let signalConfirmationModalOpen = false;
  let error = '';
  let resetReapplyType: ResetReapplyType = ResetReapplyType.Signal;
  let resetId = writable<string>();
  let resetReason: string;
  let loading = false;
  let resetTooltipText: string;
  let signalInputCodeBlock: CodeBlock;

  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: signalEnabled = workflowSignalEnabled($page.data.settings);
  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: resetEnabled = workflowResetEnabled($page.data.settings);

  const hideTerminationModal = () => {
    reason = '';
  };

  const hideSignalModal = () => {
    signalInput = getDefaultSignalInput();
    signalName = '';
    signalInputCodeBlock?.resetView(signalInput);
  };

  const hideResetModal = () => {
    resetReapplyType = ResetReapplyType.Signal;
    $resetId = undefined;
    resetReason = undefined;
  };

  const handleSuccessfulTermination = async () => {
    terminateConfirmationModalOpen = false;
    $refresh = Date.now();
    toaster.push({
      id: 'workflow-termination-success-toast',
      message: t('terminate-success'),
    });
  };

  const handleTerminationError = (err: NetworkError) => {
    reason = '';
    error = err?.message ?? translate('unknown-error');
  };

  const terminate = () => {
    error = '';
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
    error = '';
    try {
      await cancelWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
      });
      cancelConfirmationModalOpen = false;
      loading = false;
      $refresh = Date.now();
      toaster.push({
        id: 'workflow-cancelation-success-toast',
        message: t('cancel-success'),
      });
    } catch (err) {
      error = err?.message ?? translate('unknown-error');
    }
  };

  const handleSignalInputChange = (event: CustomEvent<string>) => {
    signalInput = event.detail;
  };

  const signal = async () => {
    error = '';
    try {
      await signalWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
        signalInput,
        signalName,
        settings: {
          ...$page.data.settings,
          codec: {
            endpoint: $codecEndpoint,
            includeCredentials: $includeCredentials,
            passAccessToken: $passAccessToken,
          },
        },
        accessToken: $authUser.accessToken,
      });
      signalConfirmationModalOpen = false;
      $refresh = Date.now();
      toaster.push({
        message: t('signal-success'),
        id: 'workflow-signal-success-toast',
      });
      hideSignalModal();
    } catch (err) {
      error = err?.message ?? translate('unknown-error');
    }
  };

  const reset = async () => {
    error = '';
    try {
      const response = await resetWorkflow({
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
        eventId: $resetId,
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
      resetConfirmationModalOpen = false;
      $refresh = Date.now();
    } catch (err) {
      error = err?.message ?? translate('unknown-error');
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

  $: {
    if (!resetEnabled) {
      resetTooltipText = t('reset-disabled');
    } else if (resetEnabled && workflow?.pendingChildren?.length > 0) {
      resetTooltipText = t('reset-disabled-pending-children');
    } else if (
      resetEnabled &&
      workflow?.pendingChildren?.length === 0 &&
      $resetEvents.length === 0
    ) {
      resetTooltipText = t('reset-disabled-no-events');
    }
  }

  $: resetAllowed =
    resetEnabled &&
    workflow?.pendingChildren?.length === 0 &&
    $resetEvents.length > 0;

  $: workflowActions = [
    {
      label: t('reset'),
      onClick: () => (resetConfirmationModalOpen = true),
      testId: 'reset-button',
      allowed: resetAllowed,
      tooltip: resetAllowed ? '' : resetTooltipText,
    },
    {
      label: t('signal'),
      onClick: () => (signalConfirmationModalOpen = true),
      testId: 'signal-button',
      allowed: signalEnabled,
      tooltip: signalEnabled ? '' : t('signal-disabled'),
    },
    {
      label: t('terminate'),
      onClick: () => (terminateConfirmationModalOpen = true),
      testId: 'terminate-button',
      allowed: terminateEnabled,
      destructive: true,
      tooltip: terminateEnabled ? '' : t('terminate-disabled'),
    },
  ];

  let coreUser = coreUserStore();

  $: actionsDisabled =
    $coreUser.namespaceWriteDisabled(namespace) ||
    !writeActionsAreAllowed(settings);
</script>

{#if isRunning}
  <SplitButton
    id="workflow-actions"
    position="right"
    disabled={actionsDisabled}
    primaryActionDisabled={!cancelEnabled || cancelInProgress}
    on:click={() => (cancelConfirmationModalOpen = true)}
    label={t('request-cancellation')}
    menuLabel={t('workflow-actions')}
  >
    {#each workflowActions as { onClick, destructive, label, allowed, testId, tooltip }}
      {#if destructive}
        <MenuDivider />
      {/if}
      <Tooltip text={tooltip} hide={!tooltip} width={200} left>
        <MenuItem
          on:click={onClick}
          {destructive}
          disabled={!allowed}
          data-testid={testId}
        >
          {label}
        </MenuItem>
      </Tooltip>
    {/each}
  </SplitButton>
{:else}
  <Tooltip bottomRight width={200} text={resetTooltipText} hide={resetAllowed}>
    <Button
      aria-label={t('reset')}
      disabled={!resetAllowed}
      variant="primary"
      on:click={() => (resetConfirmationModalOpen = true)}
    >
      {t('reset')}
    </Button>
  </Tooltip>
{/if}

<Modal
  id="reset-confirmation-modal"
  data-testid="reset-confirmation-modal"
  confirmText={translate('confirm')}
  cancelText={translate('cancel')}
  bind:error
  bind:open={resetConfirmationModalOpen}
  on:confirmModal={reset}
  on:cancelModal={hideResetModal}
  confirmDisabled={!$resetId}
>
  <h3 slot="title">{t('reset-modal-title')}</h3>
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
  confirmText={translate('confirm')}
  cancelText={translate('cancel')}
  bind:error
  bind:open={cancelConfirmationModalOpen}
  {loading}
  confirmType="destructive"
  on:confirmModal={cancel}
>
  <h3 slot="title">{t('cancel-modal-title')}</h3>
  <svelte:fragment slot="content">
    <p>
      {t('cancel-modal-confirmation')}
    </p>
  </svelte:fragment>
</Modal>
<Modal
  id="terminate-confirmation-modal"
  data-testid="terminate-confirmation-modal"
  bind:error
  bind:open={terminateConfirmationModalOpen}
  confirmText={t('terminate')}
  cancelText={translate('cancel')}
  confirmType="destructive"
  on:cancelModal={hideTerminationModal}
  on:confirmModal={terminate}
>
  <h3 slot="title">{t('terminate-modal-title')}</h3>
  <div slot="content">
    <p>
      {t('terminate-modal-confirmation')}
    </p>
    <Input
      id="workflow-termination-reason"
      class="mt-4"
      placeholder={translate('reason-placeholder')}
      label={translate('reason-placeholder')}
      labelHidden
      bind:value={reason}
    />
  </div>
</Modal>
<Modal
  id="signal-confirmation-modal"
  data-testid="signal-confirmation-modal"
  bind:error
  bind:open={signalConfirmationModalOpen}
  confirmText={translate('submit')}
  cancelText={translate('cancel')}
  confirmDisabled={!signalName}
  on:cancelModal={hideSignalModal}
  on:confirmModal={signal}
>
  <h3 slot="title">{t('signal-modal-title')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <Input
      id="signal-name"
      label={t('signal-name-label')}
      required
      bind:value={signalName}
    />
    <div>
      <span class="font-secondary text-sm font-medium"
        >{t('signal-payload-input-label')}</span
      >
      <span class="font-secondary text-xs font-light italic">
        {t('signal-payload-input-label-hint')}
      </span>
      <CodeBlock
        class="max-h-80 overflow-y-scroll overscroll-contain"
        content={signalInput}
        on:change={handleSignalInputChange}
        editable
        copyable={false}
        bind:this={signalInputCodeBlock}
      />
    </div>
  </div>
</Modal>
