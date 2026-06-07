<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitPauseSchedule,
  } from '$lib/stores/schedules';

  interface Props {
    isSchedulePaused?: boolean;
    scheduleId: string;
    namespace: string;
  }

  let { isSchedulePaused, scheduleId, namespace }: Props = $props();

  let reason = $state('');
</script>

<Modal
  id="pause-schedule-modal"
  open={$confirmationModal === 'pause'}
  confirmType="primary"
  confirmText={isSchedulePaused
    ? translate('schedules.unpause')
    : translate('schedules.pause')}
  cancelText={translate('common.cancel')}
  confirmDisabled={!reason}
  loading={$actionPending}
  error={$serverError}
  on:cancelModal={() => closeConfirmationModal('pause')}
  on:confirmModal={() =>
    submitPauseSchedule(reason, {
      scheduleId,
      namespace,
      isPaused: isSchedulePaused,
    })}
>
  <h3 slot="title">
    {isSchedulePaused
      ? translate('schedules.unpause-modal-title')
      : translate('schedules.pause-modal-title')}
  </h3>
  <div slot="content">
    <p>
      {isSchedulePaused
        ? translate('schedules.unpause-modal-confirmation', {
            schedule: scheduleId,
          })
        : translate('schedules.pause-modal-confirmation', {
            schedule: scheduleId,
          })}
    </p>
    <p class="my-4">
      {isSchedulePaused
        ? translate('schedules.unpause-reason')
        : translate('schedules.pause-reason')}
    </p>
    <Input
      id="pause-reason"
      bind:value={reason}
      placeholder={translate('common.reason')}
      label={translate('common.reason')}
      labelHidden
    />
  </div>
</Modal>
