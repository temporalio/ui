<script lang="ts">
  import type { WorkflowExecution } from '@temporalio/client';

  import { Action } from '$lib/models/activity-actions';
  import { updateActivityOptions } from '$lib/services/workflow-activities-service';
  import { triggerRefresh } from '$lib/stores/workflow-run';
  import type { ActivityOptions } from '$lib/types';
  import type { PendingActivity } from '$lib/types/events';
  import { getIdentity } from '$lib/utilities/core-context';

  import ActivityOptionsForm from './activity-options-form.svelte';

  type Props = {
    open: boolean;
    namespace: string;
    execution: WorkflowExecution;
    activity: PendingActivity;
  };

  let { open = $bindable(), namespace, execution, activity }: Props = $props();

  const identity = getIdentity();

  const onSave = async (activityOptions: ActivityOptions) => {
    await updateActivityOptions({
      namespace,
      execution,
      id: activity.activityId,
      activityOptions,
      identity,
    });
    triggerRefresh(Action.Update);
  };
</script>

<ActivityOptionsForm
  bind:open
  activityId={activity.activityId}
  activityOptions={activity.activityOptions}
  {onSave}
/>
