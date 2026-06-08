<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    deploymentName: string;
    open: boolean;
    hasActivePollers: boolean;
    isRamping: boolean;
    existingRampingBuildId?: string;
    existingRampingPercentage?: number;
    percentage: number;
    error?: string;
    onConfirm: () => void;
    onRemove: () => void;
    onCancel: () => void;
  }

  let {
    buildId,
    deploymentName,
    open,
    hasActivePollers,
    isRamping,
    existingRampingBuildId,
    existingRampingPercentage,
    percentage = $bindable(),
    error = '',
    onConfirm,
    onRemove,
    onCancel,
  }: Props = $props();
</script>

{#if !hasActivePollers}
  <Modal
    id="set-ramping-version-modal-{buildId}"
    {open}
    confirmText=""
    cancelText={translate('common.close')}
    hideConfirm
    on:cancelModal={onCancel}
  >
    <h3 slot="title">
      {translate('deployments.set-ramping-no-pollers-title')}
    </h3>
    <div slot="content">
      <p class="text-sm">
        {translate('deployments.set-ramping-no-pollers-body')}
      </p>
    </div>
  </Modal>
{:else}
  <Modal
    id="set-ramping-version-modal-{buildId}"
    {open}
    {error}
    confirmText={translate('deployments.set-ramping-version')}
    cancelText={translate('common.cancel')}
    confirmDisabled={Number.isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100}
    on:confirmModal={onConfirm}
    on:cancelModal={onCancel}
  >
    <h3 slot="title">{translate('deployments.set-ramping-version')}</h3>
    <div slot="content" class="flex flex-col gap-4">
      <p class="text-sm">
        This will route a percentage of new traffic to Build ID
        <span class="font-mono font-medium">{buildId}</span>
        for <strong>{deploymentName}</strong>. The Current Version will continue
        to receive the remaining traffic.
      </p>
      {#if existingRampingBuildId && existingRampingBuildId !== buildId}
        <p class="text-sm">
          Worker Deployment Version
          <span class="font-mono font-medium">{existingRampingBuildId}</span>
          is currently ramping at {existingRampingPercentage ?? 0}%.
        </p>
      {/if}
      <NumberInput
        id="ramping-percentage-{buildId}"
        bind:value={percentage}
        min={0}
        max={100}
        units="%"
        label={translate('deployments.ramping-percentage-label')}
      />
    </div>
    <svelte:fragment slot="footer">
      {#if isRamping}
        <Button variant="destructive" on:click={onRemove}>
          {translate('deployments.remove-ramping')}
        </Button>
      {/if}
    </svelte:fragment>
  </Modal>
{/if}
