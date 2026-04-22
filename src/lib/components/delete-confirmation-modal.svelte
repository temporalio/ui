<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
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
  on:confirmModal={() => onConfirm?.()}
  on:cancelModal={() => onCancel?.()}
>
  <h3 slot="title">{title}</h3>
  <div slot="content" class="flex flex-col gap-4">
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
</Modal>
