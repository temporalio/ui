<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import PauseConfirmationModal from '$lib/components/workflow/client-actions/pause-confirmation-modal.svelte';
  import ResetConfirmationModal from '$lib/components/workflow/client-actions/reset-confirmation-modal.svelte';
  import SignalConfirmationModal from '$lib/components/workflow/client-actions/signal-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import UnpauseConfirmationModal from '$lib/components/workflow/client-actions/unpause-confirmation-modal.svelte';
  import UpdateConfirmationModal from '$lib/components/workflow/client-actions/update-confirmation-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { coreUserStore } from '$lib/stores/core-user';
  import { resetEvents } from '$lib/stores/events';
  import { temporalVersion } from '$lib/stores/versions';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';
  import { minimumVersionRequired } from '$lib/utilities/version-check';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';
  import { workflowPauseEnabled } from '$lib/utilities/workflow-pause-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowUpdateEnabled } from '$lib/utilities/workflow-update-enabled';

  interface Props {
    workflow: WorkflowExecution;
    namespace: string;
    cancelInProgress: boolean;
    first?: string;
    next?: string;
  }

  let { workflow, namespace, cancelInProgress, first, next }: Props = $props();

  const isRunning = $derived(workflow?.isRunning);
  const isPaused = $derived(workflow?.isPaused);

  let cancelConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);
  let resetConfirmationModalOpen = $state(false);
  let signalConfirmationModalOpen = $state(false);
  let updateConfirmationModalOpen = $state(false);
  let pauseConfirmationModalOpen = $state(false);

  let coreUser = coreUserStore();

  let cancelEnabled = $derived(
    workflowCancelEnabled(page.data.settings, $coreUser, namespace),
  );

  let signalEnabled = $derived(
    workflowSignalEnabled(page.data.settings, $coreUser, namespace),
  );

  let updateEnabled = $derived(
    workflowUpdateEnabled(page.data.settings, $coreUser, namespace),
  );

  let terminateEnabled = $derived(
    workflowTerminateEnabled(page.data.settings, $coreUser, namespace),
  );

  let resetAuthorized = $derived(
    workflowResetEnabled(page.data.settings, $coreUser, namespace),
  );

  // https://github.com/temporalio/temporal/releases/tag/v1.27.1
  let canResetWithPendingChildWorkflows = $derived(
    minimumVersionRequired('1.27.1', $temporalVersion) ||
      $isCloud ||
      workflow.pendingChildren.length === 0,
  );

  let resetEnabled = $derived(
    resetAuthorized &&
      canResetWithPendingChildWorkflows &&
      $resetEvents.length > 0,
  );

  let startWorkflowDisabled = $derived(workflowCreateDisabled(page));

  const isDelayed = $derived(isWorkflowDelayed(workflow));
  const pauseAuthorized = $derived(
    workflowPauseEnabled(page.data.settings, $coreUser, namespace),
  );
  const pauseEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workflowPause,
  );

  const getResetDescription = ({
    resetAuthorized,
    canResetWithPendingChildWorkflows,
    resetEvents,
  }: {
    resetAuthorized: boolean;
    canResetWithPendingChildWorkflows: boolean;
    resetEvents: WorkflowEvent[];
  }) => {
    if (!resetAuthorized) {
      return translate('workflows.reset-disabled-unauthorized');
    } else if (resetAuthorized && !canResetWithPendingChildWorkflows) {
      return translate('workflows.reset-disabled-pending-children');
    } else if (
      resetAuthorized &&
      canResetWithPendingChildWorkflows &&
      resetEvents.length === 0
    ) {
      return translate('workflows.reset-disabled-no-events');
    }
    return '';
  };

  let resetDescription = $derived(
    getResetDescription({
      resetAuthorized,
      canResetWithPendingChildWorkflows,
      resetEvents: $resetEvents,
    }),
  );

  let workflowActions: {
    label: string;
    onClick: () => void;
    enabled: boolean;
    testId: string;
    destructive?: boolean;
    description?: string;
  }[] = $derived([
    ...(pauseEnabled
      ? [
          {
            label: translate('workflows.request-cancellation'),
            onClick: () => (cancelConfirmationModalOpen = true),
            testId: 'request-cancellation-button',
            enabled: cancelEnabled || !cancelInProgress,
            description: '',
          },
        ]
      : []),
    {
      label: translate('workflows.reset'),
      onClick: () => (resetConfirmationModalOpen = true),
      testId: 'reset-button',
      enabled: resetEnabled,
      description: resetEnabled ? '' : resetDescription,
    },
    {
      label: translate('workflows.signal'),
      onClick: () => (signalConfirmationModalOpen = true),
      testId: 'signal-button',
      enabled: signalEnabled,
      description: signalEnabled ? '' : translate('workflows.signal-disabled'),
    },
    {
      label: translate('workflows.update'),
      onClick: () => (updateConfirmationModalOpen = true),
      testId: 'update-button',
      enabled: updateEnabled && !isPaused,
      description: updateEnabled
        ? isPaused
          ? translate('workflows.update-disabled-on-pause')
          : ''
        : translate('workflows.update-disabled'),
    },
    {
      label: translate('workflows.terminate'),
      onClick: () => (terminateConfirmationModalOpen = true),
      testId: 'terminate-button',
      enabled: terminateEnabled,
      destructive: true,
      description: terminateEnabled
        ? ''
        : translate('workflows.terminate-disabled'),
    },
  ]);

  let actionsDisabled = $derived(
    isRunning || isPaused
      ? workflowActions.every((action) => !action.enabled) &&
          startWorkflowDisabled
      : !terminateEnabled && startWorkflowDisabled,
  );
</script>

{#snippet pauseButton()}
  <Button
    on:click={() => (pauseConfirmationModalOpen = true)}
    disabled={!pauseAuthorized || isDelayed}
    size="sm"
  >
    {#if isPaused}
      {translate('workflows.unpause-workflow')}
    {:else}
      {translate('workflows.pause-workflow')}
    {/if}
  </Button>
{/snippet}

{#snippet requestCancellationButton()}
  <Button
    on:click={() => (cancelConfirmationModalOpen = true)}
    disabled={!cancelEnabled || cancelInProgress}
    size="sm"
  >
    {translate('workflows.request-cancellation')}
  </Button>
{/snippet}

{#snippet resetButton()}
  <Button
    on:click={() => (resetConfirmationModalOpen = true)}
    disabled={!resetEnabled}
    size="sm"
  >
    {translate('workflows.reset')}
  </Button>
{/snippet}

{#snippet startWorkflow()}
  <MenuItem
    onclick={() =>
      goto(
        routeForWorkflowStart({
          namespace,
          workflowId: workflow.id,
          runId: workflow.runId,
          taskQueue: workflow.taskQueue,
          workflowType: workflow.name,
        }),
      )}
    disabled={startWorkflowDisabled}
    data-testid="start-workflow-button"
  >
    {translate('workflows.start-workflow-like-this-one')}
  </MenuItem>
{/snippet}

{#snippet runningWorkflowActions()}
  {#each workflowActions as { onClick, destructive, label, enabled, testId, description } (label)}
    {#if destructive}
      <MenuDivider />
    {/if}
    <MenuItem
      onclick={onClick}
      {destructive}
      disabled={!enabled}
      data-testid={testId}
      {description}
    >
      {label}
    </MenuItem>
  {/each}
  <MenuDivider />
  {@render startWorkflow()}
{/snippet}

{#snippet worklfowActions()}
  {@render startWorkflow()}
  {#if terminateEnabled && next}
    <MenuDivider />
    <MenuItem
      onclick={() => (terminateConfirmationModalOpen = true)}
      data-testid="terminate-button"
      destructive
    >
      {translate('workflows.terminate-latest')}
    </MenuItem>
  {/if}
{/snippet}

<div class="flex items-center gap-2">
  {#if isRunning || (isPaused && pauseEnabled)}
    {#if pauseEnabled}
      {@render pauseButton()}
    {:else}
      {@render requestCancellationButton()}
    {/if}
  {:else}
    {@render resetButton()}
  {/if}
  <MenuContainer>
    <MenuButton
      disabled={actionsDisabled}
      hasIndicator
      controls="workflow-actions"
      variant="secondary"
      size="sm"
    >
      {translate('workflows.more-actions')}
    </MenuButton>
    <Menu id="workflow-actions" position="right" class="w-[16rem] md:w-[24rem]">
      {#if isRunning || isPaused}
        {@render runningWorkflowActions()}
      {:else}
        {@render worklfowActions()}
      {/if}
    </Menu>
  </MenuContainer>
</div>

{#if resetEnabled}
  <ResetConfirmationModal
    {workflow}
    {namespace}
    bind:open={resetConfirmationModalOpen}
  />
{/if}

{#if signalEnabled}
  <SignalConfirmationModal
    {workflow}
    {namespace}
    bind:open={signalConfirmationModalOpen}
  />
{/if}

{#if updateEnabled}
  <UpdateConfirmationModal
    {workflow}
    {namespace}
    bind:open={updateConfirmationModalOpen}
  />
{/if}

{#if cancelEnabled}
  <CancelConfirmationModal
    {workflow}
    {namespace}
    bind:open={cancelConfirmationModalOpen}
  />
{/if}

{#if terminateEnabled}
  <TerminateConfirmationModal
    {workflow}
    {namespace}
    {first}
    bind:open={terminateConfirmationModalOpen}
  />
{/if}

{#if pauseEnabled}
  {#if isPaused}
    <UnpauseConfirmationModal
      {workflow}
      {namespace}
      bind:open={pauseConfirmationModalOpen}
    />
  {:else}
    <PauseConfirmationModal
      {workflow}
      {namespace}
      bind:open={pauseConfirmationModalOpen}
    />
  {/if}
{/if}
