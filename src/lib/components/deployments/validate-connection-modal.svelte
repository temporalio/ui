<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    open: boolean;
    loading: boolean;
    result: { valid: boolean; message?: string } | null;
    onClose: () => void;
  }

  let { buildId, open, loading, result, onClose }: Props = $props();

  const isValid = $derived(result?.valid !== false);
</script>

<Modal
  id="validate-connection-modal-{buildId}"
  {open}
  confirmText={translate('common.close')}
  cancelText={translate('common.cancel')}
  on:confirmModal={onClose}
  on:cancelModal={onClose}
>
  <h3 slot="title">
    {translate('deployments.validate-connection')}
    <span class="font-mono text-secondary">{buildId}</span>
  </h3>
  <div slot="content">
    {#if loading}
      <div class="flex flex-col gap-2">
        <div class="h-3 w-32 animate-pulse rounded bg-subtle"></div>
        <div class="h-3 w-48 animate-pulse rounded bg-subtle"></div>
      </div>
    {:else if result}
      <div class="flex items-start gap-2">
        <Icon
          name={isValid ? 'circle-check-filled' : 'warning'}
          class="mt-0.5 h-4 w-4 shrink-0 {isValid
            ? 'text-success'
            : 'text-danger'}"
        />
        <div class="flex flex-col gap-1">
          <p
            class="text-sm font-medium {isValid
              ? 'text-success'
              : 'text-danger'}"
          >
            {isValid
              ? translate('deployments.validate-connection-valid')
              : translate('deployments.validate-connection-invalid')}
          </p>
          {#if result.message}
            <p class="text-xs text-secondary">{result.message}</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Modal>
