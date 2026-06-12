<script lang="ts">
  import ActivityOptionsForm from '$lib/components/activity/activity-options-form.svelte';
  import { updateActivityExecutionOptions } from '$lib/services/standalone-activities';
  import type { ActivityOptions } from '$lib/types';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { getIdentity } from '$lib/utilities/core-context';

  type Props = {
    open: boolean;
    namespace: string;
    activityExecutionInfo: ActivityExecutionInfo;
    onUpdate?: () => void;
  };

  let {
    open = $bindable(),
    namespace,
    activityExecutionInfo,
    onUpdate,
  }: Props = $props();

  const identity = getIdentity();

  const activityOptions = $derived({
    taskQueue: { name: activityExecutionInfo.taskQueue },
    scheduleToCloseTimeout: activityExecutionInfo.scheduleToCloseTimeout,
    scheduleToStartTimeout: activityExecutionInfo.scheduleToStartTimeout,
    startToCloseTimeout: activityExecutionInfo.startToCloseTimeout,
    heartbeatTimeout: activityExecutionInfo.heartbeatTimeout,
    retryPolicy: activityExecutionInfo.retryPolicy,
  }) as unknown as ActivityOptions;

  const onSave = async (options: ActivityOptions) => {
    await updateActivityExecutionOptions(
      namespace,
      activityExecutionInfo.activityId,
      activityExecutionInfo.runId,
      options,
      identity,
    );
    onUpdate?.();
  };
</script>

<ActivityOptionsForm
  bind:open
  activityId={activityExecutionInfo.activityId}
  {activityOptions}
  {onSave}
/>
