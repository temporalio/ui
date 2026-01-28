<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import type { ActivityExecutionPoller } from '$lib/utilities/activity-execution-poller.svelte';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  import CancelConfirmationModal from './cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from './terminate-confirmation-modal.svelte';

  interface Props {
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
    poller: ActivityExecutionPoller;
  }

  let { activityExecutionInfo, namespace, poller }: Props = $props();

  let cancelConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);

  let isRunning = $derived(
    activityExecutionInfo.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING',
  );

  const onConfirmCancelOrTerminate = () => {
    poller.abort();
  };
</script>

<div class="flex items-center gap-2">
  <Button
    on:click={() => (cancelConfirmationModalOpen = true)}
    disabled={!isRunning}
    size="sm"
  >
    {translate('standalone-activities.request-cancellation')}
  </Button>
  <MenuContainer>
    <MenuButton
      hasIndicator
      controls="activity-execution-actions"
      variant="secondary"
      size="sm"
    >
      {translate('workflows.more-actions')}
    </MenuButton>
    <Menu id="activity-execution-actions" position="right" class="w-[16rem]">
      <MenuItem
        onclick={() => (terminateConfirmationModalOpen = true)}
        destructive
        disabled={!isRunning}
        data-testid="terminate-button"
      >
        {translate('standalone-activities.terminate')}
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onclick={() =>
          goto(
            routeForStartStandaloneActivity({
              namespace,
              activityId: activityExecutionInfo.activityId,
              activityType: activityExecutionInfo.activityType.name,
              taskQueue: activityExecutionInfo.taskQueue,
              startToCloseTimeout: activityExecutionInfo.startToCloseTimeout,
              scheduleToCloseTimeout:
                activityExecutionInfo.scheduleToCloseTimeout,
            }),
          )}
        data-testid="start-activity-button"
      >
        {translate('standalone-activities.start-activity-like-this-one')}
      </MenuItem>
    </Menu>
  </MenuContainer>
</div>

<CancelConfirmationModal
  onConfirm={onConfirmCancelOrTerminate}
  {activityExecutionInfo}
  {namespace}
  bind:open={cancelConfirmationModalOpen}
/>
<TerminateConfirmationModal
  onConfirm={onConfirmCancelOrTerminate}
  {activityExecutionInfo}
  {namespace}
  bind:open={terminateConfirmationModalOpen}
/>
