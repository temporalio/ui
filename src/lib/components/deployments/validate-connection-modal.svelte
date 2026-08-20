<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ValidationOutcome } from '$lib/utilities/connection-status';

  interface Props {
    buildId: string;
    open: boolean;
    loading: boolean;
    result: ValidationOutcome | null;
    onClose: () => void;
    onRetry: () => void;
  }

  let {
    buildId,
    open = $bindable(),
    loading,
    result,
    onClose,
    onRetry,
  }: Props = $props();

  const state = $derived(result?.state);

  const glyph = $derived.by(() => {
    if (state === 'valid') return 'circle-check-filled';
    if (state === 'invalid') return 'warning';
    return 'circle-question';
  });

  const tone = $derived.by(() => {
    if (state === 'valid') return 'text-success';
    if (state === 'invalid') return 'text-danger';
    return 'text-secondary';
  });

  const heading = $derived.by(() => {
    if (state === 'valid')
      return translate('deployments.validate-connection-valid');
    if (state === 'invalid')
      return translate('deployments.validate-connection-invalid');
    return translate('deployments.validate-connection-incomplete');
  });
</script>

<Modal
  id="validate-connection-modal-{buildId}"
  bind:open
  confirmText=""
  cancelText=""
  hideCancel
  hideConfirm
>
  {#snippet titleSnippet()}
    <h3>
      {translate('deployments.validate-connection-for')}
      <span class="font-mono text-secondary">{buildId}</span>
    </h3>
  {/snippet}
  {#snippet footer()}
    <div class="flex w-full items-center justify-end gap-2">
      <Button variant="ghost" onclick={onRetry} disabled={loading}
        >{translate('common.retry')}</Button
      >
      <Button variant="primary" onclick={onClose}
        >{translate('common.close')}</Button
      >
    </div>
  {/snippet}
  {#snippet content()}
    <div>
      {#if loading}
        <div class="flex items-center gap-2">
          <div
            class="h-5 w-5 shrink-0 animate-pulse rounded-full bg-subtle"
          ></div>
          <div class="h-5 w-40 animate-pulse rounded bg-subtle"></div>
        </div>
      {:else if result}
        <div class="flex items-start gap-2">
          <Icon name={glyph} class="mt-0.5 h-4 w-4 shrink-0 {tone}" />
          <div class="flex flex-col gap-1">
            <p class="text-sm font-medium {tone}">
              {heading}
            </p>
            {#if state === 'indeterminate'}
              <p class="text-xs text-secondary">
                {translate(
                  'deployments.validate-connection-incomplete-description',
                )}
              </p>
            {/if}
            {#if result.state !== 'valid' && result.message}
              <p class="text-xs text-secondary">{result.message}</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
</Modal>
