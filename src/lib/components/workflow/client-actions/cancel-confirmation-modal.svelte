<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { cancelWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import type { WorkflowExecution } from '$lib/types/workflows';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;

  let loading: boolean;
  let error: string = '';

  const cancel = async () => {
    try {
      error = '';
      loading = true;
      await cancelWorkflow({
        namespace,
        workflow,
      });
      open = false;
      $refresh = Date.now(); // TODO: this should be diff for batch vs. single
      toaster.push({
        id: 'workflow-cancelation-success-toast',
        message: translate('workflows.cancel-success'),
      });
    } catch (err: unknown) {
      error =
        err instanceof Error ? err.message : translate('common.unknown-error');
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
