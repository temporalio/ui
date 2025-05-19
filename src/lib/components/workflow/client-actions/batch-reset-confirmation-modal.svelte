<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';
  import { v4 } from 'uuid';

  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { batchResetWorkflows } from '$lib/services/batch-service';
  import { authUser } from '$lib/stores/auth-user';
  import { toaster } from '$lib/stores/toaster';
  import { workflowsQuery } from '$lib/stores/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { getPlacholder } from '$lib/utilities/workflow-actions';

  import BatchOperationConfirmationForm from './batch-operation-confirmation-form.svelte';

  export let namespace: string;
  export let open = false;
  let error = '';
  let jobIdPlaceholder = v4();
  let resetType = writable<'first' | 'last'>('first');
  const reason = writable('');
  const reasonPlaceholder = getPlacholder(Action.Reset, $authUser.email);
  const jobId = writable('');
  const jobIdValid = writable(true);

  const { allSelected, selectedWorkflows } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  const resetForm = () => {
    $reason = '';
    $jobId = '';
    $jobIdValid = true;
    jobIdPlaceholder = v4();
  };

  $: if (open) resetForm();

  const resetWorkflows = async () => {
    error = '';
    const options = {
      namespace,
      reason: $reason ? `${$reason} ${reasonPlaceholder}` : reasonPlaceholder,
      jobId: $jobId || jobIdPlaceholder,
      resetType: $resetType,
      ...($allSelected
        ? { query: $workflowsQuery }
        : { workflows: $selectedWorkflows }),
    };

    try {
      await batchResetWorkflows(options);
      open = false;
      resetForm();
      toaster.push({
        message: translate('workflows.batch-reset-all-success'),
        id: 'batch-reset-success-toast',
      });
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    }
  };
</script>

<Modal
  cancelText={translate('common.cancel')}
  confirmText={translate('workflows.reset')}
  bind:error
  bind:open
  id="batch-reset-confirmation-modal"
  on:confirmModal={resetWorkflows}
  confirmType="destructive"
>
  <h3 slot="modal-title">
    <Translate key="workflows.batch-reset-modal-title" />
  </h3>
  <svelte:fragment slot="content">
    <BatchOperationConfirmationForm
      bind:reason={$reason}
      bind:jobId={$jobId}
      bind:jobIdValid={$jobIdValid}
      {jobIdPlaceholder}
      {reasonPlaceholder}
      action={Action.Reset}
    >
      <RadioGroup
        description={translate('workflows.reset-event-radio-group-description')}
        bind:group={resetType}
        name="reset-event"
      >
        <RadioInput
          id="reset-event-first"
          value="first"
          label="First Workflow task"
        />
        <RadioInput
          id="reset-event-last"
          value="last"
          label="Last Workflow task"
        />
      </RadioGroup>
    </BatchOperationConfirmationForm>
  </svelte:fragment>
</Modal>
