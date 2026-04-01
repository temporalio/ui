<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  type Props = {
    open: boolean;
    workerName: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };

  let { open, workerName, onConfirm, onCancel }: Props = $props();
  let deleteInput = $state('');

  $effect(() => {
    if (!open) {
      deleteInput = '';
    }
  });
</script>

<Modal
  id="delete-worker-modal"
  {open}
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  confirmDisabled={deleteInput !== 'DELETE'}
  on:confirmModal={() => onConfirm?.()}
  on:cancelModal={() => onCancel?.()}
>
  <h3 slot="title">{translate('workers.delete-serverless-worker')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p class="text-sm text-primary">
      {translate('workers.delete-description')}
    </p>
    <Input
      id="delete-confirm-input"
      label={translate('workers.delete-type-instruction')}
      bind:value={deleteInput}
      required
    />
  </div>
</Modal>
