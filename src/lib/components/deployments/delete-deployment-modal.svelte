<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  import DeleteConfirmModal from './delete-confirm-modal.svelte';

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
