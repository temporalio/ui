<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  type Props = {
    open: boolean;
    activityId: string;
    onConfirm: () => Promise<void>;
  };

  let { open = $bindable(), activityId, onConfirm }: Props = $props();

  let error = $state('');
  let loading = $state(false);

  const hideModal = () => {
    open = false;
  };

  const onActivityUnpause = async () => {
    error = '';
    loading = true;
    try {
      await onConfirm();
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
  id="activity-unpause-confirmation-modal"
  data-testid="activity-unpause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.unpause')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityUnpause}
>
  <h3 slot="title">
    {translate('activities.unpause-modal-confirmation', {
      activityId,
    })}
  </h3>
  <div slot="content">
    <p>{translate('activities.unpause-modal-description')}</p>
  </div>
</Modal>
