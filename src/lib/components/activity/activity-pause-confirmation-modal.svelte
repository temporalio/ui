<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/workflow-actions';
  import { pauseActivity } from '$lib/services/workflow-activities-service';
  import { triggerRefresh } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';
  import { getIdentity } from '$lib/utilities/core-context';

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
  let reason = $state('');
  let includeType = $state(false);

  const identity = getIdentity();

  const hideModal = () => {
    open = false;
    reason = '';
    includeType = false;
  };

  const onActivityPause = async () => {
    await pauseActivity({
      namespace,
      execution,
      id: includeType ? undefined : id,
      reason,
      type: includeType ? type : undefined,
      identity,
    });
    triggerRefresh(Action.Pause);
    hideModal();
  };
</script>

<Modal
  id="activity-pause-confirmation-modal"
  data-testid="activity-pause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.pause')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityPause}
>
  <h3 slot="title">
    {translate('activities.pause-modal-confirmation', {
      activityId: activity.id,
    })}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>{translate('activities.pause-modal-description')}</p>
    <Input
      id="activity-pause-reason"
      class="mt-4"
      placeholder={translate('common.reason-placeholder')}
      label={translate('common.reason')}
      bind:value={reason}
    />
    <Checkbox
      bind:checked={includeType}
      label={translate('activities.pause-all-activity-types', {
        type: type ?? '',
      })}
    />
  </div>
</Modal>
