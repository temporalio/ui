<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
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
      size="xs"
      leadingIcon={activity.paused ? 'play' : 'pause'}
      on:click={onPause}
    >
      {activity.paused
        ? translate('workflows.unpause')
        : translate('workflows.pause')}
    </Button>
  </Tooltip>
  <Tooltip bottom width={200} text="Update this Activity Options">
    <Button
      variant="secondary"
      size="xs"
      leadingIcon="pencil"
      on:click={onUpdate}
    >
      {translate('common.update')}
    </Button>
  </Tooltip>
  <Tooltip bottom width={200} text="Reset this Activity">
    <Button
      variant="secondary"
      size="xs"
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

{#key optionsUpdateDrawerOpen}
  <ActivityOptionsUpdateDrawer
    bind:open={optionsUpdateDrawerOpen}
    {namespace}
    {execution}
    {activity}
  />
{/key}
