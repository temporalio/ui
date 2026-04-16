<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  import DeleteConfirmModal from './delete-confirm-modal.svelte';

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
