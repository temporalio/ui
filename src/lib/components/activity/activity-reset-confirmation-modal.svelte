<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { resetActivity } from '$lib/services/workflow-activities-service';
  import { toaster } from '$lib/stores/toaster';
  import { refresh } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';

  type Props = {
    open: boolean;
    namespace: string;
    execution: WorkflowExecution;
    activity: PendingActivity;
  };

  let { open = $bindable(), namespace, execution, activity }: Props = $props();
  let { activityId: id, activityType: type } = $derived(activity);

  let error = $state('');
  let loading = $state(false);
  let includeType = $state(false);
  let resetHeartbeat = $state(false);

  const hideModal = () => {
    open = false;
    includeType = false;
    resetHeartbeat = false;
  };

  const onActivityReset = async () => {
    await resetActivity({
      namespace,
      execution,
      id: includeType ? undefined : id,
      resetHeartbeat,
      type: includeType ? type : undefined,
    });
    $refresh = Date.now();
    toaster.push({
      variant: 'success',
      message: translate('activities.reset-success', { activityId: id }),
    });
    hideModal();
  };
</script>

<Modal
  id="activity-pause-confirmation-modal"
  data-testid="activity-pause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.reset')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityReset}
>
  <h3 slot="title">
    {translate('activities.reset-modal-confirmation', {
      activityId: activity.id,
    })}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>{translate('activities.reset-modal-description')}</p>
    <Checkbox
      bind:checked={includeType}
      label={translate('activities.apply-to-all-activity-types', {
        type,
      })}
    />
    <Checkbox
      bind:checked={resetHeartbeat}
      label={translate('activities.reset-heartbeat-details')}
    />
  </div>
</Modal>
