<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/workflow-actions';
  import { cancelWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import { triggerRefresh as triggerWorkflowRunRefresh } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number> | undefined = undefined;

  let loading: boolean;
  let error: string = '';

  const identity = getIdentity();

  const triggerRefresh = () => {
    if (refresh) {
      $refresh = Date.now();
    } else {
      triggerWorkflowRunRefresh(Action.Cancel);
    }
  };

  const cancel = async () => {
    error = '';
    loading = true;
    try {
      await cancelWorkflow({
        namespace,
        workflow,
        identity,
      });
      open = false;
      triggerRefresh();
      toaster.push({
        id: 'workflow-cancelation-success-toast',
        message: translate('workflows.cancel-success'),
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
  <h3 slot="title">{translate('workflows.cancel-modal-title')}</h3>
  <svelte:fragment slot="content">
    <p>
      {translate('workflows.cancel-modal-confirmation')}
    </p>
  </svelte:fragment>
</Modal>
