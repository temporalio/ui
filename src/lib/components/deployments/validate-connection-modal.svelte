<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    open: boolean;
    loading: boolean;
    result: { message?: string } | null;
    onClose: () => void;
    onRetry: () => void;
  }

  let { buildId, open, loading, result, onClose, onRetry }: Props = $props();

  const isValid = $derived(!result?.message);
</script>

<Modal
  id="validate-connection-modal-{buildId}"
  {open}
  confirmText=""
  cancelText=""
  hideCancel
  hideConfirm
>
  <h3 slot="title">
    {translate('deployments.validate-connection')}
    <span class="font-mono text-secondary">{buildId}</span>
  </h3>
  <svelte:fragment slot="footer">
    <div class="flex w-full items-center justify-end gap-2">
      <Button variant="ghost" on:click={onRetry}
        >{translate('common.retry')}</Button
      >
      <Button variant="primary" on:click={onClose}
        >{translate('common.close')}</Button
      >
    </div>
  </svelte:fragment>
  <div slot="content">
    {#if loading}
      <div class="flex items-center gap-2">
        <div
          class="h-5 w-5 shrink-0 animate-pulse rounded-full bg-subtle"
        ></div>
        <div class="h-5 w-40 animate-pulse rounded bg-subtle"></div>
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
