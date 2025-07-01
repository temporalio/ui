<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';

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
  const isRunning = $derived($workflowRun.workflow?.isRunning);

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
</script>

<div class="flex items-center gap-2 {className}">
  <Tooltip
    bottomLeft
    width={200}
    text={activity.paused
      ? 'Resume this Activity'
      : 'Pauses this Activity, starting before it retries or the next time it heartbeats. It won’t time out while it’s paused.'}
  >
    <Button
      variant="secondary"
      size="sm"
      leadingIcon={activity.paused ? 'play' : 'pause'}
      on:click={onPause}
      disabled={!isRunning}
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
      disabled={!isRunning}
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
      disabled={!isRunning}
    >
      {translate('workflows.reset')}
    </Button>
  </Tooltip>
</div>

<ActivityPauseConfirmationModal
  bind:open={pauseConfirmationModalOpen}
  {namespace}
  {execution}
  {activity}
/>

<ActivityUnpauseConfirmationModal
  bind:open={unpauseConfirmationModalOpen}
  {namespace}
  {execution}
  {activity}
/>

<ActivityResetConfirmationModal
  bind:open={resetConfirmationModalOpen}
  {namespace}
  {execution}
  {activity}
/>

<ActivityOptionsUpdateDrawer
  bind:open={optionsUpdateDrawerOpen}
  {namespace}
  {execution}
  {activity}
/>
