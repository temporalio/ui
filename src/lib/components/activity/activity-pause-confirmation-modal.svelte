<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  type Props = {
    open: boolean;
    activityId: string;
    onConfirm: (reason: string) => Promise<void>;
  };

  let { open = $bindable(), activityId, onConfirm }: Props = $props();

  let error = $state('');
  let loading = $state(false);
  let reason = $state('');

  const hideModal = () => {
    open = false;
    reason = '';
  };

  const onActivityPause = async () => {
    error = '';
    loading = true;
    try {
      await onConfirm(reason);
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
  id="activity-pause-confirmation-modal"
  data-testid="activity-pause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.pause')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityPause}
>
  <h3 slot="title">
    {translate('activities.pause-modal-confirmation', {
      activityId,
    })}
  </h3>
  <div slot="content">
    <p>{translate('activities.pause-modal-description')}</p>
    <Link
      newTab
      trailingIcon="book"
      href="https://docs.temporal.io/activity-operations#important-considerations"
      class="mt-1"
    >
      {translate('activities.pause-modal-docs-link')}
    </Link>
    <Input
      id="activity-pause-reason"
      class="mt-4"
      placeholder={translate('common.reason-placeholder')}
      label={translate('common.reason-optional')}
      bind:value={reason}
    />
  </div>
</Modal>
