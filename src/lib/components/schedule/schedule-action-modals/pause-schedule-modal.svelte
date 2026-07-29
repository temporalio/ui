<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal-runes.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    clearConfirmationModalActionTimeout,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitPauseSchedule,
  } from '$lib/stores/schedules';
  import { getIdentity } from '$lib/utilities/core-context';

  interface Props {
    isSchedulePaused?: boolean;
    scheduleId: string;
    namespace: string;
  }

  const identity = getIdentity();

  let { isSchedulePaused, scheduleId, namespace }: Props = $props();

  let reason = $state('');

  $effect(() => {
    return () => clearConfirmationModalActionTimeout('pause');
  });
</script>

<Modal
  id="pause-schedule-modal"
  open={$confirmationModal === 'pause'}
  confirmType="primary"
  confirmText={isSchedulePaused
    ? translate('schedules.unpause')
    : translate('schedules.pause')}
  cancelText={translate('common.cancel')}
  confirmDisabled={!reason.trim()}
  loading={$actionPending}
  error={$serverError}
  onCancelModal={() => closeConfirmationModal('pause')}
  onConfirmModal={() =>
    submitPauseSchedule(reason.trim(), {
      identity,
      scheduleId,
      namespace,
      isPaused: isSchedulePaused ?? false,
    })}
>
  {#snippet titleSnippet()}
    <h3>
      {isSchedulePaused
        ? translate('schedules.unpause-modal-title')
        : translate('schedules.pause-modal-title')}
    </h3>
  {/snippet}
  {#snippet content()}
    <div>
      <p>
        {isSchedulePaused
          ? translate('schedules.unpause-modal-confirmation', {
              schedule: scheduleId,
            })
          : translate('schedules.pause-modal-confirmation', {
              schedule: scheduleId,
            })}
      </p>
      <Input
        id="pause-reason"
        bind:value={reason}
        placeholder={isSchedulePaused
          ? translate('schedules.unpause-reason')
          : translate('schedules.pause-reason')}
        label={translate('common.reason')}
        required
        class="mt-4"
      />
    </div>
  {/snippet}
</Modal>
