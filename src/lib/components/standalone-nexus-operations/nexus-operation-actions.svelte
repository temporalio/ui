<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusOperationExecutionInfo } from '$lib/types/nexus-operation-execution';
  import { routeForStartStandaloneNexusOperation } from '$lib/utilities/route-for';
  import type { StandaloneNexusOperationPoller } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

  import CancelConfirmationModal from './cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from './terminate-confirmation-modal.svelte';

  interface Props {
    nexusOperationInfo: NexusOperationExecutionInfo;
    namespace: string;
    poller: StandaloneNexusOperationPoller;
  }

  let { nexusOperationInfo, namespace, poller }: Props = $props();

  let cancelConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);

  let isRunning = $derived(
    nexusOperationInfo.status === 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING',
  );

  const onConfirmCancelOrTerminate = () => {
    poller.fetchOnce().then(() => {
      poller.abort();
    });
  };
</script>

<div class="flex items-center gap-2">
  <Button
    on:click={() => (cancelConfirmationModalOpen = true)}
    disabled={!isRunning}
    size="sm"
  >
    {translate('standalone-nexus-operations.request-cancellation')}
  </Button>
  <MenuContainer>
    <MenuButton
      hasIndicator
      controls="nexus-operation-actions"
      variant="secondary"
      size="sm"
    >
      {translate('workflows.more-actions')}
    </MenuButton>
    <Menu id="nexus-operation-actions" position="right" class="w-[16rem]">
      <MenuItem
        onclick={() => (terminateConfirmationModalOpen = true)}
        destructive
        disabled={!isRunning}
        data-testid="terminate-button"
      >
        {translate('standalone-nexus-operations.terminate')}
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onclick={() =>
          goto(
            routeForStartStandaloneNexusOperation({
              namespace,
              operationId: nexusOperationInfo.operationId,
              endpoint: nexusOperationInfo.endpoint,
              service: nexusOperationInfo.service,
              operation: nexusOperationInfo.operation,
              runId: nexusOperationInfo.runId,
            }),
          )}
        data-testid="start-nexus-operation-button"
      >
        {translate(
          'standalone-nexus-operations.start-nexus-operation-like-this-one',
        )}
      </MenuItem>
    </Menu>
  </MenuContainer>
</div>

<CancelConfirmationModal
  onConfirm={onConfirmCancelOrTerminate}
  operationId={nexusOperationInfo.operationId}
  {namespace}
  bind:open={cancelConfirmationModalOpen}
/>
<TerminateConfirmationModal
  onConfirm={onConfirmCancelOrTerminate}
  operationId={nexusOperationInfo.operationId}
  {namespace}
  bind:open={terminateConfirmationModalOpen}
/>
