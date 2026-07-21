<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/activity-actions';
  import {
    pauseActivity,
    resetActivity,
    unpauseActivity,
  } from '$lib/services/workflow-activities-service';
  import { toaster } from '$lib/stores/toaster';
  import { triggerRefresh } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';
  import { getIdentity } from '$lib/utilities/core-context';

  import ActivityOptionsUpdateDrawer from './activity-options-update-drawer.svelte';
  import ActivityPauseConfirmationModal from './activity-pause-confirmation-modal.svelte';
  import ActivityResetConfirmationModal from './activity-reset-confirmation-modal.svelte';
  import ActivityUnpauseConfirmationModal from './activity-unpause-confirmation-modal.svelte';

  type Props = {
    activity: PendingActivity;
    class?: string;
  };

  let { activity, class: className = '' }: Props = $props();
  const { namespace, workflow, run } = $derived(page.params);
  const execution: WorkflowExecution = $derived({
    workflowId: workflow,
    runId: run,
  });

  const identity = getIdentity();

  let pauseConfirmationModalOpen = $state(false);
  let unpauseConfirmationModalOpen = $state(false);
  let resetConfirmationModalOpen = $state(false);
  let optionsUpdateDrawerOpen = $state(false);

  const onPause = async () => {
    if (activity.paused) {
      unpauseConfirmationModalOpen = true;
    } else {
      pauseConfirmationModalOpen = true;
    }
  };

  const onReset = () => {
    resetConfirmationModalOpen = true;
  };

  const onUpdate = () => {
    optionsUpdateDrawerOpen = true;
  };

  const onConfirmPause = async (reason: string) => {
    await pauseActivity({
      namespace,
      execution,
      id: activity.activityId,
      reason,
      identity,
    });
    triggerRefresh(Action.Pause);
  };

  const onConfirmUnpause = async () => {
    await unpauseActivity({
      namespace,
      execution,
      id: activity.activityId,
      identity,
    });
    triggerRefresh(Action.Unpause);
  };

  const onConfirmReset = async (resetHeartbeat: boolean) => {
    await resetActivity({
      namespace,
      execution,
      id: activity.activityId,
      resetHeartbeat,
      identity,
    });
    triggerRefresh(Action.Reset);
    toaster.push({
      variant: 'success',
      message: translate('activities.reset-success', {
        activityId: activity.activityId,
      }),
    });
  };
</script>

<div class="flex items-center gap-2 {className}">
  <Tooltip
    bottomLeft
    width={200}
    text={activity.paused
      ? translate('activities.resume-tooltip')
      : translate('activities.pause-tooltip')}
  >
    <Button
      variant="secondary"
      size="sm"
      leadingIcon={activity.paused ? 'play' : 'pause'}
      on:click={onPause}
    >
      {activity.paused
        ? translate('workflows.unpause')
        : translate('workflows.pause')}
    </Button>
  </Tooltip>
  <Tooltip bottomLeft width={200} text="Update this Activity Options.">
    <Button
      variant="secondary"
      size="sm"
      leadingIcon="pencil"
      on:click={onUpdate}
    >
      {translate('common.update')}
    </Button>
  </Tooltip>
  <Tooltip bottom width={200} text="Reset this Activity.">
    <Button
      variant="secondary"
      size="sm"
      leadingIcon="retry"
      on:click={onReset}
    >
      {translate('workflows.reset')}
    </Button>
  </Tooltip>
</div>

<ActivityPauseConfirmationModal
  bind:open={pauseConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onConfirmPause}
/>

<ActivityUnpauseConfirmationModal
  bind:open={unpauseConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onConfirmUnpause}
/>

<ActivityResetConfirmationModal
  bind:open={resetConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onConfirmReset}
/>

{#key optionsUpdateDrawerOpen}
  <ActivityOptionsUpdateDrawer
    bind:open={optionsUpdateDrawerOpen}
    {namespace}
    {execution}
    {activity}
  />
{/key}
