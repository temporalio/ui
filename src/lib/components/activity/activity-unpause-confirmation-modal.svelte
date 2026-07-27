<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

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
  let { activityId: id } = $derived(activity);

  let error = $state('');
  let loading = $state(false);

  const identity = getIdentity();

  const hideModal = () => {
    open = false;
  };

  const onActivityUnpause = async () => {
    await unpauseActivity({
      namespace,
      execution,
      id,
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
    {translate('activities.unpause-modal-confirmation', {
      activityId: activity.id,
    })}
  </h3>
  <div slot="content">
    <p>{translate('activities.unpause-modal-description')}</p>
  </div>
</Modal>
