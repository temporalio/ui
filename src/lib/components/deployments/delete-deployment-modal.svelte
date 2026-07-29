<script lang="ts">
  import DeleteConfirmModal from '$lib/components/delete-confirmation-modal.svelte';
  import Modal from '$lib/holocene/modal-runes.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
    deploymentName: string;
    hasVersions: boolean;
    error?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    open,
    deploymentName,
    hasVersions,
    error = '',
    onConfirm,
    onCancel,
  }: Props = $props();
</script>

{#if hasVersions}
  <Modal
    id="delete-deployment-modal"
    {open}
    confirmText=""
    cancelText={translate('common.close')}
    hideConfirm
    onCancelModal={() => onCancel?.()}
  >
    {#snippet titleSnippet()}
      <h3>{translate('deployments.cannot-delete-deployment')}</h3>
    {/snippet}
    {#snippet content()}
      <div>
        <p class="text-sm">
          {translate('deployments.cannot-delete-deployment-body')}
        </p>
      </div>
    {/snippet}
  </Modal>
{:else}
  <DeleteConfirmModal
    id="delete-deployment-modal"
    {open}
    {error}
    title={translate('deployments.delete-deployment')}
    description={translate('deployments.delete-deployment-description', {
      name: deploymentName,
    })}
    entityName={deploymentName}
    {onConfirm}
    {onCancel}
  />
{/if}
