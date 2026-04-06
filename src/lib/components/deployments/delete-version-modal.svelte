<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    open: boolean;
    error?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let { buildId, open, error = '', onConfirm, onCancel }: Props = $props();
  let deleteInput = $state('');

  $effect(() => {
    if (!open) {
      deleteInput = '';
    }
  });
</script>

<Modal
  id="delete-version-modal-{buildId}"
  {open}
  {error}
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  confirmDisabled={deleteInput !== 'DELETE'}
  on:confirmModal={onConfirm}
  on:cancelModal={onCancel}
>
  <h3 slot="title">{translate('deployments.delete-version')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p class="text-sm">{translate('deployments.delete-version-description')}</p>
    <Input
      id="delete-version-confirm-input"
      label={translate('deployments.delete-deployment-confirm-instruction')}
      bind:value={deleteInput}
      required
    />
  </div>
</Modal>
