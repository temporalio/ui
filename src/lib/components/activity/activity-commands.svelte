<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { unpauseActivity } from '$lib/services/workflow-activities-service';
  import { refresh } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';

  import ActivityOptionsUpdateDrawer from './activity-options-update-drawer.svelte';
  import ActivityPauseConfirmationModal from './activity-pause-confirmation-modal.svelte';
  import ActivityResetConfirmationModal from './activity-reset-confirmation-modal.svelte';

  type Props = {
    activity: PendingActivity;
    class?: string;
  };

  const { namespace, workflow, run } = $derived(page.params);
  const execution: WorkflowExecution = $derived({
    workflowId: workflow,
    runId: run,
  });

  let { activity, class: className = '' }: Props = $props();
  let { activityId: id } = $derived(activity);

  let pauseConfirmationModalOpen = $state(false);
  let resetConfirmationModalOpen = $state(false);
  let optionsUpdateDrawerOpen = $state(false);

  const onPause = async () => {
    if (activity.paused) {
      onActivityUnpause();
    } else {
      pauseConfirmationModalOpen = true;
    }
  };

  const onActivityUnpause = async () => {
    await unpauseActivity({
      namespace,
      execution,
      id,
    });
    $refresh = Date.now();
  };

  const onReset = () => {
    resetConfirmationModalOpen = true;
  };

  const onUpdate = () => {
    optionsUpdateDrawerOpen = true;
  };
</script>

<div class="flex items-center gap-4 {className}">
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
