<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
    percentage?: number;
    error?: string;
    onConfirm?: (percentage: number) => void;
    onCancel?: () => void;
    onRemove?: () => void;
  }

  let {
    open,
    percentage = $bindable(0),
    error = '',
    onConfirm,
    onCancel,
    onRemove,
  }: Props = $props();
</script>

<Modal
  id="ramp-unversioned-modal"
  {open}
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  on:confirmModal={() => onConfirm?.(percentage)}
  on:cancelModal={() => onCancel?.()}
>
  {#if onRemove}
    <Button slot="footer" variant="destructive" size="sm" on:click={onRemove}>
      {translate('deployments.remove-unversioned-ramping')}
    </Button>
  {/if}
  <h3 slot="title">{translate('deployments.ramp-to-unversioned')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p class="text-sm">
      {translate('deployments.ramp-to-unversioned-description')}
    </p>
    <NumberInput
      id="unversioned-ramping-percentage"
      label={translate('deployments.ramping-percentage', {
        percentage: '',
      }).trim()}
      bind:value={percentage}
      min={0}
      max={100}
      units="%"
    />
    {#if error}
      <p class="text-sm text-danger">{error}</p>
    {/if}
  </div>
</Modal>
