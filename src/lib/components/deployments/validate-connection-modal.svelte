<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  type Props = {
    buildId: string;
    open: boolean;
    loading: boolean;
    result: { valid: boolean; message?: string } | null;
    onClose: () => void;
  };

  let { buildId, open, loading, result, onClose }: Props = $props();
</script>

<Modal
  id="validate-connection-modal-{buildId}"
  {open}
  confirmText={translate('common.close')}
  cancelText={translate('common.cancel')}
  on:confirmModal={onClose}
  on:cancelModal={onClose}
>
  <h3 slot="title">{translate('deployments.validate-connection')}</h3>
  <div slot="content">
    {#if loading}
      <div class="flex flex-col gap-2">
        <div class="h-3 w-32 animate-pulse rounded bg-subtle"></div>
        <div class="h-3 w-48 animate-pulse rounded bg-subtle"></div>
      </div>
    {:else if result}
      <p class="text-sm">
        {result.valid !== false
          ? translate('deployments.validate-connection-valid')
          : translate('deployments.validate-connection-invalid')}
      </p>
      {#if result.message}
        <p class="mt-1 text-sm text-secondary">{result.message}</p>
      {/if}
    {/if}
  </div>
</Modal>
