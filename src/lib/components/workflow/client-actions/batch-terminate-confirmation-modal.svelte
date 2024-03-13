<script lang="ts">
  import { getContext } from 'svelte';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { batchTerminateWorkflows } from '$lib/services/batch-service';
  import { authUser } from '$lib/stores/auth-user';
  import { toaster } from '$lib/stores/toaster';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  import BatchOperationConfirmationModalBody, {
    batchOperationForm,
  } from './batch-operation-confirmation-modal-body.svelte';

  export let namespace: string;
  export let open: boolean;

  let error = '';

  const { allSelected, terminableWorkflows, query } =
    getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  const { jobId, jobIdValid, jobIdPlaceholder, reason, reasonPlaceholder } =
    batchOperationForm(Action.Terminate, $authUser.email);

  const terminateWorkflows = async () => {
    error = '';
    try {
      const options = {
        namespace,
        reason: $reason || reasonPlaceholder,
        jobId: $jobId || jobIdPlaceholder,
        ...($allSelected
          ? { query: $query }
          : { workflows: $terminableWorkflows }),
      };
      await batchTerminateWorkflows(options);
      open = false;
      toaster.push({
        message: translate('workflows.batch-terminate-all-success'),
        id: 'batch-terminate-success-toast',
      });
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    }
  };
</script>

<Modal
  id="batch-terminate-confirmation-modal"
  bind:open
  bind:error
  data-testid="batch-terminate-confirmation"
  confirmType="destructive"
  cancelText={translate('common.cancel')}
  confirmDisabled={!jobIdValid}
  confirmText={translate('workflows.terminate')}
  on:confirmModal={terminateWorkflows}
>
  <h3 slot="title">
    <Translate key="workflows.batch-terminate-modal-title" />
  </h3>
  <svelte:fragment slot="content">
    <BatchOperationConfirmationModalBody
      bind:reason={$reason}
      bind:jobId={$jobId}
      bind:jobIdValid={$jobIdValid}
      {reasonPlaceholder}
      {jobIdPlaceholder}
      action={Action.Terminate}
    />
  </svelte:fragment>
</Modal>
