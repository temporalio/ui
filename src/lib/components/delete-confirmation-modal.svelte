<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal-runes.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    id: string;
    open: boolean;
    title: string;
    description: string;
    entityName?: string;
    error?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    id,
    open,
    title,
    description,
    entityName,
    error = '',
    onConfirm,
    onCancel,
  }: Props = $props();

  let deleteInput = $state('');

  $effect(() => {
    if (!open) {
      deleteInput = '';
    }
  });
</script>

<Modal
  {id}
  {open}
  {error}
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  confirmDisabled={deleteInput !== 'DELETE'}
  onConfirmModal={() => onConfirm?.()}
  onCancelModal={() => onCancel?.()}
>
  {#snippet titleSnippet()}
    <h3>{title}</h3>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col gap-4">
      <p class="text-sm">{description}</p>
      {#if entityName}
        <p class="font-mono text-sm font-medium">{entityName}</p>
      {/if}
      <Input
        id="{id}-confirm-input"
        label={translate('deployments.delete-deployment-confirm-instruction')}
        bind:value={deleteInput}
        required
      />
    </div>
  {/snippet}
</Modal>
