<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { cancelNexusOperationExecution } from '$lib/services/standalone-nexus-operations';
  import { toaster } from '$lib/stores/toaster';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  interface Props {
    open: boolean;
    operationId: string;
    namespace: string;
    onConfirm: () => void;
  }

  let {
    open = $bindable(),
    operationId,
    namespace,
    onConfirm,
  }: Props = $props();

  let loading = $state(false);
  let error = $state('');

  const identity = getIdentity();

  const cancel = async () => {
    error = '';
    loading = true;
    try {
      await cancelNexusOperationExecution(
        namespace,
        operationId,
        undefined,
        identity,
      );
      open = false;
      toaster.push({
        id: 'nexus-operation-cancellation-success-toast',
        message: translate('standalone-nexus-operations.cancel-success'),
      });
      onConfirm();
    } catch (err: unknown) {
      error = isNetworkError(err)
        ? (err.message ?? translate('common.unknown-error'))
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="cancel-confirmation-modal"
  data-testid="cancel-confirmation-modal"
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  bind:error
  bind:open
  {loading}
  confirmType="destructive"
  on:confirmModal={cancel}
>
  <h3 slot="title">
    {translate('standalone-nexus-operations.cancel-modal-title')}
  </h3>
  <svelte:fragment slot="content">
    <p>
      {translate('standalone-nexus-operations.cancel-modal-confirmation')}
    </p>
  </svelte:fragment>
</Modal>
