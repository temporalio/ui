<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal-runes.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
    workerName: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

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
  onConfirmModal={() => onConfirm?.()}
  onCancelModal={() => onCancel?.()}
>
  {#snippet titleSnippet()}
    <h3>{translate('workers.delete-serverless-worker')}</h3>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col gap-4">
      <p class="text-sm">{translate('workers.delete-confirm')}</p>
      <p class="font-mono text-sm font-medium">{workerName}</p>
      <p class="text-sm">{translate('workers.delete-description')}</p>
      <Input
        id="delete-worker-confirm-input"
        label={translate('workers.delete-type-instruction')}
        bind:value={deleteInput}
        required
      />
    </div>
  {/snippet}
</Modal>
