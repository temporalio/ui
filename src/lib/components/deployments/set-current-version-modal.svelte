<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowRight } from '$lib/io/icon';

  interface Props {
    buildId: string;
    currentBuildId: string | undefined;
    deploymentName: string;
    open: boolean;
    error?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    buildId,
    currentBuildId,
    deploymentName,
    open,
    error = '',
    onConfirm,
    onCancel,
  }: Props = $props();
</script>

<Modal
  id="set-current-version-modal-{buildId}"
  {open}
  {error}
  confirmText={translate('deployments.set-as-current')}
  cancelText={translate('common.cancel')}
  onConfirmModal={onConfirm}
  onCancelModal={onCancel}
>
  {#snippet titleSnippet()}
    <h3>{translate('deployments.set-as-current')}</h3>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col gap-4">
      <p class="text-sm">
        This will set Build ID <span class="font-mono font-medium"
          >{buildId}</span
        >
        as the current version for <strong>{deploymentName}</strong>. All
        traffic will be routed to this Worker Deployment Version.
      </p>
      {#if currentBuildId}
        <div class="border border-subtle">
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <span class="text-secondary"
              >{translate('deployments.build-id')}</span
            >
            <span class="flex items-center gap-2 font-mono font-medium">
              <span class="text-secondary">{currentBuildId}</span>
              <IconArrowRight class="h-3.5 w-3.5 text-secondary" />
              <span>{buildId}</span>
            </span>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
</Modal>
