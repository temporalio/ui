<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconPause,
    IconPencil,
    IconPlaySolid,
    IconRetry,
  } from '$lib/io/icon';
  import type { ActivityOptions } from '$lib/types';
  import type { PendingActivity } from '$lib/types/events';

  import ActivityOptionsForm from './activity-options-form.svelte';
  import ActivityPauseConfirmationModal from './activity-pause-confirmation-modal.svelte';
  import ActivityResetConfirmationModal from './activity-reset-confirmation-modal.svelte';
  import ActivityUnpauseConfirmationModal from './activity-unpause-confirmation-modal.svelte';

  type Props = {
    activity: PendingActivity;
    class?: string;
    onPause: (reason: string) => Promise<void>;
    onUnpause: () => Promise<void>;
    onReset: (resetHeartbeat: boolean) => Promise<void>;
    onUpdateOptions: (options: ActivityOptions) => Promise<void>;
  };

  let {
    activity,
    class: className = '',
    onPause,
    onUnpause,
    onReset,
    onUpdateOptions,
  }: Props = $props();

  let pauseConfirmationModalOpen = $state(false);
  let unpauseConfirmationModalOpen = $state(false);
  let resetConfirmationModalOpen = $state(false);
  let optionsUpdateDrawerOpen = $state(false);

  const openPauseConfirmation = () => {
    if (activity.paused) {
      unpauseConfirmationModalOpen = true;
    } else {
      pauseConfirmationModalOpen = true;
    }
  };

  const openResetConfirmation = () => {
    resetConfirmationModalOpen = true;
  };

  const openOptionsDrawer = () => {
    optionsUpdateDrawerOpen = true;
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
      LeadingIcon={activity.paused ? IconPlaySolid : IconPause}
      onclick={openPauseConfirmation}
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
      LeadingIcon={IconPencil}
      onclick={openOptionsDrawer}
    >
      {translate('common.update')}
    </Button>
  </Tooltip>
  <Tooltip bottom width={200} text="Reset this Activity.">
    <Button
      variant="secondary"
      size="sm"
      LeadingIcon={IconRetry}
      onclick={openResetConfirmation}
    >
      {translate('workflows.reset')}
    </Button>
  </Tooltip>
</div>

<ActivityPauseConfirmationModal
  bind:open={pauseConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onPause}
/>

<ActivityUnpauseConfirmationModal
  bind:open={unpauseConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onUnpause}
/>

<ActivityResetConfirmationModal
  bind:open={resetConfirmationModalOpen}
  activityId={activity.id}
  onConfirm={onReset}
/>

<!-- Remounts the drawer on every open so the form re-seeds from the current
  activity; activity-options-form.svelte deliberately untracks its initial
  values so a background refresh cannot clobber a mid-edit form. -->
{#key optionsUpdateDrawerOpen}
  <ActivityOptionsForm
    bind:open={optionsUpdateDrawerOpen}
    activityId={activity.activityId}
    activityOptions={activity.activityOptions}
    onSave={onUpdateOptions}
  />
{/key}
