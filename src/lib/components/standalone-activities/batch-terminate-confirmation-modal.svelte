<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import BatchOperationConfirmationForm from '$lib/components/batch/batch-operation-confirmation-form.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/workflow-actions';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/standalone-activities.svelte';
  import { batchTerminateActivities } from '$lib/services/activity-batch-service';
  import { activitiesQuery } from '$lib/stores/activities';
  import { toaster } from '$lib/stores/toaster';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { getPlaceholder } from '$lib/utilities/workflow-actions';

  interface Props {
    namespace: string;
    open: boolean;
  }

  let { namespace, open = $bindable() }: Props = $props();

  const identity = getIdentity();
  const reason = writable('');
  const reasonPlaceholder = getPlaceholder(Action.Terminate, identity);
  const jobId = writable('');
  const jobIdValid = writable(true);
  let jobIdPlaceholder = $state(crypto.randomUUID());
  let error = $state('');

  const { allSelected, terminableActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const actionText = translate('standalone-activities.terminate');
  const confirmationText = $derived(
    translate('standalone-activities.batch-confirmation', {
      action: actionText,
      count: $terminableActivities.length,
    }),
  );

  const resetForm = () => {
    $reason = '';
    $jobId = '';
    $jobIdValid = true;
    jobIdPlaceholder = crypto.randomUUID();
  };

  $effect(() => {
    if (open) resetForm();
  });

  const terminateActivities = async () => {
    error = '';
    try {
      const options = {
        namespace,
        reason: $reason ? $reason : reasonPlaceholder,
        jobId: $jobId || jobIdPlaceholder,
        ...($allSelected
          ? { query: $activitiesQuery }
          : { activities: $terminableActivities }),
      };
      await batchTerminateActivities(options);
      open = false;
      resetForm();
      toaster.push({
        message: translate('standalone-activities.batch-terminate-all-success'),
        id: 'batch-terminate-success-toast',
      });
    } catch (err) {
      error =
        isNetworkError(err) && err.message
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
  confirmDisabled={!$jobIdValid}
  confirmText={translate('standalone-activities.terminate')}
  on:confirmModal={terminateActivities}
>
  <h3 slot="title">
    {translate('standalone-activities.batch-terminate-modal-title')}
  </h3>
  <svelte:fragment slot="content">
    <BatchOperationConfirmationForm
      bind:reason={$reason}
      bind:jobId={$jobId}
      bind:jobIdValid={$jobIdValid}
      {jobIdPlaceholder}
      {reasonPlaceholder}
      reasonInputId="bulk-action-reason-{Action.Terminate}"
      reasonHint={translate(
        'workflows.batch-operation-confirmation-input-hint',
      )}
      allSelected={$allSelected}
      query={$activitiesQuery}
      queryTestId="batch-action-activities-query"
      {confirmationText}
      allSelectedText={translate(
        'standalone-activities.batch-operation-confirmation-all',
        { action: actionText },
      )}
      countDisclaimerText={translate(
        'standalone-activities.batch-operation-count-disclaimer',
        { action: actionText },
      )}
    />
  </svelte:fragment>
</Modal>
