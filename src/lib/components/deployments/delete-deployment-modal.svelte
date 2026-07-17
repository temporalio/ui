<script lang="ts">
  import DeleteConfirmModal from '$lib/components/delete-confirmation-modal.svelte';
  import Modal from '$lib/holocene/modal.svelte';
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
    on:cancelModal={() => onCancel?.()}
  >
    <h3 slot="title">{translate('deployments.cannot-delete-deployment')}</h3>
    <div slot="content">
      <p class="text-sm">
        {translate('deployments.cannot-delete-deployment-body')}
      </p>
    </div>
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
