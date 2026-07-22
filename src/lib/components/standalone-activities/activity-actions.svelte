<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import ActivityPauseConfirmationModal from '$lib/components/activity/activity-pause-confirmation-modal.svelte';
  import ActivityResetConfirmationModal from '$lib/components/activity/activity-reset-confirmation-modal.svelte';
  import ActivityUnpauseConfirmationModal from '$lib/components/activity/activity-unpause-confirmation-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { MenuDivider, MenuItem } from '$lib/holocene/menu';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    pauseActivityExecution,
    resetActivityExecution,
    unpauseActivityExecution,
  } from '$lib/services/standalone-activities';
  import { toaster } from '$lib/stores/toaster';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';
  import {
    standaloneActivityCommandsDisabled,
    standaloneActivityWriteActionsDisabled,
  } from '$lib/utilities/standalone-activities-commands-disabled';
  import type { StandaloneActivityPoller } from '$lib/utilities/standalone-activity-poller.svelte';

  import ActivityOptionsUpdateDrawer from './activity-options-update-drawer.svelte';
  import CancelConfirmationModal from './cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from './terminate-confirmation-modal.svelte';

  interface Props {
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
    poller: StandaloneActivityPoller;
  }

  let { activityExecutionInfo, namespace, poller }: Props = $props();

  let cancelConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);
  let pauseConfirmationModalOpen = $state(false);
  let unpauseConfirmationModalOpen = $state(false);
  let resetConfirmationModalOpen = $state(false);
  let optionsUpdateDrawerOpen = $state(false);

  const identity = getIdentity();

  let isRunning = $derived(
    activityExecutionInfo.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING',
  );
  let isPaused = $derived(
    activityExecutionInfo.runState === 'PENDING_ACTIVITY_STATE_PAUSED',
  );
  const commandsDisabled = $derived(standaloneActivityCommandsDisabled(page));
  const writeActionsDisabled = $derived(
    standaloneActivityWriteActionsDisabled(page),
  );

  const activityId = $derived(activityExecutionInfo.activityId ?? '');
  const runId = $derived(activityExecutionInfo.runId ?? '');

  const refresh = () => poller.fetchOnce();

  const onConfirmCancelOrTerminate = () => {
    poller.fetchOnce().then(() => {
      poller.abort();
    });
  };

  const onPause = () => {
    if (isPaused) {
      unpauseConfirmationModalOpen = true;
    } else {
      pauseConfirmationModalOpen = true;
    }
  };

  const onConfirmPause = async (reason: string) => {
    await pauseActivityExecution(
      namespace,
      activityId,
      runId,
      reason,
      identity,
    );
    await refresh();
  };

  const onConfirmUnpause = async () => {
    await unpauseActivityExecution(namespace, activityId, runId, identity);
    await refresh();
  };

  const onConfirmReset = async (resetHeartbeat: boolean) => {
    await resetActivityExecution(
      namespace,
      activityId,
      runId,
      resetHeartbeat,
      identity,
    );
    await refresh();
    toaster.push({
      variant: 'success',
      message: translate('activities.reset-success', { activityId }),
    });
  };
</script>

<div class="flex items-center gap-2">
  {#if isRunning}
    {#if commandsDisabled}
      <Button
        on:click={() => (cancelConfirmationModalOpen = true)}
        disabled={writeActionsDisabled}
        size="sm"
      >
        {translate('standalone-activities.request-cancellation')}
      </Button>
    {:else}
      <Button on:click={onPause} size="sm">
        {isPaused
          ? translate('standalone-activities.unpause-activity')
          : translate('standalone-activities.pause-activity')}
      </Button>
    {/if}
  {/if}
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
      {#if isRunning}
        {#if !commandsDisabled}
          <MenuItem
            onclick={() => (cancelConfirmationModalOpen = true)}
            disabled={writeActionsDisabled}
            data-testid="request-cancellation-button"
          >
            {translate('standalone-activities.request-cancellation')}
          </MenuItem>
          <MenuItem
            onclick={() => (resetConfirmationModalOpen = true)}
            data-testid="reset-button"
          >
            {translate('workflows.reset')}
          </MenuItem>
          <MenuItem
            onclick={() => (optionsUpdateDrawerOpen = true)}
            data-testid="update-button"
          >
            {translate('common.update')}
          </MenuItem>
          <MenuDivider />
        {/if}
        <MenuItem
          onclick={() => (terminateConfirmationModalOpen = true)}
          destructive
          disabled={writeActionsDisabled}
          data-testid="terminate-button"
        >
          {translate('standalone-activities.terminate')}
        </MenuItem>
        <MenuDivider />
      {/if}
      <MenuItem
        onclick={() =>
          goto(
            routeForStartStandaloneActivity({
              namespace,
              activityId: activityExecutionInfo.activityId ?? undefined,
              runId: activityExecutionInfo.runId ?? undefined,
              activityType:
                activityExecutionInfo.activityType?.name ?? undefined,
              taskQueue: activityExecutionInfo.taskQueue ?? undefined,
              startToCloseTimeout: activityExecutionInfo.startToCloseTimeout,
              scheduleToCloseTimeout:
                activityExecutionInfo.scheduleToCloseTimeout,
            }),
          )}
        disabled={writeActionsDisabled}
        data-testid="start-activity-button"
      >
        {translate('standalone-activities.start-activity-like-this-one')}
      </MenuItem>
    </Menu>
  </MenuContainer>
</div>

{#if !commandsDisabled}
  <ActivityPauseConfirmationModal
    bind:open={pauseConfirmationModalOpen}
    {activityId}
    onConfirm={onConfirmPause}
  />
  <ActivityUnpauseConfirmationModal
    bind:open={unpauseConfirmationModalOpen}
    {activityId}
    onConfirm={onConfirmUnpause}
  />
  <ActivityResetConfirmationModal
    bind:open={resetConfirmationModalOpen}
    {activityId}
    onConfirm={onConfirmReset}
  />
  {#key optionsUpdateDrawerOpen}
    <ActivityOptionsUpdateDrawer
      bind:open={optionsUpdateDrawerOpen}
      {namespace}
      {activityExecutionInfo}
      onUpdate={refresh}
    />
  {/key}
{/if}

{#if !writeActionsDisabled}
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
{/if}
