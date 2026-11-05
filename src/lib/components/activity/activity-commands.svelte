<script lang="ts">
  import { page } from '$app/state';

  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/activity-actions';
  import {
    pauseActivity,
    resetActivity,
    unpauseActivity,
    updateActivityOptions,
  } from '$lib/services/workflow-activities-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { toaster } from '$lib/stores/toaster';
  import type { ActivityOptions } from '$lib/types';
  import type { PendingActivity } from '$lib/types/events';
  import type {
    WorkflowExecution,
    WorkflowExecutionIdentity,
  } from '$lib/types/workflows';
  import { activityCommandsEnabled } from '$lib/utilities/activity-commands-enabled';
  import { getIdentity } from '$lib/utilities/core-context';

  import ActivityCommandControls from './activity-command-controls.svelte';

  type Props = {
    activity: PendingActivity;
    executionIdentity: WorkflowExecutionIdentity;
    workflow: Pick<WorkflowExecution, 'isRunning' | 'isPaused'>;
    onRefresh: (action: Action) => void | Promise<void>;
    class?: string;
  };

  let {
    activity,
    executionIdentity,
    workflow,
    onRefresh,
    class: className = '',
  }: Props = $props();

  const identity = getIdentity();
  const coreUser = coreUserStore();
  const showActivityCommands = $derived(
    activityCommandsEnabled(
      page.data.settings,
      $coreUser,
      executionIdentity.namespace,
    ) &&
      (workflow.isRunning || workflow.isPaused),
  );

  const onPause = async (reason: string) => {
    const refresh = onRefresh;
    await pauseActivity({
      namespace: executionIdentity.namespace,
      execution: {
        workflowId: executionIdentity.workflowId,
        runId: executionIdentity.runId,
      },
      id: activity.activityId,
      reason,
      identity,
    });
    await refresh(Action.Pause);
  };

  const onUnpause = async () => {
    const refresh = onRefresh;
    await unpauseActivity({
      namespace: executionIdentity.namespace,
      execution: {
        workflowId: executionIdentity.workflowId,
        runId: executionIdentity.runId,
      },
      id: activity.activityId,
      identity,
    });
    await refresh(Action.Unpause);
  };

  const onReset = async (resetHeartbeat: boolean) => {
    const refresh = onRefresh;
    const activityId = activity.activityId;
    await resetActivity({
      namespace: executionIdentity.namespace,
      execution: {
        workflowId: executionIdentity.workflowId,
        runId: executionIdentity.runId,
      },
      id: activityId,
      resetHeartbeat,
      identity,
    });
    await refresh(Action.Reset);
    toaster.push({
      variant: 'success',
      message: translate('activities.reset-success', { activityId }),
    });
  };

  const onUpdateOptions = async (options: ActivityOptions) => {
    const refresh = onRefresh;
    await updateActivityOptions({
      namespace: executionIdentity.namespace,
      execution: {
        workflowId: executionIdentity.workflowId,
        runId: executionIdentity.runId,
      },
      id: activity.activityId,
      activityOptions: options,
      identity,
    });
    await refresh(Action.Update);
  };
</script>

{#if showActivityCommands}
  <ActivityCommandControls
    {activity}
    {onPause}
    {onUnpause}
    {onReset}
    {onUpdateOptions}
    class={className}
  />
{/if}
