<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitDeleteSchedule,
  } from '$lib/stores/schedules';
  import { getIdentity } from '$lib/utilities/core-context';

  interface Props {
    scheduleId: string;
    namespace: string;
  }

  const identity = getIdentity();

  let { scheduleId, namespace }: Props = $props();
</script>

<Modal
  id="delete-schedule-modal"
  open={$confirmationModal === 'delete'}
  confirmType="destructive"
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  loading={$actionPending}
  error={$serverError}
  on:cancelModal={() => closeConfirmationModal('delete')}
  on:confirmModal={() =>
    submitDeleteSchedule({
      identity,
      scheduleId,
      namespace,
    })}
>
  <h3 slot="title">{translate('schedules.delete-modal-title')}</h3>
  <div slot="content">
    <p>
      {translate('schedules.delete-modal-confirmation', {
        schedule: scheduleId,
      })}
    </p>
  </div>
</Modal>
