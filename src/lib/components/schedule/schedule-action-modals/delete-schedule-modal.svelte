<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    clearConfirmationModalActionTimeout,
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

  $effect(() => {
    return () => clearConfirmationModalActionTimeout('delete');
  });
</script>

<Modal
  id="delete-schedule-modal"
  open={$confirmationModal === 'delete'}
  confirmType="destructive"
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  loading={$actionPending}
  error={$serverError}
  onCancelModal={() => closeConfirmationModal('delete')}
  onConfirmModal={() =>
    submitDeleteSchedule({
      identity,
      scheduleId,
      namespace,
    })}
>
  {#snippet titleSnippet()}
    <h3>{translate('schedules.delete-modal-title')}</h3>
  {/snippet}
  {#snippet content()}
    <div>
      <p>
        {translate('schedules.delete-modal-confirmation', {
          schedule: scheduleId,
        })}
      </p>
    </div>
  {/snippet}
</Modal>
