<script lang="ts">
  import DeleteConfirmModal from '$lib/components/delete-confirmation-modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
    deploymentName: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let { open, deploymentName, onConfirm, onCancel }: Props = $props();
</script>

<DeleteConfirmModal
  id="delete-deployment-modal"
  {open}
  title={translate('deployments.delete-deployment')}
  description={translate('deployments.delete-deployment-description')}
  entityName={deploymentName}
  {onConfirm}
  {onCancel}
/>
