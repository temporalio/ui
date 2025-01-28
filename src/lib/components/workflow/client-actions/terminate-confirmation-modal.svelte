<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { terminateWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;

  let reason: string = '';
  let error: string = '';
  let loading = false;

  const hideModal = () => {
    open = false;
    reason = '';
  };

  const terminate = async () => {
    error = '';
    loading = true;
    try {
      await terminateWorkflow({
        workflow,
        namespace,
        reason,
      });
      open = false;
      reason = '';
      $refresh = Date.now();
      toaster.push({
        id: 'workflow-termination-success-toast',
        message: translate('workflows.terminate-success'),
      });
    } catch (err: unknown) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="terminate-confirmation-modal"
  data-testid="terminate-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.terminate')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  cancelModal={hideModal}
  confirmModal={terminate}
>
  <h3 slot="title">{translate('workflows.terminate-modal-title')}</h3>
  <div slot="content">
    <p>
      {translate('workflows.terminate-modal-confirmation')}
    </p>
    <Input
      id="workflow-termination-reason"
      class="mt-4"
      placeholder={translate('common.reason-placeholder')}
      label={translate('common.reason-placeholder')}
      labelHidden
      bind:value={reason}
    />
  </div>
</Modal>
