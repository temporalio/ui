<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { batchCancelActivities } from '$lib/services/activity-batch-service';
  import { activitiesQuery } from '$lib/stores/activities';
  import { toaster } from '$lib/stores/toaster';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { getPlaceholder } from '$lib/utilities/workflow-actions';

  import BatchOperationConfirmationModalBody from './batch-operation-confirmation-form.svelte';

  export let namespace: string;
  export let open: boolean;
  const identity = getIdentity();
  const reason = writable('');
  const reasonPlaceholder = getPlaceholder(Action.Cancel, identity);
  const jobId = writable('');
  const jobIdValid = writable(true);
  let jobIdPlaceholder = crypto.randomUUID();
  let error = '';

  const { allSelected, cancelableActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const resetForm = () => {
    $reason = '';
    $jobId = '';
    $jobIdValid = true;
    jobIdPlaceholder = crypto.randomUUID();
  };

  $: if (open) resetForm();

  const cancelActivities = async () => {
    error = '';
    const options = {
      namespace,
      reason: $reason ? `${$reason} ${reasonPlaceholder}` : reasonPlaceholder,
      jobId: $jobId || jobIdPlaceholder,
      ...($allSelected
        ? { query: $activitiesQuery }
        : { activities: $cancelableActivities }),
    };
    try {
      await batchCancelActivities(options);
      open = false;
      resetForm();
      toaster.push({
        message: translate('activities.batch-cancel-all-success'),
        id: 'activity-batch-cancel-success-toast',
      });
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    }
  };
</script>

<Modal
  id="activity-batch-cancel-confirmation-modal"
  bind:open
  bind:error
  data-testid="activity-batch-cancel-confirmation"
  confirmType="destructive"
  cancelText={translate('common.cancel')}
  confirmDisabled={!jobIdValid}
  confirmText={translate('common.confirm')}
  on:confirmModal={cancelActivities}
>
  <h3 slot="title">
    <Translate key="activities.batch-cancel-activities" />
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
