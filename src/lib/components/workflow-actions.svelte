<script lang="ts">
  import { page } from '$app/stores';

  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import ResetConfirmationModal from '$lib/components/workflow/client-actions/reset-confirmation-modal.svelte';
  import SignalConfirmationModal from '$lib/components/workflow/client-actions/signal-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { coreUserStore } from '$lib/stores/core-user';
  import { resetEvents } from '$lib/stores/events';
  import { settings } from '$lib/stores/settings';
  import { refresh } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let cancelInProgress: boolean;
  export let isRunning: boolean;

  let cancelConfirmationModalOpen = false;
  let terminateConfirmationModalOpen = false;
  let resetConfirmationModalOpen = false;
  let signalConfirmationModalOpen = false;
  let resetTooltipText: string;

  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: signalEnabled = workflowSignalEnabled($page.data.settings);
  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: resetEnabled = workflowResetEnabled($page.data.settings);

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
      resetTooltipText = translate('workflows.reset-disabled');
    } else if (resetEnabled && workflow?.pendingChildren?.length > 0) {
      resetTooltipText = translate('workflows.reset-disabled-pending-children');
    } else if (
      resetEnabled &&
      workflow?.pendingChildren?.length === 0 &&
      $resetEvents.length === 0
    ) {
      resetTooltipText = translate('workflows.reset-disabled-no-events');
    }
  }

  $: workflowActions = [
    {
      label: translate('workflows.reset'),
      onClick: () => (resetConfirmationModalOpen = true),
      testId: 'reset-button',
      allowed: resetAllowed,
      tooltip: resetAllowed ? '' : resetTooltipText,
    },
    {
      label: translate('workflows.signal'),
      onClick: () => (signalConfirmationModalOpen = true),
      testId: 'signal-button',
      allowed: signalEnabled,
      tooltip: signalEnabled ? '' : translate('workflows.signal-disabled'),
    },
    {
      label: translate('workflows.terminate'),
      onClick: () => (terminateConfirmationModalOpen = true),
      testId: 'terminate-button',
      allowed: terminateEnabled,
      destructive: true,
      tooltip: terminateEnabled
        ? ''
        : translate('workflows.terminate-disabled'),
    },
  ];

  let coreUser = coreUserStore();

  $: actionsDisabled =
    $coreUser.namespaceWriteDisabled(namespace) ||
    !writeActionsAreAllowed(settings);

  $: resetAllowed =
    resetEnabled &&
    workflow?.pendingChildren?.length === 0 &&
    $resetEvents.length > 0 &&
    !actionsDisabled;
</script>

{#if isRunning}
  <SplitButton
    id="workflow-actions"
    position="right"
    disabled={actionsDisabled}
    primaryActionDisabled={!cancelEnabled || cancelInProgress}
    on:click={() => (cancelConfirmationModalOpen = true)}
    label={translate('workflows.request-cancellation')}
    menuLabel={translate('workflows.workflow-actions')}
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
      aria-label={translate('workflows.reset')}
      disabled={!resetAllowed}
      variant="primary"
      on:click={() => (resetConfirmationModalOpen = true)}
      data-testid="workflow-reset-button"
    >
      {translate('workflows.reset')}
    </Button>
  </Tooltip>
{/if}

<ResetConfirmationModal
  {refresh}
  {workflow}
  {namespace}
  bind:open={resetConfirmationModalOpen}
/>
<SignalConfirmationModal
  {refresh}
  {workflow}
  {namespace}
  bind:open={signalConfirmationModalOpen}
/>
<CancelConfirmationModal
  {refresh}
  {workflow}
  {namespace}
  bind:open={cancelConfirmationModalOpen}
/>
<TerminateConfirmationModal
  {refresh}
  {workflow}
  {namespace}
  bind:open={terminateConfirmationModalOpen}
/>
