<script lang="ts">
  import { getContext } from 'svelte';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { batchTerminateActivities } from '$lib/services/activity-batch-service';
  import { activitiesQuery } from '$lib/stores/activities';
  import { toaster } from '$lib/stores/toaster';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { getPlaceholder } from '$lib/utilities/workflow-actions';

  import BatchOperationConfirmationModalBody from './batch-operation-confirmation-form.svelte';

  interface Props {
    namespace: string;
    open: boolean;
  }

  let { namespace, open = $bindable() }: Props = $props();

  const identity = getIdentity();
  const reasonPlaceholder = getPlaceholder(Action.Terminate, identity);
  let reason = $state('');
  let jobId = $state('');
  let jobIdValid = $state(true);
  let jobIdPlaceholder = $state(crypto.randomUUID());
  let error = $state('');

  const { allSelected, terminableActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const resetForm = () => {
    reason = '';
    jobId = '';
    jobIdValid = true;
    jobIdPlaceholder = crypto.randomUUID();
  };

  $effect(() => {
    if (open) resetForm();
  });

  const terminateActivities = async () => {
    error = '';
    const options = {
      namespace,
      reason: reason ? `${reason} ${reasonPlaceholder}` : reasonPlaceholder,
      jobId: jobId || jobIdPlaceholder,
      ...($allSelected
        ? { query: $activitiesQuery }
        : { activities: $terminableActivities }),
    };
    try {
      await batchTerminateActivities(options);
      open = false;
      resetForm();
      toaster.push({
        message: translate('activities.batch-terminate-all-success'),
        id: 'activity-batch-terminate-success-toast',
      });
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    }
  };
</script>

<Modal
  id="activity-batch-terminate-confirmation-modal"
  bind:open
  bind:error
  data-testid="activity-batch-terminate-confirmation"
  confirmType="destructive"
  cancelText={translate('common.cancel')}
  confirmDisabled={!jobIdValid}
  confirmText={translate('common.confirm')}
  on:confirmModal={terminateActivities}
>
  <h3 slot="title">
    <Translate key="activities.batch-terminate-activities" />
  </h3>
  <svelte:fragment slot="content">
    <BatchOperationConfirmationModalBody
      bind:reason
      bind:jobId
      bind:jobIdValid
      {jobIdPlaceholder}
      {reasonPlaceholder}
      action={Action.Terminate}
    />
  </svelte:fragment>
</Modal>
