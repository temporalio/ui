<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  type Props = {
    buildId: string;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };

  let { buildId, open, onConfirm, onCancel }: Props = $props();
</script>

<Modal
  id="delete-version-modal-{buildId}"
  {open}
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:confirmModal={onConfirm}
  on:cancelModal={onCancel}
>
  <h3 slot="title">{translate('deployments.delete-version')}</h3>
  <div slot="content" class="flex flex-col gap-2">
    <p class="text-sm">{translate('deployments.delete-version-confirm')}</p>
    <p class="text-sm">{translate('deployments.delete-version-description')}</p>
  </div>
</Modal>
