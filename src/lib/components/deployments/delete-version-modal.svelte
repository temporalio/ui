<script lang="ts">
  import DeleteConfirmModal from '$lib/components/delete-confirmation-modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    open: boolean;
    error?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let { buildId, open, error = '', onConfirm, onCancel }: Props = $props();
</script>

<DeleteConfirmModal
  id="delete-version-modal-{buildId}"
  {open}
  {error}
  title={translate('deployments.delete-version')}
  description={translate('deployments.delete-version-description')}
  {onConfirm}
  {onCancel}
/>
