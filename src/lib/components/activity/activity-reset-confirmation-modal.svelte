<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  type Props = {
    open: boolean;
    activityId: string;
    onConfirm: (resetHeartbeat: boolean) => Promise<void>;
  };

  let { open = $bindable(), activityId, onConfirm }: Props = $props();

  let error = $state('');
  let loading = $state(false);
  let resetHeartbeat = $state(false);

  const hideModal = () => {
    open = false;
    resetHeartbeat = false;
  };

  const onActivityReset = async () => {
    error = '';
    loading = true;
    try {
      await onConfirm(resetHeartbeat);
      hideModal();
    } catch (err: unknown) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="activity-reset-confirmation-modal"
  data-testid="activity-reset-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.reset')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityReset}
>
  <h3 slot="title">
    {translate('activities.reset-modal-confirmation', {
      activityId,
    })}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>{translate('activities.reset-modal-description')}</p>
    <Checkbox
      bind:checked={resetHeartbeat}
      label={translate('activities.reset-heartbeat-details')}
    />
  </div>
</Modal>
