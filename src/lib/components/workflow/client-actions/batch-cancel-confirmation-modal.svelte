<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';
  import { v4 } from 'uuid';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { batchCancelWorkflows } from '$lib/services/batch-service';
  import { authUser } from '$lib/stores/auth-user';
  import { toaster } from '$lib/stores/toaster';
  import { workflowsQuery } from '$lib/stores/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { getPlacholder } from '$lib/utilities/workflow-actions';

  import BatchOperationConfirmationModalBody from './batch-operation-confirmation-form.svelte';

  export let namespace: string;
  export let open: boolean;
  const reason = writable('');
  const reasonPlaceholder = getPlacholder(Action.Cancel, $authUser.email);
  const jobId = writable('');
  const jobIdValid = writable(true);
  let jobIdPlaceholder = v4();
  let error = '';

  const { allSelected, cancelableWorkflows } =
    getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  const resetForm = () => {
    $reason = '';
    $jobId = '';
    $jobIdValid = true;
    jobIdPlaceholder = v4();
  };

  $: if (open) resetForm();

  const cancelWorkflows = async () => {
    error = '';
    const options = {
      namespace,
      reason: $reason ? `${$reason} ${reasonPlaceholder}` : reasonPlaceholder,
      jobId: $jobId || jobIdPlaceholder,
      ...($allSelected
        ? { query: $workflowsQuery }
        : { workflows: $cancelableWorkflows }),
    };
    try {
      await batchCancelWorkflows(options);
      open = false;
      resetForm();
      toaster.push({
        message: translate('workflows.batch-cancel-all-success'),
        id: 'batch-cancel-success-toast',
      });
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    }
  };
</script>

<Modal
  id="batch-cancel-confirmation-modal"
  bind:open
  bind:error
  data-testid="batch-cancel-confirmation"
  confirmType="destructive"
  cancelText={translate('common.cancel')}
  confirmDisabled={!jobIdValid}
  confirmText={translate('common.confirm')}
  on:confirmModal={cancelWorkflows}
>
  <h3 slot="title">
    <Translate key="workflows.batch-cancel-modal-title" />
  </h3>
  <svelte:fragment slot="content">
    <BatchOperationConfirmationModalBody
      bind:reason={$reason}
      bind:jobId={$jobId}
      bind:jobIdValid={$jobIdValid}
      {jobIdPlaceholder}
      {reasonPlaceholder}
      action={Action.Cancel}
    />
  </svelte:fragment>
</Modal>
