<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/activity-actions';
  import { unpauseActivity } from '$lib/services/workflow-activities-service';
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
  let includeType = $state(false);

  const identity = getIdentity();

  const hideModal = () => {
    open = false;
    includeType = false;
  };

  const onActivityUnpause = async () => {
    await unpauseActivity({
      namespace,
      execution,
      id: includeType ? undefined : id,
      type: includeType ? type : undefined,
      identity,
    });
    triggerRefresh(Action.Unpause);
    hideModal();
  };
</script>

<Modal
  id="activity-unpause-confirmation-modal"
  data-testid="activity-unpause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.unpause')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:cancelModal={hideModal}
  on:confirmModal={onActivityUnpause}
>
  <h3 slot="title">
    {translate('activities.pause-modal-confirmation', {
      activityId: activity.id,
    })}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>{translate('activities.unpause-modal-description')}</p>
    <Checkbox
      bind:checked={includeType}
      label={translate('activities.unpause-all-activity-types', {
        type,
      })}
    />
  </div>
</Modal>
